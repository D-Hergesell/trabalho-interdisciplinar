import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Swal from 'sweetalert2';

/**
 * HOC de Segurança
 * @param {Component} WrappedComponent - O componente da página
 * @param {string} requiredRole - O nível de usuário exigido (ex: "admin", "cliente")
 * @param {string} loginRoute - A rota para onde mandar se não estiver logado (ex: "/admin/login", "/")
 */
const withAuth = (WrappedComponent, requiredRole = "admin", loginRoute = "/admin/login") => {
    const Wrapper = (props) => {
        const router = useRouter();
        const [verified, setVerified] = useState(false);

        useEffect(() => {
            const usuarioString = localStorage.getItem("usuario");

            // 1. Se ninguém está logado, manda para a rota de login configurada no parâmetro
            if (!usuarioString) {
                router.replace(loginRoute);
                return;
            }

            try {
                const usuario = JSON.parse(usuarioString);

                // 2. Verifica se o nível do usuário bate com o nível exigido
                if (usuario.level !== requiredRole) {

                    Swal.fire({
                        icon: 'warning',
                        title: 'Acesso Restrito',
                        // Mostra qual nível ele tem e qual ele precisa
                        text: `Você está logado como "${usuario.level || 'usuário'}", mas esta página requer perfil de "${requiredRole}".`,
                        showCancelButton: true,
                        confirmButtonText: 'Trocar de Conta',
                        confirmButtonColor: '#3085d6',
                        cancelButtonText: 'Voltar para Home',
                        cancelButtonColor: '#d33',
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Remove o usuário atual para permitir novo login
                            localStorage.removeItem("usuario");
                            // Leva para a tela de login correta (a que foi passada por parâmetro)
                            router.replace(loginRoute);
                        } else {
                            // Se cancelar, volta para a raiz do site
                            router.replace("/");
                        }
                    });

                    return;
                }

                // 3. É o nível correto, libera o acesso
                setVerified(true);

            } catch (error) {
                console.error("Erro auth:", error);
                localStorage.removeItem("usuario");
                router.replace(loginRoute);
            }
        }, [router]);

        if (!verified) return null;

        return <WrappedComponent {...props} />;
    };

    Wrapper.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;
    return Wrapper;
};

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withAuth;
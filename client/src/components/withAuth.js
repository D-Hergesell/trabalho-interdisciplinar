import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Swal from 'sweetalert2';

/**
 * HOC de Segurança (Case Insensitive)
 */
const withAuth = (WrappedComponent, requiredRole = "admin", loginRoute = "/admin/login") => {
    const Wrapper = (props) => {
        const router = useRouter();
        const [verified, setVerified] = useState(false);

        useEffect(() => {
            const usuarioString = localStorage.getItem("usuario");

            if (!usuarioString) {
                router.replace(loginRoute);
                return;
            }

            try {
                const usuario = JSON.parse(usuarioString);

                // --- AQUI ESTÁ A CORREÇÃO ---
                // Pegamos o nível do usuário e forçamos para minúsculo
                // Se usuario.level for null/undefined, vira string vazia para não quebrar
                const userLevel = (usuario.level || "").toLowerCase();

                // Prepara a lista de permissões também em minúsculo
                const requiredRoles = Array.isArray(requiredRole)
                    ? requiredRole.map(r => r.toLowerCase())
                    : [requiredRole.toLowerCase()]; // Transforma string única em array minúsculo

                // Verifica se o nível do usuário está na lista permitida
                const hasPermission = requiredRoles.includes(userLevel);

                if (!hasPermission) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Acesso Restrito',
                        // Mostra o nível original para você saber o que está vindo
                        text: `Você está logado como "${usuario.level || 'Desconhecido'}", mas esta página requer perfil de "${requiredRole}".`,
                        showCancelButton: true,
                        confirmButtonText: 'Trocar de Conta',
                        confirmButtonColor: '#3085d6',
                        cancelButtonText: 'Voltar',
                        cancelButtonColor: '#d33',
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            localStorage.removeItem("usuario");
                            router.replace(loginRoute);
                        } else {
                            router.replace("/");
                        }
                    });
                    return;
                }

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

    Wrapper.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return Wrapper;
};

export default withAuth;
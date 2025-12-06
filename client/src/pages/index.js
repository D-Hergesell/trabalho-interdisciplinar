import { useState } from "react";
import api from "../services/api";
import { useRouter } from "next/router";
import styles from '../styles/Login.module.css';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        setErro("");
        setLoading(true);

        try {
            // 1. Envia os campos para o Backend
            const response = await api.post('/auth/login', {
                email: email,
                senha: senha
            });

            const usuario = response.data;

            // 2. Verifica se é Admin (bloqueia aqui, pois admin tem login próprio)
            if (usuario.tipoUsuario === "ADMIN") {
                setErro("Administradores devem usar o login administrativo.");
                setLoading(false);
                return;
            }

            // --- CORREÇÃO AQUI ---
            // Cria o objeto para salvar no localStorage com o campo 'level' que o withAuth exige.
            // Se for 'LOJA' vira 'lojista', se for 'FORNECEDOR' vira 'fornecedor'.
            const usuarioParaSalvar = {
                ...usuario,
                level: usuario.tipoUsuario === "LOJA" ? "lojista" : usuario.tipoUsuario.toLowerCase()
            };

            // 3. Salva o objeto CORRIGIDO no localStorage
            localStorage.setItem("usuario", JSON.stringify(usuarioParaSalvar));

            // 4. Redireciona para o dashboard correto
            if (usuario.tipoUsuario === "LOJA") {
                router.push("/loja/dashboard");
            } else if (usuario.tipoUsuario === "FORNECEDOR") {
                router.push("/fornecedor/dashboard");
            } else {
                setErro("Tipo de usuário desconhecido.");
            }

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.erro || "E-mail ou senha inválidos";
            setErro(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>

                <h1 className={styles.title}>LOGIN</h1>

                <div className={styles.inputGroup}>
                    <label>Email:</label>
                    <input
                        className={styles.input}
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Senha:</label>
                    <input
                        className={styles.input}
                        type="password"
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.buttonContainer}>
                    <button
                        type="button"
                        className={styles.greenButton}
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? "Entrando..." : "Entrar como Lojista"}
                    </button>

                    <button
                        type="button"
                        className={styles.greenButton}
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? "Entrando..." : "Entrar como Fornecedor"}
                    </button>
                </div>

                {erro && <p className={styles.erro}>{erro}</p>}
            </div>
        </div>
    );
}
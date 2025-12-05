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

    // A função não precisa mais receber o nível, pois o backend decide quem é o usuário
    async function handleLogin() {
        setErro("");
        setLoading(true);

        try {
            // 1. Envia os campos corretos para o Backend Java
            const response = await api.post('/auth/login', {
                email: email,
                senha: senha
            });

            const usuario = response.data;

            // 2. Verifica se é Admin (que deve usar a outra tela)
            if (usuario.tipoUsuario === "ADMIN") {
                setErro("Administradores devem usar o login administrativo.");
                setLoading(false);
                return;
            }

            // 3. Salva no localStorage
            localStorage.setItem("usuario", JSON.stringify(usuario));

            // 4. Redireciona baseado no tipo retornado pelo banco
            if (usuario.tipoUsuario === "LOJA") {
                router.push("/loja/dashboard"); // Caminho corrigido
            } else if (usuario.tipoUsuario === "FORNECEDOR") {
                router.push("/fornecedor/dashboard"); // Caminho corrigido
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
                    {/* Ambos os botões chamam a mesma função, pois o login é único pelo email */}
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
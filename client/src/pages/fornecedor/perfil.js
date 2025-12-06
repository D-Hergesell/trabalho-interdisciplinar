import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/FornecedorPerfil.module.css';
import api from '@/services/api';

import {
    FiGrid,
    FiPackage,
    FiUser,
    FiLogOut,
    FiUsers,
    FiSettings,
    FiTag,
    FiMoreVertical,
    FiX
} from 'react-icons/fi';

const PerfilFornecedor = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    // Estado do formulário
    const [formData, setFormData] = useState({
        id: '',
        nomeFantasia: '',
        cnpj: '',
        responsavelNome: '',
        emailContato: '',
        telefone: '',
        cep: '',
        logradouro: '',
        cidade: '',
        estado: '',
        ativo: true // Mantém o status atual
    });

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // 1. Pega usuário do LocalStorage
                const usuarioStored = localStorage.getItem("usuario");
                if (!usuarioStored) {
                    router.push('/');
                    return;
                }

                const usuario = JSON.parse(usuarioStored);
                // Verifica se é um fornecedor
                if (!usuario.fornecedorId) {
                    setMessage({ type: 'error', text: 'Usuário não vinculado a um fornecedor.' });
                    setLoading(false);
                    return;
                }

                // 2. Busca dados atualizados do backend
                const response = await api.get(`/api/v1/fornecedores/${usuario.fornecedorId}`);
                const fornecedor = response.data;

                // 3. Preenche o formulário
                setFormData({
                    id: fornecedor.id,
                    nomeFantasia: fornecedor.nomeFantasia || '',
                    cnpj: fornecedor.cnpj || '',
                    responsavelNome: fornecedor.responsavelNome || '',
                    emailContato: fornecedor.emailContato || '',
                    telefone: fornecedor.telefone || '',
                    cep: fornecedor.cep || '',
                    logradouro: fornecedor.logradouro || '',
                    cidade: fornecedor.cidade || '',
                    estado: fornecedor.estado || '',
                    ativo: fornecedor.ativo
                });

            } catch (error) {
                console.error("Erro ao carregar perfil:", error);
                setMessage({ type: 'error', text: 'Erro ao carregar dados do perfil. Tente novamente.' });
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (!formData.id) throw new Error("ID do fornecedor não identificado.");

            // Envia PUT para atualizar
            await api.put(`/api/v1/fornecedores/${formData.id}`, formData);

            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });

            // Opcional: Atualizar scroll para o topo para ver a mensagem
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error("Erro ao atualizar:", error);
            const msg = error.response?.data?.erro || error.message || "Erro ao salvar alterações.";
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles['dashboard-container']}>

            {/* SIDEBAR */}
            <nav className={styles.sidebar}>
                {/* Header Mobile */}
                <div className={styles.mobileHeader}>
                    <span className={styles.mobileLogo}>Menu Fornecedor</span>
                    <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <FiX size={24} /> : <FiMoreVertical size={24} />}
                    </button>
                </div>

                {/* Menu Itens */}
                <ul className={menuOpen ? styles.open : ''}>
                    <li>
                        <Link href="/fornecedor/dashboard" className={styles.linkReset}>
                            <div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/fornecedor/pedidos-recebidos" className={styles.linkReset}>
                            <div className={styles.menuItem}><FiPackage size={20} /><span>Pedidos Recebidos</span></div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/fornecedor/meus-produtos" className={styles.linkReset}>
                            <div className={styles.menuItem}><FiPackage size={20} /><span>Meus Produtos</span></div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/fornecedor/campanhas" className={styles.linkReset}>
                            <div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/fornecedor/condicoes-comerciais" className={styles.linkReset}>
                            <div className={styles.menuItem}><FiSettings size={20} /><span>Condições Comerciais</span></div>
                        </Link>
                    </li>
                    <li className={styles.active}>
                        <Link href="/fornecedor/perfil" className={styles.linkReset}>
                            <div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/" className={styles.linkReset}>
                            <div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div>
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* CONTEÚDO PRINCIPAL */}
            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Meu Perfil</h1>
                </header>

                {message && (
                    <div className={`${styles.alertMessage} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <div className={styles.formCard}>
                    <h2 className={styles.sectionTitle}>Dados da Empresa</h2>

                    <form onSubmit={handleSubmit}>
                        {/* Linha 1: Nome Fantasia e CNPJ */}
                        <div className={styles.row}>
                            <div className={`${styles.fieldGroup} ${styles['col-2']}`}>
                                <label>Nome Fantasia <span className={styles.requiredAsterisk}>*</span></label>
                                <input
                                    type="text"
                                    name="nomeFantasia"
                                    value={formData.nomeFantasia}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={`${styles.fieldGroup} ${styles['col-1']}`}>
                                <label>CNPJ <span className={styles.requiredAsterisk}>*</span></label>
                                <input
                                    type="text"
                                    name="cnpj"
                                    value={formData.cnpj}
                                    onChange={handleChange}
                                    maxLength={18}
                                    required
                                />
                            </div>
                        </div>

                        {/* Linha 2: Responsável e Email */}
                        <div className={styles.row}>
                            <div className={`${styles.fieldGroup} ${styles['col-1']}`}>
                                <label>Nome do Responsável</label>
                                <input
                                    type="text"
                                    name="responsavelNome"
                                    value={formData.responsavelNome}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={`${styles.fieldGroup} ${styles['col-1']}`}>
                                <label>Email de Contato (Login) <span className={styles.requiredAsterisk}>*</span></label>
                                <input
                                    type="email"
                                    name="emailContato"
                                    value={formData.emailContato}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <h2 className={styles.sectionTitle}>Endereço e Contato</h2>

                        {/* Linha 3: Telefone e CEP */}
                        <div className={styles.row}>
                            <div className={`${styles.fieldGroup} ${styles['col-1']}`}>
                                <label>Telefone / WhatsApp</label>
                                <input
                                    type="text"
                                    name="telefone"
                                    value={formData.telefone}
                                    onChange={handleChange}
                                    placeholder="(XX) XXXXX-XXXX"
                                />
                            </div>
                            <div className={`${styles.fieldGroup} ${styles['col-1']}`}>
                                <label>CEP</label>
                                <input
                                    type="text"
                                    name="cep"
                                    value={formData.cep}
                                    onChange={handleChange}
                                    maxLength={9}
                                />
                            </div>
                        </div>

                        {/* Linha 4: Logradouro */}
                        <div className={styles.row}>
                            <div className={`${styles.fieldGroup} ${styles['col-3']}`}>
                                <label>Logradouro</label>
                                <input
                                    type="text"
                                    name="logradouro"
                                    value={formData.logradouro}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Linha 5: Cidade e Estado */}
                        <div className={styles.row}>
                            <div className={`${styles.fieldGroup} ${styles['col-2']}`}>
                                <label>Cidade</label>
                                <input
                                    type="text"
                                    name="cidade"
                                    value={formData.cidade}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={`${styles.fieldGroup} ${styles['col-1']}`}>
                                <label>Estado (UF)</label>
                                <input
                                    type="text"
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    maxLength={2}
                                    style={{ textTransform: 'uppercase' }}
                                    placeholder="EX: SP"
                                />
                            </div>
                        </div>

                        {/* Botão de Ação */}
                        <div className={styles.footer}>
                            <button type="submit" className={styles.submitButton} disabled={loading}>
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default PerfilFornecedor;
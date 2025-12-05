import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/lojafornecedor.module.css';
import api from '@/services/api';

import {
    FiGrid,
    FiPackage,
    FiUser,
    FiLogOut,
    FiUsers,
    FiSearch
} from 'react-icons/fi';

const FornecedoresDisponiveis = () => {
    const router = useRouter();
    const [fornecedores, setFornecedores] = useState([]);
    const [filtroBusca, setFiltroBusca] = useState('');
    const [loading, setLoading] = useState(false);

    // Carregar fornecedores ativos do Backend
    useEffect(() => {
        async function fetchFornecedores() {
            setLoading(true);
            try {
                // Busca apenas os fornecedores ativos
                const res = await api.get('/api/v1/fornecedores/ativos');
                setFornecedores(res.data || []);
            } catch (error) {
                console.error('Erro ao buscar fornecedores:', error);
                setFornecedores([]);
            } finally {
                setLoading(false);
            }
        }
        fetchFornecedores();
    }, []);

    // Filtro de busca (Frontend)
    const fornecedoresFiltrados = useMemo(() => {
        if (!filtroBusca.trim()) return fornecedores;
        const termo = filtroBusca.toLowerCase();

        return fornecedores.filter(f => {
            const nome = f.nomeFantasia || '';
            const cidade = f.cidade || '';
            const categoria = f.categoria || '';

            return [nome, cidade, categoria]
                .some(valor => valor.toString().toLowerCase().includes(termo));
        });
    }, [fornecedores, filtroBusca]);

    // --- FUNÇÃO CORRIGIDA DO CATÁLOGO ---
    const handleVerCatalogo = (idFornecedor) => {
        // Redireciona para a página catalogo.js passando o ID pela URL
        router.push(`/loja/catalogo?id=${idFornecedor}`);
    };

    return (
        <div className={styles['dashboard-container']}>

            {/* Sidebar */}
            <nav className={styles.sidebar}>
                <ul>
                    <li>
                        <Link href="/loja/dashboard" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiGrid size={20} />
                                <span>Dashboard</span>
                            </div>
                        </Link>
                    </li>

                    <li className={styles.active}>
                        <Link href="/loja/fornecedoresdisponiveis" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiUsers size={20} />
                                <span>Fornecedores</span>
                            </div>
                        </Link>
                    </li>

                    <li>
                        <Link href="/loja/pedidos" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiPackage size={20} />
                                <span>Meus Pedidos</span>
                            </div>
                        </Link>
                    </li>



                    <li>
                        <Link href="/loja/perfil" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiUser size={20} />
                                <span>Perfil</span>
                            </div>
                        </Link>
                    </li>

                    <li>
                        <Link href="/" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiLogOut size={20} />
                                <span>Sair</span>
                            </div>
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Conteúdo Principal */}
            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Fornecedores Disponíveis</h1>
                </header>

                <section className={styles.actionsSection}>
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchIconCircle}>
                            <FiSearch />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por Nome ou Cidade"
                            className={styles.searchInput}
                            value={filtroBusca}
                            onChange={e => setFiltroBusca(e.target.value)}
                        />
                    </div>
                </section>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Nome do Fornecedor</th>
                                    <th>Categoria</th>
                                    <th>Cidade / Estado</th>
                                    <th>Contato</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className={styles.emptyState}>
                                            Carregando fornecedores...
                                        </td>
                                    </tr>
                                ) : fornecedoresFiltrados.length > 0 ? (
                                    fornecedoresFiltrados.map((fornecedor) => (
                                        <tr key={fornecedor.id}>
                                            <td style={{ fontWeight: 600, color: '#333' }}>
                                                {fornecedor.nomeFantasia}
                                            </td>
                                            <td>
                                                {fornecedor.categoria || '-'}
                                            </td>
                                            <td>
                                                {fornecedor.cidade} {fornecedor.estado ? `- ${fornecedor.estado}` : ''}
                                            </td>
                                            <td>
                                                {fornecedor.emailContato}
                                            </td>
                                            <td>
                                                <button
                                                    className={styles.btnCatalogo}
                                                    // Passa o ID para a função de navegação
                                                    onClick={() => handleVerCatalogo(fornecedor.id)}
                                                >
                                                    Ver Catálogo
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className={styles.emptyState}>
                                            Nenhum fornecedor disponível no momento.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default FornecedoresDisponiveis;
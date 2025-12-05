import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
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
    const [fornecedores, setFornecedores] = useState([]);
    const [filtroBusca, setFiltroBusca] = useState('');
    const [loading, setLoading] = useState(false);

    // Carregar fornecedores
    useEffect(() => {
        async function fetchFornecedores() {
            setLoading(true);
            try {
                const res = await api.get('/api/fornecedor'); // Ajuste o endpoint conforme seu Controller
                setFornecedores(res.data || []);
            } catch (error) {
                console.error('Erro ao buscar fornecedores:', error);
                // Mock para visualização
                setFornecedores([
                    { id: 1, nome: 'Tech Distribuidora', categoria: 'Eletrônicos', email: 'contato@tech.com', cidade: 'São Paulo - SP' },
                    { id: 2, nome: 'Moda Atacado Sul', categoria: 'Vestuário', email: 'vendas@modasul.com', cidade: 'Curitiba - PR' },
                    { id: 3, nome: 'Alimentos Boa Safra', categoria: 'Alimentos', email: 'comercial@boasafra.com', cidade: 'Porto Alegre - RS' }
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchFornecedores();
    }, []);

    // Filtro
    const fornecedoresFiltrados = useMemo(() => {
        if (!filtroBusca.trim()) return fornecedores;
        const termo = filtroBusca.toLowerCase();
        return fornecedores.filter(f =>
            [f.nome, f.categoria, f.cidade]
                .filter(Boolean)
                .some(valor => valor.toString().toLowerCase().includes(termo))
        );
    }, [fornecedores, filtroBusca]);

    return (
        <div className={styles['dashboard-container']}>

            {/* Sidebar Padrão */}
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

                    {/* ITEM ATIVO */}
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

                {/* Barra de Busca */}
                <section className={styles.actionsSection}>
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchIconCircle}>
                            <FiSearch />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por Nome, Categoria ou Cidade"
                            className={styles.searchInput}
                            value={filtroBusca}
                            onChange={e => setFiltroBusca(e.target.value)}
                        />
                    </div>
                </section>

                {/* Tabela de Fornecedores */}
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
                                        <td colSpan="5" className={styles.emptyState}>Carregando fornecedores...</td>
                                    </tr>
                                ) : fornecedoresFiltrados.length > 0 ? (
                                    fornecedoresFiltrados.map((fornecedor) => (
                                        <tr key={fornecedor.id}>
                                            <td style={{ fontWeight: 600, color: '#333' }}>
                                                {fornecedor.nome}
                                            </td>
                                            <td>{fornecedor.categoria || '-'}</td>
                                            <td>{fornecedor.cidade || '-'}</td>
                                            <td>{fornecedor.email}</td>
                                            <td>
                                                <button
                                                    className={styles.btnCatalogo}
                                                    onClick={() => alert(`Abrir catálogo de ${fornecedor.nome}`)}
                                                >
                                                    Ver Catálogo
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className={styles.emptyState}>
                                            Nenhum fornecedor encontrado.
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
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../styles/FornecedorProdutos.module.css';
import api from '@/services/api';

import {
    FiGrid, FiPackage, FiUser, FiLogOut, FiUsers, FiSettings
} from 'react-icons/fi';

const MeusProdutos = () => {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const usuarioStorage = localStorage.getItem('usuario');
                const usuario = usuarioStorage ? JSON.parse(usuarioStorage) : null;

                if (!usuario || !usuario.fornecedorId) {
                    setLoading(false);
                    return;
                }

                const res = await api.get('/api/v1/produtos');
                const todos = res.data || [];

                // Filtrar produtos deste fornecedor
                const meus = todos.filter(p => String(p.fornecedorId) === String(usuario.fornecedorId));

                setProdutos(meus);
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const { totalProdutos, totalEstoqueBaixo, totalCategorias } = useMemo(() => {
        const total = produtos.length;
        // Considera estoque baixo se < 10
        const estoqueBaixo = produtos.filter(p => (p.quantidadeEstoque || 0) <= 10).length;

        const categoriasSet = new Set(
            produtos.map(p => p.nomeCategoria).filter(Boolean)
        );

        return {
            totalProdutos: total,
            totalEstoqueBaixo: estoqueBaixo,
            totalCategorias: categoriasSet.size
        };
    }, [produtos]);

    const formatarPreco = (valor = 0) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

    return (
        <div className={styles['dashboard-container']}>
            <nav className={styles.sidebar}>
                <ul>
                    <li><Link href="/fornecedor/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
                    <li><Link href="/fornecedor/pedidos-recebidos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Pedidos Recebidos</span></div></Link></li>
                    <li className={styles.active}><Link href="/fornecedor/meus-produtos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Meus Produtos</span></div></Link></li>
                    <li><Link href="/fornecedor/campanhas" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Campanhas</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-comerciais" className={styles.linkReset}><div className={styles.menuItem}><FiSettings size={20} /><span>Condições Comerciais</span></div></Link></li>
                    <li><Link href="/fornecedor/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
                    <li><Link href="/" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Meus Produtos</h1>
                </header>

                <section className={styles.summarySection}>
                    <div className={styles.summaryBox}>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Total Cadastrado</span>
                            <span className={styles.summaryValue}>{totalProdutos}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Estoque Baixo</span>
                            <span className={styles.summaryValue}>{totalEstoqueBaixo}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Categorias</span>
                            <span className={styles.summaryValue}>{totalCategorias}</span>
                        </div>
                    </div>
                </section>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Categoria</th>
                                <th>Preço Base</th>
                                <th>Estoque</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className={styles.emptyState}>Carregando...</td></tr>
                            ) : produtos.length > 0 ? (
                                produtos.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.nome}</td>
                                        <td>{p.nomeCategoria || 'Geral'}</td>
                                        <td>{formatarPreco(p.precoBase)}</td>
                                        <td style={{ color: p.quantidadeEstoque <= 10 ? 'red' : 'inherit', fontWeight: p.quantidadeEstoque <= 10 ? 'bold' : 'normal'}}>
                                            {p.quantidadeEstoque}
                                        </td>
                                        <td>{p.ativo ? 'Ativo' : 'Inativo'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>Nenhum produto encontrado.</td>
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

export default MeusProdutos;
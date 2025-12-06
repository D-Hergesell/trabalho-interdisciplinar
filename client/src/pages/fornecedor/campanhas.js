import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../styles/FornecedorCampanhas.module.css';
import api from '@/services/api';

import {
    FiGrid, FiPackage, FiUser, FiLogOut, FiUsers, FiTag
} from 'react-icons/fi';

const Campanhas = () => {
    const [campanhas, setCampanhas] = useState([]);
    const [filtroBusca, setFiltroBusca] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Identificar Fornecedor Logado
                const usuarioStorage = localStorage.getItem('usuario');
                const usuario = usuarioStorage ? JSON.parse(usuarioStorage) : null;

                if (!usuario || !usuario.fornecedorId) {
                    console.warn("Usuário não é fornecedor ou não está logado.");
                    setLoading(false);
                    return;
                }

                // 2. Buscar Campanhas (Backend não tem endpoint específico de filtro, buscamos todas e filtramos aqui)
                const res = await api.get('/api/v1/campanhas');
                const todasCampanhas = res.data || [];

                // 3. Filtrar apenas deste fornecedor
                const minhasCampanhas = todasCampanhas.filter(c =>
                    String(c.fornecedorId) === String(usuario.fornecedorId)
                );

                setCampanhas(minhasCampanhas);
            } catch (error) {
                console.error('Erro ao carregar campanhas:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const { totalCampanhas, totalInativas, totalAtivas } = useMemo(() => {
        const total = campanhas.length;
        const inativas = campanhas.filter(c => c.ativo === false).length;
        const ativas = campanhas.filter(c => c.ativo === true).length;

        return { totalCampanhas: total, totalInativas: inativas, totalAtivas: ativas };
    }, [campanhas]);

    const campanhasFiltradas = useMemo(() => {
        if (!filtroBusca.trim()) return campanhas;
        const termo = filtroBusca.toLowerCase();
        return campanhas.filter(c =>
            [c.nome, c.tipo].filter(Boolean).some(v => v.toLowerCase().includes(termo))
        );
    }, [campanhas, filtroBusca]);

    // Helper para formatar o tipo de campanha vindo do Java
    const formatarTipo = (tipo) => {
        const mapa = {
            'valor_compra': 'Valor Mínimo',
            'quantidade_produto': 'Qtd. Produto',
            'percentual_produto': 'Desconto %'
        };
        return mapa[tipo] || tipo;
    };

    // Helper para descrever a condição
    const formatarCondicao = (c) => {
        if (c.tipo === 'valor_compra') return `Min: R$ ${c.valorMinimoCompra}`;
        if (c.tipo === 'quantidade_produto') return `Min: ${c.quantidadeMinimaProduto} un.`;
        if (c.tipo === 'percentual_produto') return `${c.percentualDesconto}% OFF`;
        return '-';
    };

    return (
        <div className={styles['dashboard-container']}>
            <nav className={styles.sidebar}>
                <ul>
                    <li><Link href="/fornecedor/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
                    <li><Link href="/fornecedor/pedidos-recebidos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Pedidos Recebidos</span></div></Link></li>
                    <li><Link href="/fornecedor/meus-produtos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Meus Produtos</span></div></Link></li>
                    <li className={styles.active}><Link href="/fornecedor/campanhas" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-comerciais" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Condições Comerciais</span></div></Link></li>
                    <li><Link href="/fornecedor/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
                    <li><Link href="/" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Campanhas Promocionais</h1>
                </header>

                <section className={styles.summarySection}>
                    <div className={styles.summaryBox}>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Campanhas Totais</span>
                            <span className={styles.summaryValue}>{totalCampanhas}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Campanhas Inativas</span>
                            <span className={styles.summaryValue}>{totalInativas}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Campanhas Ativas</span>
                            <span className={styles.summaryValue}>{totalAtivas}</span>
                        </div>
                    </div>
                </section>

                <section className={styles.actionsSection}>
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchIconCircle}>🔍</div>
                        <input
                            type="text"
                            placeholder="Buscar campanha..."
                            className={styles.searchInput}
                            value={filtroBusca}
                            onChange={e => setFiltroBusca(e.target.value)}
                        />
                    </div>
                </section>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Nome da Campanha</th>
                                <th>Tipo</th>
                                <th>Condição</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className={styles.emptyState}>Carregando...</td></tr>
                            ) : campanhasFiltradas.length > 0 ? (
                                campanhasFiltradas.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.nome}</td>
                                        <td>{formatarTipo(c.tipo)}</td>
                                        <td>{formatarCondicao(c)}</td>
                                        <td>
                                            <span style={{ color: c.ativo ? 'green' : 'red', fontWeight: 'bold' }}>
                                                {c.ativo ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className={styles.emptyState}>
                                        Nenhuma campanha encontrada.
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

export default Campanhas;
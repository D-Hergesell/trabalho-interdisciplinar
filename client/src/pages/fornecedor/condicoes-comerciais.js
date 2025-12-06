import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../styles/Condicao.module.css';
import api from '@/services/api';

import {
    FiGrid, FiPackage, FiUser, FiLogOut, FiUsers, FiSettings
} from 'react-icons/fi';

const CondicoesComerciais = () => {
    const [condicoes, setCondicoes] = useState([]);
    const [filtroBusca, setFiltroBusca] = useState('');
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

                const res = await api.get('/api/v1/condicoes-estado');
                const todas = res.data || [];

                // Filtra pelo ID do fornecedor logado
                const minhasCondicoes = todas.filter(c =>
                    String(c.fornecedorId) === String(usuario.fornecedorId)
                );

                setCondicoes(minhasCondicoes);
            } catch (error) {
                console.error('Erro ao carregar condições comerciais:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const { totalEstados, cashbackMedio, prazoMedio } = useMemo(() => {
        if (!condicoes.length) return { totalEstados: 0, cashbackMedio: 0, prazoMedio: 0 };

        const estadosSet = new Set(condicoes.map(c => c.estado).filter(Boolean));

        // Média Cashback
        const comCashback = condicoes.filter(c => c.cashbackPercentual > 0);
        const somaCashback = comCashback.reduce((acc, c) => acc + (c.cashbackPercentual || 0), 0);
        const cashbackMedio = comCashback.length > 0 ? somaCashback / comCashback.length : 0;

        // Média Prazo
        const comPrazo = condicoes.filter(c => c.prazoPagamentoDias > 0);
        const somaPrazo = comPrazo.reduce((acc, c) => acc + (c.prazoPagamentoDias || 0), 0);
        const prazoMedio = comPrazo.length > 0 ? somaPrazo / comPrazo.length : 0;

        return { totalEstados: estadosSet.size, cashbackMedio, prazoMedio };
    }, [condicoes]);

    const condicoesFiltradas = useMemo(() => {
        if (!filtroBusca.trim()) return condicoes;
        const termo = filtroBusca.toLowerCase();
        return condicoes.filter(c =>
            c.estado.toLowerCase().includes(termo)
        );
    }, [condicoes, filtroBusca]);

    const formatarCashback = valor => `${Number(valor || 0).toFixed(2)}%`;
    const formatarMoeda = valor => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

    return (
        <div className={styles['dashboard-container']}>
            <nav className={styles.sidebar}>
                <ul>
                    <li><Link href="/fornecedor/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
                    <li><Link href="/fornecedor/pedidos-recebidos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Pedidos Recebidos</span></div></Link></li>
                    <li><Link href="/fornecedor/meus-produtos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Meus Produtos</span></div></Link></li>
                    <li><Link href="/fornecedor/campanhas" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Campanhas</span></div></Link></li>
                    <li className={styles.active}><Link href="/fornecedor/condicoes-comerciais" className={styles.linkReset}><div className={styles.menuItem}><FiSettings size={20} /><span>Condições Comerciais</span></div></Link></li>
                    <li><Link href="/fornecedor/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
                    <li><Link href="/" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Condições Comerciais Regionais</h1>
                </header>

                <section className={styles.actionsSection}>
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchIconCircle}>🔍</div>
                        <input
                            type="text"
                            placeholder="Buscar Estado (UF)"
                            className={styles.searchInput}
                            value={filtroBusca}
                            onChange={e => setFiltroBusca(e.target.value)}
                        />
                    </div>
                </section>

                <section className={styles.summarySection}>
                    <div className={styles.summaryBox}>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Estados Atendidos</span>
                            <span className={styles.summaryValue}>{totalEstados}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Média Cashback</span>
                            <span className={styles.summaryValue}>{formatarCashback(cashbackMedio)}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Média Prazo</span>
                            <span className={styles.summaryValue}>{Math.round(prazoMedio)} Dias</span>
                        </div>
                    </div>
                </section>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                            <tr>
                                <th>Estado</th>
                                <th>Prazo Pagamento</th>
                                <th>Cashback</th>
                                <th>Ajuste Unitário</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className={styles.emptyState}>Carregando...</td></tr>
                            ) : condicoesFiltradas.length > 0 ? (
                                condicoesFiltradas.map((c) => (
                                    <tr key={c.id}>
                                        <td style={{fontWeight:'bold'}}>{c.estado}</td>
                                        <td>{c.prazoPagamentoDias} dias</td>
                                        <td>{c.cashbackPercentual ? `${c.cashbackPercentual}%` : '-'}</td>
                                        <td style={{ color: c.ajusteUnitarioAplicado > 0 ? 'red' : 'green' }}>
                                            {c.ajusteUnitarioAplicado ? formatarMoeda(c.ajusteUnitarioAplicado) : '-'}
                                        </td>
                                        <td>{c.ativo ? 'Ativo' : 'Inativo'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>
                                        Nenhuma condição comercial encontrada.
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

export default CondicoesComerciais;
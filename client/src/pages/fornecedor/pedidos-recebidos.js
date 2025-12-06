import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
import styles from '../../styles/FornecedorPedidos.module.css';
import api from '@/services/api';

import {
    FiGrid, FiPackage, FiUser, FiLogOut, FiUsers, FiSettings
} from 'react-icons/fi';

function PedidosRecebidos  () {
    const [pedidos, setPedidos] = useState([]);
    const [filtro, setFiltro] = useState('todos');
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

                // Endpoint específico do seu backend:
                const res = await api.get(`/api/v1/pedidos/fornecedor/${usuario.fornecedorId}`);
                setPedidos(res.data || []);
            } catch (error) {
                console.error('Erro ao carregar pedidos:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const { totalPedidos, totalPendentes, totalEnviados } = useMemo(() => {
        const total = pedidos.length;
        const pendentes = pedidos.filter(p => p.status === 'PENDENTE' || p.status === 'EM_SEPARACAO').length;
        const enviados = pedidos.filter(p => p.status === 'ENVIADO' || p.status === 'ENTREGUE').length;

        return { totalPedidos: total, totalPendentes: pendentes, totalEnviados: enviados };
    }, [pedidos]);

    const pedidosFiltrados = useMemo(() => {
        if (filtro === 'pendentes') {
            return pedidos.filter(p => p.status === 'PENDENTE' || p.status === 'EM_SEPARACAO');
        }
        if (filtro === 'enviados') {
            return pedidos.filter(p => p.status === 'ENVIADO' || p.status === 'ENTREGUE');
        }
        return pedidos;
    }, [filtro, pedidos]);

    const formatarValor = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

    const formatarData = (dataIso) => {
        if (!dataIso) return '-';
        return new Date(dataIso).toLocaleDateString('pt-BR');
    };

    return (
        <div className={styles['dashboard-container']}>
            <nav className={styles.sidebar}>
                <ul>
                    <li><Link href="/fornecedor/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
                    <li className={styles.active}><Link href="/fornecedor/pedidos-recebidos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Pedidos Recebidos</span></div></Link></li>
                    <li><Link href="/fornecedor/meus-produtos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Meus Produtos</span></div></Link></li>
                    <li><Link href="/fornecedor/campanhas" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Campanhas</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-comerciais" className={styles.linkReset}><div className={styles.menuItem}><FiSettings size={20} /><span>Condições Comerciais</span></div></Link></li>
                    <li><Link href="/fornecedor/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
                    <li><Link href="/" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Pedidos Recebidos</h1>
                </header>

                <section className={styles.filtersSection}>
                    <div className={styles.filterButtons}>
                        <button type="button" className={`${styles.filterButton} ${filtro === 'todos' ? styles.filterButtonActive : ''}`} onClick={() => setFiltro('todos')}>Todos</button>
                        <button type="button" className={`${styles.filterButton} ${filtro === 'pendentes' ? styles.filterButtonActive : ''}`} onClick={() => setFiltro('pendentes')}>Pendentes</button>
                        <button type="button" className={`${styles.filterButton} ${filtro === 'enviados' ? styles.filterButtonActive : ''}`} onClick={() => setFiltro('enviados')}>Enviados</button>
                    </div>
                </section>

                <section className={styles.summarySection}>
                    <div className={styles.summaryBox}>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Total</span>
                            <span className={styles.summaryValue}>{totalPedidos}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Abertos</span>
                            <span className={styles.summaryValue}>{totalPendentes}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Finalizados</span>
                            <span className={styles.summaryValue}>{totalEnviados}</span>
                        </div>
                    </div>
                </section>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Nº Pedido</th>
                                <th>Loja Solicitante</th>
                                <th>Valor Total</th>
                                <th>Status</th>
                                <th>Data</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className={styles.emptyState}>Carregando...</td></tr>
                            ) : pedidosFiltrados.length > 0 ? (
                                pedidosFiltrados.map((pedido) => (
                                    <tr key={pedido.id}>
                                        <td>#{String(pedido.id).substring(0, 8)}</td>
                                        <td>{pedido.lojaNome || 'Desconhecida'}</td>
                                        <td>{formatarValor(pedido.valorTotal)}</td>
                                        <td>{pedido.status}</td>
                                        <td>{formatarData(pedido.dataPedido)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>Nenhum pedido encontrado.</td>
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


export default withAuth(PedidosRecebidos, "fornecedor", "/");
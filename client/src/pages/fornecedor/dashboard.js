import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import withAuth from '../../components/withAuth';
import styles from '../../styles/FornecedorDashboard.module.css';
import api from '@/services/api';

import {
    FiGrid,
    FiShoppingBag,
    FiPackage,
    FiTag,
    FiSettings,
    FiUser,
    FiLogOut,
    FiMoreVertical,
    FiX, FiCreditCard
} from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';

function Dashboard() {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState({
        totalRecebidos: 0,
        valorTotal: 0,
        totalEnviados: 0,
        totalCampanhasAtivas: 0,
    });

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado para o Menu Mobile
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const usuarioStorage = localStorage.getItem('usuario');
                const usuario = usuarioStorage ? JSON.parse(usuarioStorage) : null;

                if (!usuario || !usuario.fornecedorId) {
                    console.warn("Usuário sem vínculo de fornecedor.");
                    setLoading(false);
                    return;
                }

                const [resPedidos, resCampanhas] = await Promise.all([
                    api.get(`/api/v1/pedidos/fornecedor/${usuario.fornecedorId}`),
                    api.get('/api/v1/campanhas')
                ]);

                const pedidosApi = resPedidos.data || [];
                const campanhasApi = resCampanhas.data || [];

                const totalRecebidos = pedidosApi.length;
                const valorTotal = pedidosApi.reduce((acc, item) => acc + (item.valorTotal || 0), 0);
                const totalEnviados = pedidosApi.filter(p => p.status === 'ENVIADO' || p.status === 'ENTREGUE').length;
                const totalCampanhasAtivas = campanhasApi.filter(c => String(c.fornecedorId) === String(usuario.fornecedorId) && c.ativo === true).length;

                setDashboardData({
                    totalRecebidos,
                    valorTotal,
                    totalEnviados,
                    totalCampanhasAtivas,
                });

                const pedidosRecentes = pedidosApi
                    .sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido)) // Ordena do mais recente
                    .slice(0, 5)
                    .map((p) => ({
                        id: p.id,
                        entity: p.lojaNome || 'Loja não informada',
                        value: p.valorTotal || 0,
                        status: p.status || 'PENDENTE',
                    }));

                setOrders(pedidosRecentes);

            } catch (error) {
                console.error('Erro ao carregar dados do dashboard:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const stats = [
        { label: 'Pedidos Recebidos', value: dashboardData.totalRecebidos },
        { label: 'Valor Total Vendido', value: formatCurrency(dashboardData.valorTotal) },
        { label: 'Pedidos Enviados', value: dashboardData.totalEnviados },
        { label: 'Campanhas Ativas', value: dashboardData.totalCampanhasAtivas },
    ];

    return (
        <div className={styles['dashboard-container']}>

            {/* SIDEBAR COM MENU MOBILE */}
            <nav className={styles.sidebar}>
                <div className={styles.mobileHeader}>
                    <span className={styles.mobileLogo}>Menu Fornecedor</span>
                    <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <FiX size={24} /> : <FiMoreVertical size={24} />}
                    </button>
                </div>

                <ul className={menuOpen ? styles.open : ''}>
                    <li className={styles.active}>
                        <Link href="/fornecedor/dashboard" className={styles.linkReset}>
                            <div className={styles.menuItem}><FiGrid size={20} /><span>Painel</span></div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/fornecedor/pedidos-recebidos" className={styles.linkReset}>
                            <div className={styles.menuItem}><FiShoppingBag size={20} /><span>Pedidos Recebidos</span></div>
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

                    <li><Link href="/fornecedor/condicoes-pagamento" className={styles.linkReset}><div className={styles.menuItem}><FiCreditCard size={20} /><span>Formas de Pagamento</span></div></Link></li>

                    <li>
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

            {/* MAIN */}
            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>DASHBOARD</h1>
                    <div className={styles['profile-area']}>
                        <FaUserCircle size={24} />
                        <span>Fornecedor</span>
                    </div>
                </header>

                {/* CARDS DE MÉTRICA */}
                <section className={styles['dashboard-cards']}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.card}>
                            <h3>{stat.label}</h3>
                            <p>{stat.value}</p>
                        </div>
                    ))}
                </section>

                {/* TABELA DE PEDIDOS RECENTES */}
                <section className={styles['table-section']}>
                    <h2 style={{ marginBottom: '20px', color: '#333' }}>Últimos Pedidos</h2>

                    <div className={styles['table-wrapper']}>
                        <table className={styles['custom-table']}>
                            <thead>
                            <tr>
                                <th>Nº do Pedido</th>
                                <th>Loja</th>
                                <th>Valor</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{textAlign:'center', padding:'20px'}}>Carregando...</td></tr>
                            ) : orders.length > 0 ? (
                                orders.map((order, index) => (
                                    <tr key={index}>
                                        <td data-label="Nº do Pedido">{String(order.id).substring(0, 8)}</td>
                                        <td data-label="Loja">{order.entity}</td>
                                        <td data-label="Valor">{formatCurrency(order.value)}</td>
                                        <td data-label="Status">{order.status}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                        Nenhum pedido recente.
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

export default withAuth(Dashboard, "fornecedor", "/");

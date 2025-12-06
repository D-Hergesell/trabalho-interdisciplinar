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
    FiLogOut
} from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';

function Dashboard  ()  {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState({
        totalRecebidos: 0,
        valorTotal: 0,
        totalEnviados: 0,
        totalCampanhasAtivas: 0,
    });

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Recupera o usuário do LocalStorage
                const usuarioStorage = localStorage.getItem('usuario');
                const usuario = usuarioStorage ? JSON.parse(usuarioStorage) : null;

                // 2. Se não tiver fornecedorId, manda pro login ou avisa
                if (!usuario || !usuario.fornecedorId) {
                    console.warn("Usuário sem vínculo de fornecedor.");
                    setLoading(false);
                    return;
                }

                // 3. Buscas em paralelo para agilizar
                const [resPedidos, resCampanhas] = await Promise.all([
                    // Busca pedidos específicos deste fornecedor
                    api.get(`/api/v1/pedidos/fornecedor/${usuario.fornecedorId}`),
                    // Busca todas as campanhas (o filtro será manual pois não há endpoint específico ainda)
                    api.get('/api/v1/campanhas')
                ]);

                const pedidosApi = resPedidos.data || [];
                const campanhasApi = resCampanhas.data || [];

                // --- Cálculos ---

                // Total de Pedidos
                const totalRecebidos = pedidosApi.length;

                // Valor Total Vendido
                const valorTotal = pedidosApi.reduce(
                    (acc, item) => acc + (item.valorTotal || 0),
                    0
                );

                // Total Enviados ou Entregues
                const totalEnviados = pedidosApi.filter(
                    p => p.status === 'ENVIADO' || p.status === 'ENTREGUE'
                ).length;

                // Campanhas Ativas deste Fornecedor
                const totalCampanhasAtivas = campanhasApi.filter(c =>
                    String(c.fornecedorId) === String(usuario.fornecedorId) && c.ativo === true
                ).length;

                setDashboardData({
                    totalRecebidos,
                    valorTotal,
                    totalEnviados,
                    totalCampanhasAtivas,
                });

                // Prepara a tabela (Pega os 5 últimos pedidos)
                const pedidosRecentes = pedidosApi
                    .slice(0, 5) // Pega apenas os 5 primeiros
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

    // Componente auxiliar para item do menu
    const NavItem = ({ icon, label, href, active }) => (
        <li className={active ? styles.active : ''}>
            <Link href={href} className={styles.linkReset}>
                <div className={styles.menuItem}>
                    {icon}
                    <span>{label}</span>
                </div>
            </Link>
        </li>
    );

    return (
        <div className={styles['dashboard-container']}>
            {/* SIDEBAR */}
            <aside className={styles.sidebar}>
                <ul>
                    <NavItem icon={<FiGrid size={20} />} label="Painel" href="/fornecedor/dashboard" active />
                    <NavItem icon={<FiShoppingBag size={20} />} label="Pedidos Recebidos" href="/fornecedor/pedidos-recebidos" />
                    <NavItem icon={<FiPackage size={20} />} label="Meus Produtos" href="/fornecedor/meus-produtos" />
                    <NavItem icon={<FiTag size={20} />} label="Campanhas" href="/fornecedor/campanhas" />
                    <NavItem icon={<FiSettings size={20} />} label="Condições Comerciais" href="/fornecedor/condicoes-comerciais" />
                    <NavItem icon={<FiUser size={20} />} label="Perfil" href="/fornecedor/perfil" />
                    <NavItem icon={<FiLogOut size={20} />} label="Sair" href="/" />
                </ul>
            </aside>

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
                                <tr><td colSpan="4" style={{textAlign:'center'}}>Carregando...</td></tr>
                            ) : orders.length > 0 ? (
                                orders.map((order, index) => (
                                    <tr key={index}>
                                        <td>{String(order.id).substring(0, 8)}</td>
                                        <td>{order.entity}</td>
                                        <td>{formatCurrency(order.value)}</td>
                                        <td>{order.status}</td>
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
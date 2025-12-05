import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/fornecedorGeral.module.css'; // Ajuste o caminho se necessário (ex: ../styles/Loja.module.css)
import api from '../../services/api';

// Substituindo lucide-react por react-icons/fi (que já está instalado)
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

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        totalRecebidos: 0,
        valorTotal: 0,
        totalEnviados: 0,
        totalCampanhasAtivas: 0,
    });

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                // Busca os pedidos (endpoint já filtrado ou geral, dependendo da lógica do back)
                // Se for fornecedor, o backend deve filtrar pelo token ou ID.
                const res = await api.get('/api/v1/pedidos');
                const pedidosApi = res.data || [];

                // Filtragem básica local se o backend retornar tudo (idealmente o backend filtra)
                // Supondo que estamos vendo dados "deste" fornecedor logado.

                const totalRecebidos = pedidosApi.length;
                const valorTotal = pedidosApi.reduce(
                    (acc, item) => acc + (item.valorTotal || item.total_amount || 0),
                    0
                );

                // Ajuste conforme os status reais do seu Enum (PENDENTE, ENVIADO, ENTREGUE, etc)
                const totalEnviados = pedidosApi.filter(
                    p => p.status === 'ENVIADO' || p.status === 'ENTREGUE'
                ).length;

                // Exemplo mockado para campanhas se não tiver endpoint ainda
                const totalCampanhasAtivas = 3;

                setDashboardData({
                    totalRecebidos,
                    valorTotal,
                    totalEnviados,
                    totalCampanhasAtivas,
                });

                const pedidosTratados = pedidosApi.map((p, index) => ({
                    id: p.id || `#${index + 1}`,
                    // store_id ou lojaNome vem do DTO
                    entity: p.lojaNome || 'Loja não informada',
                    value: new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    }).format(p.valorTotal || 0),
                    status: p.status || '—',
                }));

                setOrders(pedidosTratados);
            } catch (error) {
                console.error('Erro ao carregar dados do dashboard:', error);
            }
        }

        fetchData();
    }, []);

    const stats = [
        { label: 'Pedidos Recebidos', value: dashboardData.totalRecebidos },
        {
            label: 'Valor Total Vendido',
            value: new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(dashboardData.valorTotal),
        },
        { label: 'Pedidos Enviados', value: dashboardData.totalEnviados },
        { label: 'Campanhas Ativas', value: dashboardData.totalCampanhasAtivas },
    ];

    return (
        <div className={styles['dashboard-container']}>
            {/* SIDEBAR */}
            <aside className={styles.sidebar}>
                <ul>
                    <NavItem
                        icon={<FiGrid size={20} />}
                        label="Painel"
                        href="/fornecedor"
                        active
                    />
                    <NavItem
                        icon={<FiShoppingBag size={20} />}
                        label="Pedidos Recebidos"
                        href="/fornecedor/pedidos-recebidos"
                    />
                    <NavItem
                        icon={<FiPackage size={20} />}
                        label="Meus Produtos"
                        href="/fornecedor/meus-produtos"
                    />
                    <NavItem
                        icon={<FiTag size={20} />}
                        label="Campanhas"
                        href="/fornecedor/campanhas"
                    />
                    <NavItem
                        icon={<FiSettings size={20} />}
                        label="Condições Comerciais"
                        href="/fornecedor/condicoes-comerciais"
                    />
                    <NavItem
                        icon={<FiUser size={20} />}
                        label="Perfil"
                        href="/fornecedor/perfil"
                    />
                    <NavItem
                        icon={<FiLogOut size={20} />}
                        label="Sair"
                        href="/"
                    />
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

                    <div className={styles['table-section']}>
                        <table className={styles['custom-table'] || styles.table}>
                            <thead>
                            <tr>
                                <th>Nº do Pedido</th>
                                <th>Loja</th>
                                <th>Valor</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.map((order, index) => (
                                <tr key={index}>
                                    <td>{String(order.id).substring(0, 8)}</td>
                                    <td>{order.entity}</td>
                                    <td>{order.value}</td>
                                    <td>{order.status}</td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
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

// Componente Auxiliar para o Menu
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

export default Dashboard;
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../styles/LojaPedidos.module.css';
import api from '@/services/api';

import {
    FiGrid,
    FiPackage,
    FiUser,
    FiLogOut,
    FiUsers,
    FiSearch,
    FiEye
} from 'react-icons/fi';

const MeusPedidosLoja = () => {
    const [pedidos, setPedidos] = useState([]);
    const [filtroBusca, setFiltroBusca] = useState('');
    const [loading, setLoading] = useState(false);

    // Carregar pedidos da API
    useEffect(() => {
        async function fetchPedidos() {
            setLoading(true);
            try {
                // TODO: Pegar o ID da loja do usuário logado (ex: localStorage ou Context)
                // const lojaId = localStorage.getItem('lojaId');
                // Se não tiver login implementado, use um ID fixo para teste ou chame /api/v1/pedidos se for listar tudo

                // Exemplo chamando o endpoint de pedidos da loja específica
                // const res = await api.get(`/api/v1/pedidos/loja/${lojaId}`);

                // Para teste, vou chamar listar todos ou usar um mock se falhar
                const res = await api.get('/api/v1/pedidos');
                setPedidos(res.data || []);
            } catch (error) {
                console.error('Erro ao carregar pedidos:', error);
                // Mock para visualização caso a API falhe
                setPedidos([
                    { id: '12345', dataCriacao: '2023-10-01', total: 1500.00, status: 'PENDENTE', fornecedorNome: 'Fornecedor A' },
                    { id: '67890', dataCriacao: '2023-10-05', total: 230.50, status: 'APROVADO', fornecedorNome: 'Fornecedor B' },
                    { id: '11223', dataCriacao: '2023-10-10', total: 5000.00, status: 'ENVIADO', fornecedorNome: 'Fornecedor C' }
                ]);
            } finally {
                setLoading(false);
            }
        }

        fetchPedidos();
    }, []);

    // Filtro de busca
    const pedidosFiltrados = useMemo(() => {
        if (!filtroBusca.trim()) return pedidos;
        const termo = filtroBusca.toLowerCase();

        return pedidos.filter(p =>
            [p.id, p.status, p.fornecedorNome]
                .filter(Boolean)
                .some(valor => valor.toString().toLowerCase().includes(termo))
        );
    }, [pedidos, filtroBusca]);

    // Formatadores
    const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
    const formatarData = (data) => data ? new Date(data).toLocaleDateString('pt-BR') : '-';

    // Função auxiliar para classe de status
    const getStatusClass = (status) => {
        const s = (status || '').toUpperCase();
        if (s === 'PENDENTE' || s === 'PENDING') return styles.statusPendente;
        if (s === 'APROVADO' || s === 'APPROVED' || s === 'CONFIRMED') return styles.statusAprovado;
        if (s === 'ENVIADO' || s === 'SHIPPED') return styles.statusEnviado;
        if (s === 'CANCELADO' || s === 'CANCELED') return styles.statusCancelado;
        return '';
    };

    return (
        <div className={styles['dashboard-container']}>

            {/* Sidebar idêntica ao padrão solicitado */}
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

                    <li>
                        <Link href="/loja/fornecedoresdisponiveis" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiUsers size={20} />
                                <span>Fornecedores</span>
                            </div>
                        </Link>
                    </li>

                    {/* ITEM ATIVO */}
                    <li className={styles.active}>
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
                    <h1>Meus Pedidos</h1>
                </header>

                {/* Barra de Ações */}
                <section className={styles.actionsSection}>
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchIconCircle}>
                            <FiSearch />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por ID, Status ou Fornecedor"
                            className={styles.searchInput}
                            value={filtroBusca}
                            onChange={e => setFiltroBusca(e.target.value)}
                        />
                    </div>

                    <Link href="/loja/novo-pedido" style={{ textDecoration: 'none' }}>
                        <button className={styles.newOrderButton}>
                            + Novo Pedido
                        </button>
                    </Link>
                </section>

                {/* Tabela de Pedidos */}
                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>ID do Pedido</th>
                                    <th>Data</th>
                                    <th>Fornecedor</th>
                                    <th>Valor Total</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className={styles.emptyState}>Carregando pedidos...</td>
                                    </tr>
                                ) : pedidosFiltrados.length > 0 ? (
                                    pedidosFiltrados.map((pedido) => (
                                        <tr key={pedido.id}>
                                            <td>#{pedido.id.toString().substring(0, 8)}...</td>
                                            <td>{formatarData(pedido.dataCriacao)}</td>
                                            <td>{pedido.fornecedorNome || '-'}</td>
                                            <td>{formatarMoeda(pedido.total)}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${getStatusClass(pedido.status)}`}>
                                                    {pedido.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button className={styles.actionButton} title="Ver Detalhes">
                                                    <FiEye />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className={styles.emptyState}>
                                            Nenhum pedido encontrado.
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
//teste
export default MeusPedidosLoja;
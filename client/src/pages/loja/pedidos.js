import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/LojaPedidos.module.css';
import api from '@/services/api';

import {
    FiGrid,
    FiPackage,
    FiUser,
    FiLogOut,
    FiUsers,
    FiSearch,
    FiXCircle,
    FiMoreVertical,
    FiX
} from 'react-icons/fi';

const MeusPedidosLoja = () => {
    const router = useRouter();
    const [pedidos, setPedidos] = useState([]);
    const [filtroBusca, setFiltroBusca] = useState('');
    const [loading, setLoading] = useState(false);

    const [menuOpen, setMenuOpen] = useState(false);

    const fetchPedidos = useCallback(async () => {
        setLoading(true);
        try {
            const usuarioStorage = localStorage.getItem('usuario');
            if (!usuarioStorage) {
                console.warn("Usuário não logado");
                setLoading(false);
                return;
            }
            const usuario = JSON.parse(usuarioStorage);
            const idParaBuscar = usuario.lojaId || usuario.id;

            if (!idParaBuscar) {
                console.error("ID da loja não encontrado.");
                setLoading(false);
                return;
            }

            const res = await api.get(`/api/v1/pedidos/loja/${idParaBuscar}`);
            setPedidos(res.data || []);

        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPedidos();
    }, [fetchPedidos]);

    const handleCancelar = async (pedidoId, statusAtual) => {
        // 1. Mensagem Original Restaurada
        if (['ENVIADO', 'ENTREGUE', 'CANCELADO'].includes(statusAtual)) {
            alert('O pedido já foi enviado, entregue ou cancelado e não é mais possível cancelar. Entre em contato com o suporte ou fornecedor.');
            return;
        }

        if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) {
            return;
        }

        try {
            const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));
            await api.patch(`/api/v1/pedidos/${pedidoId}/status`, null, {
                params: { status: 'CANCELADO', usuarioId: usuarioLogado.id }
            });
            alert('Pedido cancelado com sucesso!');
            fetchPedidos();
        } catch (error) {
            console.error("Erro ao cancelar:", error);
            const msg = error.response?.data?.erro || "Erro ao cancelar.";
            alert(msg);
        }
    };

    const pedidosFiltrados = useMemo(() => {
        if (!filtroBusca.trim()) return pedidos;
        const termo = filtroBusca.toLowerCase();
        return pedidos.filter(p =>
            [p.id, p.status, p.fornecedorNome]
                .filter(Boolean)
                .some(valor => valor.toString().toLowerCase().includes(termo))
        );
    }, [pedidos, filtroBusca]);

    const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const getStatusClass = (status) => {
        const s = (status || '').toUpperCase();
        if (s === 'PENDENTE' || s === 'PENDING') return styles.statusPendente;
        if (s === 'EM_SEPARACAO') return styles.statusAprovado;
        if (s === 'ENVIADO' || s === 'SHIPPED') return styles.statusEnviado;
        if (s === 'ENTREGUE') return styles.statusAprovado;
        if (s === 'CANCELADO' || s === 'CANCELED') return styles.statusCancelado;
        return '';
    };

    return (
        <div className={styles['dashboard-container']}>
            <nav className={styles.sidebar}>
                <div className={styles.mobileHeader}>
                    <span className={styles.mobileLogo}>Menu Loja</span>
                    <button
                        className={styles.menuToggle}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <FiX size={24} /> : <FiMoreVertical size={24} />}
                    </button>
                </div>

                <ul className={menuOpen ? styles.open : ''}>
                    <li><Link href="/loja/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20}/><span>Dashboard</span></div></Link></li>
                    <li><Link href="/loja/fornecedoresdisponiveis" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20}/><span>Fornecedores</span></div></Link></li>
                    <li className={styles.active}><Link href="/loja/pedidos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20}/><span>Meus Pedidos</span></div></Link></li>
                    <li><Link href="/loja/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20}/><span>Perfil</span></div></Link></li>
                    <li><Link href="/" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20}/><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Meus Pedidos</h1>
                </header>

                <section className={styles.actionsSection}>
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchIconCircle}><FiSearch /></div>
                        <input type="text" placeholder="Buscar por ID, Status ou Fornecedor" className={styles.searchInput} value={filtroBusca} onChange={e => setFiltroBusca(e.target.value)} />
                    </div>
                    <Link href="/loja/novo-pedido" style={{ textDecoration: 'none' }}>
                        <button className={styles.newOrderButton}>+ Novo Pedido</button>
                    </Link>
                </section>

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
                                    <tr><td colSpan="6" className={styles.emptyState}>Carregando pedidos...</td></tr>
                                ) : pedidosFiltrados.length > 0 ? (
                                    pedidosFiltrados.map((pedido) => {
                                        const isCancelable = pedido.status === 'PENDENTE' || pedido.status === 'EM_SEPARACAO';
                                        return (
                                            <tr key={pedido.id}>
                                                <td data-label="ID">#{pedido.id.toString().substring(0, 8)}...</td>
                                                <td data-label="Data">{formatarData(pedido.dataPedido)}</td>
                                                <td data-label="Fornecedor">{pedido.fornecedorNome || '-'}</td>
                                                <td data-label="Valor">{formatarMoeda(pedido.valorTotal)}</td>
                                                <td data-label="Status"><span className={`${styles.statusBadge} ${getStatusClass(pedido.status)}`}>{pedido.status}</span></td>
                                                <td data-label="Ações" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <button
                                                        onClick={() => handleCancelar(pedido.id, pedido.status)}
                                                        // 2. Aplica classe 'btnDisabled' se não for cancelável, mas REMOVE o atributo 'disabled' para permitir o clique
                                                        className={`${styles.btnCancelIcon} ${!isCancelable ? styles.btnDisabled : ''}`}
                                                        title={isCancelable ? "Cancelar Pedido" : "Ver detalhes do cancelamento"}
                                                    >
                                                        <FiXCircle />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan="6" className={styles.emptyState}>Nenhum pedido encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default MeusPedidosLoja;
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../styles/FornecedorPedidos.module.css';
import withAuth from '../../components/withAuth';
import api from '@/services/api';

import {
    FiGrid, FiPackage, FiUser, FiLogOut, FiUsers, FiSettings,
    FiCheckCircle, FiTruck, FiMoreVertical, FiX, FiCreditCard,
    FiChevronDown, FiChevronUp
} from 'react-icons/fi';

const PedidosRecebidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [filtro, setFiltro] = useState('todos');
    const [loading, setLoading] = useState(true);

    const [expandedPedidoId, setExpandedPedidoId] = useState(null);
    const toggleDetails = (id) => setExpandedPedidoId(prev => prev === id ? null : id);

    // Estado para o Menu Mobile
    const [menuOpen, setMenuOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            if (!usuario || !usuario.fornecedorId) return;

            const res = await api.get(`/api/v1/pedidos/fornecedor/${usuario.fornecedorId}`);
            // Ordenar do mais recente
            const sorted = (res.data || []).sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido));
            setPedidos(sorted);
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // LÓGICA DE AVANÇAR STATUS
    const avancarStatus = async (pedido) => {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        let novoStatus = '';

        if (pedido.status === 'PENDENTE') novoStatus = 'EM_SEPARACAO';
        else if (pedido.status === 'EM_SEPARACAO') novoStatus = 'ENVIADO';
        else if (pedido.status === 'ENVIADO') novoStatus = 'ENTREGUE';
        else return;

        if(!confirm(`Deseja alterar o status para ${novoStatus}?`)) return;

        try {
            await api.patch(`/api/v1/pedidos/${pedido.id}/status`, null, {
                params: {
                    status: novoStatus,
                    usuarioId: usuario.id
                }
            });
            alert('Status atualizado com sucesso!');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.erro || "Erro ao atualizar status.");
        }
    };

    const pedidosFiltrados = useMemo(() => {
        if (filtro === 'pendentes') return pedidos.filter(p => ['PENDENTE', 'EM_SEPARACAO'].includes(p.status));
        if (filtro === 'enviados') return pedidos.filter(p => ['ENVIADO', 'ENTREGUE'].includes(p.status));
        return pedidos;
    }, [filtro, pedidos]);

    const formatarValor = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
    const formatarData = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

    return (
        <div className={styles['dashboard-container']}>

            {/* SIDEBAR COM MENU MOBILE */}
            <nav className={styles.sidebar}>
                <div className={styles.mobileHeader}>
                    <span className={styles.mobileLogo}>Menu Fornecedor</span>
                    <button
                        className={styles.menuToggle}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <FiX size={24} /> : <FiMoreVertical size={24} />}
                    </button>
                </div>

                <ul className={menuOpen ? styles.open : ''}>
                    <li><Link href="/fornecedor/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
                    <li className={styles.active}><Link href="/fornecedor/pedidos-recebidos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Pedidos Recebidos</span></div></Link></li>
                    <li><Link href="/fornecedor/meus-produtos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Meus Produtos</span></div></Link></li>
                    <li><Link href="/fornecedor/campanhas" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Campanhas</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-comerciais" className={styles.linkReset}><div className={styles.menuItem}><FiSettings size={20} /><span>Condições Comerciais</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-pagamento" className={styles.linkReset}><div className={styles.menuItem}><FiCreditCard size={20} /><span>Formas de Pagamento</span></div></Link></li>
                    <li><Link href="/fornecedor/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
                    <li><Link href="/" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Gestão de Pedidos</h1>
                </header>

                <section className={styles.filtersSection}>
                    <div className={styles.filterButtons}>
                        <button className={`${styles.filterButton} ${filtro === 'todos' ? styles.filterButtonActive : ''}`} onClick={() => setFiltro('todos')}>Todos</button>
                        <button className={`${styles.filterButton} ${filtro === 'pendentes' ? styles.filterButtonActive : ''}`} onClick={() => setFiltro('pendentes')}>Abertos</button>
                        <button className={`${styles.filterButton} ${filtro === 'enviados' ? styles.filterButtonActive : ''}`} onClick={() => setFiltro('enviados')}>Finalizados</button>
                    </div>
                </section>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>#ID</th>
                                <th>Loja</th>
                                <th>Valor</th>
                                <th>Data</th>
                                <th>Status</th>
                                <th>Ação</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Carregando...</td></tr>
                            ) : pedidosFiltrados.length === 0 ? (
                                <tr><td colSpan="6" className={styles.emptyState}>Nenhum pedido encontrado.</td></tr>
                            ) : (
                                pedidosFiltrados.map((p) => {
                                    const isExpanded = expandedPedidoId === p.id;
                                    return (
                                        <React.Fragment key={p.id}>
                                            <tr>
                                                <td data-label="#ID">
                                                    <button onClick={() => toggleDetails(p.id)} style={{background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontWeight:'bold', color:'#333'}}>
                                                        {isExpanded ? <FiChevronUp/> : <FiChevronDown/>}
                                                        {String(p.id).substring(0, 8)}
                                                    </button>
                                                </td>
                                                <td data-label="Loja">{p.lojaNome}</td>
                                                <td data-label="Valor">{formatarValor(p.valorTotal)}</td>
                                                <td data-label="Data">{formatarData(p.dataPedido)}</td>
                                                <td data-label="Status">
                            <span style={{
                                padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 'bold',
                                backgroundColor: p.status === 'PENDENTE' ? '#fff3cd' : p.status === 'ENVIADO' ? '#d1ecf1' : '#d4edda',
                                color: p.status === 'PENDENTE' ? '#856404' : p.status === 'ENVIADO' ? '#0c5460' : '#155724',
                                display: 'inline-block'
                            }}>
                                {p.status}
                            </span>
                                                </td>
                                                <td data-label="Ação" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    {p.status === 'PENDENTE' && (
                                                        <button onClick={() => avancarStatus(p)} className={styles.actionBtn}>
                                                            <FiCheckCircle /> Separar
                                                        </button>
                                                    )}
                                                    {p.status === 'EM_SEPARACAO' && (
                                                        <button onClick={() => avancarStatus(p)} className={`${styles.actionBtn} ${styles.btnSend}`}>
                                                            <FiTruck /> Enviar
                                                        </button>
                                                    )}
                                                    {['ENVIADO', 'ENTREGUE', 'CANCELADO'].includes(p.status) && (
                                                        <span style={{ color: '#aaa', fontSize: 12 }}>---</span>
                                                    )}
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr style={{backgroundColor: '#f9f9f9'}}>
                                                    <td colSpan="6">
                                                        <div style={{padding: '15px', borderTop:'1px dashed #ddd'}}>
                                                            <h4 style={{margin:'0 0 10px 0', fontSize:'14px', color:'#0c2b4e'}}>Linha do Tempo</h4>
                                                            <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px'}}>
                                                                <div>📅 <b>Pedido:</b> {p.dataPedido ? new Date(p.dataPedido).toLocaleString('pt-BR') : '-'}</div>
                                                                <div>📦 <b>Separação:</b> {p.dataSeparacao ? new Date(p.dataSeparacao).toLocaleString('pt-BR') : '-'}</div>
                                                                <div>🚚 <b>Enviado:</b> {p.dataEnviado ? new Date(p.dataEnviado).toLocaleString('pt-BR') : '-'}</div>
                                                                <div>✅ <b>Entregue:</b> {p.dataEntregue ? new Date(p.dataEntregue).toLocaleString('pt-BR') : '-'}</div>
                                                                {p.dataCancelado && <div style={{color:'red'}}>🚫 <b>Cancelado:</b> {new Date(p.dataCancelado).toLocaleString('pt-BR')}</div>}
                                                            </div>

                                                            <h4 style={{margin:'15px 0 5px 0', fontSize:'14px', color:'#0c2b4e'}}>Itens Solicitados</h4>
                                                            <ul style={{margin:0, paddingLeft:20, fontSize:'13px'}}>
                                                                {p.itens && p.itens.map((it, i) => (
                                                                    <li key={i}>{it.quantidade}x {it.produtoNome}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default withAuth(PedidosRecebidos, 'fornecedor');
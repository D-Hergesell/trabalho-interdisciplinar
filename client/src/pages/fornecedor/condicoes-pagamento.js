import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
// IMPORTANTE: Usar um CSS module específico para evitar conflitos ou reutilizar o Campanha se preferir
import styles from '../../styles/FornecedorCampanhas.module.css';
import api from '@/services/api';
import {
    FiGrid, FiPackage, FiUser, FiLogOut, FiUsers, FiSettings,
    FiPlus, FiTrash2, FiCreditCard, FiMoreVertical, FiX
} from 'react-icons/fi';

function CondicoesPagamento() {
    const [condicoes, setCondicoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);

    // Estado do menu mobile
    const [menuOpen, setMenuOpen] = useState(false);

    // Estado do formulário
    const [novoPrazo, setNovoPrazo] = useState({ descricao: '', prazoDias: '' });

    useEffect(() => {
        carregarCondicoes();
    }, []);

    async function carregarCondicoes() {
        try {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            if (!usuario?.fornecedorId) return;

            const res = await api.get(`/api/v1/condicoes-pagamento/fornecedor/${usuario.fornecedorId}`);
            setCondicoes(res.data || []);
        } catch (error) {
            console.error("Erro ao carregar condições:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSalvar(e) {
        e.preventDefault();
        try {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            await api.post('/api/v1/condicoes-pagamento', {
                fornecedorId: usuario.fornecedorId,
                descricao: novoPrazo.descricao,
                prazoDias: parseInt(novoPrazo.prazoDias),
                ativo: true
            });
            setNovoPrazo({ descricao: '', prazoDias: '' });
            setFormVisible(false);
            carregarCondicoes();
            alert("Condição cadastrada!");
        } catch (error) {
            alert("Erro ao cadastrar: " + (error.response?.data?.erro || "Erro desconhecido"));
        }
    }

    async function handleDeletar(id) {
        if(!confirm("Deseja remover esta condição?")) return;
        try {
            await api.delete(`/api/v1/condicoes-pagamento/${id}`);
            carregarCondicoes();
        } catch (error) {
            alert("Erro ao deletar.");
        }
    }

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
                    <li><Link href="/fornecedor/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
                    <li><Link href="/fornecedor/pedidos-recebidos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Pedidos Recebidos</span></div></Link></li>
                    <li><Link href="/fornecedor/meus-produtos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Meus Produtos</span></div></Link></li>
                    <li><Link href="/fornecedor/campanhas" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Campanhas</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-comerciais" className={styles.linkReset}><div className={styles.menuItem}><FiSettings size={20} /><span>Condições Regionais</span></div></Link></li>

                    {/* Item Ativo */}
                    <li className={styles.active}>
                        <Link href="/fornecedor/condicoes-pagamento" className={styles.linkReset}>
                            <div className={styles.menuItem}><FiCreditCard size={20} /><span>Formas de Pagamento</span></div>
                        </Link>
                    </li>

                    <li><Link href="/fornecedor/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
                    <li><Link href="/" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Formas de Pagamento (Genéricas)</h1>
                </header>

                <div style={{marginBottom: 20}}>
                    {!formVisible ? (
                        <button onClick={() => setFormVisible(true)} className={styles.newCampaignButton}>
                            <FiPlus /> Nova Condição
                        </button>
                    ) : (
                        <form onSubmit={handleSalvar} className={styles.summaryBox} style={{flexDirection: 'column', gap: 15, alignItems: 'flex-start'}}>
                            <h3 style={{margin: 0, color: '#333'}}>Nova Condição</h3>
                            <div style={{display:'flex', gap: 10, width: '100%', flexWrap: 'wrap'}}>
                                <input
                                    type="text"
                                    placeholder="Descrição (ex: Boleto 30 Dias)"
                                    className={styles.searchInput}
                                    style={{flex: 2, border: '1px solid #ccc', minWidth: '200px'}}
                                    value={novoPrazo.descricao}
                                    onChange={e => setNovoPrazo({...novoPrazo, descricao: e.target.value})}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Prazo (dias)"
                                    className={styles.searchInput}
                                    style={{flex: 1, border: '1px solid #ccc', minWidth: '100px'}}
                                    value={novoPrazo.prazoDias}
                                    onChange={e => setNovoPrazo({...novoPrazo, prazoDias: e.target.value})}
                                    required
                                />
                            </div>
                            <div style={{display: 'flex', gap: 10, width: '100%', justifyContent: 'flex-end'}}>
                                <button type="button" onClick={() => setFormVisible(false)} style={{padding: '10px 20px', border: '1px solid #ccc', borderRadius: 8, background: '#fff', cursor: 'pointer'}}>Cancelar</button>
                                <button type="submit" className={styles.newCampaignButton}>Salvar</button>
                            </div>
                        </form>
                    )}
                </div>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Descrição</th>
                                <th>Prazo (Dias)</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{textAlign:'center', padding:'20px'}}>Carregando...</td></tr>
                            ) : condicoes.length === 0 ? (
                                <tr><td colSpan="4" className={styles.emptyState}>Nenhuma condição cadastrada.</td></tr>
                            ) : (
                                condicoes.map(c => (
                                    <tr key={c.id}>
                                        <td data-label="Descrição">{c.descricao}</td>
                                        <td data-label="Prazo">{c.prazoDias} dias</td>
                                        <td data-label="Status">
                                            {c.ativo ? <span style={{color:'green', fontWeight:'bold'}}>Ativo</span> : 'Inativo'}
                                        </td>
                                        <td data-label="Ações" style={{textAlign: 'right'}}>
                                            <button onClick={() => handleDeletar(c.id)} style={{border:'none', background:'none', color:'#dc3545', cursor:'pointer', padding:'5px'}}>
                                                <FiTrash2 size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default withAuth(CondicoesPagamento, "fornecedor", "/");
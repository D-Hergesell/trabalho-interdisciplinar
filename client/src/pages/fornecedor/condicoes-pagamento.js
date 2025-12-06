import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
import styles from '../../styles/FornecedorCampanhas.module.css'; // Reutilizando estilos
import api from '@/services/api';
import { FiGrid, FiPackage, FiUser, FiLogOut, FiUsers, FiSettings, FiPlus, FiTrash2, FiCreditCard } from 'react-icons/fi';

function CondicoesPagamento() {
    const [condicoes, setCondicoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);

    // Estado do formulário
    const [novoPrazo, setNovoPrazo] = useState({ descricao: '', prazoDias: '' });

    useEffect(() => {
        carregarCondicoes();
    }, []);

    async function carregarCondicoes() {
        try {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            if (!usuario?.fornecedorId) return;

            // Busca usando o novo endpoint que criamos no backend
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
            <nav className={styles.sidebar}>
                <ul>
                    <li><Link href="/fornecedor/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
                    <li><Link href="/fornecedor/pedidos-recebidos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Pedidos Recebidos</span></div></Link></li>
                    <li><Link href="/fornecedor/meus-produtos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Meus Produtos</span></div></Link></li>
                    <li><Link href="/fornecedor/campanhas" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Campanhas</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-comerciais" className={styles.linkReset}><div className={styles.menuItem}><FiSettings size={20} /><span>Condições Regionais</span></div></Link></li>
                    {/* Novo Item no Menu */}
                    <li className={styles.active}><Link href="/fornecedor/condicoes-pagamento" className={styles.linkReset}><div className={styles.menuItem}><FiCreditCard size={20} /><span>Formas de Pagamento</span></div></Link></li>
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
                            <h3>Nova Condição</h3>
                            <div style={{display:'flex', gap: 10, width: '100%'}}>
                                <input
                                    type="text"
                                    placeholder="Descrição (ex: Boleto 30 Dias)"
                                    className={styles.searchInput}
                                    style={{flex: 2, border: '1px solid #ccc'}}
                                    value={novoPrazo.descricao}
                                    onChange={e => setNovoPrazo({...novoPrazo, descricao: e.target.value})}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Prazo (dias)"
                                    className={styles.searchInput}
                                    style={{flex: 1, border: '1px solid #ccc'}}
                                    value={novoPrazo.prazoDias}
                                    onChange={e => setNovoPrazo({...novoPrazo, prazoDias: e.target.value})}
                                    required
                                />
                            </div>
                            <div style={{display: 'flex', gap: 10}}>
                                <button type="submit" className={styles.newCampaignButton}>Salvar</button>
                                <button type="button" onClick={() => setFormVisible(false)} style={{padding: '10px 20px', border: '1px solid #ccc', borderRadius: 8, background: '#fff', cursor: 'pointer'}}>Cancelar</button>
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
                            {loading ? <tr><td colSpan="4">Carregando...</td></tr> :
                                condicoes.length === 0 ? <tr><td colSpan="4" className={styles.emptyState}>Nenhuma condição cadastrada.</td></tr> :
                                    condicoes.map(c => (
                                        <tr key={c.id}>
                                            <td>{c.descricao}</td>
                                            <td>{c.prazoDias} dias</td>
                                            <td>{c.ativo ? <span style={{color:'green', fontWeight:'bold'}}>Ativo</span> : 'Inativo'}</td>
                                            <td>
                                                <button onClick={() => handleDeletar(c.id)} style={{border:'none', background:'none', color:'red', cursor:'pointer'}}><FiTrash2 size={18}/></button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default withAuth(CondicoesPagamento, "fornecedor", "/");
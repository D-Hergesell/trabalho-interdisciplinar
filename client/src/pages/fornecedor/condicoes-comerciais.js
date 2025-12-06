import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth'; // Importação corrigida
import styles from '../../styles/Condicao.module.css';
import api from '@/services/api';

import {
    FiGrid, FiPackage, FiUser, FiLogOut, FiUsers, FiSettings, FiPlus, FiEdit, FiTrash2
} from 'react-icons/fi';

const CondicoesComerciais = () => {
    const [condicoes, setCondicoes] = useState([]);
    const [filtroBusca, setFiltroBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado do Formulário
    const [formData, setFormData] = useState({
        id: null,
        estado: '',
        prazoPagamentoDias: '',
        cashbackPercentual: '',
        ajusteUnitarioAplicado: '',
        ativo: true
    });

    // Buscar dados
    const fetchData = async () => {
        setLoading(true);
        try {
            const usuarioStorage = localStorage.getItem('usuario');
            const usuario = usuarioStorage ? JSON.parse(usuarioStorage) : null;

            if (!usuario || !usuario.fornecedorId) return;

            const res = await api.get('/api/v1/condicoes-estado');
            const todas = res.data || [];

            // Filtra apenas as deste fornecedor
            const minhas = todas.filter(c => String(c.fornecedorId) === String(usuario.fornecedorId));
            setCondicoes(minhas);
        } catch (error) {
            console.error('Erro ao carregar condições:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Ações do Modal
    const openModal = (condicao = null) => {
        if (condicao) {
            setFormData({
                id: condicao.id,
                estado: condicao.estado,
                prazoPagamentoDias: condicao.prazoPagamentoDias,
                cashbackPercentual: condicao.cashbackPercentual || 0,
                ajusteUnitarioAplicado: condicao.ajusteUnitarioAplicado || 0,
                ativo: condicao.ativo
            });
        } else {
            setFormData({ id: null, estado: '', prazoPagamentoDias: '', cashbackPercentual: '', ajusteUnitarioAplicado: '', ativo: true });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Salvar (POST ou PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const usuario = JSON.parse(localStorage.getItem('usuario'));

            const payload = {
                fornecedorId: usuario.fornecedorId,
                estado: formData.estado.toUpperCase(),
                prazoPagamentoDias: parseInt(formData.prazoPagamentoDias),
                cashbackPercentual: formData.cashbackPercentual ? parseFloat(formData.cashbackPercentual) : 0,
                ajusteUnitarioAplicado: formData.ajusteUnitarioAplicado ? parseFloat(formData.ajusteUnitarioAplicado) : 0,
                ativo: formData.ativo
            };

            if (formData.id) {
                await api.put(`/api/v1/condicoes-estado/${formData.id}`, payload);
                alert("Condição atualizada com sucesso!");
            } else {
                await api.post('/api/v1/condicoes-estado', payload);
                alert("Condição criada com sucesso!");
            }
            closeModal();
            fetchData();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.erro || "Erro ao salvar condição.");
        }
    };

    // Excluir
    const handleDelete = async (id) => {
        if(!window.confirm("Deseja realmente excluir esta regra?")) return;
        try {
            await api.delete(`/api/v1/condicoes-estado/${id}`);
            fetchData();
        } catch (error) {
            alert("Erro ao excluir.");
        }
    };

    const condicoesFiltradas = useMemo(() => {
        if (!filtroBusca.trim()) return condicoes;
        return condicoes.filter(c => c.estado.toLowerCase().includes(filtroBusca.toLowerCase()));
    }, [condicoes, filtroBusca]);

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

                <section className={styles.actionsSection} style={{display:'flex', justifyContent:'space-between', marginBottom: 20}}>
                    <div className={styles.searchWrapper}>
                        <input type="text" placeholder="Buscar Estado (UF)" className={styles.searchInput} value={filtroBusca} onChange={e => setFiltroBusca(e.target.value)} />
                    </div>
                    <button className={styles.submitButton} onClick={() => openModal()} style={{width: 'auto', padding: '10px 20px', display:'flex', gap: 10, alignItems:'center'}}>
                        <FiPlus /> Nova Regra
                    </button>
                </section>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                            <tr>
                                <th>Estado</th>
                                <th>Prazo (Dias)</th>
                                <th>Cashback</th>
                                <th>Ajuste (R$)</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {condicoesFiltradas.map((c) => (
                                <tr key={c.id}>
                                    <td><b>{c.estado}</b></td>
                                    <td>{c.prazoPagamentoDias}</td>
                                    <td>{c.cashbackPercentual}%</td>
                                    <td style={{ color: c.ajusteUnitarioAplicado > 0 ? 'red' : 'green' }}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.ajusteUnitarioAplicado)}
                                    </td>
                                    <td>{c.ativo ? 'Ativo' : 'Inativo'}</td>
                                    <td>
                                        <button onClick={() => openModal(c)} style={{marginRight: 10, border:'none', background:'transparent', cursor:'pointer', color:'#007bff'}}><FiEdit size={18}/></button>
                                        <button onClick={() => handleDelete(c.id)} style={{border:'none', background:'transparent', cursor:'pointer', color:'#dc3545'}}><FiTrash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* MODAL SIMPLES (Inline Styles para garantir funcionamento sem CSS extra) */}
                {isModalOpen && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div style={{ backgroundColor: 'white', padding: 30, borderRadius: 8, width: 400 }}>
                            <h2 style={{marginTop:0}}>{formData.id ? 'Editar Regra' : 'Nova Regra'}</h2>
                            <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap: 15}}>
                                <div>
                                    <label>Estado (UF)</label>
                                    <input className={styles.input} style={{width:'100%', padding: 8}} type="text" name="estado" maxLength="2" value={formData.estado} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label>Prazo Pagamento (Dias)</label>
                                    <input style={{width:'100%', padding: 8}} type="number" name="prazoPagamentoDias" value={formData.prazoPagamentoDias} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label>Cashback (%)</label>
                                    <input style={{width:'100%', padding: 8}} type="number" step="0.01" name="cashbackPercentual" value={formData.cashbackPercentual} onChange={handleChange} />
                                </div>
                                <div>
                                    <label>Ajuste Preço (R$)</label>
                                    <input style={{width:'100%', padding: 8}} type="number" step="0.01" name="ajusteUnitarioAplicado" value={formData.ajusteUnitarioAplicado} onChange={handleChange} />
                                    <small>Use negativo para desconto.</small>
                                </div>
                                <div style={{display:'flex', gap: 10}}>
                                    <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange} />
                                    <label>Ativo</label>
                                </div>
                                <div style={{display:'flex', justifyContent:'flex-end', gap: 10, marginTop: 10}}>
                                    <button type="button" onClick={closeModal} style={{padding:'8px 15px', cursor:'pointer'}}>Cancelar</button>
                                    <button type="submit" style={{padding:'8px 15px', backgroundColor:'#0c2b4e', color:'white', border:'none', cursor:'pointer'}}>Salvar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default withAuth(CondicoesComerciais, "fornecedor");
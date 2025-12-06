import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
import styles from '../../styles/Condicao.module.css';
import api from '@/services/api';

import {
    FiGrid, FiPackage, FiUser, FiLogOut, FiUsers, FiSettings,
    FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiX, FiCreditCard
} from 'react-icons/fi';

const CondicoesComerciais = () => {
    const [condicoes, setCondicoes] = useState([]);
    const [filtroBusca, setFiltroBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado para o Menu Mobile
    const [menuOpen, setMenuOpen] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        estado: '',
        prazoPagamentoDias: '',
        cashbackPercentual: '',
        ajusteUnitarioAplicado: '',
        ativo: true
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const usuarioStorage = localStorage.getItem('usuario');
            const usuario = usuarioStorage ? JSON.parse(usuarioStorage) : null;
            if (!usuario || !usuario.fornecedorId) return;

            const res = await api.get('/api/v1/condicoes-estado');
            const todas = res.data || [];
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
                    <li className={styles.active}><Link href="/fornecedor/condicoes-comerciais" className={styles.linkReset}><div className={styles.menuItem}><FiSettings size={20} /><span>Condições Comerciais</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-pagamento" className={styles.linkReset}><div className={styles.menuItem}><FiCreditCard size={20} /><span>Formas de Pagamento</span></div></Link></li>
                    <li><Link href="/fornecedor/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
                    <li><Link href="/" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Condições Comerciais Regionais</h1>
                </header>

                <section className={styles.actionsSection}>
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Buscar Estado (UF)"
                            className={styles.searchInput}
                            value={filtroBusca}
                            onChange={e => setFiltroBusca(e.target.value)}
                        />
                    </div>
                    <button className={styles.newCampaignButton} onClick={() => openModal()}>
                        <FiPlus /> Nova Regra
                    </button>
                </section>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
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
                                    <td data-label="Estado"><b>{c.estado}</b></td>
                                    <td data-label="Prazo">{c.prazoPagamentoDias}</td>
                                    <td data-label="Cashback">{c.cashbackPercentual}%</td>
                                    <td data-label="Ajuste" style={{ color: c.ajusteUnitarioAplicado > 0 ? 'red' : 'green' }}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.ajusteUnitarioAplicado)}
                                    </td>
                                    <td data-label="Status">{c.ativo ? 'Ativo' : 'Inativo'}</td>
                                    <td data-label="Ações" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <button onClick={() => openModal(c)} className={styles.btnEdit} title="Editar"><FiEdit size={18}/></button>
                                        <button onClick={() => handleDelete(c.id)} className={styles.btnDelete} title="Excluir"><FiTrash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* MODAL RESPONSIVO */}
                {isModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>{formData.id ? 'Editar Regra' : 'Nova Regra'}</h2>
                                <button onClick={closeModal} className={styles.closeModalBtn}><FiX size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.modalForm}>
                                <div className={styles.rowGroup}>
                                    <div className={styles.inputGroup}>
                                        <label>Estado (UF)</label>
                                        <input
                                            className={styles.modalInput}
                                            type="text"
                                            name="estado"
                                            maxLength="2"
                                            value={formData.estado}
                                            onChange={handleChange}
                                            required
                                            placeholder="SP"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Prazo (Dias)</label>
                                        <input
                                            className={styles.modalInput}
                                            type="number"
                                            name="prazoPagamentoDias"
                                            value={formData.prazoPagamentoDias}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.rowGroup}>
                                    <div className={styles.inputGroup}>
                                        <label>Cashback (%)</label>
                                        <input
                                            className={styles.modalInput}
                                            type="number"
                                            step="0.01"
                                            name="cashbackPercentual"
                                            value={formData.cashbackPercentual}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Ajuste Preço (R$)</label>
                                        <input
                                            className={styles.modalInput}
                                            type="number"
                                            step="0.01"
                                            name="ajusteUnitarioAplicado"
                                            value={formData.ajusteUnitarioAplicado}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className={styles.checkboxGroup}>
                                    <input
                                        type="checkbox"
                                        id="ativoCheck"
                                        name="ativo"
                                        checked={formData.ativo}
                                        onChange={handleChange}
                                        style={{width: '20px', height: '20px'}}
                                    />
                                    <label htmlFor="ativoCheck">Regra Ativa</label>
                                </div>

                                <div className={styles.modalActions}>
                                    <button type="button" onClick={closeModal} className={styles.btnCancel}>Cancelar</button>
                                    <button type="submit" className={styles.btnSave}>Salvar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};


export default withAuth(CondicoesComerciais, "fornecedor", "/");
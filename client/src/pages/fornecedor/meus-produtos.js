import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../styles/FornecedorProdutos.module.css';
import withAuth from '../../components/withAuth';
import api from '@/services/api';

import {
    FiGrid, FiPackage, FiUser, FiLogOut, FiUsers, FiSettings,
    FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiX, FiCreditCard
} from 'react-icons/fi';

const MeusProdutos = () => {
    const [produtos, setProdutos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado para o Menu Mobile
    const [menuOpen, setMenuOpen] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        nome: '',
        descricao: '',
        precoBase: '',
        unidadeMedida: '',
        quantidadeEstoque: '',
        categoriaId: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const usuarioStorage = localStorage.getItem('usuario');
            const usuario = usuarioStorage ? JSON.parse(usuarioStorage) : null;
            if (!usuario || !usuario.fornecedorId) return;

            // Busca Produtos
            const resProd = await api.get('/api/v1/produtos');
            const meus = (resProd.data || []).filter(p => String(p.fornecedorId) === String(usuario.fornecedorId));
            setProdutos(meus);

            // Busca Categorias
            const resCat = await api.get('/api/v1/categorias');
            setCategorias(resCat.data || []);

        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (prod = null) => {
        if (prod) {
            setFormData({
                id: prod.id,
                nome: prod.nome,
                descricao: prod.descricao || '',
                precoBase: prod.precoBase,
                unidadeMedida: prod.unidadeMedida || '',
                quantidadeEstoque: prod.quantidadeEstoque,
                categoriaId: prod.categoriaId || ''
            });
        } else {
            setFormData({ id: null, nome: '', descricao: '', precoBase: '', unidadeMedida: '', quantidadeEstoque: '', categoriaId: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const usuario = JSON.parse(localStorage.getItem('usuario'));

        const payload = {
            nome: formData.nome,
            descricao: formData.descricao,
            precoBase: parseFloat(formData.precoBase),
            quantidadeEstoque: parseInt(formData.quantidadeEstoque),
            unidadeMedida: formData.unidadeMedida,
            categoriaId: formData.categoriaId || null,
            fornecedorId: usuario.fornecedorId
        };

        try {
            if (formData.id) {
                await api.put(`/api/v1/produtos/${formData.id}`, payload);
                alert('Produto atualizado!');
            } else {
                await api.post('/api/v1/produtos', payload);
                alert('Produto criado!');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar produto.');
        }
    };

    const handleDelete = async (id) => {
        if(!confirm("Excluir produto?")) return;
        try {
            await api.delete(`/api/v1/produtos/${id}`);
            fetchData();
        } catch (e) { alert("Erro ao excluir"); }
    };

    const formatarPreco = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    // Totais para o resumo
    const totalProdutos = produtos.length;
    const baixoEstoque = produtos.filter(p => p.quantidadeEstoque < 10).length;
    const totalCategorias = new Set(produtos.map(p => p.categoriaId)).size;

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
                    <li className={styles.active}><Link href="/fornecedor/meus-produtos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Meus Produtos</span></div></Link></li>
                    <li><Link href="/fornecedor/campanhas" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Campanhas</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-comerciais" className={styles.linkReset}><div className={styles.menuItem}><FiSettings size={20} /><span>Condições Comerciais</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-pagamento" className={styles.linkReset}><div className={styles.menuItem}><FiCreditCard size={20} /><span>Formas de Pagamento</span></div></Link></li>
                   <li><Link href="/fornecedor/condicoes-pagamento" className={styles.linkReset}><div className={styles.menuItem}><FiCreditCard size={20} /><span>Formas de Pagamento</span></div></Link></li>
                    <li><Link href="/fornecedor/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
                    <li><Link href="/" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Meus Produtos</h1>
                </header>

                 <section className={styles.summarySection}>
                    <div className={styles.summaryBox}>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Total Produtos</span>
                            <span className={styles.summaryValue}>{totalProdutos}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Baixo Estoque</span>
                            <span className={styles.summaryValue} style={{color: baixoEstoque > 0 ? '#dc3545' : '#0c2b4e'}}>{baixoEstoque}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Categorias</span>
                            <span className={styles.summaryValue}>{totalCategorias}</span>
                        </div>
                    </div>
                </section>

                <div className={styles.productsHeaderSection}>
                    <h2>Gerenciar Catálogo</h2>
                    <button className={styles.newCampaignButton} onClick={() => openModal()}>
                        <FiPlus /> Novo Produto
                    </button>
                </div>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Categoria</th>
                                <th>Preço Base</th>
                                <th>Estoque</th>
                                <th>Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>Carregando...</td></tr>
                            ) : produtos.length === 0 ? (
                                <tr><td colSpan="5" className={styles.emptyState}>Nenhum produto encontrado.</td></tr>
                            ) : (
                                produtos.map((p) => (
                                    <tr key={p.id}>
                                        <td data-label="Produto">{p.nome}</td>
                                        <td data-label="Categoria">{p.nomeCategoria || '-'}</td>
                                        <td data-label="Preço Base">{formatarPreco(p.precoBase)}</td>
                                        <td data-label="Estoque" style={{color: p.quantidadeEstoque < 10 ? 'red' : 'inherit', fontWeight: p.quantidadeEstoque < 10 ? 'bold' : 'normal'}}>
                                            {p.quantidadeEstoque}
                                        </td>
                                        <td data-label="Ações" style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                                            <button onClick={() => openModal(p)} style={{marginRight: 10, background:'none', border:'none', cursor:'pointer', color:'#007bff', fontSize:'18px'}}><FiEdit /></button>
                                            <button onClick={() => handleDelete(p.id)} style={{background:'none', border:'none', cursor:'pointer', color:'#dc3545', fontSize:'18px'}}><FiTrash2 /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* MODAL RESPONSIVO */}
                {isModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h2 className={styles.modalTitle}>{formData.id ? 'Editar Produto' : 'Novo Produto'}</h2>
                            <form onSubmit={handleSubmit} className={styles.modalForm}>
                                <div className={styles.inputGroup}>
                                    <input
                                        className={styles.modalInput}
                                        placeholder="Nome do Produto"
                                        value={formData.nome}
                                        onChange={e => setFormData({...formData, nome: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <textarea
                                        className={styles.modalTextarea}
                                        placeholder="Descrição"
                                        value={formData.descricao}
                                        onChange={e => setFormData({...formData, descricao: e.target.value})}
                                    />
                                </div>

                                <div className={styles.rowGroup}>
                                    <input
                                        className={styles.modalInput}
                                        type="number"
                                        step="0.01"
                                        placeholder="Preço (R$)"
                                        value={formData.precoBase}
                                        onChange={e => setFormData({...formData, precoBase: e.target.value})}
                                        required
                                    />
                                    <input
                                        className={styles.modalInput}
                                        type="number"
                                        placeholder="Estoque"
                                        value={formData.quantidadeEstoque}
                                        onChange={e => setFormData({...formData, quantidadeEstoque: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className={styles.rowGroup}>
                                    <input
                                        className={styles.modalInput}
                                        placeholder="Unidade (Ex: UN, KG)"
                                        value={formData.unidadeMedida}
                                        onChange={e => setFormData({...formData, unidadeMedida: e.target.value})}
                                    />
                                    <select
                                        className={styles.modalSelect}
                                        value={formData.categoriaId}
                                        onChange={e => setFormData({...formData, categoriaId: e.target.value})}
                                    >
                                        <option value="">Sem Categoria</option>
                                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>

                                <div className={styles.modalActions}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className={styles.btnCancel}>Cancelar</button>
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


export default withAuth(MeusProdutos, "fornecedor", "/");
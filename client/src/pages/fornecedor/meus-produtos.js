import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../styles/FornecedorProdutos.module.css';
import withAuth from '../../components/withAuth';
import api from '@/services/api';

import {
    FiGrid, FiPackage, FiUser, FiLogOut, FiUsers, FiSettings, FiPlus, FiEdit, FiTrash2
} from 'react-icons/fi';

const MeusProdutos = () => {
    const [produtos, setProdutos] = useState([]);
    const [categorias, setCategorias] = useState([]); // Nova lista para o select
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

            // Busca Categorias (para o Select)
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
            fornecedorId: usuario.fornecedorId // ID AUTOMÁTICO
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

    return (
        <div className={styles['dashboard-container']}>
            <nav className={styles.sidebar}>
                <ul>
                    <li><Link href="/fornecedor/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
                    <li><Link href="/fornecedor/pedidos-recebidos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Pedidos Recebidos</span></div></Link></li>
                    <li className={styles.active}><Link href="/fornecedor/meus-produtos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Meus Produtos</span></div></Link></li>
                    <li><Link href="/fornecedor/campanhas" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Campanhas</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-comerciais" className={styles.linkReset}><div className={styles.menuItem}><FiSettings size={20} /><span>Condições Comerciais</span></div></Link></li>
                    <li><Link href="/fornecedor/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
                    <li><Link href="/" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Meus Produtos</h1>
                </header>

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
                            {produtos.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.nome}</td>
                                    <td>{p.nomeCategoria || '-'}</td>
                                    <td>{formatarPreco(p.precoBase)}</td>
                                    <td style={{color: p.quantidadeEstoque < 10 ? 'red' : 'black'}}>{p.quantidadeEstoque}</td>
                                    <td>
                                        <button onClick={() => openModal(p)} style={{marginRight: 10, background:'none', border:'none', cursor:'pointer', color:'#007bff'}}><FiEdit /></button>
                                        <button onClick={() => handleDelete(p.id)} style={{background:'none', border:'none', cursor:'pointer', color:'#dc3545'}}><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* MODAL */}
                {isModalOpen && (
                    <div style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div style={{ background: 'white', padding: 30, borderRadius: 8, width: 500, maxHeight: '90vh', overflowY: 'auto' }}>
                            <h2>{formData.id ? 'Editar Produto' : 'Novo Produto'}</h2>
                            <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap: 15}}>
                                <input style={{padding: 10, border: '1px solid #ccc', borderRadius: 4}} placeholder="Nome" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
                                <textarea style={{padding: 10, border: '1px solid #ccc', borderRadius: 4}} placeholder="Descrição" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
                                <div style={{display:'flex', gap: 10}}>
                                    <input style={{padding: 10, border: '1px solid #ccc', borderRadius: 4, flex: 1}} type="number" step="0.01" placeholder="Preço (R$)" value={formData.precoBase} onChange={e => setFormData({...formData, precoBase: e.target.value})} required />
                                    <input style={{padding: 10, border: '1px solid #ccc', borderRadius: 4, flex: 1}} type="number" placeholder="Estoque" value={formData.quantidadeEstoque} onChange={e => setFormData({...formData, quantidadeEstoque: e.target.value})} required />
                                </div>
                                <div style={{display:'flex', gap: 10}}>
                                    <input style={{padding: 10, border: '1px solid #ccc', borderRadius: 4, flex: 1}} placeholder="Unidade (Ex: UN, KG)" value={formData.unidadeMedida} onChange={e => setFormData({...formData, unidadeMedida: e.target.value})} />
                                    <select style={{padding: 10, border: '1px solid #ccc', borderRadius: 4, flex: 1}} value={formData.categoriaId} onChange={e => setFormData({...formData, categoriaId: e.target.value})}>
                                        <option value="">Sem Categoria</option>
                                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>
                                <div style={{display:'flex', justifyContent:'flex-end', gap: 10}}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} style={{padding: '10px 20px'}}>Cancelar</button>
                                    <button type="submit" style={{padding: '10px 20px', background: '#0c2b4e', color: 'white', border: 'none'}}>Salvar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default withAuth(MeusProdutos, "fornecedor");
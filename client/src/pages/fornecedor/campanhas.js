import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/FornecedorCampanhas.module.css';
import withAuth from '../../components/withAuth';
import api from '@/services/api';

import {
    FiGrid, FiPackage, FiUser, FiLogOut, FiUsers, FiTag,
    FiPlus, FiTrash2, FiMoreVertical, FiX, FiSettings, FiCreditCard
} from 'react-icons/fi';

const Campanhas = () => {
    const [campanhas, setCampanhas] = useState([]);
    const [produtos, setProdutos] = useState([]); // Para escolher o brinde
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado para o Menu Mobile
    const [menuOpen, setMenuOpen] = useState(false);

    // Form
    const [form, setForm] = useState({
        nome: '',
        tipo: 'percentual_produto', // percentual_produto, valor_compra, quantidade_produto
        dataInicio: '',
        dataFim: '',
        percentualDesconto: '',
        valorMinimoCompra: '',
        cashbackValor: '',
        quantidadeMinimaProduto: '',
        produtoIdBrinde: '',
        brindeDescricao: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            if (!usuario) return;

            // Campanhas
            const res = await api.get('/api/v1/campanhas');
            const minhas = (res.data || []).filter(c => String(c.fornecedorId) === String(usuario.fornecedorId));
            setCampanhas(minhas);

            // Produtos (para selecionar o brinde se necessário)
            const resProd = await api.get('/api/v1/produtos');
            const meusProds = (resProd.data || []).filter(p => String(p.fornecedorId) === String(usuario.fornecedorId));
            setProdutos(meusProds);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const usuario = JSON.parse(localStorage.getItem('usuario'));

        const payload = {
            fornecedorId: usuario.fornecedorId,
            nome: form.nome,
            tipo: form.tipo,
            dataInicio: form.dataInicio,
            dataFim: form.dataFim || null,
            ativo: true,
            // Campos opcionais dependendo do tipo
            percentualDesconto: form.percentualDesconto ? Number(form.percentualDesconto) : null,
            valorMinimoCompra: form.valorMinimoCompra ? Number(form.valorMinimoCompra) : null,
            cashbackValor: form.cashbackValor ? Number(form.cashbackValor) : null,
            quantidadeMinimaProduto: form.quantidadeMinimaProduto ? parseInt(form.quantidadeMinimaProduto) : null,
            produtoIdBrinde: form.produtoIdBrinde || null,
            brindeDescricao: form.brindeDescricao || null
        };

        try {
            await api.post('/api/v1/campanhas', payload);
            alert('Campanha criada com sucesso!');
            setIsModalOpen(false);
            setForm({ nome: '', tipo: 'percentual_produto', dataInicio: '', dataFim: '', percentualDesconto: '', valorMinimoCompra: '', cashbackValor: '', quantidadeMinimaProduto: '', produtoIdBrinde: '', brindeDescricao: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.erro || "Erro ao criar campanha.");
        }
    };

    const handleDelete = async (id) => {
        if(confirm("Excluir campanha?")) {
            await api.delete(`/api/v1/campanhas/${id}`);
            fetchData();
        }
    };

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
                    <li className={styles.active}><Link href="/fornecedor/campanhas" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-comerciais" className={styles.linkReset}><div className={styles.menuItem}><FiSettings size={20} /><span>Condições Comerciais</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-pagamento" className={styles.linkReset}><div className={styles.menuItem}><FiCreditCard size={20} /><span>Formas de Pagamento</span></div></Link></li>
                    <li><Link href="/fornecedor/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
                    <li><Link href="/" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Campanhas Promocionais</h1>
                </header>

                <div className={styles.productsHeaderSection}>
                    <h2>Gerenciar Campanhas</h2>
                    <button className={styles.newCampaignButton} onClick={() => setIsModalOpen(true)}>
                        <FiPlus /> Nova Campanha
                    </button>
                </div>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Tipo</th>
                                <th>Vigência</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {campanhas.map(c => (
                                <tr key={c.id}>
                                    <td data-label="Nome">{c.nome}</td>
                                    <td data-label="Tipo">{c.tipo === 'percentual_produto' ? 'Desconto' : c.tipo === 'valor_compra' ? 'Cashback' : 'Brinde'}</td>
                                    <td data-label="Vigência">{c.dataInicio ? new Date(c.dataInicio).toLocaleDateString('pt-BR') : ''} até {c.dataFim ? new Date(c.dataFim).toLocaleDateString('pt-BR') : '...'}</td>
                                    <td data-label="Status">{c.ativo ? 'Ativa' : 'Inativa'}</td>
                                    <td data-label="Ações" style={{textAlign: 'right'}}>
                                        <button onClick={() => handleDelete(c.id)} className={styles.btnDelete}><FiTrash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* MODAL RESPONSIVO E MAIS BONITO */}
                {isModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>Nova Campanha</h2>
                                <button onClick={() => setIsModalOpen(false)} className={styles.closeModalBtn}><FiX size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.modalForm}>
                                <div className={styles.inputGroup}>
                                    <label>Nome da Campanha</label>
                                    <input className={styles.modalInput} placeholder="Ex: Promoção de Verão" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Tipo de Benefício</label>
                                    <select className={styles.modalSelect} value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                                        <option value="percentual_produto">Desconto Percentual (%)</option>
                                        <option value="valor_compra">Cashback por Valor de Compra</option>
                                        <option value="quantidade_produto">Brinde por Quantidade</option>
                                    </select>
                                </div>

                                {/* Campos Dinâmicos */}
                                {form.tipo === 'percentual_produto' && (
                                    <div className={styles.inputGroup}>
                                        <label>Percentual de Desconto</label>
                                        <input className={styles.modalInput} type="number" placeholder="Ex: 10" value={form.percentualDesconto} onChange={e => setForm({...form, percentualDesconto: e.target.value})} />
                                    </div>
                                )}

                                {form.tipo === 'valor_compra' && (
                                    <div className={styles.rowGroup}>
                                        <div className={styles.inputGroup}>
                                            <label>Compra Mínima (R$)</label>
                                            <input className={styles.modalInput} type="number" placeholder="0.00" value={form.valorMinimoCompra} onChange={e => setForm({...form, valorMinimoCompra: e.target.value})} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Valor do Cashback (R$)</label>
                                            <input className={styles.modalInput} type="number" placeholder="0.00" value={form.cashbackValor} onChange={e => setForm({...form, cashbackValor: e.target.value})} />
                                        </div>
                                    </div>
                                )}

                                {form.tipo === 'quantidade_produto' && (
                                    <>
                                        <div className={styles.inputGroup}>
                                            <label>Qtd. Mínima de Produtos</label>
                                            <input className={styles.modalInput} type="number" placeholder="Ex: 10" value={form.quantidadeMinimaProduto} onChange={e => setForm({...form, quantidadeMinimaProduto: e.target.value})} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Produto Brinde</label>
                                            <select className={styles.modalSelect} value={form.produtoIdBrinde} onChange={e => setForm({...form, produtoIdBrinde: e.target.value})}>
                                                <option value="">Selecione o Produto...</option>
                                                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                                            </select>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Descrição do Brinde</label>
                                            <input className={styles.modalInput} placeholder="Ex: Leve 1 unidade extra" value={form.brindeDescricao} onChange={e => setForm({...form, brindeDescricao: e.target.value})} />
                                        </div>
                                    </>
                                )}

                                <div className={styles.rowGroup}>
                                    <div className={styles.inputGroup}>
                                        <label>Data de Início</label>
                                        <input className={styles.modalInput} type="date" value={form.dataInicio} onChange={e => setForm({...form, dataInicio: e.target.value})} required />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Data de Fim</label>
                                        <input className={styles.modalInput} type="date" value={form.dataFim} onChange={e => setForm({...form, dataFim: e.target.value})} />
                                    </div>
                                </div>

                                <div className={styles.modalActions}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className={styles.btnCancel}>Cancelar</button>
                                    <button type="submit" className={styles.btnSave}>Salvar Campanha</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
export default withAuth(Campanhas, "fornecedor", "/");

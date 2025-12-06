import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/FornecedorCampanhas.module.css';
import withAuth from '../../components/withAuth';
import api from '@/services/api';

import {
    FiGrid, FiPackage, FiUser, FiLogOut, FiUsers, FiTag, FiPlus, FiTrash2, FiCreditCard
} from 'react-icons/fi';

const Campanhas = () => {
    const [campanhas, setCampanhas] = useState([]);
    const [produtos, setProdutos] = useState([]); // Para escolher o brinde
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        produtoIdBrinde: '', // ID do produto que é brinde
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
            <nav className={styles.sidebar}>
                <ul>
                    <li><Link href="/fornecedor/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
                    <li><Link href="/fornecedor/pedidos-recebidos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Pedidos Recebidos</span></div></Link></li>
                    <li><Link href="/fornecedor/meus-produtos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Meus Produtos</span></div></Link></li>
                    <li className={styles.active}><Link href="/fornecedor/campanhas" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-comerciais" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Condições Comerciais</span></div></Link></li>
                    <li><Link href="/fornecedor/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
                    <li><Link href="/fornecedor/condicoes-pagamento" className={styles.linkReset}><div className={styles.menuItem}><FiCreditCard size={20} /><span>Formas de Pagamento</span></div></Link></li>
                    <li><Link href="/" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Campanhas Promocionais</h1>
                </header>

                <div style={{marginBottom: 20, textAlign: 'right'}}>
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
                                    <td>{c.nome}</td>
                                    <td>{c.tipo}</td>
                                    <td>{c.dataInicio} até {c.dataFim || '...'}</td>
                                    <td>{c.ativo ? 'Ativa' : 'Inativa'}</td>
                                    <td>
                                        <button onClick={() => handleDelete(c.id)} style={{border:'none', background:'transparent', color: 'red', cursor: 'pointer'}}><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* MODAL CAMPANHA */}
                {isModalOpen && (
                    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
                        <div style={{background:'white', padding:30, borderRadius:8, width:500}}>
                            <h2>Nova Campanha</h2>
                            <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap: 15}}>
                                <input placeholder="Nome da Campanha" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required style={{padding:8, border:'1px solid #ccc'}}/>

                                <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} style={{padding:8, border:'1px solid #ccc'}}>
                                    <option value="percentual_produto">Desconto (%)</option>
                                    <option value="valor_compra">Cashback por Valor Compra</option>
                                    <option value="quantidade_produto">Brinde por Quantidade</option>
                                </select>

                                {/* Campos dinâmicos */}
                                {form.tipo === 'percentual_produto' && (
                                    <input type="number" placeholder="Percentual Desconto (%)" value={form.percentualDesconto} onChange={e => setForm({...form, percentualDesconto: e.target.value})} style={{padding:8, border:'1px solid #ccc'}}/>
                                )}

                                {form.tipo === 'valor_compra' && (
                                    <div style={{display:'flex', gap:10}}>
                                        <input type="number" placeholder="Mínimo Compra (R$)" value={form.valorMinimoCompra} onChange={e => setForm({...form, valorMinimoCompra: e.target.value})} style={{padding:8, border:'1px solid #ccc', flex:1}}/>
                                        <input type="number" placeholder="Valor Cashback (R$)" value={form.cashbackValor} onChange={e => setForm({...form, cashbackValor: e.target.value})} style={{padding:8, border:'1px solid #ccc', flex:1}}/>
                                    </div>
                                )}

                                {form.tipo === 'quantidade_produto' && (
                                    <div style={{display:'flex', flexDirection:'column', gap:10}}>
                                        <input type="number" placeholder="Qtd. Mínima Produtos" value={form.quantidadeMinimaProduto} onChange={e => setForm({...form, quantidadeMinimaProduto: e.target.value})} style={{padding:8, border:'1px solid #ccc'}}/>
                                        <select value={form.produtoIdBrinde} onChange={e => setForm({...form, produtoIdBrinde: e.target.value})} style={{padding:8, border:'1px solid #ccc'}}>
                                            <option value="">Selecione o Produto Brinde...</option>
                                            {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                                        </select>
                                        <input placeholder="Descrição do Brinde (Ex: 1 Unidade Grátis)" value={form.brindeDescricao} onChange={e => setForm({...form, brindeDescricao: e.target.value})} style={{padding:8, border:'1px solid #ccc'}}/>
                                    </div>
                                )}

                                <div style={{display:'flex', gap:10}}>
                                    <div style={{flex:1}}>
                                        <label>Início</label>
                                        <input type="date" value={form.dataInicio} onChange={e => setForm({...form, dataInicio: e.target.value})} required style={{width:'100%', padding:8, border:'1px solid #ccc'}}/>
                                    </div>
                                    <div style={{flex:1}}>
                                        <label>Fim</label>
                                        <input type="date" value={form.dataFim} onChange={e => setForm({...form, dataFim: e.target.value})} style={{width:'100%', padding:8, border:'1px solid #ccc'}}/>
                                    </div>
                                </div>

                                <div style={{display:'flex', justifyContent:'flex-end', gap:10, marginTop:10}}>
                                    <button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                    <button type="submit" style={{background:'#28a745', color:'white', border:'none', padding:'8px 16px'}}>Salvar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default withAuth(Campanhas, "fornecedor");
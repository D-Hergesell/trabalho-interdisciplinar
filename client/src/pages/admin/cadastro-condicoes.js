import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
import styles from '../../styles/Geral.module.css'; // Reaproveitando estilos padrão
import api from '../../services/api';

import {
    FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox,
    FiSearch, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight, FiTag, FiShoppingBag, FiMapPin
} from 'react-icons/fi';

// ============================================================================
// MODAL DE EDIÇÃO
// ============================================================================
const EditCondicaoModal = ({ condicao, onSave, onCancel, loading, fornecedores }) => {
    const [formData, setFormData] = useState({
        fornecedorId: '',
        estado: '',
        cashbackPercentual: '',
        prazoPagamentoDias: '',
        ajusteUnitarioAplicado: '',
        ativo: 'true'
    });

    useEffect(() => {
        if (condicao) {
            setFormData({
                fornecedorId: condicao.fornecedorId || '',
                estado: condicao.estado || '',
                cashbackPercentual: condicao.cashbackPercentual || '',
                prazoPagamentoDias: condicao.prazoPagamentoDias || '',
                ajusteUnitarioAplicado: condicao.ajusteUnitarioAplicado || '',
                ativo: condicao.ativo ? 'true' : 'false'
            });
        }
    }, [condicao]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: condicao.id,
            ativo: formData.ativo === 'true',
            // Conversão de tipos
            cashbackPercentual: formData.cashbackPercentual ? Number(formData.cashbackPercentual) : null,
            prazoPagamentoDias: Number(formData.prazoPagamentoDias),
            ajusteUnitarioAplicado: formData.ajusteUnitarioAplicado ? Number(formData.ajusteUnitarioAplicado) : null
        });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                <h3 className={styles.modalTitle}>Editar Condição Comercial</h3>
                <form onSubmit={handleSubmit}>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Fornecedor *</label>
                            <select name="fornecedorId" value={formData.fornecedorId} onChange={handleChange} required className={styles.inputModal}>
                                <option value="">Selecione...</option>
                                {fornecedores.map(f => (
                                    <option key={f.id} value={f.id}>{f.nomeFantasia}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Estado (UF) *</label>
                            <input
                                type="text"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                maxLength="2"
                                required
                                className={styles.inputModal}
                                placeholder="EX: SC"
                                style={{textTransform: 'uppercase'}}
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Prazo Pagto (Dias) *</label>
                            <input type="number" name="prazoPagamentoDias" value={formData.prazoPagamentoDias} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Cashback (%)</label>
                            <input type="number" step="0.01" name="cashbackPercentual" value={formData.cashbackPercentual} onChange={handleChange} className={styles.inputModal} />
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label>Ajuste Unitário (R$)</label>
                        <input type="number" step="0.01" name="ajusteUnitarioAplicado" value={formData.ajusteUnitarioAplicado} onChange={handleChange} className={styles.inputModal} />
                        <small style={{color: '#666'}}>* Valor positivo para acréscimo, negativo para desconto.</small>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label>Status</label>
                        <select name="ativo" value={formData.ativo} onChange={handleChange} className={styles.inputModal}>
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
                        </select>
                    </div>

                    <div className={styles.modalActions}>
                        <button className={`${styles.submitButton} ${styles.btnCancel}`} type="button" onClick={onCancel} disabled={loading}>
                            Cancelar
                        </button>
                        <button className={styles.submitButton} type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================================================
// LISTAGEM E BUSCA
// ============================================================================
const BuscaCondicoes = ({ fornecedores, mainMessageSetter }) => {
    const [condicoes, setCondicoes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filtros
    const [filtroFornecedor, setFiltroFornecedor] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');

    const [editingCondicao, setEditingCondicao] = useState(null);
    const [searched, setSearched] = useState(false);

    // Paginação
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        setEditingCondicao(null);
        setCurrentIndex(0);

        try {
            const response = await api.get('/api/v1/condicoes-estado');
            let dados = response.data || [];

            // Filtragem no Front (idealmente seria no back, mas o endpoint `listarTudo` retorna tudo)
            if (filtroFornecedor) {
                dados = dados.filter(c => String(c.fornecedorId) === String(filtroFornecedor));
            }
            if (filtroEstado) {
                dados = dados.filter(c => c.estado.toUpperCase().includes(filtroEstado.toUpperCase()));
            }

            // Ordenar por Estado
            dados.sort((a, b) => a.estado.localeCompare(b.estado));

            setCondicoes(dados);
        } catch (error) {
            console.error("Erro ao buscar condições:", error);
            mainMessageSetter({ type: 'error', text: "Erro ao buscar condições comerciais." });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubmit = async (updatedData) => {
        setLoading(true);
        const id = updatedData.id;
        const { id: _id, ...payload } = updatedData; // Remove ID do corpo

        try {
            await api.put(`/api/v1/condicoes-estado/${id}`, payload);

            // Atualiza lista local
            setCondicoes(old => old.map(c => c.id === id ? { ...c, ...updatedData } : c));
            setEditingCondicao(null);
            mainMessageSetter({ type: 'success', text: "Condição atualizada com sucesso!" });
        } catch (error) {
            console.error("Erro:", error);
            const msg = error.response?.data?.erro || "Erro ao atualizar condição.";
            mainMessageSetter({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta regra?")) return;

        setLoading(true);
        try {
            await api.delete(`/api/v1/condicoes-estado/${id}`);
            setCondicoes(old => old.filter(c => c.id !== id));
            mainMessageSetter({ type: 'success', text: "Regra excluída com sucesso!" });
        } catch (error) {
            console.error(error);
            mainMessageSetter({ type: 'error', text: "Erro ao excluir." });
        } finally {
            setLoading(false);
        }
    };

    // Paginação
    const nextSlide = () => { if (currentIndex + itemsPerPage < condicoes.length) setCurrentIndex(currentIndex + itemsPerPage); };
    const prevSlide = () => { if (currentIndex - itemsPerPage >= 0) setCurrentIndex(currentIndex - itemsPerPage); };
    const visibleItems = condicoes.slice(currentIndex, currentIndex + itemsPerPage);
    const totalPages = Math.ceil(condicoes.length / itemsPerPage);
    const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;

    // Helper para nome do fornecedor (já que a lista pode ter só IDs ou nomes antigos)
    const getFornecedorNome = (id, nomeOriginal) => {
        const f = fornecedores.find(item => item.id === id);
        return f ? f.nomeFantasia : nomeOriginal || 'N/A';
    };

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    return (
        <div className={styles['search-section']}>
            <h2 className={styles['search-header']}>Consultar Regras por Estado</h2>

            <div className={styles['search-inputs']}>
                <div className={styles['search-group']}>
                    <label>Fornecedor</label>
                    <select value={filtroFornecedor} onChange={e => setFiltroFornecedor(e.target.value)} style={{padding: '10px', borderRadius: '6px', border: '1px solid #ddd'}}>
                        <option value="">Todos</option>
                        {fornecedores.map(f => (
                            <option key={f.id} value={f.id}>{f.nomeFantasia}</option>
                        ))}
                    </select>
                </div>
                <div className={styles['search-group']}>
                    <label>Estado (UF)</label>
                    <input type="text" placeholder="Ex: SC" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} maxLength="2" />
                </div>
                <button className={styles['btn-search']} onClick={handleSearch} disabled={loading}>
                    <FiSearch size={20} /> {loading ? '...' : 'Buscar'}
                </button>
            </div>

            {condicoes.length > 0 && (
                <>
                    <div className={styles['provider-list-container']}>
                        <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`} style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 100px' }}>
                            <div className={styles['header-cell']}>Estado</div>
                            <div className={styles['header-cell']}>Fornecedor</div>
                            <div className={styles['header-cell']}>Prazo</div>
                            <div className={styles['header-cell']}>Cashback</div>
                            <div className={styles['header-cell']}>Ajuste</div>
                            <div className={styles['header-cell-actions']}>Ações</div>
                        </div>
                        {visibleItems.map(item => (
                            <div key={item.id} className={styles['provider-list-item']} style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 100px' }}>
                                <div className={styles['detail-cell-name']}><p>{item.estado}</p></div>
                                <div className={styles['detail-cell']}>{getFornecedorNome(item.fornecedorId, item.fornecedorNome)}</div>
                                <div className={styles['detail-cell']}>{item.prazoPagamentoDias} dias</div>
                                <div className={styles['detail-cell']}>{item.cashbackPercentual ? `${item.cashbackPercentual}%` : '-'}</div>
                                <div className={styles['detail-cell']} style={{color: (item.ajusteUnitarioAplicado > 0 ? 'red' : 'green')}}>
                                    {item.ajusteUnitarioAplicado ? formatCurrency(item.ajusteUnitarioAplicado) : '-'}
                                </div>
                                <div className={styles['item-actions']}>
                                    <button className={styles['btn-edit']} onClick={() => setEditingCondicao(item)}><FiEdit size={18} /></button>
                                    <button className={styles['btn-delete']} onClick={() => handleDelete(item.id)}><FiTrash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.paginationControls}>
                        <button className={styles['nav-btn']} onClick={prevSlide} disabled={currentIndex === 0}><FiChevronLeft size={24} /></button>
                        <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
                        <button className={styles['nav-btn']} onClick={nextSlide} disabled={currentIndex + itemsPerPage >= condicoes.length}><FiChevronRight size={24} /></button>
                    </div>
                </>
            )}

            {searched && condicoes.length === 0 && !loading && (
                <p className={styles['no-data']}>Nenhuma condição encontrada com os filtros atuais.</p>
            )}

            {editingCondicao && (
                <EditCondicaoModal
                    condicao={editingCondicao}
                    fornecedores={fornecedores}
                    onSave={handleUpdateSubmit}
                    onCancel={() => setEditingCondicao(null)}
                    loading={loading}
                />
            )}
        </div>
    );
};

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================
function CadastroCondicoes() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [fornecedores, setFornecedores] = useState([]);

    const [formData, setFormData] = useState({
        fornecedorId: '',
        estado: '',
        cashbackPercentual: '',
        prazoPagamentoDias: '',
        ajusteUnitarioAplicado: ''
    });

    useEffect(() => {
        async function loadData() {
            try {
                const res = await api.get('/api/v1/fornecedores/ativos');
                setFornecedores(res.data || []);
            } catch (error) {
                console.error("Erro ao carregar fornecedores:", error);
            }
        }
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const payload = {
            fornecedorId: formData.fornecedorId,
            estado: formData.estado.toUpperCase(),
            prazoPagamentoDias: Number(formData.prazoPagamentoDias),
            // Opcionais
            cashbackPercentual: formData.cashbackPercentual ? Number(formData.cashbackPercentual) : null,
            ajusteUnitarioAplicado: formData.ajusteUnitarioAplicado ? Number(formData.ajusteUnitarioAplicado) : null,
            ativo: true
        };

        try {
            await api.post('/api/v1/condicoes-estado', payload);
            setMessage({ type: 'success', text: `Regra para ${payload.estado} cadastrada com sucesso!` });

            // Limpa form (mantém fornecedor para facilitar cadastro múltiplo)
            setFormData(prev => ({
                ...prev,
                estado: '',
                cashbackPercentual: '',
                prazoPagamentoDias: '',
                ajusteUnitarioAplicado: ''
            }));

        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.erro || "Erro ao cadastrar condição.";
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles['dashboard-container']}>
            <nav className={styles.sidebar}>
                <ul>
                    <li><Link href="/admin/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
                    <li><Link href="/admin/cadastro-fornecedor" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Fornecedores</span></div></Link></li>
                    <li><Link href="/admin/cadastro-lojista" className={styles.linkReset}><div className={styles.menuItem}><FiBox size={20} /><span>Lojistas</span></div></Link></li>
                    <li><Link href="/admin/cadastro-produto" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Produtos</span></div></Link></li>
                    <li><Link href="/admin/cadastro-pedidos" className={styles.linkReset}><div className={styles.menuItem}><FiShoppingBag size={20} /><span>Pedidos</span></div></Link></li>
                    <li><Link href="/admin/cadastro-campanha" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div></Link></li>
                    <li><Link href="/admin/cadastro-categoria" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Categorias</span></div></Link></li>
                    <li className={styles.active}><Link href="/admin/cadastro-condicoes" className={styles.linkReset}><div className={styles.menuItem}><FiMapPin size={20} /><span>Regras por Estado</span></div></Link></li>
                    <li><Link href="/admin/login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Condições Comerciais por Estado</h1>
                </header>

                {message && <div className={`${styles.alertMessage} ${styles[message.type]}`}>{message.text}</div>}

                <form className={styles.formCard} onSubmit={handleSubmit}>
                    <h2 className={styles.sectionTitle}>Nova Regra Regional</h2>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Fornecedor *</label>
                            <select name="fornecedorId" value={formData.fornecedorId} onChange={handleChange} required className={styles.inputLong}>
                                <option value="">Selecione...</option>
                                {fornecedores.map(f => (
                                    <option key={f.id} value={f.id}>{f.nomeFantasia}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.fieldGroup} style={{maxWidth: '120px'}}>
                            <label>UF *</label>
                            <input
                                type="text"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                className={styles.inputLong}
                                placeholder="SC"
                                maxLength="2"
                                required
                                style={{textTransform: 'uppercase'}}
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Prazo de Pagamento (Dias) *</label>
                            <input type="number" name="prazoPagamentoDias" value={formData.prazoPagamentoDias} onChange={handleChange} className={styles.inputLong} required placeholder="ex: 45" />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Cashback (%)</label>
                            <input type="number" name="cashbackPercentual" value={formData.cashbackPercentual} onChange={handleChange} step="0.01" className={styles.inputLong} placeholder="ex: 10" />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Ajuste Preço Unitário (R$)</label>
                            <input type="number" name="ajusteUnitarioAplicado" value={formData.ajusteUnitarioAplicado} onChange={handleChange} step="0.01" className={styles.inputLong} placeholder="ex: 2.00 (acréscimo)" />
                            <small style={{fontSize:'12px', color:'#666'}}>Use valores negativos para desconto.</small>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Cadastrando...' : 'Criar Regra'}
                        </button>
                    </div>
                </form>

                <hr className={styles.divider} />

                <BuscaCondicoes fornecedores={fornecedores} mainMessageSetter={setMessage} />
            </main>
        </div>
    );
}

export default withAuth(CadastroCondicoes);
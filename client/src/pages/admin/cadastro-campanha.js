import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
import styles from '../../styles/AdminGeral.module.css';
import api from '../../services/api';

// Importação dos ícones
import {
    FiGrid,
    FiUsers,
    FiPackage,
    FiBox,
    FiLogOut,
    FiEdit3,
    FiTrash2,
    FiSearch,
    FiChevronLeft,
    FiChevronRight,
    FiArrowRight,
    FiShoppingBag,
    FiTag
} from 'react-icons/fi';

const EditCampanhaModal = ({ campanha, onSave, onCancel, loading }) => {

    const [formData, setFormData] = useState({
        nome: '',
        fornecedorId: '',
        tipo: 'percentual_produto',
        dataInicio: '',
        dataFim: '',
        ativo: 'on',
        // Campos específicos
        percentualDesconto: '',
        valorMinimoCompra: '',
        cashbackValor: '',
        quantidadeMinimaProduto: '',
        brindeDescricao: ''
    });

    useEffect(() => {
        if (campanha) {
            setFormData({
                nome: campanha.nome || '',
                fornecedorId: campanha.fornecedorId || '',
                tipo: campanha.tipo || 'percentual_produto',
                dataInicio: campanha.dataInicio ? String(campanha.dataInicio).split('T')[0] : '',
                dataFim: campanha.dataFim ? String(campanha.dataFim).split('T')[0] : '',
                ativo: campanha.ativo ? 'on' : 'off',
                percentualDesconto: campanha.percentualDesconto || '',
                valorMinimoCompra: campanha.valorMinimoCompra || '',
                cashbackValor: campanha.cashbackValor || '',
                quantidadeMinimaProduto: campanha.quantidadeMinimaProduto || '',
                brindeDescricao: campanha.brindeDescricao || ''
            });
        }
    }, [campanha]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.dataFim && formData.dataInicio) {
            if (new Date(formData.dataFim) < new Date(formData.dataInicio)) {
                alert("A data de fim não pode ser anterior à data de início.");
                return;
            }
        }

        // Prepara o payload convertendo tipos
        const payload = {
            id: campanha.id, // ID para update
            nome: formData.nome,
            fornecedorId: formData.fornecedorId,
            tipo: formData.tipo,
            dataInicio: formData.dataInicio,
            dataFim: formData.dataFim || null,
            ativo: formData.ativo === 'on',

            // Envia nulo se estiver vazio, ou converte para número
            percentualDesconto: formData.percentualDesconto ? Number(formData.percentualDesconto) : null,
            valorMinimoCompra: formData.valorMinimoCompra ? Number(formData.valorMinimoCompra) : null,
            cashbackValor: formData.cashbackValor ? Number(formData.cashbackValor) : null,
            quantidadeMinimaProduto: formData.quantidadeMinimaProduto ? parseInt(formData.quantidadeMinimaProduto) : null,
            brindeDescricao: formData.brindeDescricao || null
        };

        onSave(payload);
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '700px' }}>
                <h3 className={styles.modalTitle}>Editar Campanha</h3>

                <form onSubmit={handleSubmit}>
                    {/* Linha 1 */}
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nome da Campanha *</label>
                            <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>ID do Fornecedor *</label>
                            <input type="text" name="fornecedorId" value={formData.fornecedorId} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                    </div>

                    {/* Linha 2 - Tipo */}
                    <div className={styles.fieldGroup}>
                        <label>Tipo de Campanha *</label>
                        <select name="tipo" value={formData.tipo} onChange={handleChange} className={styles.inputModal} required>
                            <option value="percentual_produto">Desconto Percentual</option>
                            <option value="valor_compra">Cashback por Valor de Compra</option>
                            <option value="quantidade_produto">Brinde por Quantidade</option>
                        </select>
                    </div>

                    {/* Linha 3 - Condicionais baseadas no Tipo */}
                    <div className={styles.row}>
                        {formData.tipo === 'percentual_produto' && (
                            <div className={styles.fieldGroup}>
                                <label>Percentual de Desconto (%)</label>
                                <input type="number" name="percentualDesconto" value={formData.percentualDesconto} onChange={handleChange} step="0.01" className={styles.inputModal} />
                            </div>
                        )}

                        {formData.tipo === 'valor_compra' && (
                            <>
                                <div className={styles.fieldGroup}>
                                    <label>Valor Mín. Compra (R$)</label>
                                    <input type="number" name="valorMinimoCompra" value={formData.valorMinimoCompra} onChange={handleChange} step="0.01" className={styles.inputModal} />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Valor Cashback (R$)</label>
                                    <input type="number" name="cashbackValor" value={formData.cashbackValor} onChange={handleChange} step="0.01" className={styles.inputModal} />
                                </div>
                            </>
                        )}

                        {formData.tipo === 'quantidade_produto' && (
                            <>
                                <div className={styles.fieldGroup}>
                                    <label>Qtd. Mínima Produtos</label>
                                    <input type="number" name="quantidadeMinimaProduto" value={formData.quantidadeMinimaProduto} onChange={handleChange} className={styles.inputModal} />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Descrição do Brinde</label>
                                    <input type="text" name="brindeDescricao" value={formData.brindeDescricao} onChange={handleChange} className={styles.inputModal} />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Linha 4 - Datas e Status */}
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Data de Início *</label>
                            <input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Data de Fim</label>
                            <input type="date" name="dataFim" value={formData.dataFim} onChange={handleChange} className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup} style={{ maxWidth: '150px' }}>
                            <label>Status</label>
                            <select name="ativo" value={formData.ativo} onChange={handleChange} className={styles.inputModal}>
                                <option value="on">Ativo</option>
                                <option value="off">Inativo</option>
                            </select>
                        </div>
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


const BuscaCampanhas = () => {

    const [searchId, setSearchId] = useState('');
    const [searchNome, setSearchNome] = useState('');
    const [searchFornecedor, setSearchFornecedor] = useState('');

    const [campanhas, setCampanhas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [message, setMessage] = useState(null);

    const [editingCampanha, setEditingCampanha] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [currentAction, setCurrentAction] = useState('deactivate');

    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        setMessage(null);
        setCurrentIndex(0);
        setExpandedId(null);
        setEditingCampanha(null);

        try {
            // Rota atualizada para o backend Spring
            const response = await api.get('/api/v1/campanhas');
            let dados = response.data || [];

            // Filtros no frontend (idealmente backend faria isso, mas mantendo a lógica do front atual)
            if (searchId) dados = dados.filter(c => c.id && c.id.includes(searchId));
            if (searchNome) dados = dados.filter(c => c.nome && c.nome.toLowerCase().includes(searchNome.toLowerCase()));
            if (searchFornecedor) dados = dados.filter(c => c.fornecedorId && c.fornecedorId.toLowerCase().includes(searchFornecedor.toLowerCase()));

            setCampanhas(dados);
        } catch (error) {
            console.error('Erro ao buscar campanhas:', error);
            setMessage({ type: 'error', text: 'Erro ao buscar campanhas.' });
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (campanha) => {
        setMessage(null);
        setEditingCampanha(campanha);
    };

    const cancelEdit = () => {
        setEditingCampanha(null);
    };

    const handleUpdateSubmit = async (updatedData) => {
        setLoading(true);
        setMessage(null);
        const id = updatedData.id;
        // Backend espera JSON, o DTO cuida disso

        try {
            await api.put(`/api/v1/campanhas/${id}`, updatedData);
            setCampanhas(oldList => oldList.map(item => item.id === id ? { ...item, ...updatedData } : item));
            setEditingCampanha(null);
            setMessage({ type: 'success', text: "Campanha atualizada com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            const msg = error.response?.data?.erro || "Erro ao atualizar campanha.";
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    const startAction = (id, type) => {
        setDeleteId(id);
        setCurrentAction(type);
        setShowConfirm(true);
    };

    const handleConfirmAction = async () => {
        if (!deleteId) return;
        setShowConfirm(false);
        setLoading(true);
        setMessage(null);

        try {
            if (currentAction === 'delete') {
                await api.delete(`/api/v1/campanhas/${deleteId}`);
                setCampanhas(oldList => oldList.filter(item => item.id !== deleteId));
                setMessage({ type: 'success', text: "Campanha excluída permanentemente!" });
            } else {
                // Desativar: Update com ativo = false
                // É necessário enviar o objeto completo para PUT no Spring geralmente,
                // mas se o backend tiver PATCH ou lógica específica no PUT, pode funcionar.
                // Como o controller usa PUT e espera RequestDTO, o ideal seria buscar antes, mas vamos tentar update simples.
                // Nota: O backend `atualizarCampanha` espera todos os campos do DTO.

                // Opção segura: Buscar, alterar e salvar. Ou simplificar aqui assumindo que temos os dados locais.
                const campanhaAtual = campanhas.find(c => c.id === deleteId);
                if(campanhaAtual) {
                    const payload = { ...campanhaAtual, ativo: false };
                    // Adaptar nomes se o objeto local estiver diferente do DTO request
                    // O objeto local (response DTO) tem os mesmos nomes que o request DTO exceto 'id'
                    await api.put(`/api/v1/campanhas/${deleteId}`, payload);

                    setCampanhas(oldList => oldList.map(item => item.id === deleteId ? { ...item, ativo: false } : item));
                    setMessage({ type: 'success', text: "Campanha desativada com sucesso!" });
                }
            }
            if (expandedId === deleteId) setExpandedId(null);
        } catch (error) {
            console.error(`Erro ao ${currentAction}:`, error);
            setMessage({ type: 'error', text: `Erro ao executar ação: ${error.response?.data?.erro || "Erro de servidor."}` });
        } finally {
            setLoading(false);
            setDeleteId(null);
            setCurrentAction('deactivate');
        }
    };

    const cancelDelete = () => {
        setDeleteId(null);
        setShowConfirm(false);
        setCurrentAction('deactivate');
    };

    const handleToggleExpand = (id) => {
        setExpandedId(currentId => (currentId === id ? null : id));
    };

    const nextSlide = () => {
        if (currentIndex + itemsPerPage < campanhas.length) {
            setCurrentIndex(currentIndex + itemsPerPage);
            setExpandedId(null);
        }
    };

    const prevSlide = () => {
        if (currentIndex - itemsPerPage >= 0) {
            setCurrentIndex(currentIndex - itemsPerPage);
            setExpandedId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const visibleItems = campanhas.slice(currentIndex, currentIndex + itemsPerPage);
    const totalPages = Math.ceil(campanhas.length / itemsPerPage);
    const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;


    const ConfirmationModal = () => {
        const isDelete = currentAction === 'delete';
        return (
            <div className={styles.modalBackdrop}>
                <div className={styles.modalContent}>
                    <h3 className={styles.modalTitle}>Confirmação de {isDelete ? 'Exclusão' : 'Desativação'}</h3>
                    <p className={styles.modalText}>
                        Tem certeza que deseja {isDelete ? 'EXCLUIR PERMANENTEMENTE' : 'DESATIVAR'} esta campanha?
                    </p>
                    <div className={styles.modalActions}>
                        <button className={`${styles.submitButton} ${styles.btnCancel}`} onClick={cancelDelete}>Cancelar</button>
                        <button className={`${styles.submitButton} ${styles.btnDanger}`} onClick={handleConfirmAction} disabled={loading}>
                            {loading ? 'Processando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ExpandedDetailsRow = ({ item }) => (
        <div className={styles['expanded-details-row']}>
            <div className={styles['detail-full-span']}>
                <p className={styles['detail-text-p']}><strong>ID Completo:</strong> {item.id}</p>
            </div>
            <div className={styles['detail-half-span']}>
                <p className={styles['detail-text-p']}><strong>Tipo:</strong> {item.tipo}</p>
            </div>
            <div className={styles['detail-half-span']}>
                <p className={styles['detail-text-p']}><strong>Detalhes:</strong>
                    {item.tipo === 'percentual_produto' && ` ${item.percentualDesconto}% de desconto`}
                    {item.tipo === 'valor_compra' && ` Min: R$${item.valorMinimoCompra} | Cashback: R$${item.cashbackValor}`}
                    {item.tipo === 'quantidade_produto' && ` Min: ${item.quantidadeMinimaProduto} un. | Brinde: ${item.brindeDescricao}`}
                </p>
            </div>
            <div className={`${styles['detail-half-span']} ${styles['detail-status']}`}>
                <p className={styles['detail-text-p']}><strong>Status:</strong> <span className={!item.ativo ? styles.statusOff : styles.statusOn}>{item.ativo ? 'Ativo' : 'Inativo'}</span></p>
            </div>
        </div>
    );

    return (
        <>
            <div className={styles['search-section']}>
                <h2 className={styles['search-header']}>Consultar / Gerenciar Campanhas</h2>

                {message && (
                    <div className={`${styles.alertMessage} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <div className={styles['search-inputs']}>
                    <div className={styles['search-group']}>
                        <label>ID</label>
                        <input type="text" placeholder="Ex: a1b2..." value={searchId} onChange={e => setSearchId(e.target.value)} />
                    </div>
                    <div className={styles['search-group']}>
                        <label>Nome</label>
                        <input type="text" placeholder="Ex: Verão..." value={searchNome} onChange={e => setSearchNome(e.target.value)} />
                    </div>
                    <div className={styles['search-group']}>
                        <label>Fornecedor</label>
                        <input type="text" placeholder="ID do Fornecedor..." value={searchFornecedor} onChange={e => setSearchFornecedor(e.target.value)} />
                    </div>
                    <button className={styles['btn-search']} onClick={handleSearch} disabled={loading}>
                        <FiSearch size={20} />
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>

                {campanhas.length > 0 ? (
                    <>
                        <div className={styles['provider-list-container']}>
                            <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`}>
                                <div className={styles['header-cell']} style={{ flex: '3fr' }}>Nome</div>
                                <div className={styles['header-cell']} style={{ flex: '1.5fr' }}>Fornecedor</div>
                                <div className={styles['header-cell']} style={{ flex: '2fr' }}>Início</div>
                                <div className={styles['header-cell']} style={{ flex: '2fr' }}>Fim</div>
                                <div className={styles['header-cell-actions']} style={{ width: '130px' }}>Ações</div>
                            </div>

                            {visibleItems.map((item) => {
                                const isExpanded = expandedId === item.id;
                                const isDeactivated = !item.ativo;
                                let itemClasses = styles['provider-list-item'];
                                if (isExpanded) itemClasses += ` ${styles['item-expanded']}`;
                                if (isDeactivated) itemClasses += ` ${styles['item-status-off']}`;

                                return (
                                    <React.Fragment key={item.id}>
                                        <div className={itemClasses} onClick={() => handleToggleExpand(item.id)}>
                                            <div className={styles['detail-cell-name']} style={{ flex: '3fr' }}><p>{item.nome}</p></div>
                                            <div className={styles['detail-cell']} style={{ flex: '1.5fr' }}>
                                                <span title={item.fornecedorId}>{item.fornecedorId ? item.fornecedorId.substring(0, 8) + '...' : '-'}</span>
                                            </div>
                                            <div className={styles['detail-cell']} style={{ flex: '2fr' }}>{formatDate(item.dataInicio)}</div>
                                            <div className={styles['detail-cell']} style={{ flex: '2fr' }}>{formatDate(item.dataFim)}</div>

                                            <div className={styles['item-actions']} style={{ width: '130px' }}>
                                                <button className={`${styles['btn-detail']} ${isExpanded ? styles['btn-rotated'] : ''}`} onClick={(e) => { e.stopPropagation(); handleToggleExpand(item.id); }}><FiArrowRight size={20} /></button>
                                                <button className={styles['btn-edit']} onClick={(e) => { e.stopPropagation(); startEdit(item); }}><FiEdit3 size={18} /></button>
                                                <button className={styles['btn-delete']} onClick={(e) => { e.stopPropagation(); isDeactivated ? startAction(item.id, 'delete') : startAction(item.id, 'deactivate'); }}><FiTrash2 size={18} /></button>
                                            </div>
                                        </div>
                                        {isExpanded && <ExpandedDetailsRow item={item} />}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        <div className={styles.paginationControls}>
                            <button className={styles['nav-btn']} onClick={prevSlide} disabled={currentIndex === 0 || loading}><FiChevronLeft size={24} /></button>
                            <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
                            <button className={styles['nav-btn']} onClick={nextSlide} disabled={currentIndex + itemsPerPage >= campanhas.length || loading}><FiChevronRight size={24} /></button>
                        </div>
                    </>
                ) : (
                    !loading && searched && <p className={styles['no-data']}>Nenhuma campanha encontrada com os filtros especificados.</p>
                )}
            </div>

            {showConfirm && <ConfirmationModal />}
            {editingCampanha && <EditCampanhaModal campanha={editingCampanha} onSave={handleUpdateSubmit} onCancel={cancelEdit} loading={loading} />}
        </>
    );
};


function CadastroCampanha() {
    const [form, setForm] = useState({
        nome: '',
        fornecedorId: '',
        tipo: 'percentual_produto', // Valor padrão
        dataInicio: '',
        dataFim: '',
        // Campos condicionais
        percentualDesconto: '',
        valorMinimoCompra: '',
        cashbackValor: '',
        quantidadeMinimaProduto: '',
        brindeDescricao: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (form.dataFim && form.dataInicio) {
            if (new Date(form.dataFim) < new Date(form.dataInicio)) {
                setMessage({ type: 'error', text: "A data de fim não pode ser anterior à data de início." });
                setLoading(false);
                return;
            }
        }

        try {
            // Conversão de tipos para o DTO
            const payload = {
                nome: form.nome,
                fornecedorId: form.fornecedorId,
                tipo: form.tipo,
                dataInicio: form.dataInicio,
                dataFim: form.dataFim || null,
                ativo: true, // Default ao criar

                // Numéricos e nulos
                percentualDesconto: form.percentualDesconto ? Number(form.percentualDesconto) : null,
                valorMinimoCompra: form.valorMinimoCompra ? Number(form.valorMinimoCompra) : null,
                cashbackValor: form.cashbackValor ? Number(form.cashbackValor) : null,
                quantidadeMinimaProduto: form.quantidadeMinimaProduto ? parseInt(form.quantidadeMinimaProduto) : null,
                brindeDescricao: form.brindeDescricao || null
            };

            await api.post('/api/v1/campanhas', payload);

            // Reset do form
            setForm({
                nome: '', fornecedorId: '', tipo: 'percentual_produto', dataInicio: '', dataFim: '',
                percentualDesconto: '', valorMinimoCompra: '', cashbackValor: '', quantidadeMinimaProduto: '', brindeDescricao: ''
            });
            setMessage({ type: 'success', text: 'Campanha criada com sucesso! Atualize a busca abaixo para ver.' });
        } catch (error) {
            console.error('Erro ao criar campanha:', error);
            const msg = error.response?.data?.erro || 'Erro ao criar campanha.';
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
                    <li className={styles.active}><Link href="/admin/cadastro-campanha" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div></Link></li>
                    <li><Link href="/admin/cadastro-categoria" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Categorias</span></div></Link></li>
                    {/*  <li><Link href="/admin/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li> */}
                    <li><Link href="/admin/login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Cadastro de Campanhas</h1>
                </header>

                {message && <div className={`${styles.alertMessage} ${styles[message.type]}`}>{message.text}</div>}

                <div className={styles.formCard}>
                    <h2 className={styles.sectionTitle}>Nova Campanha</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Linha 1 */}
                        <div className={styles.row}>
                            <div className={`${styles.fieldGroup} ${styles.inputMedium}`}>
                                <label htmlFor="nome">Nome da Campanha<span className={styles.requiredAsterisk}>*</span></label>
                                <input type="text" name="nome" id="nome" placeholder="Ex: Liquidação" value={form.nome} onChange={handleChange} required />
                            </div>
                            <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                                <label htmlFor="fornecedorId">ID do Fornecedor<span className={styles.requiredAsterisk}>*</span></label>
                                <input type="text" name="fornecedorId" id="fornecedorId" placeholder="ID..." value={form.fornecedorId} onChange={handleChange} required />
                            </div>
                        </div>

                        {/* Linha 2 - Seleção de Tipo */}
                        <div className={styles.fieldGroup}>
                            <label htmlFor="tipo">Tipo de Campanha<span className={styles.requiredAsterisk}>*</span></label>
                            <select name="tipo" id="tipo" value={form.tipo} onChange={handleChange} className={styles.inputModal} required>
                                <option value="percentual_produto">Desconto Percentual</option>
                                <option value="valor_compra">Cashback por Valor de Compra</option>
                                <option value="quantidade_produto">Brinde por Quantidade</option>
                            </select>
                        </div>

                        {/* Linha 3 - Campos Condicionais baseados no Tipo */}
                        <div className={styles.row}>
                            {form.tipo === 'percentual_produto' && (
                                <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                                    <label htmlFor="percentualDesconto">Desconto (%)<span className={styles.requiredAsterisk}>*</span></label>
                                    <input type="number" name="percentualDesconto" id="percentualDesconto" placeholder="0-100" value={form.percentualDesconto} onChange={handleChange} step="0.01" />
                                </div>
                            )}

                            {form.tipo === 'valor_compra' && (
                                <>
                                    <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                                        <label htmlFor="valorMinimoCompra">Valor Mín. Compra (R$)<span className={styles.requiredAsterisk}>*</span></label>
                                        <input type="number" name="valorMinimoCompra" id="valorMinimoCompra" value={form.valorMinimoCompra} onChange={handleChange} step="0.01" />
                                    </div>
                                    <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                                        <label htmlFor="cashbackValor">Valor Cashback (R$)<span className={styles.requiredAsterisk}>*</span></label>
                                        <input type="number" name="cashbackValor" id="cashbackValor" value={form.cashbackValor} onChange={handleChange} step="0.01" />
                                    </div>
                                </>
                            )}

                            {form.tipo === 'quantidade_produto' && (
                                <>
                                    <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                                        <label htmlFor="quantidadeMinimaProduto">Qtd. Mínima<span className={styles.requiredAsterisk}>*</span></label>
                                        <input type="number" name="quantidadeMinimaProduto" id="quantidadeMinimaProduto" value={form.quantidadeMinimaProduto} onChange={handleChange} />
                                    </div>
                                    <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                                        <label htmlFor="brindeDescricao">Descrição do Brinde<span className={styles.requiredAsterisk}>*</span></label>
                                        <input type="text" name="brindeDescricao" id="brindeDescricao" value={form.brindeDescricao} onChange={handleChange} placeholder="Ex: +1 unidade grátis" />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Linha 4 - Datas */}
                        <div className={styles.row}>
                            <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                                <label htmlFor="dataInicio">Início<span className={styles.requiredAsterisk}>*</span></label>
                                <input type="date" name="dataInicio" id="dataInicio" value={form.dataInicio} onChange={handleChange} required />
                            </div>
                            <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                                <label htmlFor="dataFim">Fim</label>
                                <input type="date" name="dataFim" id="dataFim" value={form.dataFim} onChange={handleChange} />
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <div></div>
                            <button type="submit" className={styles.submitButton} disabled={loading}>
                                {loading ? 'Criando...' : 'Criar Campanha'}
                            </button>
                        </div>
                    </form>
                </div>

                <hr className={styles.divider} />

                <BuscaCampanhas />
            </main>
        </div>
    );
}

export default withAuth(CadastroCampanha);
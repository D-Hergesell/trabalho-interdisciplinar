import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
import styles from '../../styles/AdminPedido.module.css';
import api from '../../services/api';
import {
    FiGrid,
    FiUsers,
    FiPackage,
    FiUser,
    FiLogOut,
    FiBox,
    FiPlus,
    FiTrash2,
    FiChevronDown,
    FiSearch,
    FiEdit,
    FiChevronLeft,
    FiChevronRight,
    FiShoppingBag,
    FiTag
} from 'react-icons/fi';


const formatCurrency = (value) => {
    const n = Number(value) || 0;
    return n.toFixed(2).replace('.', ',');
};

// ============================================================================
// 1. COMPONENTE MODAL DE EDIÇÃO DE PEDIDO (STATUS)
// ============================================================================
const EditPedidoModal = ({ pedido = {}, onSave, onCancel, loading }) => {
    const safeDate = pedido.dataPedido ? String(pedido.dataPedido).substring(0, 10) : new Date().toISOString().substring(0, 10);

    const [formData, setFormData] = useState({
        status: pedido.status || 'PENDENTE',
        dataPedido: safeDate
    });

    useEffect(() => {
        const newSafeDate = pedido.dataPedido ? String(pedido.dataPedido).substring(0, 10) : new Date().toISOString().substring(0, 10);
        setFormData({
            status: pedido.status || 'PENDENTE',
            dataPedido: newSafeDate
        });
    }, [pedido]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            id: pedido.id,
            status: formData.status
        });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Editar Status Pedido: #{String(pedido.id || '').substring(0, 8)}</h3>

                <form onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Status do Pedido</label>
                            <select name="status" value={formData.status} onChange={handleChange} required className={styles.inputModal}>
                                <option value="PENDENTE">Pendente</option>
                                <option value="EM_SEPARACAO">Em Separação</option>
                                <option value="ENVIADO">Enviado</option>
                                <option value="ENTREGUE">Entregue</option>
                                <option value="CANCELADO">Cancelado</option>
                            </select>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label>Data (Visualização)</label>
                            <input type="date" name="dataPedido" value={formData.dataPedido} disabled className={styles.inputModal} />
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button
                            className={`${styles.submitButton} ${styles.btnCancel}`}
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                        >
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


const CustomProductDropdown = ({ options = [], value = '', onChange, placeholder = 'Selecione', className = '', required = false, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(option => String(option.id).trim() === String(value).trim());
    const displayValue = selectedOption ? (selectedOption.nome) : placeholder;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (optionId) => {
        if (onChange) onChange({ target: { name: 'produtoId', value: String(optionId) } });
        setIsOpen(false);
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (!disabled) setIsOpen(prev => !prev);
    };

    return (
        <div ref={dropdownRef} className={`${styles.customDropdownContainer} ${className}`}>
            <div
                className={`${styles.dropdownInput} ${isOpen ? styles.active : ''}`}
                onClick={handleClick}
                tabIndex={0}
                role="button"
                style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.9 : 1 }}
            >
                <span>{displayValue}</span>
                <FiChevronDown size={16} className={`${styles.arrowIcon} ${isOpen ? styles.up : ''}`} />
            </div>

            {isOpen && !disabled && (
                <div className={styles.dropdownMenu}>
                    {options.length > 0 ? (
                        options.map(option => (
                            <div
                                key={String(option.id)}
                                className={`${styles.dropdownItem} ${String(option.id).trim() === String(value).trim() ? styles.selected : ''}`}
                                onClick={() => handleSelect(option.id)}
                            >
                                {option.nome}
                            </div>
                        ))
                    ) : (
                        <div className={styles.dropdownItem} style={{ fontStyle: 'italic', cursor: 'default', color: '#999' }}>
                            Nenhum produto encontrado para este fornecedor.
                        </div>
                    )}
                </div>
            )}

            <input type="hidden" name="produtoId" value={value} required={required && !disabled} />
        </div>
    );
};

// ============================================================================
// 3. COMPONENTE DE BUSCA E GERENCIAMENTO DE PEDIDOS
// ============================================================================
const BuscaPedidos = ({ allFornecedores = [] }) => {
    const [searchId, setSearchId] = useState('');
    const [searchSupplierInput, setSearchSupplierInput] = useState('');

    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const [expandedPedidoId, setExpandedPedidoId] = useState(null);
    const [editingPedido, setEditingPedido] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [message, setMessage] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;

    const toggleDetails = (pedidoId) => {
        setExpandedPedidoId((prev) => (prev === pedidoId ? null : pedidoId));
    };

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        setMessage(null);
        setCurrentIndex(0);
        setEditingPedido(null);
        setExpandedPedidoId(null);

        try {
            const response = await api.get('/api/v1/pedidos');
            let dados = Array.isArray(response.data) ? response.data : [];

            if (searchId.trim() !== '') {
                const searchIdLower = searchId.trim().toLowerCase();
                dados = dados.filter((p) =>
                    String(p.id).toLowerCase().includes(searchIdLower)
                );
            }

            if (searchSupplierInput.trim() !== '') {
                const term = searchSupplierInput.trim().toLowerCase();
                dados = dados.filter(p => {
                    const nomeForn = p.fornecedorNome ? p.fornecedorNome.toLowerCase() : '';
                    return nomeForn.includes(term);
                });
            }

            setPedidos(dados);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            const msg = error.response
                ? `Status ${error.response.status}: ${error.response.data?.error}`
                : 'Erro de conexão';
            setMessage({ type: 'error', text: `Erro ao buscar pedidos: ${msg}` });
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (pedido) => {
        setMessage(null);
        setEditingPedido(pedido);
    };

    const cancelEdit = () => setEditingPedido(null);

    const handleUpdateSubmit = async (updatedData) => {
        setLoading(true);
        setMessage(null);
        const id = updatedData.id;

        try {
            const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));
            if(!usuarioLogado || !usuarioLogado.id) throw new Error("Usuário não logado");

            await api.patch(`/api/v1/pedidos/${id}/status`, null, {
                params: {
                    status: updatedData.status,
                    usuarioId: usuarioLogado.id
                }
            });

            setPedidos((oldList) =>
                oldList.map((item) =>
                    item.id === id ? { ...item, status: updatedData.status } : item
                )
            );
            setEditingPedido(null);
            setMessage({
                type: 'success',
                text: `Status do pedido #${String(id).substring(0, 8)} atualizado!`,
            });
        } catch (error) {
            console.error('Erro ao atualizar pedido:', error);
            const msg = error.response?.data?.error || error.message || 'Erro desconhecido';
            setMessage({ type: 'error', text: `Erro ao atualizar: ${msg}` });
        } finally {
            setLoading(false);
        }
    };

    const startDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const cancelAction = () => {
        setDeleteId(null);
        setShowConfirm(false);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setShowConfirm(false);
        setLoading(true);
        setMessage(null);

        try {
            await api.delete(`/api/v1/pedidos/${deleteId}`);
            setPedidos((oldList) =>
                oldList.filter((item) => item.id !== deleteId)
            );
            setMessage({
                type: 'success',
                text: 'Pedido deletado permanentemente!',
            });
        } catch (error) {
            console.error('Erro ao deletar:', error);
            const msg = error.response?.data?.error || 'Erro desconhecido.';
            setMessage({ type: 'error', text: `Erro ao deletar: ${msg}` });
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
    };

    const nextSlide = () => {
        if (currentIndex + itemsPerPage < pedidos.length) {
            setCurrentIndex(currentIndex + itemsPerPage);
            setExpandedPedidoId(null);
        }
    };

    const prevSlide = () => {
        if (currentIndex - itemsPerPage >= 0) {
            setCurrentIndex(currentIndex - itemsPerPage);
            setExpandedPedidoId(null);
        }
    };

    const visibleItems = pedidos.slice(currentIndex, currentIndex + itemsPerPage);
    const totalPages = Math.max(1, Math.ceil(pedidos.length / itemsPerPage));
    const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;

    const ConfirmationModal = () => (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: 400 }}>
                <h3 className={styles.modalTitle}>Confirmação de Exclusão</h3>
                <p className={styles.modalText}>
                    Tem certeza que deseja excluir permanentemente este pedido?
                </p>
                <div className={styles.modalActions}>
                    <button className={`${styles.submitButton} ${styles.btnCancel}`} onClick={cancelAction}>
                        Cancelar
                    </button>
                    <button
                        className={`${styles.submitButton} ${styles.btnDanger}`}
                        onClick={handleConfirmDelete}
                        disabled={loading}
                    >
                        {loading ? 'Processando...' : 'Confirmar Exclusão'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles['search-section']}>
            <h2 className={styles['search-header']}>Consultar / Gerenciar Pedidos</h2>

            {message && (
                <div className={`${styles.alertMessage} ${styles[message.type]}`}>
                    {String(message.text).split('\n').map((line, idx) => (
                        <p key={idx} className={styles.messageLine}>{line}</p>
                    ))}
                </div>
            )}


            <div className={styles['search-inputs']}>
                <div className={styles['search-group']}>
                    <label>ID Pedido</label>
                    <input
                        placeholder="Ex: 64b..."
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                    />
                </div>


                <div className={styles['search-group']}>
                    <label>Fornecedor (Nome)</label>
                    <input
                        type="text"
                        placeholder="Ex: Fornecedor X..."
                        value={searchSupplierInput}
                        onChange={(e) => setSearchSupplierInput(e.target.value)}
                    />
                </div>

                <button
                    className={styles['btn-search']}
                    onClick={handleSearch}
                    disabled={loading}
                >
                    <FiSearch size={16} /> {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </div>

            {pedidos.length > 0 && (
                <>
                    <div className={styles['provider-list-container']}>
                        <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`}>
                            <div className={styles['header-cell']}>ID Pedido</div>
                            <div className={styles['header-cell']}>Loja</div>
                            <div className={styles['header-cell']}>Fornecedor</div>
                            <div className={styles['header-cell']}>Total (R$)</div>
                            <div className={styles['header-cell']}>Status</div>
                            <div className={styles['header-cell-actions']}>Ações</div>
                        </div>

                        {visibleItems.map((pedido) => {
                            const isExpanded = expandedPedidoId === pedido.id;
                            const isCanceled = pedido.status === 'CANCELADO';
                            const itemClasses = [
                                styles['provider-list-item'],
                                isCanceled && styles['item-status-off'],
                                isExpanded && styles['item-expanded'],
                            ].filter(Boolean).join(' ');

                            return (
                                <React.Fragment key={pedido.id}>
                                    <div className={itemClasses} onClick={() => toggleDetails(pedido.id)}>
                                        <div className={styles['detail-cell-name']}>#{String(pedido.id).substring(0, 8)}</div>
                                        <div className={styles['detail-cell']}>{pedido.lojaNome}</div>
                                        <div className={styles['detail-cell']}>{pedido.fornecedorNome}</div>
                                        <div className={styles['detail-cell']}>R$ {formatCurrency(pedido.valorTotal)}</div>
                                        <div className={styles['detail-cell']}>
                                            <span className={styles[`status-${String(pedido.status).toLowerCase()}`]}>{pedido.status}</span>
                                        </div>
                                        <div className={styles['item-actions']}>
                                            <button className={styles['btn-detail']} onClick={(e) => { e.stopPropagation(); toggleDetails(pedido.id); }}>
                                                <FiChevronDown size={20} className={isExpanded ? styles['btn-rotated'] : ''} />
                                            </button>
                                            <button className={styles['btn-edit']} onClick={(e) => { e.stopPropagation(); startEdit(pedido); }}>
                                                <FiEdit size={16} />
                                            </button>
                                            <button className={styles['btn-delete']} onClick={(e) => { e.stopPropagation(); startDelete(pedido.id); }}>
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className={styles['expanded-details-row']}>
                                            <p><strong>ID Completo:</strong> {pedido.id}</p>
                                            <p><strong>Criado por:</strong> {pedido.criadoPorUsuarioNome}</p>
                                            <p><strong>Data:</strong> {pedido.dataPedido ? new Date(pedido.dataPedido).toLocaleDateString() : 'N/A'}</p>
                                            <p><strong>Itens:</strong></p>
                                            <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                                                {pedido.itens && pedido.itens.map((it, idx) => (
                                                    <li key={idx}>
                                                        {it.quantidade}x {it.produtoNome} - (R$ {formatCurrency(it.precoUnitarioMomento)})
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <div className={styles.paginationControls}>
                        <button className={styles['nav-btn']} onClick={prevSlide} disabled={currentIndex === 0}>
                            <FiChevronLeft size={20} />
                        </button>
                        <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
                        <button className={styles['nav-btn']} onClick={nextSlide} disabled={currentIndex + itemsPerPage >= pedidos.length}>
                            <FiChevronRight size={20} />
                        </button>
                    </div>
                </>
            )}

            {!loading && searched && pedidos.length === 0 && (
                <p className={styles['no-data']}>Nenhum pedido encontrado. Verifique os filtros.</p>
            )}

            {!loading && !searched && pedidos.length === 0 && (
                <p className={styles['no-data']}>Busque algo ou recarregue a página.</p>
            )}

            {showConfirm && <ConfirmationModal />}
            {editingPedido && <EditPedidoModal pedido={editingPedido} onSave={handleUpdateSubmit} onCancel={cancelEdit} loading={loading} />}
        </div>
    );
};

// ============================================================================
// 4. COMPONENTE PRINCIPAL: CadastroPedido
// ============================================================================
function CadastroPedido (){
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [message, setMessage] = useState(null);

    const [fornecedores, setFornecedores] = useState([]);
    const [lojas, setLojistas] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [filteredProdutos, setFilteredProdutos] = useState([]);

    // === NOVOS ESTADOS ===
    const [lojaSelecionadaEstado, setLojaSelecionadaEstado] = useState(null);
    const [ajusteUnitario, setAjusteUnitario] = useState(0);
    const [condicoesEstados, setCondicoesEstados] = useState([]);

    const [formData, setFormData] = useState({
        fornecedorId: '',
        lojaId: '',
        dataPedido: new Date().toISOString().substring(0, 10),
        status: 'Pendente',
        observacoes: ''
    });

    const [itensPedido, setItensPedido] = useState([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);


    const loadInitialData = async () => {
        setLoadingData(true);
        setMessage(null);

        try {
            const respFornecedores = await api.get('/api/v1/fornecedores');
            setFornecedores(respFornecedores.data || []);

            const respLojas = await api.get('/api/v1/lojas');
            setLojistas(respLojas.data || []);

            const respProdutos = await api.get('/api/v1/produtos');
            setProdutos(respProdutos.data || []);

            // Busca todas as regras de estado ativas
            const resCond = await api.get('/api/v1/condicoes-estado/ativos');
            setCondicoesEstados(resCond.data || []);

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            const errorMsg = error.response ? error.response.data?.error || error.message : error.message;
            setMessage({ type: 'error', text: `Erro ao carregar dados: ${errorMsg}` });
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => { loadInitialData(); }, []);

    // 1. Efeito para capturar o Estado da Loja quando o Admin seleciona uma loja
    useEffect(() => {
        if (formData.lojaId) {
            const lojaEncontrada = lojas.find(l => String(l.id) === String(formData.lojaId));
            if (lojaEncontrada) {
                setLojaSelecionadaEstado(lojaEncontrada.estado);
            }
        } else {
            setLojaSelecionadaEstado(null);
        }
    }, [formData.lojaId, lojas]);

    // 2. Efeito para buscar/calcular o Ajuste quando Loja ou Fornecedor mudam
    useEffect(() => {
        function calcularAjuste() {
            if (!formData.fornecedorId || !lojaSelecionadaEstado || condicoesEstados.length === 0) {
                setAjusteUnitario(0);
                return;
            }

            const regra = condicoesEstados.find(c =>
                String(c.fornecedorId) === String(formData.fornecedorId) &&
                c.estado === lojaSelecionadaEstado
            );

            if (regra && regra.ajusteUnitarioAplicado) {
                const valor = Number(regra.ajusteUnitarioAplicado);
                setAjusteUnitario(valor);
            } else {
                setAjusteUnitario(0);
            }
        }

        calcularAjuste();
    }, [formData.fornecedorId, lojaSelecionadaEstado, condicoesEstados]);

    // 3. Efeito para filtrar produtos e resetar carrinho se mudar fornecedor
    useEffect(() => {
        const selectedSupplierId = String(formData.fornecedorId).trim();

        if (selectedSupplierId) {
            const produtosDoFornecedor = produtos.filter(p =>
                String(p.fornecedorId).trim() === selectedSupplierId && p.ativo === true
            );
            setFilteredProdutos(produtosDoFornecedor);

            // Verifica se tem itens no carrinho que não são desse fornecedor
            const temItemInvalido = itensPedido.some(i => i.produtoId && !produtosDoFornecedor.find(p => String(p.id) === String(i.produtoId)));

            if (temItemInvalido) {
                setItensPedido([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
            }
        } else {
            setFilteredProdutos([]);
            setItensPedido([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
        }
    }, [formData.fornecedorId, produtos]);

    // 4. NOVO: Efeito para atualizar preços de itens JÁ ADICIONADOS se o ajuste mudar
    // (Ex: O admin seleciona produtos, e DEPOIS muda a loja para uma de outro estado)
    useEffect(() => {
        setItensPedido(currentItens => currentItens.map(item => {
            if (!item.produtoId) return item;

            const prod = filteredProdutos.find(p => String(p.id) === String(item.produtoId));
            if (prod) {
                const novoPreco = Math.max(0, Number(prod.precoBase) + ajusteUnitario);
                // Só atualiza se mudou
                if (item.valorUnitario !== novoPreco) {
                    return { ...item, valorUnitario: novoPreco };
                }
            }
            return item;
        }));
    }, [ajusteUnitario, filteredProdutos]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = useCallback((index, e, productsList = filteredProdutos) => {
        const { name, value } = e.target;

        setItensPedido(prevItens => {
            const novosItens = [...prevItens];
            const itemAtual = novosItens[index];

            if (name === 'quantidade') {
                let novaQtd = parseInt(value, 10);
                if (isNaN(novaQtd) || novaQtd < 1) novaQtd = 1;

                if (itemAtual.produtoId) {
                    const produtoRef = productsList.find(p => String(p.id).trim() === String(itemAtual.produtoId).trim());
                    if (produtoRef && novaQtd > produtoRef.quantidadeEstoque) {
                        alert(`Quantidade indisponível! Estoque atual: ${produtoRef.quantidadeEstoque}`);
                        novaQtd = produtoRef.quantidadeEstoque > 0 ? produtoRef.quantidadeEstoque : 1;
                    }
                }
                novosItens[index][name] = novaQtd;
            }

            else if (name === 'produtoId') {
                const cleanedValue = String(value).trim();
                novosItens[index][name] = cleanedValue;
                const produtoSelecionado = productsList.find(p => String(p.id).trim() === cleanedValue);

                if (produtoSelecionado) {
                    const base = Number(produtoSelecionado.precoBase);
                    let final = base + ajusteUnitario;
                    if (final < 0) final = 0;
                    novosItens[index].valorUnitario = final;

                    if (produtoSelecionado.quantidadeEstoque <= 0) {
                        alert("Este produto está sem estoque.");
                        novosItens[index].quantidade = 0;
                    } else {
                        novosItens[index].quantidade = 1;
                    }
                } else {
                    novosItens[index].valorUnitario = 0.00;
                }
            }

            return novosItens;
        });
    }, [filteredProdutos, ajusteUnitario]);

    const handleAddItem = () => {
        if (!formData.fornecedorId) {
            setMessage({ type: 'warning', text: 'Selecione um Fornecedor antes de adicionar itens.' });
            return;
        }
        setItensPedido(prev => [...prev, { produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
    };

    const handleRemoveItem = (index) => {
        const novosItens = itensPedido.filter((_, i) => i !== index);
        setItensPedido(novosItens.length ? novosItens : [{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
    };

    const calcularTotal = () => {
        return itensPedido.reduce((total, item) => total + ((Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0)), 0);
    };

    const getProductStock = (prodId) => {
        const p = filteredProdutos.find(x => String(x.id) === String(prodId));
        return p ? p.quantidadeEstoque : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Validação de estoque final
        for (const item of itensPedido) {
            const prod = filteredProdutos.find(p => String(p.id) === String(item.produtoId));
            if (prod && item.quantidade > prod.quantidadeEstoque) {
                setMessage({ type: 'error', text: `Erro: O produto "${prod.nome}" tem apenas ${prod.quantidadeEstoque} em estoque.` });
                setLoading(false);
                return;
            }
        }

        if (!formData.fornecedorId || !formData.lojaId) {
            setMessage({ type: 'error', text: 'Selecione a Loja e o Fornecedor.' });
            setLoading(false);
            return;
        }

        const itensValidos = itensPedido
            .filter(item => item.produtoId && item.quantidade > 0)
            .map(item => ({
                produtoId: item.produtoId,
                quantidade: Number(item.quantidade),
                valorUnitarioMomento: item.valorUnitario
            }));

        if (itensValidos.length === 0) {
            setMessage({ type: 'error', text: 'Adicione pelo menos um produto válido ao pedido.' });
            setLoading(false);
            return;
        }

        const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));
        if (!usuarioLogado || !usuarioLogado.id) {
            setMessage({ type: 'error', text: 'Erro de autenticação. Usuário não identificado.' });
            setLoading(false);
            return;
        }

        const pedidoParaBackend = {
            lojaId: formData.lojaId,
            fornecedorId: formData.fornecedorId,
            criadoPorUsuarioId: usuarioLogado.id,
            condicaoPagamentoId: null,
            itens: itensValidos
        };

        try {
            const response = await api.post('/api/v1/pedidos', pedidoParaBackend);
            const novoPedido = response.data;

            setMessage({ type: 'success', text: ` Pedido #${String(novoPedido.id || '').substring(0, 8)} criado com sucesso! Total: R$ ${formatCurrency(novoPedido.valorTotal)}` });

            setFormData({ fornecedorId: '', lojaId: '', dataPedido: new Date().toISOString().substring(0, 10), status: 'Pendente', observacoes: '' });
            setItensPedido([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
            setAjusteUnitario(0); // Resetar ajuste

            await loadInitialData();

        } catch (error) {
            console.error('Erro ao cadastrar Pedido:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.erro || 'Erro ao criar pedido.';
            setMessage({ type: 'error', text: ` Erro: ${errorMessage}` });
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className={styles['dashboard-container']}>
                <nav className={styles.sidebar}>
                    <ul>
                        <li><Link href="/admin/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
                    </ul>
                </nav>
                <main className={styles['main-content']}>
                    <p>Carregando...</p>
                </main>
            </div>
        );
    }

    const isProductSelectionDisabled = !formData.fornecedorId;

    return (
        <div className={styles['dashboard-container']}>
            <nav className={styles.sidebar}>
                <ul>
                    <li><Link href="/admin/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
                    <li><Link href="/admin/cadastro-fornecedor" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Fornecedores</span></div></Link></li>
                    <li><Link href="/admin/cadastro-lojista" className={styles.linkReset}><div className={styles.menuItem}><FiBox size={20} /><span>Lojistas</span></div></Link></li>
                    <li><Link href="/admin/cadastro-produto" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Produtos</span></div></Link></li>
                    <li className={styles.active}><Link href="/admin/cadastro-pedidos" className={styles.linkReset}><div className={styles.menuItem}><FiShoppingBag size={20} /><span>Pedidos</span></div></Link></li>
                    <li><Link href="/admin/cadastro-campanha" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div></Link></li>
                    <li><Link href="/admin/cadastro-categoria" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Categorias</span></div></Link></li>
                    <li><Link href="/admin/login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}><h1>Cadastrar Novo Pedido</h1></header>

                {message && (<div className={`${styles.alertMessage} ${styles[message.type]}`}>{message.text}</div>)}

                <form className={styles.formCard} onSubmit={handleSubmit}>
                    <h2 className={styles.sectionTitle}>Dados do Pedido</h2>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Loja Solicitante <span className={styles.requiredAsterisk}>*</span></label>
                            <select name="lojaId" value={formData.lojaId} onChange={handleChange} className={styles.inputLong} required>
                                <option value="" disabled>Selecione uma loja</option>
                                {lojas.map(l => <option key={l.id} value={l.id}>{l.nomeFantasia}</option>)}
                            </select>
                            {lojaSelecionadaEstado && (
                                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                                    Estado da Loja: <strong>{lojaSelecionadaEstado}</strong>
                                </small>
                            )}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label>Fornecedor <span className={styles.requiredAsterisk}>*</span></label>
                            <select name="fornecedorId" value={formData.fornecedorId} onChange={handleChange} className={styles.inputLong} required>
                                <option value="" disabled>Selecione um fornecedor</option>
                                {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nomeFantasia}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Data do Pedido</label>
                            <input type="date" name="dataPedido" value={formData.dataPedido} onChange={handleChange} className={styles.inputLong} required />
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    <h2 className={styles.sectionTitle}>Itens do Pedido</h2>

                    {isProductSelectionDisabled && (<p className={`${styles.alertMessage} ${styles.info}`} style={{ marginBottom: 15 }}>⚠️ Selecione um <strong>Fornecedor</strong> acima para liberar a lista de produtos.</p>)}

                    <div className={styles.itemGridHeader}>
                        <div className={styles.colProductHeader}>Produto</div>
                        <div className={`${styles.colTinyHeader} ${styles.alignRight}`}>Qtd.</div>
                        <div className={`${styles.colTinyHeader} ${styles.alignRight}`}>Valor Unit. (R$)</div>
                        <div className={styles.colTotalHeader}>Total Item</div>
                        <div className={styles.colRemoveButtonPlaceholder}></div>
                    </div>

                    {itensPedido.map((item, index) => (
                        <div key={index} className={styles.itemGridRow}>

                            <div className={styles.colProductInput}>
                                <CustomProductDropdown
                                    options={filteredProdutos}
                                    value={item.produtoId}
                                    onChange={(e) => handleItemChange(index, e, filteredProdutos)}
                                    placeholder={isProductSelectionDisabled ? 'Fornecedor não selecionado' : 'Selecione um produto'}
                                    required
                                    index={index}
                                    disabled={isProductSelectionDisabled}
                                />
                                {item.produtoId && (
                                    <div className={styles.stockInfo}>
                                        Estoque disponível: <strong>{getProductStock(item.produtoId)}</strong>
                                        {ajusteUnitario !== 0 && (
                                            <span style={{marginLeft: '8px', color: '#e67e22', fontSize: '0.8rem'}}>
                                                (Base: {(() => {
                                                const p = filteredProdutos.find(x => String(x.id) === String(item.produtoId));
                                                return p ? formatCurrency(p.precoBase) : '...';
                                            })()})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>


                            <div className={styles.colTinyInput}>
                                <input
                                    type="number"
                                    name="quantidade"
                                    value={item.quantidade}
                                    onChange={(e) => handleItemChange(index, e, filteredProdutos)}
                                    min="1"
                                    max={getProductStock(item.produtoId)}
                                    className={styles.inputItem}
                                    required
                                    disabled={!item.produtoId}
                                />
                            </div>


                            <div className={styles.colTinyInput}>
                                <input
                                    type="text"
                                    name="valorUnitario"
                                    value={formatCurrency(item.valorUnitario)}
                                    readOnly
                                    className={`${styles.inputItem} ${styles.inputReadOnly}`}
                                    tabIndex="-1"
                                />
                            </div>


                            <div className={styles.colTotalDisplay}>
                                <p className={styles.totalItem}>R$ {formatCurrency((Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0))}</p>
                            </div>


                            <button type="button" className={styles.removeItemButton} onClick={() => handleRemoveItem(index)} disabled={itensPedido.length === 1 || isProductSelectionDisabled} title={itensPedido.length === 1 ? 'O pedido deve ter pelo menos um item' : 'Remover item'}>
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    ))}

                    <div className={styles.addItemSection}>
                        <button type="button" className={styles.addItemButton} onClick={handleAddItem} disabled={isProductSelectionDisabled || filteredProdutos.length === 0}><FiPlus size={16} /> Adicionar Novo Item</button>
                        {filteredProdutos.length === 0 && formData.fornecedorId && (<p className={styles.noProductsMessage}>⚠️ Este fornecedor não possui produtos **ativos** cadastrados.</p>)}
                    </div>

                    <div className={styles.totalPedidoContainer}>
                        <div style={{textAlign: 'right'}}>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                                <span className={styles.totalLabel}>Total Estimado:</span>
                                <span className={styles.totalValue}>R$ {formatCurrency(calcularTotal())}</span>
                            </div>
                            {ajusteUnitario !== 0 && (
                                <p style={{fontSize: '0.85rem', color: '#e67e22', marginTop: 5}}>
                                    * Incluindo ajuste de R$ {formatCurrency(ajusteUnitario)} por item (Regra Estadual)
                                </p>
                            )}
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    <h2 className={styles.sectionTitle}>Observações</h2>
                    <div className={styles.fieldGroup}>
                        <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} className={styles.textareaLong} rows="3" placeholder="Notas internas..." />
                    </div>

                    <div className={styles.footer}>
                        <button type="submit" className={styles.submitButton} disabled={loading || isProductSelectionDisabled}>{loading ? 'Processando...' : 'Salvar Novo Pedido'}</button>
                    </div>
                </form>

                <div style={{ marginTop: 28 }}>
                    <BuscaPedidos allFornecedores={fornecedores} />
                </div>
            </main>
        </div>
    );
}

export default withAuth (CadastroPedido);
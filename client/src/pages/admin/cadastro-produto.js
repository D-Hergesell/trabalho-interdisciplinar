import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
import api from '../../services/api';
import styles from '../../styles/AdminGeral.module.css';
import {
    FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox,
    FiSearch, FiArrowRight, FiTrash2, FiChevronLeft, FiChevronRight, FiEdit, FiShoppingBag, FiTag
} from 'react-icons/fi';


const EditProdutoModal = ({ produto, onSave, onCancel, loading, fornecedores, categorias, setSearchMessage }) => {
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        precoBase: '',
        quantidadeEstoque: '',
        unidadeMedida: '',
        fornecedorId: '',
        categoriaId: ''
    });

    useEffect(() => {
        if (produto) {
            setFormData({
                nome: produto.nome || '',
                descricao: produto.descricao || '',
                precoBase: produto.precoBase ? String(produto.precoBase) : '',
                quantidadeEstoque: produto.quantidadeEstoque ? String(produto.quantidadeEstoque) : '',
                unidadeMedida: produto.unidadeMedida || '',
                fornecedorId: produto.fornecedorId || '',
                categoriaId: produto.categoriaId || ''
            });
        }
    }, [produto]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const parsedPrice = String(formData.precoBase).replace(',', '.');
        const finalPrice = parseFloat(parsedPrice);
        const finalStock = formData.quantidadeEstoque ? parseInt(formData.quantidadeEstoque, 10) : 0;

        if (isNaN(finalPrice) || isNaN(finalStock)) {
            setSearchMessage({ type: 'error', text: "Erro de validação: Preço e Estoque devem ser números válidos." });
            return;
        }

        const dataToSend = {
            id: produto.id, // ID original para referência
            nome: formData.nome,
            descricao: formData.descricao,
            precoBase: finalPrice,
            quantidadeEstoque: finalStock,
            unidadeMedida: formData.unidadeMedida,
            fornecedorId: formData.fornecedorId,
            categoriaId: formData.categoriaId || null // Categoria pode ser opcional no backend dependendo da regra, mas DTO tem o campo
        };

        setSearchMessage(null);
        onSave(dataToSend);
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '700px' }}>
                <h3 className={styles.modalTitle}>Editar Produto: {produto.nome}</h3>

                <form onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nome do Produto *</label>
                            <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Categoria</label>
                            <select name="categoriaId" value={formData.categoriaId} onChange={handleChange} className={styles.inputModal}>
                                <option value="">Selecione...</option>
                                {categorias.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label>Descrição</label>
                        <textarea name="descricao" value={formData.descricao} onChange={handleChange} className={styles.inputModal}></textarea>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Preço Base (R$) *</label>
                            <input type="number" name="precoBase" value={formData.precoBase} onChange={handleChange} step="0.01" required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Estoque (Qtd) *</label>
                            <input type="number" name="quantidadeEstoque" value={formData.quantidadeEstoque} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Unidade Medida</label>
                            <input type="text" name="unidadeMedida" value={formData.unidadeMedida} onChange={handleChange} placeholder="Ex: UN, KG" className={styles.inputModal} />
                        </div>
                    </div>

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


const BuscaProdutos = ({ mainMessageSetter, fornecedores, categorias }) => {
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchCategory, setSearchCategory] = useState('');

    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [searchMessage, setSearchMessage] = useState(null);

    const [editingProduto, setEditingProduto] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;

    const handleToggleExpand = (id) => {
        setExpandedId(current => current === id ? null : id);
    };

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        setSearchMessage(null);
        setCurrentIndex(0);
        setExpandedId(null);
        setEditingProduto(null);

        try {
            const response = await api.get('/api/v1/produtos');
            let dados = response.data || [];

            if (searchId) dados = dados.filter(p => String(p.id).includes(searchId));
            if (searchName) dados = dados.filter(p => p.nome && p.nome.toLowerCase().includes(searchName.toLowerCase()));
            if (searchCategory) dados = dados.filter(p => p.nomeCategoria && p.nomeCategoria.toLowerCase().includes(searchCategory.toLowerCase()));

            setProdutos(dados);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            setSearchMessage({ type: 'error', text: "Erro ao buscar produtos." });
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (produto) => {
        mainMessageSetter(null);
        setSearchMessage(null);
        setEditingProduto(produto);
    };

    const cancelEdit = () => {
        setEditingProduto(null);
        setSearchMessage(null);
    };

    const handleUpdateSubmit = async (updatedData) => {
        setLoading(true);
        setSearchMessage(null);
        const id = updatedData.id;
        const { id: _id, ...dataToSend } = updatedData; // Remove ID do corpo

        try {
            await api.put(`/api/v1/produtos/${id}`, dataToSend);

            // Atualiza lista local
            setProdutos(oldList => oldList.map(item => {
                if (item.id === id) {
                    // Mescla dados atualizados. Nota: nomeFornecedor/nomeCategoria não vêm no request,
                    // precisaria atualizar manualmente ou refetch, mas vamos manter simples
                    return { ...item, ...dataToSend };
                }
                return item;
            }));

            setEditingProduto(null);
            mainMessageSetter({ type: 'success', text: "Produto atualizado com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            const errorMessage = error.response?.data?.erro || error.response?.data?.error || "Erro desconhecido ao salvar.";
            setSearchMessage({ type: 'error', text: `Erro ao atualizar produto: ${errorMessage}` });
        } finally {
            setLoading(false);
        }
    };

    const startDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        setShowConfirm(false);
        setSearchMessage(null);

        try {
            await api.delete(`/api/v1/produtos/${deleteId}`);
            setProdutos(list => list.filter(item => item.id !== deleteId));
            mainMessageSetter({ type: 'success', text: `Produto excluído com sucesso!` });

            if (expandedId === deleteId) setExpandedId(null);
        } catch (error) {
            console.error(`Erro ao excluir:`, error);
            const msg = error.response?.data?.error || "Erro de rede/servidor.";
            setSearchMessage({ type: 'error', text: `Erro ao excluir: ${msg}` });
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setDeleteId(null);
        setShowConfirm(false);
    };

    const nextSlide = () => {
        if (currentIndex + itemsPerPage < produtos.length) {
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

    const visibleItems = produtos.slice(currentIndex, currentIndex + itemsPerPage);
    const totalPages = Math.ceil(produtos.length / itemsPerPage);
    const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;

    const ConfirmationModal = () => (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Confirmação de Exclusão</h3>
                <p className={styles.modalText}>
                    Deseja realmente excluir este produto do banco de dados? Esta ação é irreversível.
                </p>
                <div className={styles.modalActions}>
                    <button className={`${styles.submitButton} ${styles.btnCancel}`} onClick={cancelDelete}>Cancelar</button>
                    <button className={`${styles.submitButton} ${styles.btnDanger}`} onClick={confirmDelete}>
                        Excluir Permanentemente
                    </button>
                </div>
            </div>
        </div>
    );

    const ExpandedDetailsRow = ({ item }) => (
        <div className={styles['expanded-details-row']}>
            <div className={styles['detail-full-span']}>
                <p className={styles['detail-text-p']}><strong>ID Completo:</strong> {item.id}</p>
            </div>
            <div className={styles['detail-half-span']}>
                <p className={styles['detail-text-p']}><strong>Preço Base:</strong> R$ {Number(item.precoBase).toFixed(2)}</p>
            </div>
            <div className={styles['detail-half-span']}>
                <p className={styles['detail-text-p']}><strong>Status:</strong> <span className={!item.ativo ? styles.statusOff : styles.statusOn}>{item.ativo ? 'Ativo' : 'Inativo'}</span></p>
            </div>
            <div className={styles['detail-full-span']}>
                <p className={styles['detail-text-p']}><strong>Fornecedor:</strong> {item.nomeFornecedor || 'N/A'}</p>
            </div>
            <div className={styles['detail-full-span']}>
                <p className={styles['detail-text-p']}><strong>Descrição:</strong> {item.descricao || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <div className={styles['search-section']}>
            <h2 className={styles['search-header']}>Consultar / Gerenciar Produtos</h2>

            {searchMessage && <div className={`${styles.alertMessage} ${styles[searchMessage.type]}`}>{searchMessage.text}</div>}

            <div className={styles['search-inputs']}>
                <div className={styles['search-group']}>
                    <label>ID</label>
                    <input type="text" placeholder="Ex: 64b..." value={searchId} onChange={e => setSearchId(e.target.value)} />
                </div>
                <div className={styles['search-group']}>
                    <label>Nome</label>
                    <input type="text" placeholder="Ex: Teclado..." value={searchName} onChange={e => setSearchName(e.target.value)} />
                </div>
                <div className={styles['search-group']}>
                    <label>Categoria</label>
                    <input type="text" placeholder="Ex: Eletrônicos" value={searchCategory} onChange={e => setSearchCategory(e.target.value)} />
                </div>
                <button className={styles['btn-search']} onClick={handleSearch} disabled={loading}>
                    <FiSearch size={20} />
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </div>

            {produtos.length > 0 && (
                <>
                    <div className={styles['provider-list-container']}>
                        <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`}>
                            <div className={styles['header-cell']}>Nome do Produto</div>
                            <div className={styles['header-cell']}>ID (Início)</div>
                            <div className={styles['header-cell']}>Estoque</div>
                            <div className={styles['header-cell']}>Categoria</div>
                            <div className={styles['header-cell-actions']}>Ações</div>
                        </div>

                        {visibleItems.map(item => {
                            const expanded = expandedId === item.id;
                            let itemClasses = styles['provider-list-item'];
                            if (expanded) itemClasses += ` ${styles['item-expanded']}`;
                            if (!item.ativo) itemClasses += ` ${styles['item-status-off']}`;

                            return (
                                <React.Fragment key={item.id}>
                                    <div className={itemClasses} onClick={() => handleToggleExpand(item.id)}>
                                        <div className={styles['detail-cell-name']}><p>{item.nome}</p></div>
                                        <div className={styles['detail-cell']}><p>{String(item.id).substring(0, 10)}...</p></div>
                                        <div className={styles['detail-cell']}><p>{item.quantidadeEstoque}</p></div>
                                        <div className={styles['detail-cell']}><p>{item.nomeCategoria || '-'}</p></div>

                                        <div className={styles['item-actions']}>
                                            <button
                                                className={`${styles['btn-detail']} ${expanded ? styles['btn-rotated'] : ''}`}
                                                title={expanded ? "Esconder Detalhes" : "Ver Detalhes"}
                                                onClick={(e) => { e.stopPropagation(); handleToggleExpand(item.id); }}
                                            >
                                                <FiArrowRight size={20} />
                                            </button>
                                            <button
                                                className={styles['btn-edit']}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEdit(item);
                                                }}
                                                title="Editar Produto"
                                                disabled={loading}
                                            >
                                                <FiEdit size={18} />
                                            </button>
                                            <button
                                                className={styles['btn-delete']}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startDelete(item.id);
                                                }}
                                                title="Excluir Produto"
                                                disabled={loading}
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    {expanded && <ExpandedDetailsRow item={item} />}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <div className={styles.paginationControls}>
                        <button className={styles['nav-btn']} onClick={prevSlide} disabled={currentIndex === 0 || loading}>
                            <FiChevronLeft size={24} />
                        </button>
                        <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
                        <button className={styles['nav-btn']} onClick={nextSlide} disabled={currentIndex + itemsPerPage >= produtos.length || loading}>
                            <FiChevronRight size={24} />
                        </button>
                    </div>
                </>
            )}

            {!loading && searched && produtos.length === 0 && <p className={styles['no-data']}>Nenhum produto encontrado com os filtros especificados.</p>}

            {showConfirm && <ConfirmationModal />}

            {editingProduto && (
                <EditProdutoModal
                    produto={editingProduto}
                    onSave={handleUpdateSubmit}
                    onCancel={cancelEdit}
                    loading={loading}
                    fornecedores={fornecedores}
                    categorias={categorias}
                    setSearchMessage={setSearchMessage}
                />
            )}
        </div>
    );
};

// ============================================================================
// COMPONENTE PRINCIPAL: CadastroProdutos
// ============================================================================
function CadastroProdutos() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const [formData, setFormData] = useState({
        nome: '', descricao: '', precoBase: '', quantidadeEstoque: '', unidadeMedida: '', fornecedorId: '', categoriaId: ''
    });

    // Listas para os dropdowns
    const [fornecedores, setFornecedores] = useState([]);
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        async function loadDependencies() {
            try {
                const resFornecedores = await api.get('/api/v1/fornecedores/ativos'); // ou /ativos se existir
                setFornecedores(resFornecedores.data || []);

                const resCategorias = await api.get('/api/v1/categorias');
                setCategorias(resCategorias.data || []);
            } catch (error) {
                console.error("Erro ao carregar listas:", error);
            }
        }
        loadDependencies();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const dadosParaAPI = {
            nome: formData.nome,
            descricao: formData.descricao,
            precoBase: Number(formData.precoBase),
            quantidadeEstoque: Number(formData.quantidadeEstoque),
            unidadeMedida: formData.unidadeMedida,
            fornecedorId: formData.fornecedorId,
            categoriaId: formData.categoriaId || null
        };

        if (isNaN(dadosParaAPI.precoBase) || isNaN(dadosParaAPI.quantidadeEstoque)) {
            setMessage({ type: 'error', text: "Erro: Preço e Estoque devem ser números válidos." });
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/api/v1/produtos', dadosParaAPI);
            setMessage({ type: 'success', text: `Produto "${response.data.nome}" cadastrado com sucesso!` });
            setFormData({
                nome: '', descricao: '', precoBase: '', quantidadeEstoque: '', unidadeMedida: '',
                fornecedorId: '', categoriaId: ''
            });
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            const msg = error.response?.data?.erro || error.response?.data?.detalhes || error.response?.data?.error || "Erro de rede/servidor.";
            setMessage({ type: 'error', text: `Erro ao cadastrar produto: ${msg}` });
        }

        setLoading(false);
    };

    return (
        <div className={styles["dashboard-container"]}>

            <nav className={styles.sidebar}>
                <ul>
                    <li><Link href="/admin/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
                    <li><Link href="/admin/cadastro-fornecedor" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Fornecedores</span></div></Link></li>
                    <li><Link href="/admin/cadastro-lojista" className={styles.linkReset}><div className={styles.menuItem}><FiBox size={20} /><span>Lojistas</span></div></Link></li>
                    <li className={styles.active}><Link href="/admin/cadastro-produto" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Produtos</span></div></Link></li>
                    <li><Link href="/admin/cadastro-pedidos" className={styles.linkReset}><div className={styles.menuItem}><FiShoppingBag size={20} /><span>Pedidos</span></div></Link></li>
                    <li><Link href="/admin/cadastro-campanha" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div></Link></li>
                    <li><Link href="/admin/cadastro-categoria" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Categorias</span></div></Link></li>
                    <li><Link href="/admin/login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles["main-content"]}>

                <header className={styles.header}>
                    <h1>Gerenciamento de Produtos</h1>
                </header>

                {message && (
                    <div className={`${styles.alertMessage} ${styles[message.type]}`}>
                        <p>{message.text}</p>
                    </div>
                )}

                <h2 className={styles.sectionTitle}>Novo Cadastro de Produto</h2>
                <form className={styles.formCard} onSubmit={handleSubmit}>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nome do Produto *</label>
                            <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label>Categoria</label>
                            <select name="categoriaId" value={formData.categoriaId} onChange={handleChange} className={styles.inputModal}>
                                <option value="">Selecione...</option>
                                {categorias.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label>Descrição</label>
                        <textarea name="descricao" value={formData.descricao} onChange={handleChange}></textarea>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Preço Base (R$) *</label>
                            <input type="number" name="precoBase" step="0.01" value={formData.precoBase} onChange={handleChange} required />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label>Estoque (Qtd) *</label>
                            <input type="number" name="quantidadeEstoque" value={formData.quantidadeEstoque} onChange={handleChange} required />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label>Unidade Medida</label>
                            <input type="text" name="unidadeMedida" value={formData.unidadeMedida} onChange={handleChange} placeholder="UN, KG..." />
                        </div>
                    </div>

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
                    </div>

                    <div className={styles.footer}>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? "Cadastrando..." : "Cadastrar Produto"}
                        </button>
                    </div>

                </form>

                <hr className={styles.divider} />
                <BuscaProdutos
                    mainMessageSetter={setMessage}
                    fornecedores={fornecedores}
                    categorias={categorias}
                />
            </main>
        </div>
    );
}


export default withAuth(CadastroProdutos, "admin", "/admin/login");
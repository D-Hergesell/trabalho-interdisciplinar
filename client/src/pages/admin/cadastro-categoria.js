import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
import styles from '../../styles/AdminGeral.module.css';
import api from '../../services/api';

import {
    FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox,
    FiSearch, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight, FiTag, FiShoppingBag
} from 'react-icons/fi';

const EditCategoriaModal = ({ categoria, onSave, onCancel, loading, fornecedores }) => {
    const [formData, setFormData] = useState({
        nome: '',
        fornecedorId: '',
        ativo: 'true'
    });

    useEffect(() => {
        if (categoria) {
            setFormData({
                nome: categoria.nome || '',
                fornecedorId: categoria.fornecedorId || '',
                ativo: categoria.ativo ? 'true' : 'false'
            });
        }
    }, [categoria]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: categoria.id,
            ativo: formData.ativo === 'true'
        });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                <h3 className={styles.modalTitle}>Editar Categoria</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.fieldGroup}>
                        <label>Nome da Categoria *</label>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className={styles.inputModal} />
                    </div>

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
                        <label>Status</label>
                        <select name="ativo" value={formData.ativo} onChange={handleChange} className={styles.inputModal}
                                style={{ color: formData.ativo === 'true' ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
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

const BuscaCategorias = ({ fornecedores, mainMessageSetter }) => {
    const [searchNome, setSearchNome] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        setEditingCategoria(null);
        setCurrentIndex(0);

        try {
            const response = await api.get('/api/v1/categorias');
            let dados = response.data || [];

            if (searchNome) {
                dados = dados.filter(c => c.nome.toLowerCase().includes(searchNome.toLowerCase()));
            }

            // Ordenar alfabeticamente
            dados.sort((a, b) => a.nome.localeCompare(b.nome));

            setCategorias(dados);
        } catch (error) {
            console.error("Erro ao buscar:", error);
            mainMessageSetter({ type: 'error', text: "Erro ao buscar categorias." });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubmit = async (updatedData) => {
        setLoading(true);
        const id = updatedData.id;
        const { id: _id, ...payload } = updatedData;

        try {
            await api.put(`/api/v1/categorias/${id}`, payload);
            setCategorias(old => old.map(c => c.id === id ? { ...c, ...updatedData } : c));
            setEditingCategoria(null);
            mainMessageSetter({ type: 'success', text: "Categoria atualizada com sucesso!" });
        } catch (error) {
            console.error("Erro:", error);
            mainMessageSetter({ type: 'error', text: "Erro ao atualizar categoria." });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta categoria? Isso pode afetar produtos vinculados.")) return;

        setLoading(true);
        try {
            await api.delete(`/api/v1/categorias/${id}`);
            setCategorias(old => old.filter(c => c.id !== id));
            mainMessageSetter({ type: 'success', text: "Categoria excluída!" });
        } catch (error) {
            console.error(error);
            mainMessageSetter({ type: 'error', text: "Erro ao excluir. Verifique se há produtos vinculados." });
        } finally {
            setLoading(false);
        }
    };

    // Paginação
    const nextSlide = () => { if (currentIndex + itemsPerPage < categorias.length) setCurrentIndex(currentIndex + itemsPerPage); };
    const prevSlide = () => { if (currentIndex - itemsPerPage >= 0) setCurrentIndex(currentIndex - itemsPerPage); };
    const visibleItems = categorias.slice(currentIndex, currentIndex + itemsPerPage);
    const totalPages = Math.ceil(categorias.length / itemsPerPage);
    const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;

    return (
        <div className={styles['search-section']}>
            <h2 className={styles['search-header']}>Consultar Categorias</h2>

            <div className={styles['search-inputs']}>
                <div className={styles['search-group']}>
                    <label>Nome da Categoria</label>
                    <input type="text" placeholder="Ex: Eletrônicos..." value={searchNome} onChange={e => setSearchNome(e.target.value)} />
                </div>
                <button className={styles['btn-search']} onClick={handleSearch} disabled={loading}>
                    <FiSearch size={20} /> {loading ? '...' : 'Buscar'}
                </button>
            </div>

            {categorias.length > 0 && (
                <>
                    <div className={styles['provider-list-container']}>
                        <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`} style={{ gridTemplateColumns: '2fr 2fr 1fr 100px' }}>
                            <div className={styles['header-cell']}>Nome</div>
                            <div className={styles['header-cell']}>Fornecedor</div>
                            <div className={styles['header-cell']}>Status</div>
                            <div className={styles['header-cell-actions']}>Ações</div>
                        </div>
                        {visibleItems.map(item => (
                            <div key={item.id} className={styles['provider-list-item']} style={{ gridTemplateColumns: '2fr 2fr 1fr 100px' }}>
                                <div className={styles['detail-cell-name']}><p>{item.nome}</p></div>
                                <div className={styles['detail-cell']}>{item.fornecedorNome || 'N/A'}</div>
                                <div className={styles['detail-cell']}>
                                    <span className={item.ativo ? styles.statusOn : styles.statusOff}>
                                        {item.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                <div className={styles['item-actions']}>
                                    <button className={styles['btn-edit']} onClick={() => setEditingCategoria(item)}><FiEdit size={18} /></button>
                                    <button className={styles['btn-delete']} onClick={() => handleDelete(item.id)}><FiTrash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.paginationControls}>
                        <button className={styles['nav-btn']} onClick={prevSlide} disabled={currentIndex === 0}><FiChevronLeft size={24} /></button>
                        <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
                        <button className={styles['nav-btn']} onClick={nextSlide} disabled={currentIndex + itemsPerPage >= categorias.length}><FiChevronRight size={24} /></button>
                    </div>
                </>
            )}

            {editingCategoria && (
                <EditCategoriaModal
                    categoria={editingCategoria}
                    fornecedores={fornecedores}
                    onSave={handleUpdateSubmit}
                    onCancel={() => setEditingCategoria(null)}
                    loading={loading}
                />
            )}
        </div>
    );
};

function CadastroCategoria() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [fornecedores, setFornecedores] = useState([]);
    const [formData, setFormData] = useState({ nome: '', fornecedorId: '', ativo: true });

    useEffect(() => {
        async function loadFornecedores() {
            try {
                const res = await api.get('/api/v1/fornecedores/ativos'); // Busca apenas ativos para cadastro
                setFornecedores(res.data || []);
            } catch (error) {
                console.error("Erro ao carregar fornecedores:", error);
            }
        }
        loadFornecedores();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const payload = { ...formData, ativo: true };
            await api.post('/api/v1/categorias', payload);
            setMessage({ type: 'success', text: `Categoria "${formData.nome}" cadastrada com sucesso!` });
            setFormData({ nome: '', fornecedorId: '', ativo: true });
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.erro || "Erro ao cadastrar categoria.";
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
                    <li className={styles.active}><Link href="/admin/cadastro-categoria" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Categorias</span></div></Link></li>
                    <li><Link href="/admin/login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Cadastrar Categoria</h1>
                </header>

                {message && <div className={`${styles.alertMessage} ${styles[message.type]}`}>{message.text}</div>}

                <form className={styles.formCard} onSubmit={handleSubmit}>
                    <h2 className={styles.sectionTitle}>Dados da Categoria</h2>
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nome da Categoria *</label>
                            <input type="text" name="nome" className={styles.inputLong} value={formData.nome} onChange={handleChange} required placeholder="Ex: Eletrônicos, Limpeza..." />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Fornecedor *</label>
                            <select name="fornecedorId" className={styles.inputLong} value={formData.fornecedorId} onChange={handleChange} required>
                                <option value="">Selecione um fornecedor...</option>
                                {fornecedores.map(f => (
                                    <option key={f.id} value={f.id}>{f.nomeFantasia}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={styles.footer}>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Cadastrando...' : 'Criar Categoria'}
                        </button>
                    </div>
                </form>

                <hr className={styles.divider} />

                <BuscaCategorias fornecedores={fornecedores} mainMessageSetter={setMessage} />
            </main>
        </div>
    );
}

export default withAuth(CadastroCategoria);
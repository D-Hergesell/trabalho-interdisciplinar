import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
import styles from '../../styles/Geral.module.css';
import api from '../../services/api';
import {
    FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox,
    FiSearch, FiArrowRight, FiTrash2, FiChevronLeft, FiChevronRight, FiEdit, FiShoppingBag, FiTag
} from 'react-icons/fi';


const EditLojistaModal = ({ lojista, onSave, onCancel, loading }) => {

    const [formData, setFormData] = useState({
        nomeFantasia: '',
        cnpj: '',
        responsavelNome: '',
        emailContato: '',
        logradouro: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: ''
    });

    useEffect(() => {
        if (lojista) {
            setFormData({
                nomeFantasia: lojista.nomeFantasia || '',
                cnpj: lojista.cnpj || '',
                responsavelNome: lojista.responsavelNome || '',
                emailContato: lojista.emailContato || '',
                logradouro: lojista.logradouro || '',
                cidade: lojista.cidade || '',
                estado: lojista.estado || '',
                cep: lojista.cep || '',
                telefone: lojista.telefone || ''
            });
        }
    }, [lojista]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Envia o objeto com o ID original e os dados atualizados
        onSave({ ...formData, id: lojista.id });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '700px' }}>
                <h3 className={styles.modalTitle}>Editar Loja: {lojista.nomeFantasia}</h3>

                <form onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nome Fantasia *</label>
                            <input type="text" name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>CNPJ *</label>
                            <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} required className={styles.inputModal} maxLength="14" />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Responsável</label>
                            <input type="text" name="responsavelNome" value={formData.responsavelNome} onChange={handleChange} className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Email de Contato</label>
                            <input type="email" name="emailContato" value={formData.emailContato} onChange={handleChange} className={styles.inputModal} />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Telefone</label>
                            <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>CEP</label>
                            <input type="text" name="cep" value={formData.cep} onChange={handleChange} className={styles.inputModal} maxLength="8" />
                        </div>
                    </div>

                    <h4 className={styles.sectionTitle} style={{ marginTop: '15px' }}>Endereço</h4>
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Logradouro</label>
                            <input type="text" name="logradouro" value={formData.logradouro} onChange={handleChange} className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Cidade</label>
                            <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup} style={{ maxWidth: '80px' }}>
                            <label>UF</label>
                            <input type="text" name="estado" value={formData.estado} onChange={handleChange} className={styles.inputModal} maxLength="2" />
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
                        <button
                            className={styles.submitButton}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ============================================================================
// COMPONENTE: BuscaLojistas
// ============================================================================
const BuscaLojistas = () => {
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');

    const [lojistas, setLojistas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [message, setMessage] = useState(null);

    const [editingLojista, setEditingLojista] = useState(null);

    // Paginação
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;

    const handleToggleExpand = (id) => {
        setExpandedId(currentId => (currentId === id ? null : id));
    };

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        setMessage(null);
        setCurrentIndex(0);
        setExpandedId(null);
        setEditingLojista(null);

        try {
            // Rota atualizada para o backend Spring
            const response = await api.get('/api/v1/lojas');
            let dados = response.data || [];

            // Filtros no frontend
            if (searchId) dados = dados.filter(l => l.id && l.id.includes(searchId));
            if (searchName) dados = dados.filter(l => l.nomeFantasia && l.nomeFantasia.toLowerCase().includes(searchName.toLowerCase()));
            if (searchEmail) dados = dados.filter(l => l.emailContato && l.emailContato.toLowerCase().includes(searchEmail.toLowerCase()));

            setLojistas(dados);
        } catch (error) {
            console.error("Erro ao buscar:", error);
            const errorMsg = error.response ? `Status: ${error.response.status} - ${error.response.data?.error || error.message}` : 'Erro de conexão.';
            setMessage({ type: 'error', text: `Erro ao buscar lojistas. Detalhe: ${errorMsg}` });
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (lojista) => {
        setMessage(null);
        setEditingLojista(lojista);
    };

    const cancelEdit = () => {
        setEditingLojista(null);
    };

    const handleUpdateSubmit = async (updatedData) => {
        setLoading(true);
        setMessage(null);
        const id = updatedData.id;
        // Remove o ID do corpo do objeto enviado, pois o backend espera no PathVariable
        const { id: _id, ...dataToSend } = updatedData;

        try {
            await api.put(`/api/v1/lojas/${id}`, dataToSend);

            setLojistas(oldList => oldList.map(item =>
                item.id === id ? { ...item, ...dataToSend } : item
            ));

            setEditingLojista(null);
            setMessage({ type: 'success', text: "Lojista atualizado com sucesso!" });

        } catch (error) {
            console.error("Erro ao atualizar:", error);
            const errorMessage = error.response?.data?.error || "Erro desconhecido.";
            setMessage({ type: 'error', text: `Erro ao atualizar lojista: ${errorMessage}` });
        } finally {
            setLoading(false);
        }
    };

    const startDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const cancelDelete = () => {
        setDeleteId(null);
        setShowConfirm(false);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setShowConfirm(false);
        setLoading(true);
        setMessage(null);

        try {
            // Rota atualizada para Delete
            await api.delete(`/api/v1/lojas/${deleteId}`);
            setLojistas(oldList => oldList.filter(item => item.id !== deleteId));
            setMessage({ type: 'success', text: "Lojista excluído permanentemente com sucesso!" });
            if (expandedId === deleteId) setExpandedId(null);

        } catch (error) {
            console.error("Erro ao deletar:", error);
            const errorMessage = error.response?.data?.error || "Erro de rede/servidor.";
            setMessage({ type: 'error', text: `Erro ao excluir: ${errorMessage}` });
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
    };

    const nextSlide = () => {
        if (currentIndex + itemsPerPage < lojistas.length) {
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

    const visibleItems = lojistas.slice(currentIndex, currentIndex + itemsPerPage);
    const totalPages = Math.ceil(lojistas.length / itemsPerPage);
    const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;

    const ConfirmationModal = () => (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Confirmação de Exclusão</h3>
                <p className={styles.modalText}>
                    Tem certeza que quer EXCLUIR PERMANENTEMENTE esta loja? Esta ação não pode ser desfeita.
                </p>
                <div className={styles.modalActions}>
                    <button className={`${styles.submitButton} ${styles.btnCancel}`} onClick={cancelDelete}>
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

    const ExpandedDetailsRow = ({ item }) => (
        <div className={styles['expanded-details-row']}>
            <div className={styles['detail-full-span']}>
                <p className={styles['detail-text-p']}>
                    <strong className={styles.detailLabel}>ID Completo:</strong> {item.id}
                </p>
            </div>
            <div className={styles['detail-half-span']}>
                <p className={styles['detail-text-p']}>
                    <strong className={styles.detailLabel}>CNPJ:</strong> {item.cnpj || 'N/A'}
                </p>
            </div>
            <div className={styles['detail-half-span']}>
                <p className={styles['detail-text-p']}>
                    <strong className={styles.detailLabel}>Telefone:</strong> {item.telefone || 'N/A'}
                </p>
            </div>
            <div className={`${styles['detail-half-span']} ${styles['detail-status']}`}>
                <p className={styles['detail-text-p']}>
                    <strong className={styles.detailLabel}>Status:</strong>
                    <span className={!item.ativo ? styles.statusOff : styles.statusOn}>
            {' '}{item.ativo ? 'Ativo' : 'Inativo'}
          </span>
                </p>
            </div>
            <div className={styles['detail-full-span']}>
                <p className={styles['detail-text-p']}>
                    <strong className={styles.detailLabel}>Endereço:</strong> {item.logradouro || 'N/A'}, {item.cidade || ''} - {item.estado || ''} (CEP: {item.cep})
                </p>
            </div>
        </div>
    );

    return (
        <>
            <div className={styles['search-section']}>
                <h2 className={styles['search-header']}>Consultar / Gerenciar Lojistas</h2>

                {message && (
                    <div className={`${styles.alertMessage} ${styles[message.type]}`}>
                        {message.text.split('\n').map((line, index) => (
                            <p key={index} className={styles.messageLine}>{line}</p>
                        ))}
                    </div>
                )}

                <div className={styles['search-inputs']}>
                    <div className={styles['search-group']}>
                        <label>ID</label>
                        <input type="text" placeholder="Ex: 64b..." value={searchId} onChange={e => setSearchId(e.target.value)} />
                    </div>
                    <div className={styles['search-group']}>
                        <label>Nome da Loja</label>
                        <input type="text" placeholder="Ex: Tech Store..." value={searchName} onChange={e => setSearchName(e.target.value)} />
                    </div>
                    <div className={styles['search-group']}>
                        <label>Email</label>
                        <input type="text" placeholder="Ex: loja@..." value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
                    </div>
                    <button className={styles['btn-search']} onClick={handleSearch} disabled={loading}>
                        <FiSearch size={20} />
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>

                {lojistas.length > 0 && (
                    <>
                        <div className={styles['provider-list-container']}>
                            <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`}>
                                <div className={styles['header-cell']}>Nome da Loja</div>
                                <div className={styles['header-cell']}>ID (Início)</div>
                                <div className={styles['header-cell']}>Email</div>
                                <div className={styles['header-cell']}>Responsável</div>
                                <div className={styles['header-cell-actions']}>Ações</div>
                            </div>

                            {visibleItems.map(item => {
                                const isExpanded = expandedId === item.id;
                                const isDeactivated = !item.ativo;

                                let itemClasses = styles['provider-list-item'];
                                if (isExpanded) itemClasses += ` ${styles['item-expanded']}`;
                                if (isDeactivated) itemClasses += ` ${styles['item-status-off']}`;

                                return (
                                    <React.Fragment key={item.id}>
                                        <div
                                            className={itemClasses}
                                            onClick={() => handleToggleExpand(item.id)}
                                        >
                                            <div className={styles['detail-cell-name']}>
                                                <p>{item.nomeFantasia}</p>
                                            </div>
                                            <div className={styles['detail-cell']}>
                                                <p>{item.id ? item.id.substring(0, 10) + '...' : ''}</p>
                                            </div>
                                            <div className={styles['detail-cell']}>
                                                <p>{item.emailContato}</p>
                                            </div>
                                            <div className={styles['detail-cell']}>
                                                <p>{item.responsavelNome || '-'}</p>
                                            </div>
                                            <div className={styles['item-actions']}>

                                                <button
                                                    className={`${styles['btn-detail']} ${isExpanded ? styles['btn-rotated'] : ''}`}
                                                    title={isExpanded ? "Esconder Detalhes" : "Ver Detalhes"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleExpand(item.id);
                                                    }}
                                                >
                                                    <FiArrowRight size={20} />
                                                </button>

                                                <button
                                                    className={styles['btn-edit']}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEdit(item);
                                                    }}
                                                    title="Editar Lojista"
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
                                                    title="Excluir Lojista"
                                                    disabled={loading}
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {isExpanded && <ExpandedDetailsRow item={item} />}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        <div className={styles.paginationControls}>
                            <button className={styles['nav-btn']} onClick={prevSlide} disabled={currentIndex === 0 || loading}>
                                <FiChevronLeft size={24} />
                            </button>
                            <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
                            <button className={styles['nav-btn']} onClick={nextSlide} disabled={currentIndex + itemsPerPage >= lojistas.length || loading}>
                                <FiChevronRight size={24} />
                            </button>
                        </div>
                    </>
                )}

                {!loading && searched && lojistas.length === 0 && (
                    <p className={styles['no-data']}>Nenhuma loja encontrada com os filtros especificados.</p>
                )}
            </div>

            {showConfirm && <ConfirmationModal />}

            {editingLojista && (
                <EditLojistaModal
                    lojista={editingLojista}
                    onSave={handleUpdateSubmit}
                    onCancel={cancelEdit}
                    loading={loading}
                />
            )}
        </>
    );
};


// ============================================================================
// COMPONENTE PRINCIPAL: cadastro-lojista
// ============================================================================
function CadastroLojista() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Estados atualizados para corresponder ao DTO
    const [formData, setFormData] = useState({
        nomeFantasia: '',
        cnpj: '',
        responsavelNome: '',
        emailContato: '',
        logradouro: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // DTO exato esperado pelo backend
        const dadosParaBackend = {
            nomeFantasia: formData.nomeFantasia,
            cnpj: formData.cnpj,
            responsavelNome: formData.responsavelNome,
            emailContato: formData.emailContato,
            telefone: formData.telefone,
            cep: formData.cep,
            logradouro: formData.logradouro,
            cidade: formData.cidade,
            estado: formData.estado
        };

        try {
            // Rota atualizada para API Java
            const response = await api.post('/api/v1/lojas', dadosParaBackend);

            setMessage({ type: 'success', text: `Sucesso! Loja "${response.data.nomeFantasia}" cadastrada.` });

            setFormData({
                nomeFantasia: '',
                cnpj: '',
                responsavelNome: '',
                emailContato: '',
                logradouro: '',
                cidade: '',
                estado: '',
                cep: '',
                telefone: ''
            });
        } catch (error) {
            console.error("Erro ao cadastrar Lojista:", error);
            const errorMessage = error.response?.data?.erro || (error.response?.data?.erros && error.response.data.erros.join('\n')) || "Erro interno.";
            setMessage({ type: 'error', text: ` Erro: ${errorMessage}` });
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
          <li className={styles.active}><Link href="/admin/cadastro-lojista" className={styles.linkReset}><div className={styles.menuItem}><FiBox size={20} /><span>Lojistas</span></div></Link></li>
          <li><Link href="/admin/cadastro-produto" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Produtos</span></div></Link></li>
          <li><Link href="/admin/cadastro-pedidos" className={styles.linkReset}><div className={styles.menuItem}><FiShoppingBag size={20} /><span>Pedidos</span></div></Link></li>
          <li><Link href="/admin/cadastro-campanha" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div></Link></li>
      {/*    <li><Link href="/admin/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li> */}
          <li><Link href="/admin/login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
        </ul>
      </nav>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Cadastrar Lojista</h1>
                </header>

                {/* Mensagens de Feedback no Topo */}
                {message && message.type !== 'info' && (
                    <div className={`${styles.alertMessage} ${styles[message.type]}`}>
                        {message.text.split('\n').map((line, index) => (
                            <p key={index} className={styles.messageLine}>{line}</p>
                        ))}
                    </div>
                )}

                <form className={styles.formCard} onSubmit={handleSubmit}>
                    <h2 className={styles.sectionTitle}>Dados do Lojista</h2>

                    <div className={styles.fieldGroup}>
                        <label>Nome Fantasia <span className={styles.requiredAsterisk}>*</span></label>
                        <input type="text" name="nomeFantasia" className={styles.inputLong} value={formData.nomeFantasia} onChange={handleChange} required />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label>CNPJ <span className={styles.requiredAsterisk}>*</span></label>
                        <input type="text" name="cnpj" className={styles.inputLong} value={formData.cnpj} onChange={handleChange} placeholder="99.999.999/0001-88" required maxLength="14" />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label>Responsável</label>
                        <input type="text" name="responsavelNome" className={styles.inputLong} value={formData.responsavelNome} onChange={handleChange} />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label>Email de Contato</label>
                        <input type="email" name="emailContato" className={styles.inputLong} value={formData.emailContato} onChange={handleChange} />
                    </div>

                    <h2 className={styles.sectionTitle}>Endereço & Contato</h2>
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Telefone</label>
                            <input type="text" name="telefone" className={styles.inputMedium} value={formData.telefone} onChange={handleChange} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>CEP</label>
                            <input type="text" name="cep" className={styles.inputMedium} value={formData.cep} onChange={handleChange} maxLength="8" />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Logradouro</label>
                            <input type="text" name="logradouro" className={styles.inputMedium} value={formData.logradouro} onChange={handleChange} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Cidade</label>
                            <input type="text" name="cidade" className={styles.inputMedium} value={formData.cidade} onChange={handleChange} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>UF</label>
                            <input type="text" name="estado" className={styles.inputMedium} placeholder="Ex: SP" value={formData.estado} onChange={handleChange} maxLength="2" />
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Cadastrando...' : 'Criar Lojista'}
                        </button>
                    </div>
                </form>

                <hr className={styles.divider} />
                <BuscaLojistas />

            </main>
        </div>
    );
}

export default withAuth(CadastroLojista);
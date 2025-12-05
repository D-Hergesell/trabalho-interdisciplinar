import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
import api from '../../services/api';
import styles from '../../styles/AdminGeral.module.css';
import {
    FiGrid, FiUsers, FiPackage, FiLogOut, FiBox,
    FiSearch, FiTrash2, FiChevronLeft, FiChevronRight,
    FiArrowRight, FiEdit, FiShoppingBag, FiTag
} from 'react-icons/fi';

// Função auxiliar para gerar senha aleatória
const gerarSenhaAleatoria = (tamanho = 12) => {
    const caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let senha = "";
    for (let i = 0; i < tamanho; i++) {
        senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return senha;
};

const EditFornecedorModal = ({ fornecedor, onSave, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        nomeFantasia: '',
        cnpj: '',
        responsavelNome: '',
        emailContato: '',
        telefone: '',
        cep: '',
        logradouro: '',
        cidade: '',
        estado: '',
        ativo: 'true'
    });

    useEffect(() => {
        if (fornecedor) {
            setFormData({
                nomeFantasia: fornecedor.nomeFantasia || '',
                cnpj: fornecedor.cnpj || '',
                responsavelNome: fornecedor.responsavelNome || '',
                emailContato: fornecedor.emailContato || '',
                telefone: fornecedor.telefone || '',
                cep: fornecedor.cep || '',
                logradouro: fornecedor.logradouro || '',
                cidade: fornecedor.cidade || '',
                estado: fornecedor.estado || '',
                ativo: fornecedor.ativo ? 'true' : 'false'
            });
        }
    }, [fornecedor]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            id: fornecedor.id,
            ativo: formData.ativo === 'true'
        };
        onSave(payload);
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '800px' }}>
                <h3 className={styles.modalTitle}>Editar Fornecedor</h3>

                <form onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nome Fantasia *</label>
                            <input type="text" name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup} style={{ maxWidth: '150px' }}>
                            <label>Status</label>
                            <select
                                name="ativo"
                                value={formData.ativo}
                                onChange={handleChange}
                                className={styles.inputModal}
                                style={{
                                    borderColor: formData.ativo === 'true' ? '#28a745' : '#dc3545',
                                    color: formData.ativo === 'true' ? '#28a745' : '#dc3545',
                                    fontWeight: 'bold'
                                }}
                            >
                                <option value="true">Ativo</option>
                                <option value="false">Inativo</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>CNPJ *</label>
                            <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} required className={styles.inputModal} maxLength="14" />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Responsável</label>
                            <input type="text" name="responsavelNome" value={formData.responsavelNome} onChange={handleChange} className={styles.inputModal} />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Email</label>
                            <input type="email" name="emailContato" value={formData.emailContato} onChange={handleChange} className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Telefone</label>
                            <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} className={styles.inputModal} />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>CEP</label>
                            <input type="text" name="cep" value={formData.cep} onChange={handleChange} className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Logradouro</label>
                            <input type="text" name="logradouro" value={formData.logradouro} onChange={handleChange} className={styles.inputModal} />
                        </div>
                    </div>

                    <div className={styles.row}>
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

const BuscaFornecedores = () => {
    const [searchId, setSearchId] = useState('');
    const [searchNome, setSearchNome] = useState('');
    const [searchEmail, setSearchEmail] = useState('');

    const [fornecedores, setFornecedores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const [editingFornecedor, setEditingFornecedor] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const [deleteId, setDeleteId] = useState(null);
    const [currentAction, setCurrentAction] = useState('deactivate');

    const [expandedId, setExpandedId] = useState(null);
    const [message, setMessage] = useState(null);

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
        setEditingFornecedor(null);
        try {
            const response = await api.get('/api/v1/fornecedores');
            let dados = response.data || [];

            if (searchId) dados = dados.filter(f => f.id && f.id.includes(searchId));
            if (searchNome) dados = dados.filter(f => f.nomeFantasia && f.nomeFantasia.toLowerCase().includes(searchNome.toLowerCase()));
            if (searchEmail) dados = dados.filter(f => f.emailContato && f.emailContato.toLowerCase().includes(searchEmail.toLowerCase()));

            setFornecedores(dados);
        } catch (error) {
            console.error("Erro ao buscar:", error);
            const errorMsg = error.response ? `Status: ${error.response.status}` : 'Erro de conexão.';
            setMessage({ type: 'error', text: `Erro ao buscar fornecedores: ${errorMsg}` });
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (fornecedor) => {
        setMessage(null);
        setEditingFornecedor(fornecedor);
    };

    const cancelEdit = () => {
        setEditingFornecedor(null);
    };

    const handleUpdateSubmit = async (updatedData) => {
        setLoading(true);
        setMessage(null);
        const id = updatedData.id;
        const { id: _id, ...dataToSend } = updatedData;

        try {
            await api.put(`/api/v1/fornecedores/${id}`, dataToSend);

            setFornecedores(oldList => oldList.map(item =>
                item.id === id ? { ...item, ...dataToSend } : item
            ));

            setEditingFornecedor(null);
            setMessage({ type: 'success', text: "Fornecedor atualizado com sucesso!" });

        } catch (error) {
            console.error("Erro ao atualizar:", error);
            const errorMessage = error.response?.data?.error || "Erro desconhecido.";
            setMessage({ type: 'error', text: `Erro ao atualizar fornecedor: ${errorMessage}` });
        } finally {
            setLoading(false);
        }
    };

    const startAction = (id, type) => {
        setDeleteId(id);
        setCurrentAction(type);
        setShowConfirm(true);
    };

    const cancelAction = () => {
        setDeleteId(null);
        setShowConfirm(false);
        setCurrentAction('deactivate');
    };

    const handleConfirmAction = async () => {
        if (!deleteId) return;
        setShowConfirm(false);
        setLoading(true);
        setMessage(null);

        try {
            if (currentAction === 'delete') {
                await api.delete(`/api/v1/fornecedores/${deleteId}`);
                setFornecedores(oldList => oldList.filter(item => item.id !== deleteId));
                setMessage({ type: 'success', text: "Fornecedor excluído permanentemente!" });
            } else {
                const fornecedorParaDesativar = fornecedores.find(f => f.id === deleteId);
                if (fornecedorParaDesativar) {
                    const dadosAtualizados = { ...fornecedorParaDesativar, ativo: false };
                    const { id: _id, ...payload } = dadosAtualizados;

                    await api.put(`/api/v1/fornecedores/${deleteId}`, payload);

                    setFornecedores(oldList => oldList.map(item =>
                        item.id === deleteId ? { ...item, ativo: false } : item
                    ));
                    setMessage({ type: 'success', text: "Fornecedor desativado com sucesso!" });
                }
            }
            if (expandedId === deleteId) setExpandedId(null);
        } catch (error) {
            console.error(`Erro ao ${currentAction}:`, error);
            const actionName = currentAction === 'delete' ? 'excluir' : 'desativar';
            const errorMessage = error.response?.data?.error || "Erro desconhecido.";
            setMessage({ type: 'error', text: `Erro ao ${actionName}: ${errorMessage}` });
        } finally {
            setLoading(false);
            setDeleteId(null);
            setCurrentAction('deactivate');
        }
    };

    const nextSlide = () => {
        if (currentIndex + itemsPerPage < fornecedores.length) {
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

    const visibleItems = fornecedores.slice(currentIndex, currentIndex + itemsPerPage);
    const totalPages = Math.ceil(fornecedores.length / itemsPerPage);
    const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;

    const ConfirmationModal = () => {
        const isDelete = currentAction === 'delete';
        const title = isDelete ? 'Confirmação de Exclusão' : 'Confirmação de Desativação';
        const text = isDelete
            ? 'Tem certeza que quer EXCLUIR PERMANENTEMENTE este fornecedor?'
            : 'Tem certeza que quer DESATIVAR este fornecedor?';

        return (
            <div className={styles.modalBackdrop}>
                <div className={styles.modalContent}>
                    <h3 className={styles.modalTitle}>{title}</h3>
                    <p className={styles.modalText}>{text}</p>
                    <div className={styles.modalActions}>
                        <button className={`${styles.submitButton} ${styles.btnCancel}`} onClick={cancelAction}>
                            Cancelar
                        </button>
                        <button className={`${styles.submitButton} ${styles.btnDanger}`} onClick={handleConfirmAction} disabled={loading}>
                            {loading ? 'Processando...' : `Confirmar`}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ExpandedDetailsRow = ({ fornecedor }) => (
        <div className={styles['expanded-details-row']}>
            <div className={styles['detail-full-span']}>
                <p className={styles['detail-text-p']}><strong className={styles.detailLabel}>ID:</strong> {fornecedor.id}</p>
            </div>
            <div className={styles['detail-half-span']}>
                <p className={styles['detail-text-p']}><strong className={styles.detailLabel}>CNPJ:</strong> {fornecedor.cnpj || 'N/A'}</p>
            </div>
            <div className={styles['detail-half-span']}>
                <p className={styles['detail-text-p']}><strong className={styles.detailLabel}>Telefone:</strong> {fornecedor.telefone || 'N/A'}</p>
            </div>
            <div className={`${styles['detail-half-span']} ${styles['detail-status']}`}>
                <p className={styles['detail-text-p']}>
                    <strong className={styles.detailLabel}>Status:</strong>
                    <span className={fornecedor.ativo ? styles.statusOn : styles.statusOff}>{fornecedor.ativo ? 'Ativo' : 'Inativo'}</span>
                </p>
            </div>
            <div className={styles['detail-full-span']}>
                <p className={styles['detail-text-p']}><strong className={styles.detailLabel}>Endereço:</strong> {fornecedor.logradouro || 'N/A'}, {fornecedor.cidade}</p>
            </div>
        </div>
    );

    return (
        <>
            <div className={styles['search-section']}>
                <h2 className={styles['search-header']}>Consultar / Gerenciar Fornecedor</h2>

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
                        <label>Nome</label>
                        <input type="text" placeholder="Ex: Eletrônicos..." value={searchNome} onChange={e => setSearchNome(e.target.value)} />
                    </div>
                    <div className={styles['search-group']}>
                        <label>Email</label>
                        <input type="text" placeholder="Ex: contato@..." value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
                    </div>
                    <button className={styles['btn-search']} onClick={handleSearch} disabled={loading}>
                        <FiSearch size={20} />
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>

                {fornecedores.length > 0 ? (
                    <>
                        <div className={styles['provider-list-container']}>
                            <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`}>
                                <div className={styles['header-cell']}>Nome</div>
                                <div className={styles['header-cell']}>ID</div>
                                <div className={styles['header-cell']}>Email</div>
                                <div className={styles['header-cell']}>Responsável</div>
                                <div className={styles['header-cell-actions']}>Ações</div>
                            </div>

                            {visibleItems.map(fornecedor => {
                                const isExpanded = expandedId === fornecedor.id;
                                const isDeactivated = !fornecedor.ativo;
                                let itemClasses = styles['provider-list-item'];
                                if (isExpanded) itemClasses += ` ${styles['item-expanded']}`;
                                if (isDeactivated) itemClasses += ` ${styles['item-status-off']}`;

                                return (
                                    <React.Fragment key={fornecedor.id}>
                                        <div className={itemClasses} onClick={() => handleToggleExpand(fornecedor.id)}>
                                            <div className={styles['detail-cell-name']}><p>{fornecedor.nomeFantasia}</p></div>
                                            <div className={styles['detail-cell']}><p>{fornecedor.id ? fornecedor.id.substring(0, 8) + '...' : ''}</p></div>
                                            <div className={styles['detail-cell']}><p>{fornecedor.emailContato}</p></div>
                                            <div className={styles['detail-cell']}><p>{fornecedor.responsavelNome || '-'}</p></div>
                                            <div className={styles['item-actions']}>
                                                <button className={`${styles['btn-detail']} ${isExpanded ? styles['btn-rotated'] : ''}`} onClick={(e) => { e.stopPropagation(); handleToggleExpand(fornecedor.id); }}>
                                                    <FiArrowRight size={20} />
                                                </button>
                                                <button className={styles['btn-edit']} onClick={(e) => { e.stopPropagation(); startEdit(fornecedor); }}>
                                                    <FiEdit size={18} />
                                                </button>
                                                <button className={styles['btn-delete']} onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isDeactivated) { startAction(fornecedor.id, 'delete'); } else { startAction(fornecedor.id, 'deactivate'); }
                                                }} title={isDeactivated ? "Excluir" : "Desativar"}>
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        {isExpanded && <ExpandedDetailsRow fornecedor={fornecedor} />}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        <div className={styles.paginationControls}>
                            <button className={styles['nav-btn']} onClick={prevSlide} disabled={currentIndex === 0}><FiChevronLeft size={24} /></button>
                            <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
                            <button className={styles['nav-btn']} onClick={nextSlide} disabled={currentIndex + itemsPerPage >= fornecedores.length}><FiChevronRight size={24} /></button>
                        </div>
                    </>
                ) : (
                    !loading && searched && <p className={styles['no-data']}>Nenhum fornecedor encontrado.</p>
                )}
            </div>
            {showConfirm && <ConfirmationModal />}
            {editingFornecedor && <EditFornecedorModal fornecedor={editingFornecedor} onSave={handleUpdateSubmit} onCancel={cancelEdit} loading={loading} />}
        </>
    );
};

function CadastroFornecedor() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const [formData, setFormData] = useState({
        nomeFantasia: '', cnpj: '', responsavelNome: '', emailContato: '',
        telefone: '', cep: '', logradouro: '', cidade: '', estado: '',
        gerarAutomaticamente: false,
        senhaManual: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // --- LÓGICA DE SENHA ALEATÓRIA E VALIDAÇÃO ---
        let senhaFinal = formData.senhaManual;

        if (formData.gerarAutomaticamente) {
            senhaFinal = gerarSenhaAleatoria(12); // Gera a senha
        } else if (!senhaFinal || !senhaFinal.trim()) {
            // Se NÃO for automático e estiver vazio, barra.
            setMessage({ type: 'error', text: 'Erro: A senha é obrigatória. Digite uma senha ou marque "Gerar senha automaticamente".' });
            setLoading(false);
            return;
        }

        const payload = {
            nomeFantasia: formData.nomeFantasia,
            cnpj: formData.cnpj,
            responsavelNome: formData.responsavelNome,
            emailContato: formData.emailContato,
            telefone: formData.telefone,
            cep: formData.cep,
            logradouro: formData.logradouro,
            cidade: formData.cidade,
            estado: formData.estado,
            ativo: true,
            senha: senhaFinal // Envia a senha correta (manual ou gerada)
        };

        try {
            const response = await api.post('/api/v1/fornecedores', payload);

            // Mensagem de Sucesso com Credenciais
            const textoSucesso = `✅ Sucesso! Fornecedor "${response.data.nomeFantasia}" cadastrado.\n\n` +
                `📧 Login: ${formData.emailContato}\n` +
                `🔑 Senha: ${senhaFinal}\n\n` +
                `(Copie a senha agora, ela não será exibida novamente)`;

            setMessage({ type: 'success', text: textoSucesso });

            setFormData({
                nomeFantasia: '', cnpj: '', responsavelNome: '', emailContato: '',
                telefone: '', cep: '', logradouro: '', cidade: '', estado: '',
                gerarAutomaticamente: false, senhaManual: ''
            });
        } catch (error) {
            console.error(error);
            const errorText = error.response?.data?.erro || error.response?.data?.error || "Erro ao conectar com o servidor.";
            setMessage({ type: 'error', text: ` Erro: ${errorText}` });
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className={styles['dashboard-container']}>
      <nav className={styles.sidebar}>
        <ul>
          <li><Link href="/admin/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
          <li className={styles.active}><Link href="/admin/cadastro-fornecedor" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Fornecedores</span></div></Link></li>
          <li><Link href="/admin/cadastro-lojista" className={styles.linkReset}><div className={styles.menuItem}><FiBox size={20} /><span>Lojistas</span></div></Link></li>
          <li><Link href="/admin/cadastro-produto" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Produtos</span></div></Link></li>
          <li><Link href="/admin/cadastro-pedidos" className={styles.linkReset}><div className={styles.menuItem}><FiShoppingBag size={20} /><span>Pedidos</span></div></Link></li>
          <li><Link href="/admin/cadastro-campanha" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div></Link></li>
            <li><Link href="/admin/cadastro-categoria" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Categorias</span></div></Link></li>
            {/* <li><Link href="/admin/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li> */}
          <li><Link href="/admin/login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
        </ul>
      </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Cadastrar Fornecedor</h1>
                </header>

                {message && (
                    <div className={`${styles.alertMessage} ${styles[message.type]}`}>
                        {message.text.split('\n').map((line, index) => (
                            <p key={index} className={styles.messageLine}>{line}</p>
                        ))}
                    </div>
                )}

                <form className={styles.formCard} onSubmit={handleSubmit}>
                    <h2 className={styles.sectionTitle}>Dados do Fornecedor</h2>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nome Fantasia <span className={styles.requiredAsterisk}>*</span></label>
                            <input type="text" name="nomeFantasia" className={styles.inputLong} value={formData.nomeFantasia} onChange={handleChange} required />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>CNPJ <span className={styles.requiredAsterisk}>*</span></label>
                            <input type="text" name="cnpj" className={styles.inputLong} value={formData.cnpj} onChange={handleChange} required maxLength="14" placeholder="99.999.999/0001-98" />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Responsável</label>
                            <input type="text" name="responsavelNome" className={styles.inputLong} value={formData.responsavelNome} onChange={handleChange} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Email de Contato (Login) <span className={styles.requiredAsterisk}>*</span></label>
                            <input type="email" name="emailContato" className={styles.inputLong} value={formData.emailContato} onChange={handleChange} required />
                        </div>
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
                        <div className={styles.fieldGroup} style={{ maxWidth: '100px' }}>
                            <label>UF</label>
                            <input type="text" name="estado" className={styles.inputMedium} placeholder="SP" value={formData.estado} onChange={handleChange} maxLength="2" />
                        </div>
                    </div>

                    {/* Lógica de Senha - Exibição Condicional */}
                    {!formData.gerarAutomaticamente && (
                        <div className={styles.fieldGroup} style={{ marginTop: '15px' }}>
                            <label>Senha <span className={styles.requiredAsterisk}>*</span></label>
                            <input
                                type="password"
                                name="senhaManual"
                                className={styles.inputMedium}
                                value={formData.senhaManual}
                                onChange={handleChange}
                                placeholder="Digite a senha..."
                            />
                        </div>
                    )}

                    <div className={styles.footer}>
                        <label className={styles.checkboxContainer}>
                            <input type="checkbox" name="gerarAutomaticamente" checked={formData.gerarAutomaticamente} onChange={handleChange} />
                            <span className={styles.checkmark}></span>
                            Gerar senha automaticamente (12 caracteres)
                        </label>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Cadastrando...' : 'Criar Fornecedor'}
                        </button>
                    </div>
                </form>

                <hr className={styles.divider} />
                <BuscaFornecedores />
            </main>
        </div>
    );
}

export default withAuth(CadastroFornecedor);
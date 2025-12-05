import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
import {
    FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox, FiShoppingBag, FiTag,
    FiArrowRight, FiSearch, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { FaShieldAlt } from 'react-icons/fa';
import api from '../../services/api';
import styles from '../../styles/Geral.module.css';

// ============================================================================
// COMPONENTE: ListaÚltimos (Cards de Resumo)
// ============================================================================
const ListaUltimos = ({ title, dados }) => {
    const gridTemplate = '2fr 1fr 1fr';

    return (
        <div className={styles['search-section']} style={{ marginTop: '25px' }}>
            <h2 className={styles['search-header']}>{title}</h2>

            <div className={styles['provider-list-container']}>
                <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`} style={{ gridTemplateColumns: gridTemplate }}>
                    <div className={styles['header-cell']}>Nome</div>
                    <div className={styles['header-cell']}>Cidade / ID</div>
                    <div className={styles['header-cell']}>Status</div>
                </div>

                {dados.length === 0 ? (
                    <p style={{ padding: '20px', color: '#666', textAlign: 'center' }}>Nenhum registro encontrado.</p>
                ) : (
                    dados.map((item) => {
                        const isOnline = item.ativo === true;
                        return (
                            <div key={item.id} className={styles['provider-list-item']} style={{ gridTemplateColumns: gridTemplate }}>
                                <div className={styles['detail-cell-name']}>
                                    <p>{item.nomeFantasia}</p>
                                </div>
                                <div className={styles['detail-cell']}>
                                    {item.cidade || (item.id ? item.id.substring(0, 8) + '...' : '-')}
                                </div>
                                <div className={styles['detail-cell']}>
                                    <span style={{
                                        color: isOnline ? '#28a745' : '#dc3545',
                                        fontWeight: 'bold',
                                        fontSize: '12px'
                                    }}>
                                        {isOnline ? 'ATIVO' : 'INATIVO'}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// ============================================================================
// COMPONENTE: Modal de Edição de Usuário
// ============================================================================
const EditUsuarioModal = ({ usuario, onSave, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        tipoUsuario: 'LOJA',
        senha: '' // Sempre vazio por segurança
    });

    useEffect(() => {
        if (usuario) {
            setFormData({
                nome: usuario.nome || '',
                email: usuario.email || '',
                tipoUsuario: usuario.tipoUsuario || 'LOJA',
                senha: '' // Reseta o campo de senha ao abrir
            });
        }
    }, [usuario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // O ID é passado separadamente
        onSave({ ...formData, id: usuario.id });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                <h3 className={styles.modalTitle}>Editar Usuário: {usuario.nome}</h3>

                <form onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nome</label>
                            <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nível de Acesso</label>
                            <select name="tipoUsuario" value={formData.tipoUsuario} onChange={handleChange} className={styles.inputModal}>
                                <option value="ADMIN">Administrador</option>
                                <option value="LOJA">Lojista</option>
                                <option value="FORNECEDOR">Fornecedor</option>
                            </select>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label>Nova Senha</label>
                            <input
                                type="password"
                                name="senha"
                                value={formData.senha}
                                onChange={handleChange}
                                className={styles.inputModal}
                                placeholder="Deixe em branco para manter a atual"
                                minLength={8}
                                // Removido o 'required' para permitir manter a senha antiga
                            />
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button className={`${styles.submitButton} ${styles.btnCancel}`} type="button" onClick={onCancel} disabled={loading}>Cancelar</button>
                        <button className={styles.submitButton} type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Alterações'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================================================
// COMPONENTE: Busca de Usuários
// ============================================================================
const BuscaUsuarios = () => {
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');

    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const [editingUsuario, setEditingUsuario] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;

    const handleSearch = async () => {
        setLoading(true);
        setMessage(null);
        setExpandedId(null);
        setEditingUsuario(null);

        try {
            const response = await api.get('/api/v1/usuarios');
            let dados = response.data || [];

            if (searchId) dados = dados.filter(u => u.id && u.id.includes(searchId));
            if (searchName) dados = dados.filter(u => u.nome && u.nome.toLowerCase().includes(searchName.toLowerCase()));
            if (searchEmail) dados = dados.filter(u => u.email && u.email.toLowerCase().includes(searchEmail.toLowerCase()));

            setUsuarios(dados);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            setMessage({ type: 'error', text: "Erro ao buscar usuários." });
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (usuario) => {
        setMessage(null);
        setEditingUsuario(usuario);
    };

    const handleUpdateSubmit = async (updatedData) => {
        setLoading(true);
        setMessage(null);
        const { id, ...dataToSend } = updatedData;

        try {
            await api.put(`/api/v1/usuarios/${id}`, dataToSend);

            setUsuarios(old => old.map(u => {
                if (u.id === id) {
                    return { ...u, nome: dataToSend.nome, email: dataToSend.email, tipoUsuario: dataToSend.tipoUsuario };
                }
                return u;
            }));

            setEditingUsuario(null);
            setMessage({ type: 'success', text: "Usuário atualizado com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            const msg = error.response?.data?.erro || "Erro ao atualizar usuário.";
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    const startDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setShowConfirm(false);
        setLoading(true);

        try {
            await api.delete(`/api/v1/usuarios/${deleteId}`);
            setUsuarios(old => old.filter(u => u.id !== deleteId));
            setMessage({ type: 'success', text: "Usuário excluído permanentemente!" });
        } catch (error) {
            console.error("Erro ao deletar:", error);
            setMessage({ type: 'error', text: "Erro ao excluir usuário." });
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
    };

    const nextSlide = () => { if (currentIndex + itemsPerPage < usuarios.length) setCurrentIndex(currentIndex + itemsPerPage); };
    const prevSlide = () => { if (currentIndex - itemsPerPage >= 0) setCurrentIndex(currentIndex - itemsPerPage); };
    const handleToggleExpand = (id) => setExpandedId(curr => curr === id ? null : id);

    const visibleItems = usuarios.slice(currentIndex, currentIndex + itemsPerPage);
    const totalPages = Math.ceil(usuarios.length / itemsPerPage);
    const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;

    return (
        <div className={styles['search-section']} style={{ marginTop: '40px' }}>
            <h2 className={styles['search-header']}>Consultar / Gerenciar Usuários</h2>

            {message && <div className={`${styles.alertMessage} ${styles[message.type]}`}>{message.text}</div>}

            <div className={styles['search-inputs']}>
                <div className={styles['search-group']}>
                    <label>ID</label>
                    <input type="text" placeholder="Ex: 64b..." value={searchId} onChange={e => setSearchId(e.target.value)} />
                </div>
                <div className={styles['search-group']}>
                    <label>Nome</label>
                    <input type="text" placeholder="Ex: Admin..." value={searchName} onChange={e => setSearchName(e.target.value)} />
                </div>
                <div className={styles['search-group']}>
                    <label>Email</label>
                    <input type="text" placeholder="Ex: contato@..." value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
                </div>
                <button className={styles['btn-search']} onClick={handleSearch} disabled={loading}>
                    <FiSearch size={20} /> {loading ? '...' : 'Buscar'}
                </button>
            </div>

            {usuarios.length > 0 && (
                <>
                    <div className={styles['provider-list-container']}>
                        <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`}>
                            <div className={styles['header-cell']}>Nome</div>
                            <div className={styles['header-cell']}>Email</div>
                            <div className={styles['header-cell']}>Nível</div>
                            <div className={styles['header-cell']}>Status</div>
                            <div className={styles['header-cell-actions']}>Ações</div>
                        </div>

                        {visibleItems.map(item => {
                            const isExpanded = expandedId === item.id;
                            const isOff = !item.ativo;
                            return (
                                <React.Fragment key={item.id}>
                                    <div className={`${styles['provider-list-item']} ${isExpanded ? styles['item-expanded'] : ''} ${isOff ? styles['item-status-off'] : ''}`}
                                         onClick={() => handleToggleExpand(item.id)}>
                                        <div className={styles['detail-cell-name']}><p>{item.nome}</p></div>
                                        <div className={styles['detail-cell']}><p>{item.email}</p></div>
                                        <div className={styles['detail-cell']}><p>{item.tipoUsuario}</p></div>
                                        <div className={styles['detail-cell']}>
                                            <span style={{ color: item.ativo ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                                                {item.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                        <div className={styles['item-actions']}>
                                            <button className={`${styles['btn-detail']} ${isExpanded ? styles['btn-rotated'] : ''}`} onClick={(e) => { e.stopPropagation(); handleToggleExpand(item.id); }}>
                                                <FiArrowRight size={20} />
                                            </button>
                                            <button className={styles['btn-edit']} onClick={(e) => { e.stopPropagation(); startEdit(item); }}>
                                                <FiEdit size={18} />
                                            </button>
                                            <button className={styles['btn-delete']} onClick={(e) => { e.stopPropagation(); startDelete(item.id); }}>
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div className={styles['expanded-details-row']}>
                                            <div className={styles['detail-full-span']}>
                                                <p className={styles['detail-text-p']}><strong>ID Completo:</strong> {item.id}</p>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <div className={styles.paginationControls}>
                        <button className={styles['nav-btn']} onClick={prevSlide} disabled={currentIndex === 0}><FiChevronLeft size={24} /></button>
                        <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
                        <button className={styles['nav-btn']} onClick={nextSlide} disabled={currentIndex + itemsPerPage >= usuarios.length}><FiChevronRight size={24} /></button>
                    </div>
                </>
            )}

            {showConfirm && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>Excluir Usuário?</h3>
                        <p className={styles.modalText}>Tem certeza que deseja excluir permanentemente este usuário?</p>
                        <div className={styles.modalActions}>
                            <button className={`${styles.submitButton} ${styles.btnCancel}`} onClick={() => setShowConfirm(false)}>Cancelar</button>
                            <button className={`${styles.submitButton} ${styles.btnDanger}`} onClick={handleConfirmDelete} disabled={loading}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {editingUsuario && <EditUsuarioModal usuario={editingUsuario} onSave={handleUpdateSubmit} onCancel={() => setEditingUsuario(null)} loading={loading} />}
        </div>
    );
};

// ============================================================================
//  PÁGINA DASHBOARD PRINCIPAL
// ============================================================================
function Dashboard() {
    const [stats, setStats] = useState({
        totalLojas: 0,
        totalFornecedores: 0,
        pedidosTotais: 0,
        campanhasAtivas: 0
    });

    const [ultimasLojas, setUltimasLojas] = useState([]);
    const [ultimosFornecedores, setUltimosFornecedores] = useState([]);
    const [loading, setLoading] = useState(true);

    // Função auxiliar para evitar quebra se o endpoint falhar
    const fetchDataSafe = async (url) => {
        try {
            const response = await api.get(url);
            return response.data || [];
        } catch (error) {
            console.warn(`Aviso: Não foi possível carregar ${url}`, error.message);
            return [];
        }
    };

    useEffect(() => {
        async function loadAllData() {
            setLoading(true);

            // Carrega dados de todos os endpoints
            const lojasData = await fetchDataSafe('/api/v1/lojas');
            const fornecedoresData = await fetchDataSafe('/api/v1/fornecedores');
            const pedidosData = await fetchDataSafe('/api/v1/pedidos');
            const campanhasData = await fetchDataSafe('/api/v1/campanhas');

            // Prepara listas de "Últimos Cadastrados" (inverte a lista e pega os 5 primeiros)
            const recentsLojas = [...lojasData].reverse().slice(0, 5);
            const recentsFornecedores = [...fornecedoresData].reverse().slice(0, 5);

            const totalCampanhasAtivas = campanhasData.filter(c => c.ativo === true).length;

            setUltimasLojas(recentsLojas);
            setUltimosFornecedores(recentsFornecedores);

            setStats({
                totalLojas: lojasData.length,
                totalFornecedores: fornecedoresData.length,
                pedidosTotais: pedidosData.length,
                campanhasAtivas: totalCampanhasAtivas
            });

            setLoading(false);
        }

        loadAllData();
    }, []);

    const cardData = [
        { title: 'Total de Lojistas', value: loading ? '...' : stats.totalLojas, color: '#0c2b4e' },
        { title: 'Total de Fornecedores', value: loading ? '...' : stats.totalFornecedores, color: '#1a4a7d' },
        { title: 'Pedidos Totais', value: loading ? '...' : stats.pedidosTotais, color: '#4CAF50' },
        { title: 'Campanhas Ativas', value: loading ? '...' : stats.campanhasAtivas, color: '#dc3545' },
    ];

    return (
        <div className={styles['dashboard-container']}>

            <nav className={styles.sidebar}>
                <ul>
                    <li className={styles.active}>
                        <Link href="/admin/dashboard" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiGrid size={20} /><span>Dashboard</span>
                            </div>
                        </Link>
                    </li>
                    <li><Link href="/admin/cadastro-fornecedor" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Fornecedores</span></div></Link></li>
                    <li><Link href="/admin/cadastro-lojista" className={styles.linkReset}><div className={styles.menuItem}><FiBox size={20} /><span>Lojistas</span></div></Link></li>
                    <li><Link href="/admin/cadastro-produto" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Produtos</span></div></Link></li>
                    <li><Link href="/admin/cadastro-pedidos" className={styles.linkReset}><div className={styles.menuItem}><FiShoppingBag size={20} /><span>Pedidos</span></div></Link></li>
                    <li><Link href="/admin/cadastro-campanha" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div></Link></li>
                    {/* <li><Link href="/admin/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li> */}
                    <li><Link href="/admin/login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>

                <header className={styles.header}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaShieldAlt size={32} color="#0c2b4e" />
                        Painel do Administrador
                    </h1>
                </header>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
                    {cardData.map((card, index) => (
                        <div key={index} className={styles.formCard} style={{ flex: '1', minWidth: '200px', borderLeft: `5px solid ${card.color}`, padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#555', fontSize: '16px' }}>{card.title}</h3>
                            <p style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{card.value}</p>
                        </div>
                    ))}
                </div>

                <hr className={styles.divider} />

                <ListaUltimos title="Últimos Lojistas Cadastrados" dados={ultimasLojas} />
                <ListaUltimos title="Últimos Fornecedores Cadastrados" dados={ultimosFornecedores} />

                <hr className={styles.divider} />

                <BuscaUsuarios />

            </main>
        </div>
    );
}

export default withAuth(Dashboard);
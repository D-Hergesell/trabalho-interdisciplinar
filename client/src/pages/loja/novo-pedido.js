import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/Pedido.module.css'; // Usando o mesmo estilo do Admin para consistência
import api from '../../services/api';
import {
    FiGrid, FiUsers, FiPackage, FiUser, FiLogOut,
    FiChevronLeft, FiPlus, FiTrash2, FiChevronDown
} from 'react-icons/fi';

// Componente de Dropdown Personalizado
const CustomProductDropdown = ({ options = [], value = '', onChange, placeholder = 'Selecione', disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(option => String(option.id).trim() === String(value).trim());
    const displayValue = selectedOption ? selectedOption.nome : placeholder;

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

    return (
        <div ref={dropdownRef} className={styles.customDropdownContainer}>
            <div
                className={`${styles.dropdownInput} ${isOpen ? styles.active : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.8 : 1 }}
            >
                <span>{displayValue}</span>
                <FiChevronDown />
            </div>
            {isOpen && !disabled && (
                <div className={styles.dropdownMenu}>
                    {options.length > 0 ? (
                        options.map(op => (
                            <div key={op.id} className={styles.dropdownItem} onClick={() => handleSelect(op.id)}>
                                {op.nome}
                            </div>
                        ))
                    ) : (
                        <div className={styles.dropdownItem}>Nenhum produto disponível</div>
                    )}
                </div>
            )}
        </div>
    );
};

const NovoPedidoLoja = () => {
    const router = useRouter();
    const { fornecedorId: queryFornecedorId } = router.query;

    const [fornecedores, setFornecedores] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [filteredProdutos, setFilteredProdutos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Novos estados para lógica de preço
    const [lojaEstado, setLojaEstado] = useState(null); // Estado da loja (UF)
    const [condicoesEstados, setCondicoesEstados] = useState([]); // Todas as regras
    const [ajusteUnitario, setAjusteUnitario] = useState(0); // Ajuste calculado (R$)

    // Estado do Formulário
    const [formData, setFormData] = useState({
        lojaId: '',
        fornecedorId: '',
    });

    const [itensPedido, setItensPedido] = useState([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);

    // 1. Carregar Dados Iniciais
    useEffect(() => {
        async function loadData() {
            try {
                // Pega usuário logado
                const usuarioStorage = localStorage.getItem('usuario');
                if (!usuarioStorage) {
                    router.push('/');
                    return;
                }
                const usuario = JSON.parse(usuarioStorage);
                const myLojaId = usuario.lojaId || usuario.id;

                // Define ID da loja no form
                setFormData(prev => ({
                    ...prev,
                    lojaId: myLojaId,
                    fornecedorId: queryFornecedorId || ''
                }));

                // Busca dados da Loja para saber o Estado (UF)
                if (myLojaId) {
                    const resLoja = await api.get(`/api/v1/lojas/${myLojaId}`);
                    setLojaEstado(resLoja.data.estado);
                }

                // Busca Fornecedores Ativos
                const resForn = await api.get('/api/v1/fornecedores/ativos');
                setFornecedores(resForn.data || []);

                // Busca Produtos
                const resProd = await api.get('/api/v1/produtos');
                setProdutos(resProd.data || []);

                // Busca Condições de Estado Ativas (Regras de Negócio)
                const resCond = await api.get('/api/v1/condicoes-estado/ativos');
                setCondicoesEstados(resCond.data || []);

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                setMessage({ type: 'error', text: 'Erro ao carregar dados iniciais.' });
            }
        }
        loadData();
    }, [queryFornecedorId, router]);

    // 2. Calcular Ajuste Unitário (Sempre que mudar fornecedor ou tivermos os dados de estado)
    useEffect(() => {
        if (formData.fornecedorId && lojaEstado && condicoesEstados.length > 0) {
            // Procura uma regra que combine ID do Fornecedor + Estado da Loja
            const regra = condicoesEstados.find(c =>
                String(c.fornecedorId) === String(formData.fornecedorId) &&
                c.estado === lojaEstado
            );

            if (regra && regra.ajusteUnitarioAplicado) {
                const valor = Number(regra.ajusteUnitarioAplicado);
                setAjusteUnitario(valor);
            } else {
                setAjusteUnitario(0);
            }
        } else {
            setAjusteUnitario(0);
        }
    }, [formData.fornecedorId, lojaEstado, condicoesEstados]);

    // 3. Filtrar produtos e Resetar itens ao mudar fornecedor
    useEffect(() => {
        if (formData.fornecedorId) {
            const prods = produtos.filter(p =>
                String(p.fornecedorId) === String(formData.fornecedorId) && p.ativo
            );
            setFilteredProdutos(prods);

            // Se mudou o fornecedor, reseta o carrinho para evitar produtos misturados
            // (Verifica se há itens de outro fornecedor)
            const temItemInvalido = itensPedido.some(i => i.produtoId && !prods.find(p => p.id === i.produtoId));
            if (temItemInvalido) {
                setItensPedido([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
            }
        } else {
            setFilteredProdutos([]);
        }
    }, [formData.fornecedorId, produtos]);

    // 4. Atualizar preços do carrinho se o Ajuste mudar (ex: carregou a regra depois)
    useEffect(() => {
        setItensPedido(currentItens => currentItens.map(item => {
            if (!item.produtoId) return item;

            const prod = filteredProdutos.find(p => String(p.id) === String(item.produtoId));
            if (prod) {
                // Preço Base + Ajuste Regional (Mínimo 0)
                const novoPreco = Math.max(0, Number(prod.precoBase) + ajusteUnitario);
                return { ...item, valorUnitario: novoPreco };
            }
            return item;
        }));
    }, [ajusteUnitario, filteredProdutos]);

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const novosItens = [...itensPedido];

        if (name === 'produtoId') {
            const prod = filteredProdutos.find(p => String(p.id) === String(value));
            novosItens[index].produtoId = value;

            // Aplica o preço base + ajuste
            if (prod) {
                const precoFinal = Math.max(0, Number(prod.precoBase) + ajusteUnitario);
                novosItens[index].valorUnitario = precoFinal;

                // Validação de estoque
                if (prod.quantidadeEstoque < 1) {
                    novosItens[index].quantidade = 0;
                } else {
                    novosItens[index].quantidade = 1;
                }
            } else {
                novosItens[index].valorUnitario = 0;
            }

        } else if (name === 'quantidade') {
            novosItens[index].quantidade = Number(value);
        }

        setItensPedido(novosItens);
    };

    const handleAddItem = () => {
        setItensPedido([...itensPedido, { produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
    };

    const handleRemoveItem = (index) => {
        const novos = itensPedido.filter((_, i) => i !== index);
        setItensPedido(novos.length ? novos : [{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
    };

    const calcularTotal = () => {
        return itensPedido.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const itensValidos = itensPedido.filter(i => i.produtoId && i.quantidade > 0);
        if (!formData.lojaId) {
            setMessage({ type: 'error', text: 'Erro: Loja não identificada. Faça login novamente.' });
            setLoading(false);
            return;
        }
        if (itensValidos.length === 0) {
            setMessage({ type: 'error', text: 'Adicione pelo menos um produto válido.' });
            setLoading(false);
            return;
        }

        const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));

        const payload = {
            lojaId: formData.lojaId,
            fornecedorId: formData.fornecedorId,
            criadoPorUsuarioId: usuarioLogado.id,
            itens: itensValidos.map(i => ({
                produtoId: i.produtoId,
                quantidade: i.quantidade
            }))
        };

        try {
            await api.post('/api/v1/pedidos', payload);
            alert('Pedido realizado com sucesso!');
            router.push('/loja/pedidos');
        } catch (error) {
            console.error("Erro ao enviar pedido:", error);
            const msg = error.response?.data?.erro || "Erro ao processar pedido.";
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className={styles['dashboard-container']}>

            {/* Sidebar */}
            <nav className={styles.sidebar}>
                <ul>
                    <li><Link href="/loja/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20}/><span>Dashboard</span></div></Link></li>
                    <li><Link href="/loja/fornecedoresdisponiveis" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20}/><span>Fornecedores</span></div></Link></li>
                    <li className={styles.active}><Link href="/loja/pedidos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20}/><span>Meus Pedidos</span></div></Link></li>
                    <li><Link href="/loja/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20}/><span>Perfil</span></div></Link></li>
                    <li><Link href="/" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20}/><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Novo Pedido de Compra</h1>
                    <button onClick={() => router.back()} className={styles.btnCancel} style={{padding: '8px 16px', fontSize: '14px'}}>
                        <FiChevronLeft /> Voltar
                    </button>
                </header>

                {message && (
                    <div className={`${styles.alertMessage} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <form className={styles.formCard} onSubmit={handleSubmit}>
                    <h2 className={styles.sectionTitle}>1. Escolha o Fornecedor</h2>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Fornecedor</label>
                            <select
                                name="fornecedorId"
                                value={formData.fornecedorId}
                                onChange={handleChange}
                                className={styles.inputLong}
                                required
                            >
                                <option value="">Selecione um fornecedor...</option>
                                {fornecedores.map(f => (
                                    <option key={f.id} value={f.id}>{f.nomeFantasia}</option>
                                ))}
                            </select>
                            {lojaEstado && (
                                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                                    Estado da Loja: <strong>{lojaEstado}</strong>
                                </small>
                            )}
                        </div>
                    </div>

                    {formData.fornecedorId && (
                        <>
                            <h2 className={styles.sectionTitle} style={{marginTop: '30px'}}>2. Itens do Pedido</h2>

                            <div className={styles.itemGridHeader}>
                                <div>Produto</div>
                                <div className={styles.alignRight}>Qtd.</div>
                                <div className={styles.alignRight}>Preço Unit.</div>
                                <div className={styles.alignRight}>Total</div>
                                <div></div>
                            </div>

                            {itensPedido.map((item, index) => (
                                <div key={index} className={styles.itemGridRow}>
                                    <div className={styles.colProductInput}>
                                        <CustomProductDropdown
                                            options={filteredProdutos}
                                            value={item.produtoId}
                                            onChange={(e) => handleItemChange(index, e)}
                                            placeholder="Busque o produto..."
                                        />
                                        {/* Mostra estoque */}
                                        {item.produtoId && (() => {
                                            const p = filteredProdutos.find(x => String(x.id) === String(item.produtoId));
                                            return p ? (
                                                <div className={styles.stockInfo}>
                                                    Estoque: {p.quantidadeEstoque}
                                                    {/* Mostra preço base original se houver ajuste */}
                                                    {ajusteUnitario !== 0 && (
                                                        <span style={{marginLeft: '10px', color: '#e67e22'}}>
                                                            (Base: {formatCurrency(p.precoBase)})
                                                        </span>
                                                    )}
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>

                                    <div className={styles.colTinyInput}>
                                        <input
                                            type="number"
                                            name="quantidade"
                                            min="1"
                                            value={item.quantidade}
                                            onChange={(e) => handleItemChange(index, e)}
                                            className={styles.inputItem}
                                            style={{textAlign: 'right'}}
                                        />
                                    </div>

                                    <div className={styles.colTinyInput}>
                                        <input
                                            type="text"
                                            value={formatCurrency(item.valorUnitario)}
                                            readOnly
                                            className={`${styles.inputItem} ${styles.inputReadOnly}`}
                                            style={{textAlign: 'right'}}
                                        />
                                    </div>

                                    <div className={styles.colTotalDisplay} style={{textAlign: 'right'}}>
                                        {formatCurrency(item.quantidade * item.valorUnitario)}
                                    </div>

                                    <div style={{display:'flex', justifyContent:'center'}}>
                                        <button
                                            type="button"
                                            className={styles.removeItemButton}
                                            onClick={() => handleRemoveItem(index)}
                                            disabled={itensPedido.length === 1}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className={styles.addItemSection}>
                                <button type="button" className={styles.addItemButton} onClick={handleAddItem}>
                                    <FiPlus /> Adicionar Item
                                </button>
                            </div>

                            <div className={styles.totalPedidoContainer}>
                                <div style={{textAlign: 'right'}}>
                                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                                        <span className={styles.totalLabel}>Total do Pedido:</span>
                                        <span className={styles.totalValue}>
                                            {formatCurrency(calcularTotal())}
                                        </span>
                                    </div>

                                    {ajusteUnitario !== 0 && (
                                        <p style={{fontSize: '0.85rem', color: '#e67e22', marginTop: '5px'}}>
                                            * Incluindo ajuste regional de {formatCurrency(ajusteUnitario)} por item.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className={styles.footer}>
                                <button type="submit" className={styles.submitButton} disabled={loading}>
                                    {loading ? 'Enviando...' : 'Finalizar Pedido'}
                                </button>
                            </div>
                        </>
                    )}

                    {!formData.fornecedorId && (
                        <p style={{color: '#666', marginTop: '20px', fontStyle:'italic'}}>
                            Selecione um fornecedor acima para liberar a lista de produtos.
                        </p>
                    )}
                </form>
            </main>
        </div>
    );
};

export default NovoPedidoLoja;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import withAuth from '../../components/withAuth';
import styles from '../../styles/Pedido.module.css';
import api from '../../services/api';
import {
    FiGrid, FiUsers, FiPackage, FiUser, FiLogOut,
    FiChevronLeft, FiPlus, FiTrash2, FiChevronDown,
    FiMoreVertical, FiX, FiInfo, FiTag
} from 'react-icons/fi';

// Componente de Dropdown Personalizado (Mantido igual)
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

function NovoPedidoLoja() {
    const router = useRouter();
    const { fornecedorId: queryFornecedorId } = router.query;

    const [fornecedores, setFornecedores] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [filteredProdutos, setFilteredProdutos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    // --- NOVOS ESTADOS PARA LÓGICA DE NEGÓCIO ---
    const [condicoesPagamento, setCondicoesPagamento] = useState([]);
    const [condicaoSelecionada, setCondicaoSelecionada] = useState('');
    const [condicoesEstados, setCondicoesEstados] = useState([]); // Regras de estado
    const [campanhasAtivas, setCampanhasAtivas] = useState([]);   // Campanhas
    const [lojaEstado, setLojaEstado] = useState('');             // Estado da loja logada
    const [ajusteUnitario, setAjusteUnitario] = useState(0);      // Valor do ajuste calculado

    const [formData, setFormData] = useState({
        lojaId: '',
        fornecedorId: '',
    });

    const [itensPedido, setItensPedido] = useState([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);

    // 1. Carregamento Inicial de Dados
    useEffect(() => {
        async function loadData() {
            try {
                const usuarioStorage = localStorage.getItem('usuario');
                if (!usuarioStorage) { router.push('/'); return; }
                const usuario = JSON.parse(usuarioStorage);
                const myLojaId = usuario.lojaId || usuario.id;

                // Buscas em paralelo
                const [resForn, resProd, resCond, resLoja, resCamp] = await Promise.all([
                    api.get('/api/v1/fornecedores/ativos'),
                    api.get('/api/v1/produtos'),
                    api.get('/api/v1/condicoes-estado/ativos'), // Busca regras de estado
                    api.get(`/api/v1/lojas/${myLojaId}`),       // Busca dados da loja para saber o Estado
                    api.get('/api/v1/campanhas/ativos')         // Busca campanhas ativas
                ]);

                setFornecedores(resForn.data || []);
                setProdutos(resProd.data || []);
                setCondicoesEstados(resCond.data || []);

                // Define o estado da loja atual
                if (resLoja.data && resLoja.data.estado) {
                    setLojaEstado(resLoja.data.estado);
                }

                // Filtra campanhas (serão refinadas quando escolher fornecedor)
                setCampanhasAtivas(resCamp.data || []);

                setFormData(prev => ({ ...prev, lojaId: myLojaId, fornecedorId: queryFornecedorId || '' }));
            } catch (error) {
                console.error("Erro:", error);
                setMessage({ type: 'error', text: 'Erro ao carregar dados iniciais.' });
            }
        }
        loadData();
    }, [queryFornecedorId, router]);

    // 2. Lógica de Ajuste de Preço por Estado (Igual ao Admin)
    useEffect(() => {
        function calcularAjuste() {
            if (!formData.fornecedorId || !lojaEstado || condicoesEstados.length === 0) {
                setAjusteUnitario(0);
                return;
            }

            const regra = condicoesEstados.find(c =>
                String(c.fornecedorId) === String(formData.fornecedorId) &&
                c.estado === lojaEstado
            );

            if (regra && regra.ajusteUnitarioAplicado) {
                setAjusteUnitario(Number(regra.ajusteUnitarioAplicado));
            } else {
                setAjusteUnitario(0);
            }
        }
        calcularAjuste();
    }, [formData.fornecedorId, lojaEstado, condicoesEstados]);

    // 3. Atualizar Carrinho e Condições de Pagamento quando Fornecedor muda
    useEffect(() => {
        if (formData.fornecedorId) {
            // Filtrar produtos
            const prods = produtos.filter(p => String(p.fornecedorId) === String(formData.fornecedorId) && p.ativo);
            setFilteredProdutos(prods);

            // Resetar itens se forem de outro fornecedor
            if (itensPedido.some(i => i.produtoId && !prods.find(p => p.id === i.produtoId))) {
                setItensPedido([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
            }

            // Buscar condições de pagamento
            api.get(`/api/v1/condicoes-pagamento/fornecedor/${formData.fornecedorId}`)
                .then(res => setCondicoesPagamento(res.data || []))
                .catch(err => console.error("Erro ao buscar condições pgto", err));

        } else {
            setFilteredProdutos([]);
            setCondicoesPagamento([]);
            setCondicaoSelecionada('');
        }
    }, [formData.fornecedorId, produtos]);

    // 4. Atualizar preços no carrinho se o Ajuste Unitário mudar
    useEffect(() => {
        setItensPedido(currentItens => currentItens.map(item => {
            if (!item.produtoId) return item;

            const prod = filteredProdutos.find(p => String(p.id) === String(item.produtoId));
            if (prod) {
                // Aplica lógica: Preço Base + Ajuste
                const novoPreco = Math.max(0, Number(prod.precoBase) + ajusteUnitario);
                if (item.valorUnitario !== novoPreco) {
                    return { ...item, valorUnitario: novoPreco };
                }
            }
            return item;
        }));
    }, [ajusteUnitario, filteredProdutos]);

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const novosItens = [...itensPedido];

        if (name === 'produtoId') {
            const prod = filteredProdutos.find(p => String(p.id) === String(value));
            novosItens[index].produtoId = value;

            // Calcula preço com ajuste imediatamente
            const precoBase = prod ? Number(prod.precoBase) : 0;
            const precoFinal = Math.max(0, precoBase + ajusteUnitario);

            novosItens[index].valorUnitario = precoFinal;

            if (prod && prod.quantidadeEstoque < 1) {
                novosItens[index].quantidade = 0;
                alert("Produto sem estoque!");
            } else {
                novosItens[index].quantidade = 1;
            }
        }
        else if (name === 'quantidade') {
            if (value === '') {
                novosItens[index].quantidade = '';
                setItensPedido(novosItens);
                return;
            }
            let novaQtd = parseInt(value, 10);
            if (isNaN(novaQtd) || novaQtd < 1) novaQtd = 1;

            const itemAtual = novosItens[index];
            if (itemAtual.produtoId) {
                const prod = filteredProdutos.find(p => String(p.id) === String(itemAtual.produtoId));
                if (prod && novaQtd > prod.quantidadeEstoque) {
                    alert(`Estoque insuficiente! Máximo disponível: ${prod.quantidadeEstoque}`);
                    novaQtd = prod.quantidadeEstoque;
                }
            }
            novosItens[index].quantidade = novaQtd;
        }

        setItensPedido(novosItens);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddItem = () => setItensPedido([...itensPedido, { produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
    const handleRemoveItem = (index) => {
        const novos = itensPedido.filter((_, i) => i !== index);
        setItensPedido(novos.length ? novos : [{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
    };
    const calcularTotal = () => itensPedido.reduce((acc, item) => acc + ((Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0)), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const itensValidos = itensPedido.filter(i => i.produtoId && Number(i.quantidade) > 0);

        if (itensValidos.length === 0) {
            setMessage({ type: 'error', text: 'Adicione pelo menos um produto válido.' });
            setLoading(false); return;
        }
        if (!condicaoSelecionada) {
            setMessage({ type: 'error', text: 'Selecione uma condição de pagamento.' });
            setLoading(false); return;
        }

        const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));

        const payload = {
            lojaId: formData.lojaId,
            fornecedorId: formData.fornecedorId,
            criadoPorUsuarioId: usuarioLogado.id,
            condicaoPagamentoId: condicaoSelecionada || null,
            itens: itensValidos.map(i => ({ produtoId: i.produtoId, quantidade: Number(i.quantidade) }))
        };

        try {
            await api.post('/api/v1/pedidos', payload);
            alert('Pedido realizado com sucesso!');
            router.push('/loja/pedidos');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.erro || "Erro ao processar pedido.";
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    // Helper para filtrar campanhas do fornecedor selecionado
    const campanhasDoFornecedor = campanhasAtivas.filter(c => String(c.fornecedorId) === String(formData.fornecedorId));

    return (
        <div className={styles['dashboard-container']}>
            <nav className={styles.sidebar}>
                <div className={styles.mobileHeader}>
                    <span className={styles.mobileLogo}>Menu Loja</span>
                    <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <FiX size={24} /> : <FiMoreVertical size={24} />}
                    </button>
                </div>
                <ul className={menuOpen ? styles.open : ''}>
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
                    <button onClick={() => router.back()} className={styles.btnCancel} style={{padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px'}}>
                        <FiChevronLeft /> Voltar
                    </button>
                </header>

                {message && (<div className={`${styles.alertMessage} ${styles[message.type]}`}>{message.text}</div>)}

                <form className={styles.formCard} onSubmit={handleSubmit}>
                    <h2 className={styles.sectionTitle}>1. Escolha o Fornecedor</h2>
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Fornecedor</label>
                            <select name="fornecedorId" value={formData.fornecedorId} onChange={handleChange} className={styles.inputLong} required>
                                <option value="">Selecione um fornecedor...</option>
                                {fornecedores.map(f => (<option key={f.id} value={f.id}>{f.nomeFantasia}</option>))}
                            </select>
                        </div>
                    </div>

                    {/* ALERTAS DE REGRAS E CAMPANHAS */}
                    {formData.fornecedorId && (
                        <div style={{marginBottom: 20}}>
                            {/* Alerta de Ajuste Estadual */}
                            {ajusteUnitario !== 0 && (
                                <div className={`${styles.alertMessage} ${styles.warning}`} style={{display:'flex', alignItems:'center', gap:10}}>
                                    <FiInfo size={24} />
                                    <div>
                                        <strong>Atenção:</strong> Devido a regras comerciais para o estado <strong>{lojaEstado}</strong>,
                                        haverá um {ajusteUnitario > 0 ? 'acréscimo' : 'desconto'} de
                                        <strong> R$ {Math.abs(ajusteUnitario).toFixed(2)}</strong> no preço unitário dos produtos.
                                    </div>
                                </div>
                            )}

                            {/* Alerta de Campanhas */}
                            {campanhasDoFornecedor.length > 0 && (
                                <div className={`${styles.alertMessage} ${styles.info}`}>
                                    <div style={{display:'flex', alignItems:'center', gap:10, marginBottom: 5}}>
                                        <FiTag size={20} />
                                        <strong>Campanhas Ativas deste Fornecedor:</strong>
                                    </div>
                                    <ul style={{paddingLeft: 25, margin: 0}}>
                                        {campanhasDoFornecedor.map(camp => (
                                            <li key={camp.id} style={{fontSize: '14px', marginBottom: 4}}>
                                                <strong>{camp.nome}: </strong>
                                                {camp.tipo === 'percentual_produto' && `Desconto de ${camp.percentualDesconto}%`}
                                                {camp.tipo === 'valor_compra' && `Cashback de R$${camp.cashbackValor} (Min: R$${camp.valorMinimoCompra})`}
                                                {camp.tipo === 'quantidade_produto' && `Brinde: ${camp.brindeDescricao} (Min: ${camp.quantidadeMinimaProduto} un)`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {formData.fornecedorId && (
                        <div className={styles.row}>
                            <div className={styles.fieldGroup}>
                                <label>Condição de Pagamento <span className={styles.requiredAsterisk}>*</span></label>
                                <select
                                    value={condicaoSelecionada}
                                    onChange={e => setCondicaoSelecionada(e.target.value)}
                                    className={styles.inputLong}
                                    required
                                >
                                    <option value="">Selecione uma condição...</option>
                                    {condicoesPagamento.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.descricao} ({c.prazoDias} dias)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

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
                                        {item.produtoId && (() => {
                                            const p = filteredProdutos.find(x => String(x.id) === String(item.produtoId));
                                            return p ? (
                                                <div className={styles.stockInfo}>
                                                    Estoque: {p.quantidadeEstoque}
                                                    {ajusteUnitario !== 0 && (
                                                        <span style={{marginLeft: 10, color: '#e67e22'}}>
                                                            (Base: R$ {p.precoBase})
                                                        </span>
                                                    )}
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>

                                    <div className={styles.colTinyInput}>
                                        <span className={styles.mobileLabel}>Qtd:</span>
                                        <input
                                            type="number"
                                            name="quantidade"
                                            min="1"
                                            value={item.quantidade}
                                            onChange={(e) => handleItemChange(index, e)}
                                            className={`${styles.inputItem} ${styles.inputNoSpin}`}
                                            style={{textAlign: 'right'}}
                                        />
                                    </div>

                                    <div className={styles.colTinyInput}>
                                        <span className={styles.mobileLabel}>Unit:</span>
                                        <input
                                            type="text"
                                            value={`R$ ${Number(item.valorUnitario).toFixed(2)}`}
                                            readOnly
                                            className={`${styles.inputItem} ${styles.inputReadOnly}`}
                                            style={{textAlign: 'right'}}
                                        />
                                    </div>

                                    <div className={styles.colTotalDisplay} style={{textAlign: 'right'}}>
                                        <span className={styles.mobileLabel}>Total:</span>
                                        R$ {((Number(item.quantidade)||0) * (Number(item.valorUnitario)||0)).toFixed(2)}
                                    </div>

                                    <div style={{display:'flex', justifyContent:'center'}}>
                                        <button type="button" className={styles.removeItemButton} onClick={() => handleRemoveItem(index)} disabled={itensPedido.length === 1}>
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className={styles.addItemSection}>
                                <button type="button" className={styles.addItemButton} onClick={handleAddItem}><FiPlus /> Adicionar Item</button>
                            </div>
                            <div className={styles.totalPedidoContainer}>
                                <span className={styles.totalLabel}>Total do Pedido:</span>
                                <span className={styles.totalValue}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcularTotal())}</span>
                            </div>
                            <div className={styles.footer}>
                                <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? 'Enviando...' : 'Finalizar Pedido'}</button>
                            </div>
                        </>
                    )}

                    {!formData.fornecedorId && (
                        <p style={{color: '#666', marginTop: '20px', fontStyle:'italic'}}>Selecione um fornecedor acima para liberar a lista de produtos.</p>
                    )}
                </form>
            </main>
        </div>
    );
};

export default withAuth(NovoPedidoLoja, "lojista", "/");
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/Pedido.module.css'; // Usando o mesmo estilo do Admin para consistência
import api from '../../services/api';
import {
    FiGrid, FiUsers, FiPackage, FiUser, FiLogOut,
    FiChevronLeft, FiPlus, FiTrash2, FiChevronDown, FiShoppingBag
} from 'react-icons/fi';

// Componente de Dropdown Personalizado (Igual ao do Admin)
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
    const { fornecedorId: queryFornecedorId } = router.query; // Pega ID da URL se vier de "Ver Catálogo"

    const [fornecedores, setFornecedores] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [filteredProdutos, setFilteredProdutos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

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
                // Pega usuário logado para definir a Loja
                const usuarioStorage = localStorage.getItem('usuario');
                if (!usuarioStorage) {
                    router.push('/');
                    return;
                }
                const usuario = JSON.parse(usuarioStorage);
                // Se o backend não mandar lojaId no login, tente usar o id do usuario como fallback se for 1-pra-1
                const myLojaId = usuario.lojaId || usuario.id;

                // Busca Fornecedores Ativos
                const resForn = await api.get('/api/v1/fornecedores/ativos');
                setFornecedores(resForn.data || []);

                // Busca Produtos (Pode otimizar depois para buscar só do fornecedor selecionado)
                const resProd = await api.get('/api/v1/produtos');
                setProdutos(resProd.data || []);

                // Define estado inicial
                setFormData(prev => ({
                    ...prev,
                    lojaId: myLojaId,
                    fornecedorId: queryFornecedorId || '' // Se veio da outra tela, já preenche
                }));

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                setMessage({ type: 'error', text: 'Erro ao carregar dados iniciais.' });
            }
        }
        loadData();
    }, [queryFornecedorId, router]);

    // 2. Filtrar produtos quando muda o Fornecedor
    useEffect(() => {
        if (formData.fornecedorId) {
            const prods = produtos.filter(p =>
                String(p.fornecedorId) === String(formData.fornecedorId) && p.ativo
            );
            setFilteredProdutos(prods);
            // Reseta itens se trocar de fornecedor, para não misturar
            if (itensPedido.some(i => i.produtoId && !prods.find(p => p.id === i.produtoId))) {
               setItensPedido([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
            }
        } else {
            setFilteredProdutos([]);
        }
    }, [formData.fornecedorId, produtos]);

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
            novosItens[index].valorUnitario = prod ? Number(prod.precoBase) : 0;
            // Reset qtd se estoque for baixo
            if (prod && prod.quantidadeEstoque < 1) novosItens[index].quantidade = 0;
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

        // Validação básica
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

        // Monta Payload
        // Nota: O backend espera "criadoPorUsuarioId". Pegamos do localStorage.
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
            router.push('/loja/pedidos'); // Volta para a lista
        } catch (error) {
            console.error("Erro ao enviar pedido:", error);
            const msg = error.response?.data?.erro || "Erro ao processar pedido.";
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles['dashboard-container']}>

            {/* Sidebar (Mesma estrutura das outras páginas) */}
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
                                        {/* Mostra estoque se produto selecionado */}
                                        {item.produtoId && (() => {
                                            const p = filteredProdutos.find(x => String(x.id) === String(item.produtoId));
                                            return p ? <div className={styles.stockInfo}>Estoque: {p.quantidadeEstoque}</div> : null;
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
                                            value={`R$ ${item.valorUnitario.toFixed(2)}`}
                                            readOnly
                                            className={`${styles.inputItem} ${styles.inputReadOnly}`}
                                            style={{textAlign: 'right'}}
                                        />
                                    </div>

                                    <div className={styles.colTotalDisplay} style={{textAlign: 'right'}}>
                                        R$ {(item.quantidade * item.valorUnitario).toFixed(2)}
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
                                <span className={styles.totalLabel}>Total do Pedido:</span>
                                <span className={styles.totalValue}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcularTotal())}
                                </span>
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
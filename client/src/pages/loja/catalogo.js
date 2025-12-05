import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/lojascatalogo.module.css';
import api from '@/services/api';

import {
    FiArrowLeft, FiShoppingCart, FiBox, FiGrid, FiUsers, FiPackage, FiUser, FiLogOut,
    FiMoreVertical, FiX // Novos ícones
} from 'react-icons/fi';

const CatalogoFornecedor = () => {
    const router = useRouter();
    const { id } = router.query;

    const [produtos, setProdutos] = useState([]);
    const [fornecedorInfo, setFornecedorInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estado para Menu Mobile
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (router.isReady && id) {
            fetchData();
        }
    }, [router.isReady, id]);

    async function fetchData() {
        try {
            setLoading(true);

            // 1. Buscar informações do Fornecedor
            try {
                const resForn = await api.get(`/api/v1/fornecedores/${id}`);
                setFornecedorInfo(resForn.data);
            } catch (e) {
                console.warn("Não foi possível carregar detalhes do fornecedor");
            }

            // 2. Buscar produtos e filtrar pelo ID
            const resProd = await api.get('/api/v1/produtos');
            const todosProdutos = resProd.data || [];

            const produtosFiltrados = todosProdutos.filter(p =>
                String(p.fornecedorId) === String(id) && p.ativo === true
            );

            setProdutos(produtosFiltrados);

        } catch (error) {
            console.error("Erro ao carregar catálogo:", error);
        } finally {
            setLoading(false);
        }
    }

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    return (
        <div className={styles['dashboard-container']}>

            {/* SIDEBAR COM MENU MOBILE */}
            <nav className={styles.sidebar}>
                <div className={styles.mobileHeader}>
                    <span className={styles.mobileLogo}>Menu Loja</span>
                    <button
                        className={styles.menuToggle}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <FiX size={24} /> : <FiMoreVertical size={24} />}
                    </button>
                </div>

                <ul className={menuOpen ? styles.open : ''}>
                    <li><Link href="/loja/dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20}/><span>Dashboard</span></div></Link></li>
                    <li><Link href="/loja/fornecedoresdisponiveis" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20}/><span>Fornecedores</span></div></Link></li>
                    <li><Link href="/loja/pedidos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20}/><span>Meus Pedidos</span></div></Link></li>
                    <li><Link href="/loja/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20}/><span>Perfil</span></div></Link></li>
                    <li><Link href="/" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20}/><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>

                <header className={styles.header}>
                    <div>
                        <h1>Catálogo de Produtos</h1>
                        {fornecedorInfo ? (
                            <p className={styles.subtitle}>Fornecedor: <strong>{fornecedorInfo.nomeFantasia}</strong></p>
                        ) : (
                            <p className={styles.subtitle}>Carregando fornecedor...</p>
                        )}
                    </div>

                    <div className={styles.headerActions}>
                        <button onClick={() => router.back()} className={styles.btnBack}>
                            <FiArrowLeft /> Voltar
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className={styles.loadingContainer}>Carregando produtos...</div>
                ) : produtos.length > 0 ? (
                    <div className={styles.catalogGrid}>
                        {produtos.map(prod => (
                            <div key={prod.id} className={styles.productCard}>
                                <div className={styles.cardHeader}>
                                    <FiBox className={styles.iconPlaceholder} />
                                </div>
                                <div className={styles.cardBody}>
                                    <div>
                                        <h3 className={styles.productName}>{prod.nome}</h3>
                                        <p className={styles.productCategory}>{prod.nomeCategoria || 'Geral'}</p>
                                    </div>

                                    <div className={styles.productDetails}>
                                        <div className={styles.priceTag}>
                                            {formatCurrency(prod.precoBase)}
                                            <span className={styles.unit}> / {prod.unidadeMedida || 'un'}</span>
                                        </div>
                                        <p className={`${styles.stockInfo} ${prod.quantidadeEstoque < 10 ? styles.stockLow : ''}`}>
                                            Estoque: {prod.quantidadeEstoque}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyContainer}>
                        <FiBox size={48} style={{marginBottom: 10, opacity: 0.5}}/>
                        <p>Este fornecedor ainda não possui produtos ativos no catálogo.</p>
                    </div>
                )}

            </main>
        </div>
    );
};

export default CatalogoFornecedor;
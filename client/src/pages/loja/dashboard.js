import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import withAuth from '../../components/withAuth';
import styles from '@/styles/lojas.module.css';
import api from '@/services/api';
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiUserCheck, FiSearch,
  FiMoreVertical, FiX // Novos ícones importados
} from 'react-icons/fi';

function DashboardLoja ()  {
  const router = useRouter();

  // Estado para o menu mobile
  const [menuOpen, setMenuOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    totalRealizados: 0,
    valorTotal: 0,
    totalPendentes: 0
  });
  const [pedidosRecentes, setPedidosRecentes] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const usuarioString = localStorage.getItem("usuario");
      const usuario = usuarioString ? JSON.parse(usuarioString) : null;

      if (!usuario || !usuario.lojaId) {
        console.warn("Usuário sem loja vinculada ou não logado.");
        return;
      }

      const res = await api.get(`/api/v1/pedidos/loja/${usuario.lojaId}`);
      const lista = res.data || [];

      const totalRealizados = lista.length;

      const valorTotal = lista.reduce((acc, item) => {
          if (item.status === 'CANCELADO') return acc;
          return acc + (item.valorTotal || 0);
      }, 0);

      const totalPendentes = lista.filter(
        p => p.status === "PENDENTE" || p.status === "Pending"
      ).length;

      setDashboardData({ totalRealizados, valorTotal, totalPendentes });

      const listaOrdenada = lista.sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido));
      setPedidosRecentes(listaOrdenada.slice(0, 5));

    } catch (error) {
      console.error("Erro dashboard:", error);
    }
  }

  const getStatusClassName = (status) => {
    switch (status) {
      case 'PENDENTE': return styles.statusPendente;
      case 'EM_SEPARACAO': return styles.statusEmSeparacao;
      case 'ENVIADO': return styles.statusEnviado;
      case 'ENTREGUE': return styles.statusEntregue;
      case 'CANCELADO': return styles.statusCancelado;
      default: return '';
    }
  };

  return (
    <div className={styles['dashboard-container']}>

      {/* --- SIDEBAR COM MENU DROPDOWN --- */}
      <nav className={styles.sidebar}>

        {/* Cabeçalho Mobile (Três Pontinhos) */}
        <div className={styles.mobileHeader}>
            <span className={styles.mobileLogo}>Menu Loja</span>
            <button
                className={styles.menuToggle}
                onClick={() => setMenuOpen(!menuOpen)}
            >
                {menuOpen ? <FiX size={24} /> : <FiMoreVertical size={24} />}
            </button>
        </div>

        {/* Lista de Links (Classe 'open' controla visibilidade no mobile) */}
        <ul className={menuOpen ? styles.open : ''}>
          <li className={styles.active}>
            <Link href="/loja/dashboard" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiGrid size={20} /><span>Dashboard</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/loja/fornecedoresdisponiveis" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiSearch size={20} /><span>Fornecedores</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/loja/pedidos" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiPackage size={20} /><span>Meus Pedidos</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/loja/perfil" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiUser size={20} /><span>Perfil</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiLogOut size={20} /><span>Sair</span>
              </div>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Conteúdo Principal */}
      <main className={styles['main-content']}>
        <header className={styles.header}>
          <h1>DASHBOARD</h1>

          <div
            className={styles['profile-area']}
            onClick={() => router.push('/loja/perfil')}
            style={{ cursor: 'pointer' }}
            title="Ir para meu perfil"
          >
            <FiUserCheck size={24} />
            <span>Minha Loja</span>
          </div>
        </header>

        <section className={styles['dashboard-cards']}>
          <div className={styles.card}>
            <h3>Meus Pedidos</h3>
            <p>{dashboardData.totalRealizados}</p>
          </div>
          <div className={styles.card}>
            <h3>Total Comprado</h3>
            <p>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dashboardData.valorTotal)}
            </p>
          </div>
          <div className={styles.card}>
            <h3>Pendentes</h3>
            <p>{dashboardData.totalPendentes}</p>
          </div>
        </section>

        <section className={styles['orders-table-section']}>
          <h2>Meus Últimos Pedidos</h2>
          <table className={styles['orders-table']}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fornecedor</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pedidosRecentes.length > 0 ? (
                pedidosRecentes.map((pedido) => (
                  <tr key={pedido.id}>
                    {/* Adicionado data-label para responsividade CSS */}
                    <td data-label="ID">#{String(pedido.id).substring(0, 8)}</td>
                    <td data-label="Fornecedor">{pedido.fornecedorNome || '—'}</td>
                    <td data-label="Valor">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.valorTotal || 0)}
                    </td>
                    <td data-label="Status">
                        <span className={`${styles.statusBadge} ${getStatusClassName(pedido.status)}`}>
                            {pedido.status}
                        </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{textAlign: 'center', padding: '15px'}}>Nenhum pedido realizado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default withAuth(DashboardLoja, "lojista", "/");


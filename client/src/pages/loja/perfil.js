import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/Geral.module.css'; // Certifique-se que o caminho está correto
import api from '../../services/api';
import withAuth from '../../components/withAuth';
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiMoreVertical, FiX
} from 'react-icons/fi';

function PerfilLoja  ()  {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Estado para controlar o menu no mobile
  const [menuOpen, setMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    nomeFantasia: '',
    cnpj: '',
    responsavelNome: '',
    emailContato: '',
    telefone: '',
    cep: '',
    logradouro: '',
    cidade: '',
    estado: ''
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const usuarioStored = localStorage.getItem("usuario");
        if (usuarioStored) {
          const usuario = JSON.parse(usuarioStored);
          const idParaBuscar = usuario.lojaId || usuario.id;

          if (idParaBuscar) {
            const response = await api.get(`/api/v1/lojas/${idParaBuscar}`);
            const loja = response.data;

            setFormData({
              id: loja.id,
              nomeFantasia: loja.nomeFantasia || '',
              cnpj: loja.cnpj || '',
              responsavelNome: loja.responsavelNome || '',
              emailContato: loja.emailContato || '',
              telefone: loja.telefone || '',
              cep: loja.cep || '',
              logradouro: loja.logradouro || '',
              cidade: loja.cidade || '',
              estado: loja.estado || ''
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        if (error.response && error.response.status === 404) {
             setMessage({ type: 'error', text: 'Loja não encontrada. Verifique se o seu usuário está vinculado a uma loja.' });
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!formData.id) {
         throw new Error("ID da loja não identificado.");
      }

      await api.put(`/api/v1/lojas/${formData.id}`, formData);
      setMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      const msg = error.response?.data?.error || error.message || "Erro ao salvar.";
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['dashboard-container']}>

      {/* SIDEBAR ADAPTADA PARA MOBILE */}
      <nav className={styles.sidebar}>

        {/* Cabeçalho Mobile com Botão Toggle (Só aparece em telas pequenas via CSS) */}
        <div className={styles.mobileHeader}>
            <span className={styles.mobileLogo}>Menu Loja</span>
            <button
                className={styles.menuToggle}
                onClick={() => setMenuOpen(!menuOpen)}
            >
                {menuOpen ? <FiX size={24} /> : <FiMoreVertical size={24} />}
            </button>
        </div>

        {/* Lista de Links: Recebe a classe 'open' se o menu estiver aberto */}
        <ul className={menuOpen ? styles.open : ''}>
          <li>
            <Link href="/loja/dashboard" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiGrid size={20} /><span>Dashboard</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/loja/fornecedoresdisponiveis" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiUsers size={20} /><span>Fornecedores</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/loja/pedidos" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiPackage size={20} /><span>Pedidos</span>
              </div>
            </Link>
          </li>
          <li className={styles.active}>
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

      <main className={styles['main-content']}>

        <header className={styles.header}>
          <h1>Perfil da Loja</h1>
        </header>

        {message && (
          <div className={`${styles.alertMessage} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className={styles.formCard}>
          <h2 className={styles.sectionTitle}>Dados da Loja</h2>

          <form onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label>Nome da Loja</label>
                <input
                  type="text"
                  name="nomeFantasia"
                  value={formData.nomeFantasia}
                  onChange={handleChange}
                  className={styles.inputLong}
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  className={styles.inputLong}
                  maxLength={18}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label>Responsável</label>
                <input
                  type="text"
                  name="responsavelNome"
                  value={formData.responsavelNome}
                  onChange={handleChange}
                  className={styles.inputLong}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>E-mail</label>
                <input
                  type="email"
                  name="emailContato"
                  value={formData.emailContato}
                  onChange={handleChange}
                  className={styles.inputLong}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label>Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className={styles.inputLong}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>CEP</label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  className={styles.inputLong}
                  maxLength={9}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label>Logradouro</label>
                <input
                  type="text"
                  name="logradouro"
                  value={formData.logradouro}
                  onChange={handleChange}
                  className={styles.inputLong}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label>Cidade</label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className={styles.inputLong}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Estado (UF)</label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className={styles.inputLong}
                  maxLength={2}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            <div className={styles.footer}>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};


export default withAuth( PerfilLoja);
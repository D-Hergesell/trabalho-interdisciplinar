package trabalho.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import trabalho.dto.PedidoRequestDTO;
import trabalho.dto.PedidoResponseDTO;
import trabalho.entities.*;
import trabalho.enums.StatusPedido;
import trabalho.enums.TipoCampanha;
import trabalho.enums.TipoUsuario;
import trabalho.mapper.PedidoMapper;
import trabalho.repository.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final LojaRepository lojaRepository;
    private final FornecedorRepository fornecedorRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;
    private final CondicoesEstadoRepository condicoesEstadoRepository;
    private final CampanhaRepository campanhaRepository;
    private final PedidoMapper pedidoMapper;

    @Transactional
    public PedidoResponseDTO criarPedido(PedidoRequestDTO dto) {

        Pedido pedido = new Pedido();

        Loja loja = lojaRepository.findById(dto.lojaId())
                .orElseThrow(() -> new RuntimeException("Loja não encontrada."));

        Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));

        Usuario usuario = usuarioRepository.findById(dto.criadoPorUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        // =================================================================================
        // LÓGICA DE CONDIÇÕES REGIONAIS (ESTADO)
        // =================================================================================
        Optional<CondicoesEstado> condicaoEstadoOpt = condicoesEstadoRepository
                .findByFornecedor_IdAndEstado(fornecedor.getId(), loja.getEstado());

        BigDecimal ajustePorUnidade = BigDecimal.ZERO;
        BigDecimal cashbackPercentualEstado = BigDecimal.ZERO;

        if (condicaoEstadoOpt.isPresent() && Boolean.TRUE.equals(condicaoEstadoOpt.get().getAtivo())) {
            CondicoesEstado cond = condicaoEstadoOpt.get();

            // 1. Captura o ajuste de preço (ex: +R$ 2,00)
            if (cond.getAjusteUnitarioAplicado() != null) {
                ajustePorUnidade = cond.getAjusteUnitarioAplicado();
            }

            // 2. Captura o percentual de cashback (ex: 10%)
            if (cond.getCashbackPercentual() != null) {
                cashbackPercentualEstado = cond.getCashbackPercentual();
            }
        }

        pedido.setLoja(loja);
        pedido.setFornecedor(fornecedor);
        pedido.setCriadoPorUsuario(usuario);
        pedido.setStatus(StatusPedido.PENDENTE);
        pedido.setItens(new HashSet<>());

        BigDecimal valorTotalCalculado = BigDecimal.ZERO;
        int quantidadeTotalItens = 0;

        // Processa os itens do pedido
        for (var itemDto : dto.itens()) {
            Produto produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDto.produtoId()));

            if (produto.getQuantidadeEstoque() < itemDto.quantidade()) {
                throw new RuntimeException("Estoque insuficiente para o produto: " + produto.getNome());
            }

            // Baixa de estoque
            produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() - itemDto.quantidade());
            produtoRepository.save(produto);

            PedidoItem item = new PedidoItem();
            item.setPedido(pedido);
            item.setProduto(produto);
            item.setQuantidade(itemDto.quantidade());

            // APLICAÇÃO DO AJUSTE REGIONAL NO PREÇO
            BigDecimal precoBase = produto.getPrecoBase();
            BigDecimal precoFinal = precoBase.add(ajustePorUnidade); // Soma o ajuste (pode ser negativo)

            if (precoFinal.compareTo(BigDecimal.ZERO) < 0) {
                precoFinal = BigDecimal.ZERO;
            }

            item.setPrecoUnitarioMomento(precoFinal);
            item.setAjusteUnitarioAplicado(ajustePorUnidade); // Registra histórico do ajuste

            pedido.getItens().add(item);

            BigDecimal subtotal = item.getPrecoUnitarioMomento()
                    .multiply(BigDecimal.valueOf(item.getQuantidade()));

            valorTotalCalculado = valorTotalCalculado.add(subtotal);
            quantidadeTotalItens += itemDto.quantidade();
        }

        pedido.setValorTotal(valorTotalCalculado);

        // =================================================================================
        // CÁLCULO DE CASHBACK (CAMPANHAS + ESTADO)
        // =================================================================================
        BigDecimal totalCashback = BigDecimal.ZERO;

        // 1. Cashback por Estado (CORRIGIDO: Adicionado RoundingMode)
        if (cashbackPercentualEstado.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal cashbackDoEstado = valorTotalCalculado
                    .multiply(cashbackPercentualEstado)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP); // <--- CORREÇÃO AQUI
            totalCashback = totalCashback.add(cashbackDoEstado);
        }

        // 2. Cashback por Campanhas
        List<Campanha> campanhasAtivas = campanhaRepository.findByFornecedor_IdAndAtivoTrue(fornecedor.getId());
        LocalDate hoje = LocalDate.now();

        for (Campanha campanha : campanhasAtivas) {
            if (campanha.getDataInicio() != null && hoje.isBefore(campanha.getDataInicio())) continue;
            if (campanha.getDataFim() != null && hoje.isAfter(campanha.getDataFim())) continue;

            // Campanha de Valor
            if (campanha.getTipo() == TipoCampanha.valor_compra && campanha.getValorMinimoCompra() != null) {
                if (valorTotalCalculado.compareTo(campanha.getValorMinimoCompra()) >= 0) {
                    if (campanha.getCashbackValor() != null) {
                        totalCashback = totalCashback.add(campanha.getCashbackValor());
                    }
                }
            }

            // Lógica de Brinde
            if (campanha.getTipo() == TipoCampanha.quantidade_produto && campanha.getQuantidadeMinimaProduto() != null) {
                if (quantidadeTotalItens >= campanha.getQuantidadeMinimaProduto()) {
                    Produto brinde = campanha.getProdutoIdBrinde();
                    if (brinde != null && brinde.getQuantidadeEstoque() > 0) {
                        PedidoItem itemBrinde = new PedidoItem();
                        itemBrinde.setPedido(pedido);
                        itemBrinde.setProduto(brinde);
                        itemBrinde.setQuantidade(1);
                        itemBrinde.setPrecoUnitarioMomento(BigDecimal.ZERO);
                        itemBrinde.setAjusteUnitarioAplicado(BigDecimal.ZERO);

                        brinde.setQuantidadeEstoque(brinde.getQuantidadeEstoque() - 1);
                        produtoRepository.save(brinde);
                        pedido.getItens().add(itemBrinde);
                    }
                }
            }
        }

        pedido.setCashbackGerado(totalCashback);

        Pedido salvo = pedidoRepository.save(pedido);
        return pedidoMapper.toResponseDTO(salvo);
    }

    // -----------------------------------------
    // GET - Buscar por ID
    // -----------------------------------------
    @Transactional(readOnly = true)
    public PedidoResponseDTO buscarPorId(UUID id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado."));
        return pedidoMapper.toResponseDTO(pedido);
    }

    // -----------------------------------------
    // GET - Listar todos
    // -----------------------------------------
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarTodos() {
        return pedidoRepository.findAll().stream()
                .map(pedidoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // -----------------------------------------
    // GET - Listar por Loja
    // -----------------------------------------
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorLoja(UUID lojaId) {
        Loja loja = lojaRepository.findById(lojaId)
                .orElseThrow(() -> new RuntimeException("Loja não encontrada."));

        return pedidoRepository.findByLoja(loja).stream()
                .map(pedidoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // -----------------------------------------
    // GET - Listar por Fornecedor
    // -----------------------------------------
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorFornecedor(UUID fornecedorId) {
        Fornecedor fornecedor = fornecedorRepository.findById(fornecedorId)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));

        return pedidoRepository.findByFornecedor(fornecedor).stream()
                .map(pedidoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // -----------------------------------------
    // UPDATE - Alterar status do pedido
    // -----------------------------------------
    @Transactional
    public PedidoResponseDTO atualizarStatus(UUID pedidoId, StatusPedido novoStatus, UUID usuarioId) {

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado."));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        // 1. Verificar se é ADMIN
        boolean isAdmin = usuario.getTipoUsuario() == TipoUsuario.ADMIN;

        // 2. Se NÃO for Admin, verifica se o usuário pertence à Loja ou Fornecedor do pedido
        boolean isUsuarioDaLoja = false;
        boolean isUsuarioDoFornecedor = false;

        if (!isAdmin) {
            isUsuarioDaLoja = pedido.getLoja().getUsuarios().stream()
                    .anyMatch(u -> u.getId().equals(usuarioId));

            isUsuarioDoFornecedor = pedido.getFornecedor().getUsuarios().stream()
                    .anyMatch(u -> u.getId().equals(usuarioId));

            if (!isUsuarioDaLoja && !isUsuarioDoFornecedor) {
                throw new RuntimeException("Apenas os envolvidos (ou Administradores) podem alterar este pedido.");
            }
        }

        // 3. Se NÃO for Admin, aplica a Máquina de Estados estrita
        // (Admins pulam essa validação para poderem corrigir erros manuais)
        if (!isAdmin) {
            validarTransicao(pedido.getStatus(), novoStatus, isUsuarioDaLoja, isUsuarioDoFornecedor);
        }

        // 4. Efetivar mudança
        pedido.setStatus(novoStatus);
        Pedido atualizado = pedidoRepository.save(pedido);

        return pedidoMapper.toResponseDTO(atualizado);
    }

    /**
     * Valida se a mudança de 'atual' para 'novo' é válida para usuários comuns.
     */
    private void validarTransicao(StatusPedido atual, StatusPedido novo, boolean isLoja, boolean isFornecedor) {

        // Regra Geral: Usuário comum não mexe em pedido finalizado
        if (atual == StatusPedido.ENTREGUE || atual == StatusPedido.CANCELADO) {
            throw new RuntimeException("O pedido já foi finalizado. Contate o suporte para alterações.");
        }

        switch (novo) {
            case EM_SEPARACAO:
                if (!isFornecedor) throw new RuntimeException("Apenas o fornecedor pode iniciar a separação.");
                if (atual != StatusPedido.PENDENTE) throw new RuntimeException("Fluxo inválido: Deve estar PENDENTE.");
                break;

            case ENVIADO:
                if (!isFornecedor) throw new RuntimeException("Apenas o fornecedor pode marcar como enviado.");
                if (atual != StatusPedido.EM_SEPARACAO) throw new RuntimeException("Fluxo inválido: Deve estar EM SEPARAÇÃO.");
                break;

            case ENTREGUE:
                if (!isFornecedor) throw new RuntimeException("Apenas o fornecedor pode confirmar a entrega.");
                if (atual != StatusPedido.ENVIADO) throw new RuntimeException("Fluxo inválido: Deve estar ENVIADO.");
                break;

            case CANCELADO:
                if (isLoja) {
                    // Loja só cancela se ainda não saiu para entrega
                    if (atual == StatusPedido.ENVIADO || atual == StatusPedido.EM_SEPARACAO) {
                        throw new RuntimeException("Pedido já em processo. Contate o fornecedor para cancelar.");
                    }
                }
                break;

            default:
                // Se tentar voltar status (ex: de ENVIADO para PENDENTE) sem ser admin
                throw new RuntimeException("Mudança de status não permitida ou inválida.");
        }
    }

    // -----------------------------------------
    // DELETE - Remover pedido
    // -----------------------------------------
    @Transactional
    public void deletarPedido(UUID id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado."));
        pedidoRepository.delete(pedido);
    }
}
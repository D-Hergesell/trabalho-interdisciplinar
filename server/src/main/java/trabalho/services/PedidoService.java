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
import java.time.OffsetDateTime;
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

        // Lógica de Condições Regionais
        Optional<CondicoesEstado> condicaoEstadoOpt = condicoesEstadoRepository
                .findByFornecedor_IdAndEstado(fornecedor.getId(), loja.getEstado());

        BigDecimal ajustePorUnidade = BigDecimal.ZERO;
        BigDecimal cashbackPercentualEstado = BigDecimal.ZERO;

        if (condicaoEstadoOpt.isPresent() && Boolean.TRUE.equals(condicaoEstadoOpt.get().getAtivo())) {
            CondicoesEstado cond = condicaoEstadoOpt.get();
            if (cond.getAjusteUnitarioAplicado() != null) {
                ajustePorUnidade = cond.getAjusteUnitarioAplicado();
            }
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

        // Processa Itens e Baixa Estoque
        for (var itemDto : dto.itens()) {
            Produto produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDto.produtoId()));

            if (produto.getQuantidadeEstoque() < itemDto.quantidade()) {
                throw new RuntimeException("Estoque insuficiente para o produto: " + produto.getNome());
            }

            // BAIXA DE ESTOQUE
            produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() - itemDto.quantidade());
            produtoRepository.save(produto);

            PedidoItem item = new PedidoItem();
            item.setPedido(pedido);
            item.setProduto(produto);
            item.setQuantidade(itemDto.quantidade());

            BigDecimal precoBase = produto.getPrecoBase();
            BigDecimal precoFinal = precoBase.add(ajustePorUnidade);
            if (precoFinal.compareTo(BigDecimal.ZERO) < 0) {
                precoFinal = BigDecimal.ZERO;
            }

            item.setPrecoUnitarioMomento(precoFinal);
            item.setAjusteUnitarioAplicado(ajustePorUnidade);

            pedido.getItens().add(item);

            BigDecimal subtotal = item.getPrecoUnitarioMomento()
                    .multiply(BigDecimal.valueOf(item.getQuantidade()));

            valorTotalCalculado = valorTotalCalculado.add(subtotal);
            quantidadeTotalItens += itemDto.quantidade();
        }

        pedido.setValorTotal(valorTotalCalculado);

        // Lógica de Cashback
        BigDecimal totalCashback = BigDecimal.ZERO;

        if (cashbackPercentualEstado.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal cashbackDoEstado = valorTotalCalculado
                    .multiply(cashbackPercentualEstado)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            totalCashback = totalCashback.add(cashbackDoEstado);
        }

        List<Campanha> campanhasAtivas = campanhaRepository.findByFornecedor_IdAndAtivoTrue(fornecedor.getId());
        LocalDate hoje = LocalDate.now();

        for (Campanha campanha : campanhasAtivas) {
            if (campanha.getDataInicio() != null && hoje.isBefore(campanha.getDataInicio())) continue;
            if (campanha.getDataFim() != null && hoje.isAfter(campanha.getDataFim())) continue;

            if (campanha.getTipo() == TipoCampanha.valor_compra && campanha.getValorMinimoCompra() != null) {
                if (valorTotalCalculado.compareTo(campanha.getValorMinimoCompra()) >= 0) {
                    if (campanha.getCashbackValor() != null) {
                        totalCashback = totalCashback.add(campanha.getCashbackValor());
                    }
                }
            }

            // Lógica de Brinde (Também baixa estoque do brinde)
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

                        // Baixa estoque do brinde
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

    @Transactional(readOnly = true)
    public PedidoResponseDTO buscarPorId(UUID id) {
        Pedido pedido = pedidoRepository.findById(id).orElseThrow(() -> new RuntimeException("Pedido não encontrado."));
        return pedidoMapper.toResponseDTO(pedido);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarTodos() {
        return pedidoRepository.findAll().stream().map(pedidoMapper::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorLoja(UUID lojaId) {
        Loja loja = lojaRepository.findById(lojaId).orElseThrow(() -> new RuntimeException("Loja não encontrada."));
        return pedidoRepository.findByLoja(loja).stream().map(pedidoMapper::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorFornecedor(UUID fornecedorId) {
        Fornecedor fornecedor = fornecedorRepository.findById(fornecedorId).orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
        return pedidoRepository.findByFornecedor(fornecedor).stream().map(pedidoMapper::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional
    public PedidoResponseDTO atualizarStatus(UUID pedidoId, StatusPedido novoStatus, UUID usuarioId) {
        Pedido pedido = pedidoRepository.findById(pedidoId).orElseThrow(() -> new RuntimeException("Pedido não encontrado."));
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        boolean isAdmin = usuario.getTipoUsuario() == TipoUsuario.ADMIN;
        boolean isUsuarioDaLoja = false;
        boolean isUsuarioDoFornecedor = false;

        if (!isAdmin) {
            if (pedido.getLoja().getUsuarios() != null) {
                isUsuarioDaLoja = pedido.getLoja().getUsuarios().stream().anyMatch(u -> u.getId().equals(usuarioId));
            }
            if (pedido.getFornecedor().getUsuarios() != null) {
                isUsuarioDoFornecedor = pedido.getFornecedor().getUsuarios().stream().anyMatch(u -> u.getId().equals(usuarioId));
            }

            if (!isUsuarioDaLoja && !isUsuarioDoFornecedor) {
                throw new RuntimeException("Apenas os envolvidos (ou Administradores) podem alterar este pedido.");
            }
        }

        if (!isAdmin) {
            validarTransicao(pedido.getStatus(), novoStatus, isUsuarioDaLoja, isUsuarioDoFornecedor);
        }

        OffsetDateTime agora = OffsetDateTime.now();

        switch (novoStatus) {
            case EM_SEPARACAO:
                if (pedido.getDataSeparacao() == null) pedido.setDataSeparacao(agora);
                break;

            case ENVIADO:
                if (pedido.getDataEnviado() == null) pedido.setDataEnviado(agora);
                break;

            case ENTREGUE:
                if (pedido.getDataEntregue() == null) pedido.setDataEntregue(agora);
                break;

            case CANCELADO:
                if (pedido.getDataCancelado() == null) pedido.setDataCancelado(agora);

                // IMPORTANTE: Estorno de estoque se for cancelado agora
                if (pedido.getStatus() != StatusPedido.CANCELADO) {
                    restaurarEstoque(pedido);
                }
                break;

            case PENDENTE:
                // Nenhuma ação de data específica
                break;
        }

        pedido.setStatus(novoStatus);
        Pedido atualizado = pedidoRepository.save(pedido);
        return pedidoMapper.toResponseDTO(atualizado);
    }

    @Transactional
    public void deletarPedido(UUID id) {
        Pedido pedido = pedidoRepository.findById(id).orElseThrow(() -> new RuntimeException("Pedido não encontrado."));

        // --- LÓGICA DE ESTORNO DE ESTOQUE AO DELETAR ---
        // Se o pedido NÃO estava cancelado, o estoque ainda está preso nele. Devolvemos.
        if (pedido.getStatus() != StatusPedido.CANCELADO) {
            restaurarEstoque(pedido);
        }
        // -----------------------------------------------

        pedidoRepository.delete(pedido);
    }

    /**
     * Devolve a quantidade dos itens para o estoque do produto.
     */
    private void restaurarEstoque(Pedido pedido) {
        for (PedidoItem item : pedido.getItens()) {
            Produto produto = item.getProduto();
            // Recupera o produto do banco para garantir saldo atualizado (opcional, mas seguro)
            // Como já temos o objeto, podemos somar direto se estiver gerenciado pelo EntityManager
            produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() + item.getQuantidade());
            produtoRepository.save(produto);
        }
    }

    private void validarTransicao(StatusPedido atual, StatusPedido novo, boolean isLoja, boolean isFornecedor) {
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
                    if (atual == StatusPedido.ENVIADO || atual == StatusPedido.EM_SEPARACAO) {
                        throw new RuntimeException("Pedido já em processo. Contate o fornecedor para cancelar.");
                    }
                }
                break;
            default:
                throw new RuntimeException("Mudança de status não permitida ou inválida.");
        }
    }
}
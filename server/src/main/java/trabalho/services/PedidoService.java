package trabalho.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import trabalho.dto.PedidoRequestDTO;
import trabalho.dto.PedidoResponseDTO;
import trabalho.entities.*;
import trabalho.enums.StatusPedido;
import trabalho.mapper.PedidoMapper;
import trabalho.repository.*;

import java.math.BigDecimal;
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
    private final PedidoMapper pedidoMapper;

    // -----------------------------------------
    // CREATE
    // -----------------------------------------
    @Transactional
    public PedidoResponseDTO criarPedido(PedidoRequestDTO dto) {

        Pedido pedido = new Pedido();

        Loja loja = lojaRepository.findById(dto.lojaId())
                .orElseThrow(() -> new RuntimeException("Loja não encontrada."));

        Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));

        Usuario usuario = usuarioRepository.findById(dto.criadoPorUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        // O repositório busca pela combinação Fornecedor + Estado da Loja
        Optional<CondicoesEstado> condicaoEstadoOpt = condicoesEstadoRepository
                .findByFornecedor_IdAndEstado(fornecedor.getId(), loja.getEstado());

        BigDecimal ajustePorUnidade = BigDecimal.ZERO;

        // Se houver condição cadastrada e ela estiver ativa
        if (condicaoEstadoOpt.isPresent() && Boolean.TRUE.equals(condicaoEstadoOpt.get().getAtivo())) {
            CondicoesEstado cond = condicaoEstadoOpt.get();

            // Pega o valor do ajuste (pode ser positivo ou negativo)
            if (cond.getAjusteUnitarioAplicado() != null) {
                ajustePorUnidade = cond.getAjusteUnitarioAplicado();
            }

            // Nota: Se quiser implementar Cashback ou Prazo, você faria aqui.
            // Como 'Pedido' não tem campo de cashback explícito no código atual,
            // focaremos no ajuste de preço unitário que já existe em 'PedidoItem'.
        }

        pedido.setLoja(loja);
        pedido.setFornecedor(fornecedor);
        pedido.setCriadoPorUsuario(usuario);
        pedido.setStatus(StatusPedido.PENDENTE);

        BigDecimal valorTotal = BigDecimal.ZERO;
        pedido.setItens(new HashSet<>());

        for (var itemDto : dto.itens()) {

            Produto produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDto.produtoId()));

            // 1. Validação: Verifica se há estoque suficiente
            if (produto.getQuantidadeEstoque() < itemDto.quantidade()) {
                throw new RuntimeException("Estoque insuficiente para o produto: " + produto.getNome());
            }

            // 2. Baixa de Estoque: Subtrai a quantidade do pedido do estoque atual
            produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() - itemDto.quantidade());

            PedidoItem item = new PedidoItem();
            item.setPedido(pedido);
            item.setProduto(produto);
            item.setQuantidade(itemDto.quantidade());

            // Preço Final = Preço Base do Produto + Ajuste Regional
            BigDecimal precoBase = produto.getPrecoBase();
            BigDecimal precoFinal = precoBase.add(ajustePorUnidade);

            // Garante que o preço não fique negativo
            if (precoFinal.compareTo(BigDecimal.ZERO) < 0) {
                precoFinal = BigDecimal.ZERO;
            }

            item.setPrecoUnitarioMomento(precoFinal);
            item.setAjusteUnitarioAplicado(ajustePorUnidade); // Registra quanto foi o ajuste

            pedido.getItens().add(item);

            BigDecimal subtotal = item.getPrecoUnitarioMomento()
                    .multiply(BigDecimal.valueOf(item.getQuantidade()));

            valorTotal = valorTotal.add(subtotal);
        }

        pedido.setValorTotal(valorTotal);

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
    public PedidoResponseDTO atualizarStatus(UUID pedidoId, StatusPedido novoStatus) {

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado."));

        pedido.setStatus(novoStatus);

        Pedido atualizado = pedidoRepository.save(pedido);

        return pedidoMapper.toResponseDTO(atualizado);
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

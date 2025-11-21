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

        pedido.setLoja(loja);
        pedido.setFornecedor(fornecedor);
        pedido.setCriadoPorUsuario(usuario);
        pedido.setStatus(StatusPedido.PENDENTE);

        BigDecimal valorTotal = BigDecimal.ZERO;
        pedido.setItens(new HashSet<>());

        for (var itemDto : dto.itens()) {

            Produto produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDto.produtoId()));

            PedidoItem item = new PedidoItem();
            item.setPedido(pedido);
            item.setProduto(produto);
            item.setQuantidade(itemDto.quantidade());

            item.setPrecoUnitarioMomento(produto.getPrecoBase());
            item.setAjusteUnitarioAplicado(BigDecimal.ZERO);

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

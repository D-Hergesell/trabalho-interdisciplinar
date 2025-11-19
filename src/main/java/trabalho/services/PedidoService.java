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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final LojaRepository lojaRepository;
    private final FornecedorRepository fornecedorRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;
    private final PedidoMapper pedidoMapper;

    @Transactional
    public PedidoResponseDTO criarPedido(PedidoRequestDTO dto) {

        // 1. Instanciar o Pedido (O Mapper pode fazer o básico, mas relacionamentos manuais são mais seguros)
        Pedido pedido = new Pedido();

        // 2. Buscar Entidades Relacionadas
        Loja loja = lojaRepository.findById(dto.lojaId())
                .orElseThrow(() -> new RuntimeException("Loja não encontrada."));

        Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));

        Usuario usuario = usuarioRepository.findById(dto.criadoPorUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        // 3. Setar relacionamentos
        pedido.setLoja(loja);
        pedido.setFornecedor(fornecedor);
        pedido.setCriadoPorUsuario(usuario);
        pedido.setStatus(StatusPedido.PENDENTE);

        // 4. Processar Itens e Calcular Total (Regra de Negócio Pesada)
        BigDecimal valorTotal = BigDecimal.ZERO;
        pedido.setItens(new HashSet<>()); // Inicializa o set

        for (var itemDto : dto.itens()) {
            Produto produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDto.produtoId()));

            // Cria o item do pedido
            PedidoItem item = new PedidoItem();
            item.setPedido(pedido); // Vínculo Pai <-> Filho
            item.setProduto(produto);
            item.setQuantidade(itemDto.quantidade());
            item.setPrecoUnitarioMomento(produto.getPrecoBase()); // Usa o preço atual do produto
            item.setAjusteUnitarioAplicado(BigDecimal.ZERO); // Ou lógica de desconto

            // Adiciona ao pedido
            pedido.getItens().add(item);

            // Soma ao total: (Preco * Qtd)
            BigDecimal subtotal = item.getPrecoUnitarioMomento()
                    .multiply(BigDecimal.valueOf(item.getQuantidade()));
            valorTotal = valorTotal.add(subtotal);
        }

        pedido.setValorTotal(valorTotal);

        // 5. Salvar (O CascadeType.ALL no Pedido salvará os Itens automaticamente)
        Pedido salvo = pedidoRepository.save(pedido);

        return pedidoMapper.toResponseDTO(salvo);
    }

    // ... busca e listagem
}
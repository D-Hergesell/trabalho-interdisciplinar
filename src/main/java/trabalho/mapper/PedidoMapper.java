package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import trabalho.dto.PedidoRequestDTO;
import trabalho.dto.PedidoResponseDTO;
import trabalho.entities.Pedido;

@Mapper(componentModel = "spring", uses = {PedidoItemMapper.class})
public interface PedidoMapper {

    // REQUEST DTO → ENTITY
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)                // Definido no Service
    @Mapping(target = "valorTotal", ignore = true)            // Calculado no Service
    @Mapping(target = "dataPedido", ignore = true)            // Definido pelo banco
    @Mapping(target = "loja", ignore = true)                  // Buscado no Service
    @Mapping(target = "fornecedor", ignore = true)            // Buscado no Service
    @Mapping(target = "criadoPorUsuario", ignore = true)      // Buscado no Service
    @Mapping(target = "condicaoPagamento", ignore = true)
    @Mapping(target = "itens", ignore = true)                 // Construído manualmente
    Pedido toEntity(PedidoRequestDTO dto);


    // ENTITY → RESPONSE DTO (com flatten)
    @Mapping(source = "loja.id", target = "lojaId")
    @Mapping(source = "loja.nomeFantasia", target = "lojaNome")

    @Mapping(source = "fornecedor.id", target = "fornecedorId")
    @Mapping(source = "fornecedor.nomeFantasia", target = "fornecedorNome")

    @Mapping(source = "criadoPorUsuario.id", target = "criadoPorUsuarioId")
    @Mapping(source = "criadoPorUsuario.nome", target = "criadoPorUsuarioNome")

    // Lista de itens será convertida via PedidoItemMapper automaticamente
    PedidoResponseDTO toResponseDTO(Pedido entity);
}

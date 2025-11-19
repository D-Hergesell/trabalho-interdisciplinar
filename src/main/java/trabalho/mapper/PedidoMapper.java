package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import trabalho.dto.PedidoRequestDTO;
import trabalho.dto.PedidoResponseDTO;
import trabalho.entities.Pedido;

@Mapper(componentModel = "spring", uses = {PedidoItemMapper.class}) // <-- Usa o auxiliar
public interface PedidoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true) // Service define
    @Mapping(target = "valorTotal", ignore = true) // Service calcula
    @Mapping(target = "dataPedido", ignore = true) // Banco define
    @Mapping(target = "loja", ignore = true) // Service busca
    @Mapping(target = "fornecedor", ignore = true) // Service busca
    @Mapping(target = "criadoPorUsuario", ignore = true) // Service busca
    @Mapping(target = "condicaoPagamento", ignore = true)
    @Mapping(target = "itens", ignore = true) // CRUCIAL: O Service monta a lista manualmente
    Pedido toEntity(PedidoRequestDTO dto);

    @Mapping(source = "loja.id", target = "lojaId")
    @Mapping(source = "loja.nomeFantasia", target = "lojaNome")
    @Mapping(source = "fornecedor.id", target = "fornecedorId")
    @Mapping(source = "fornecedor.nomeFantasia", target = "fornecedorNome")
    @Mapping(source = "criadoPorUsuario.id", target = "criadoPorUsuarioId")
    @Mapping(source = "criadoPorUsuario.nome", target = "criadoPorUsuarioNome")
        // O MapStruct vai usar o PedidoItemMapper para converter a lista 'itens' automaticamente
    PedidoResponseDTO toResponseDTO(Pedido entity);
}
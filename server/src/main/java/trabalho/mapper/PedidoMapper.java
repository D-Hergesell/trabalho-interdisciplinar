package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import trabalho.dto.PedidoRequestDTO;
import trabalho.dto.PedidoResponseDTO;
import trabalho.entities.Pedido;

@Mapper(componentModel = "spring", uses = {PedidoItemMapper.class})
public interface PedidoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "valorTotal", ignore = true)
    @Mapping(target = "dataPedido", ignore = true)
    @Mapping(target = "loja", ignore = true)
    @Mapping(target = "fornecedor", ignore = true)
    @Mapping(target = "criadoPorUsuario", ignore = true)
    @Mapping(target = "condicaoPagamento", ignore = true)
    @Mapping(target = "itens", ignore = true)
    Pedido toEntity(PedidoRequestDTO dto);

    @Mapping(source = "loja.id", target = "lojaId")
    @Mapping(source = "loja.nomeFantasia", target = "lojaNome")
    @Mapping(source = "fornecedor.id", target = "fornecedorId")
    @Mapping(source = "fornecedor.nomeFantasia", target = "fornecedorNome")
    @Mapping(source = "criadoPorUsuario.id", target = "criadoPorUsuarioId")
    @Mapping(source = "criadoPorUsuario.nome", target = "criadoPorUsuarioNome")
    @Mapping(source = "dataPedido", target = "dataPedido")
    @Mapping(source = "valorTotal", target = "valorTotal")
    @Mapping(source = "status", target = "status")

    PedidoResponseDTO toResponseDTO(Pedido entity);
}

package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import trabalho.dto.PedidoItemResponseDTO;
import trabalho.entities.PedidoItem;

@Mapper(componentModel = "spring")
public interface PedidoItemMapper {

    @Mapping(source = "produto.id", target = "produtoId")
    @Mapping(source = "produto.nome", target = "produtoNome")
    @Mapping(source = "quantidade", target = "quantidade")
    @Mapping(source = "precoUnitarioMomento", target = "precoUnitarioMomento")
    @Mapping(source = "ajusteUnitarioAplicado", target = "ajusteUnitarioAplicado")
    PedidoItemResponseDTO toResponseDTO(PedidoItem entity);
}

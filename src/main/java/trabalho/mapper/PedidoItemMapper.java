package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import trabalho.dto.PedidoItemResponseDTO;
import trabalho.entities.PedidoItem;

@Mapper(componentModel = "spring")
public interface PedidoItemMapper {

    // A conversão DTO -> Entity é feita manualmente no Service
    // porque envolve lógica de preço e cálculo de total.
    // Então aqui só precisamos do Entity -> ResponseDTO.

    @Mapping(source = "produto.id", target = "produtoId")
    @Mapping(source = "produto.nome", target = "produtoNome")
    PedidoItemResponseDTO toResponseDTO(PedidoItem entity);
}
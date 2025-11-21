package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import trabalho.dto.ProdutoRequestDTO;
import trabalho.dto.ProdutoResponseDTO;
import trabalho.entities.Produto;

@Mapper(componentModel = "spring")
public interface ProdutoMapper {

    // REQUEST DTO → ENTITY
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    @Mapping(target = "fornecedor", ignore = true) // Setado no Service
    @Mapping(target = "categoria", ignore = true)  // Setado no Service
    @Mapping(target = "pedidoItems", ignore = true)
    @Mapping(target = "campanhasOndeSouBrinde", ignore = true)
    Produto toEntity(ProdutoRequestDTO dto);

    // ENTITY → RESPONSE DTO (achatado)
    @Mapping(source = "fornecedor.id", target = "fornecedorId")
    @Mapping(source = "fornecedor.nomeFantasia", target = "nomeFornecedor")
    @Mapping(source = "categoria.id", target = "categoriaId")
    @Mapping(source = "categoria.nome", target = "nomeCategoria")
    ProdutoResponseDTO toResponseDTO(Produto entity);
}

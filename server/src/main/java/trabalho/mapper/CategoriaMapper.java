package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import trabalho.dto.CategoriaRequestDTO;
import trabalho.dto.CategoriaResponseDTO;
import trabalho.entities.Categoria;

@Mapper(componentModel = "spring")
public interface CategoriaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ativo", ignore = true) // service define padrão
    @Mapping(target = "produtos", ignore = true)
    @Mapping(target = "fornecedor", ignore = true) // service busca
    Categoria toEntity(CategoriaRequestDTO dto);

    @Mapping(source = "fornecedor.id", target = "fornecedorId")
    @Mapping(source = "fornecedor.nomeFantasia", target = "fornecedorNome")
    CategoriaResponseDTO toResponseDTO(Categoria entity);
}

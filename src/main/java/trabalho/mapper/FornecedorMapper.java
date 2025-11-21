package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import trabalho.dto.FornecedorRequestDTO;
import trabalho.dto.FornecedorResponseDTO;
import trabalho.entities.Fornecedor;

@Mapper(componentModel = "spring")
public interface FornecedorMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "campanhas", ignore = true)
    @Mapping(target = "produtos", ignore = true)
    @Mapping(target = "condicoesPagamentos", ignore = true)
    @Mapping(target = "condicoesEstados", ignore = true)
    @Mapping(target = "usuarios", ignore = true)
    Fornecedor toEntity(FornecedorRequestDTO dto);

    // Todos os campos do DTO têm o mesmo nome da entidade,
    // então o MapStruct fará mapping automático com segurança.
    FornecedorResponseDTO toResponseDTO(Fornecedor entity);
}

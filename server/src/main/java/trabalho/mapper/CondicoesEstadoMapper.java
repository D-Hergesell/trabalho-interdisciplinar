package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import trabalho.dto.CondicoesEstadoRequestDTO;
import trabalho.dto.CondicoesEstadoResponseDTO;
import trabalho.entities.CondicoesEstado;

@Mapper(componentModel = "spring")
public interface CondicoesEstadoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fornecedor", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    CondicoesEstado toEntity(CondicoesEstadoRequestDTO dto);

    @Mapping(source = "fornecedor.id", target = "fornecedorId")
    @Mapping(source = "fornecedor.nomeFantasia", target = "fornecedorNome")
    @Mapping(source = "entity.dataInicio", target = "dataInicio")
    CondicoesEstadoResponseDTO toResponseDTO(CondicoesEstado entity);

}

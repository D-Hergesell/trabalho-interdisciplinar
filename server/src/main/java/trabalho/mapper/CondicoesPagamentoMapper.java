package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import trabalho.dto.CondicoesPagamentoRequestDTO;
import trabalho.dto.CondicoesPagamentoResponseDTO;
import trabalho.entities.CondicoesPagamento;

@Mapper(componentModel = "spring")
public interface CondicoesPagamentoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fornecedor", ignore = true)
    @Mapping(target = "pedidos", ignore = true)
    CondicoesPagamento toEntity(CondicoesPagamentoRequestDTO dto);

    @Mapping(source = "fornecedor.id", target = "fornecedorId")
    @Mapping(source = "fornecedor.nomeFantasia", target = "fornecedorNome")
    CondicoesPagamentoResponseDTO toResponseDTO(CondicoesPagamento entity);
}

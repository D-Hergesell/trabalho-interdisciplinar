package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import trabalho.dto.CampanhaRequestDTO;
import trabalho.dto.CampanhaResponseDTO;
import trabalho.entities.Campanha;

@Mapper(componentModel = "spring")
public interface CampanhaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fornecedor", ignore = true)
    @Mapping(target = "produtoIdBrinde", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    Campanha toEntity(CampanhaRequestDTO dto);

    @Mapping(source = "fornecedor.id", target = "fornecedorId")
    @Mapping(source = "produtoIdBrinde.id", target = "produtoIdBrinde")
    @Mapping(source = "entity.dataInicio", target = "dataInicio")
    @Mapping(source = "entity.dataFim", target = "dataFim")
    @Mapping(source = "entity.percentualDesconto", target = "percentualDesconto")
    @Mapping(source = "entity.cashbackValor", target = "cashbackValor")
    @Mapping(source = "entity.brindeDescricao", target = "brindeDescricao")
    CampanhaResponseDTO toResponseDTO(Campanha entity);
}



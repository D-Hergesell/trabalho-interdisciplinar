package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import trabalho.dto.LojaRequestDTO;
import trabalho.dto.LojaResponseDTO;
import trabalho.entities.Loja;

@Mapper(componentModel = "spring")
public interface LojaMapper {

    // REQUEST → ENTITY
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ativo", ignore = true)        // service define
    @Mapping(target = "createdAt", ignore = true)    // gerado pelo banco
    @Mapping(target = "lojaMatriz", ignore = true)   // service define
    @Mapping(target = "filiais", ignore = true)
    @Mapping(target = "pedidos", ignore = true)
    @Mapping(target = "usuarios", ignore = true)
    Loja toEntity(LojaRequestDTO dto);


    // ENTITY → RESPONSE
    @Mapping(source = "lojaMatriz.id", target = "lojaMatrizId")
    LojaResponseDTO toResponseDTO(Loja entity);
}

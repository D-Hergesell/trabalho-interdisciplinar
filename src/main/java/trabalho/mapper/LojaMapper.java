package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import trabalho.dto.LojaRequestDTO;
import trabalho.dto.LojaResponseDTO;
import trabalho.entities.Loja;

@Mapper(componentModel = "spring")
public interface LojaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ativo", ignore = true) // Service define
    @Mapping(target = "createdAt", ignore = true) // Banco define
    @Mapping(target = "lojaMatriz", ignore = true) // Service busca e setta
    @Mapping(target = "filiais", ignore = true)
    @Mapping(target = "pedidos", ignore = true)
    @Mapping(target = "usuarios", ignore = true)
    Loja toEntity(LojaRequestDTO dto);

    // Mapeia o ID da matriz (se existir) para o DTO de resposta
    @Mapping(source = "lojaMatriz.id", target = "lojaMatrizId")
    LojaResponseDTO toResponseDTO(Loja entity);
}
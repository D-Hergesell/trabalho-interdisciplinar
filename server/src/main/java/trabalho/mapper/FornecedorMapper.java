package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import trabalho.dto.FornecedorRequestDTO;
import trabalho.dto.FornecedorResponseDTO;
import trabalho.entities.Categoria;
import trabalho.entities.Fornecedor;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface FornecedorMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "produtos", ignore = true)
    @Mapping(target = "campanhas", ignore = true)
    @Mapping(target = "categorias", ignore = true)
    @Mapping(target = "condicoesEstados", ignore = true)
    @Mapping(target = "usuarios", ignore = true)
    @Mapping(target = "pedidos", ignore = true)
    Fornecedor toEntity(FornecedorRequestDTO dto);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "createdAt", target = "createdAt")
    // Mapeia a lista de categorias para uma String única
    @Mapping(source = "categorias", target = "categoria", qualifiedByName = "mapCategoriasToString")
    FornecedorResponseDTO toResponseDTO(Fornecedor entity);

    @Named("mapCategoriasToString")
    default String mapCategoriasToString(Set<Categoria> categorias) {
        if (categorias == null || categorias.isEmpty()) {
            return "Geral"; // Valor padrão se não tiver categoria
        }
        // Pega o nome de cada categoria e junta com vírgula
        return categorias.stream()
                .map(Categoria::getNome)
                .collect(Collectors.joining(", "));
    }
}
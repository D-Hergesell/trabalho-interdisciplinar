package trabalho.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import trabalho.dto.UsuarioRequestDTO;
import trabalho.dto.UsuarioResponseDTO;
import trabalho.entities.Usuario;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    /**
     * Converte nosso DTO de criação para a Entidade.
     * (DTO -> Entity)
     */
    @Mapping(target = "id", ignore = true) // Ignora o ID (será gerado pelo banco)
    @Mapping(target = "ativo", ignore = true) // Ignora (o Service define a regra)
    @Mapping(target = "createdAt", ignore = true) // Ignora (o banco define)
    @Mapping(target = "senhaHash", ignore = true) // **CRUCIAL**: Ignora! O Service vai fazer o HASH
    @Mapping(target = "loja", ignore = true) // Ignora (o Service define)
    @Mapping(target = "fornecedor", ignore = true) // Ignora (o Service define)
    @Mapping(target = "pedidosCriados", ignore = true) // Ignora (é um relacionamento)
    Usuario toEntity(UsuarioRequestDTO dto);

    /**
     * Converte nossa Entidade para o DTO de resposta.
     * (Entity -> DTO)
     */
    @Mapping(source = "loja.id", target = "lojaId")
    @Mapping(source = "fornecedor.id", target = "fornecedorId")
    UsuarioResponseDTO toResponseDTO(Usuario entity);
}
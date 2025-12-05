package trabalho.dto;

import trabalho.enums.TipoUsuario;
import java.util.UUID;

public record UsuarioResponseDTO(
        UUID id,
        String nome,
        String email,
        TipoUsuario tipoUsuario,
        Boolean ativo,
        UUID lojaId,
        UUID fornecedorId
) {}

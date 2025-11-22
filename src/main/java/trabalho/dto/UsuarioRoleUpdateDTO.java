package trabalho.dto;

import jakarta.validation.constraints.NotNull;
import trabalho.enums.TipoUsuario;

public record UsuarioRoleUpdateDTO(
        @NotNull(message = "O tipo de usuário é obrigatório")
        TipoUsuario tipoUsuario
) {}

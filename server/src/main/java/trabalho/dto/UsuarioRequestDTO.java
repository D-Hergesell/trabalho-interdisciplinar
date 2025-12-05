package trabalho.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import trabalho.enums.TipoUsuario;

public record UsuarioRequestDTO(

        @NotBlank(message = "Nome não pode ser vazio")
        String nome,

        @NotBlank(message = "Email não pode ser vazio")
        @Email(message = "Email inválido")
        String email,

        String senha,

        TipoUsuario tipoUsuario
) {}
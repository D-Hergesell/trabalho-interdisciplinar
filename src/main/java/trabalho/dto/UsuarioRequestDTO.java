package trabalho.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import trabalho.enums.TipoUsuario;

public record UsuarioRequestDTO(

        @NotBlank(message = "Nome não pode ser vazio")
        String nome,

        @NotBlank(message = "Email não pode ser vazio")
        @Email(message = "Email inválido")
        String email,

        @NotBlank(message = "Senha não pode ser vazia")
        @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
        String senha, // Senha em texto puro

        TipoUsuario tipoUsuario

        // NOTA: Os campos 'lojaId' ou 'fornecedorId' seriam adicionados aqui
        // se o usuário fosse criado JÁ vinculado.
) {}

package trabalho.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FornecedorRequestDTO(
        @NotBlank(message = "Nome fantasia é obrigatório")
        String nomeFantasia,

        @NotBlank(message = "Razão social é obrigatória")
        String razaoSocial,

        @NotBlank(message = "CNPJ é obrigatório")
        @Size(min = 14, max = 14, message = "CNPJ deve ter 14 dígitos")
        String cnpj,

        String responsavelNome,

        @Email(message = "Email inválido")
        String emailContato,

        String telefone,
        String cep,
        String logradouro,
        String cidade,

        @NotBlank(message = "Estado é obrigatório")
        @Size(min = 2, max = 2)
        String estado
) {}
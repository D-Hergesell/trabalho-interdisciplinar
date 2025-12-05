package trabalho.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record FornecedorRequestDTO(
        @NotBlank(message = "Nome do fornecedor é obrigatório")
        String nomeFantasia,

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
        String estado,

        Boolean ativo
) {}

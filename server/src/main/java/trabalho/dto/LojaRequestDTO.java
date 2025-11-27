package trabalho.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record LojaRequestDTO(

        @NotBlank(message = "Nome fantasia é obrigatório")
        String nomeFantasia,

        @NotBlank(message = "CNPJ é obrigatório")
        @Size(min = 14, max = 14, message = "CNPJ deve ter 14 dígitos (apenas números)")
        String cnpj,

        String responsavelNome,

        @Email(message = "Email inválido")
        String emailContato,

        String telefone,

        @Size(min = 8, max = 8, message = "CEP deve ter exatamente 8 dígitos")
        String cep,

        String logradouro,
        String cidade,

        @NotBlank(message = "Estado é obrigatório")
        @Size(min = 2, max = 2, message = "Use a sigla do estado (ex: SP, SC)")
        String estado

) {}

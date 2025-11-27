package trabalho.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record FornecedorResponseDTO(
        UUID id,
        String nomeFantasia,
        String razaoSocial,
        String cnpj,
        String responsavelNome,
        String emailContato,
        String telefone,
        String cep,
        String logradouro,
        String cidade,
        String estado,
        Boolean ativo,
        OffsetDateTime createdAt
) {}

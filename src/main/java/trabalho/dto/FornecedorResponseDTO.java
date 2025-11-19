package trabalho.dto;

import java.util.UUID;

public record FornecedorResponseDTO(
        UUID id,
        String nomeFantasia,
        String cnpj,
        String emailContato,
        String cidade,
        String estado,
        Boolean ativo
) {}
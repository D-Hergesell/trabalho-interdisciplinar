package trabalho.dto;

import java.util.UUID;

public record CategoriaResponseDTO(
        UUID id,
        String nome,
        Boolean ativo,
        UUID fornecedorId,
        String fornecedorNome
) {}


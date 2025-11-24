package trabalho.dto;

import java.util.UUID;

public record CategoriaResponseDTO(
        UUID id,
        UUID fornecedorId,
        String fornecedorNome,

        String nome,
        String descricao,

        Boolean ativo
) {}

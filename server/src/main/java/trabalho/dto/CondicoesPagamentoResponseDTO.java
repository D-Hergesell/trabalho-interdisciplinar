package trabalho.dto;

import java.util.UUID;

public record CondicoesPagamentoResponseDTO(
        UUID id,
        String descricao,
        Integer prazoDias,
        Boolean ativo,
        UUID fornecedorId,
        String fornecedorNome // helper pro front como se fosse item drop
) {}

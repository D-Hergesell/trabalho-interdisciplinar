package trabalho.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CondicoesPagamentoRequestDTO(
        @NotNull(message = "Fornecedor é obrigatório.")
        UUID fornecedorId,

        @NotBlank(message = "Descrição é obrigatória.")
        String descricao,

        @NotNull(message = "Prazo (dias) é obrigatório.")
        Integer prazoDias,

        Boolean ativo // opcional, se null o banco mantém true
) {}

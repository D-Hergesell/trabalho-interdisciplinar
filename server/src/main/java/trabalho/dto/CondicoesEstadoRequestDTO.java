package trabalho.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CondicoesEstadoRequestDTO(
        @NotNull(message = "Fornecedor é obrigatório")
        UUID fornecedorId,

        @NotBlank(message = "Estado é obrigatório")
        String estado,

        BigDecimal cashbackPercentual,

        @NotNull(message = "Prazo de pagamento é obrigatório")
        Integer prazoPagamentoDias,

        BigDecimal ajusteUnitarioAplicado,

        Boolean ativo
) {}

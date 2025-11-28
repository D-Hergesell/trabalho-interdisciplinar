package trabalho.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CondicoesEstadoResponseDTO(
        UUID id,
        String estado,
        BigDecimal cashbackPercentual,
        Integer prazoPagamentoDias,
        BigDecimal ajusteUnitarioAplicado,
        Boolean ativo,
        OffsetDateTime createdAt,
        UUID fornecedorId,
        String fornecedorNome
) {}

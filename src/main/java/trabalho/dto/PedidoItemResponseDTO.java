package trabalho.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PedidoItemResponseDTO(
        UUID produtoId,
        String produtoNome, // Facilitador para o front
        Integer quantidade,
        BigDecimal precoUnitarioMomento,
        BigDecimal ajusteUnitarioAplicado
) {}
package trabalho.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import trabalho.enums.StatusPedido;

public record PedidoResponseDTO(
        UUID id,
        StatusPedido status,
        BigDecimal valorTotal,
        OffsetDateTime dataPedido,
        UUID lojaId,
        String lojaNome,
        UUID fornecedorId,
        String fornecedorNome,
        UUID criadoPorUsuarioId,
        String criadoPorUsuarioNome,
        List<PedidoItemResponseDTO> itens
) {}
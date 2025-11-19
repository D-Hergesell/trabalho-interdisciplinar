package trabalho.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record PedidoItemRequestDTO(
        @NotNull(message = "Produto é obrigatório")
        UUID produtoId,

        @NotNull(message = "Quantidade é obrigatória")
        @Min(value = 1, message = "Quantidade deve ser pelo menos 1")
        Integer quantidade
) {}
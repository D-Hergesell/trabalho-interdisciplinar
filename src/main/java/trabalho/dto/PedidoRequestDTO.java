package trabalho.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record PedidoRequestDTO(
        @NotNull(message = "Loja é obrigatória")
        UUID lojaId,

        @NotNull(message = "Fornecedor é obrigatório")
        UUID fornecedorId,

        @NotNull(message = "Usuário criador é obrigatório")
        UUID criadoPorUsuarioId,

        // Opcional
        UUID condicaoPagamentoId,

        // A lista de itens é obrigatória e validada em cascata (@Valid)
        @NotEmpty(message = "O pedido deve ter pelo menos um item")
        @Valid
        List<PedidoItemRequestDTO> itens
) {}
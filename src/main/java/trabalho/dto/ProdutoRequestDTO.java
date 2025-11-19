package trabalho.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record ProdutoRequestDTO(
        @NotBlank(message = "Nome do produto é obrigatório")
        String nome,

        String descricao,

        @NotNull(message = "Preço base é obrigatório")
        @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
        BigDecimal precoBase,

        String unidadeMedida,

        // Opcional no request (o service define 0 se vier nulo), mas bom ter
        Integer quantidadeEstoque,

        // RELACIONAMENTOS: Recebemos apenas os IDs
        @NotNull(message = "Fornecedor é obrigatório")
        UUID fornecedorId,

        UUID categoriaId // Opcional
) {}
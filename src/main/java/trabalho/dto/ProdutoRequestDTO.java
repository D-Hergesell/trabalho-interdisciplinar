package trabalho.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record ProdutoRequestDTO(

        @NotBlank(message = "Nome do produto é obrigatório")
        String nome,

        String descricao,

        @NotNull(message = "Preço base é obrigatório")
        @DecimalMin(value = "0.01", message = "O preço deve ser maior que zero")
        @Digits(integer = 10, fraction = 2, message = "Preço inválido (máx: 10 dígitos inteiros e 2 decimais)")
        BigDecimal precoBase,

        String unidadeMedida,

        // Estoque opcional — o Service define 0 se vier nulo
        Integer quantidadeEstoque,

        // ID do fornecedor (obrigatório)
        @NotNull(message = "Fornecedor é obrigatório")
        UUID fornecedorId,

        // Categoria opcional
        UUID categoriaId
) {}

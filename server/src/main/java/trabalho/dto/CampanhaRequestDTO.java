package trabalho.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import trabalho.entities.Produto;
import trabalho.enums.TipoCampanha;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CampanhaRequestDTO(
        @NotBlank String nome,
        @NotBlank TipoCampanha tipo,
        BigDecimal valorMinimoCompra,
        BigDecimal cashbackValor,
        Produto produtoIdBrinde,
        Integer quantidadeMinimaProduto,
        String brindeDescricao,
        BigDecimal percentualDesconto,
        @NotNull LocalDate dataInicio,
        LocalDate dataFim,
        UUID fornecedorId
) {}


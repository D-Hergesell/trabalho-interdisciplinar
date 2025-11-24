package trabalho.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import trabalho.enums.TipoCampanha;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CampanhaRequestDTO(

        @NotNull(message = "Fornecedor é obrigatório")
        UUID fornecedorId,

        @NotBlank(message = "Nome da campanha é obrigatório")
        String nome,

        @NotNull(message = "Tipo da campanha é obrigatório")
        TipoCampanha tipo,

        BigDecimal valorMinimoCompra,
        BigDecimal cashbackValor,

        UUID produtoIdBrinde,
        Integer quantidadeMinimaProduto,

        String brindeDescricao,
        BigDecimal percentualDesconto,

        @NotNull(message = "Data de início é obrigatória")
        LocalDate dataInicio,

        LocalDate dataFim
) {}

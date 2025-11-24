package trabalho.dto;

import trabalho.enums.TipoCampanha;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CampanhaResponseDTO(
        UUID id,
        UUID fornecedorId,
        String fornecedorNome,

        String nome,
        TipoCampanha tipo,

        BigDecimal valorMinimoCompra,
        BigDecimal cashbackValor,

        UUID produtoIdBrinde,
        String produtoNomeBrinde,

        Integer quantidadeMinimaProduto,
        String brindeDescricao,
        BigDecimal percentualDesconto,

        LocalDate dataInicio,
        LocalDate dataFim,

        Boolean ativo
) {}

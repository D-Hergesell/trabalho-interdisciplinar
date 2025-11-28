package trabalho.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import trabalho.enums.TipoCampanha;

public record CampanhaResponseDTO(
        UUID id,
        TipoCampanha tipo,
        String nome,
        BigDecimal valorMinimoCompra,
        BigDecimal cashbackValor,
        UUID produtoIdBrinde,
        Integer quantidadeMinimaProduto,
        String brindeDescricao,
        BigDecimal percentualDesconto,
        LocalDate dataInicio,
        LocalDate dataFim,
        Boolean ativo,
        UUID fornecedorId
) {}

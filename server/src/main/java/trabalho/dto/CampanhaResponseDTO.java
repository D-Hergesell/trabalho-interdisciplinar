package trabalho.dto;

import trabalho.entities.Produto;
import trabalho.enums.TipoCampanha;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CampanhaResponseDTO(
        UUID id,
        String nome,
        TipoCampanha tipo,
        BigDecimal valorMinimoCompra,
        BigDecimal cashbackValor,
        Produto produtoIdBrinde,
        Integer quantidadeMinimaProduto,
        String brindeDescricao,
        BigDecimal percentualDesconto,
        LocalDate dataInicio,
        LocalDate dataFim,
        Boolean ativo,
        UUID fornecedorId,
        String nomeFornecedor
) {}


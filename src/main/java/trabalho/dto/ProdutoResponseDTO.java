package trabalho.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProdutoResponseDTO(
        UUID id,
        String nome,
        String descricao,
        BigDecimal precoBase,
        String unidadeMedida,
        Integer quantidadeEstoque,
        Boolean ativo,

        // Dados "Achatados" para facilitar o Frontend
        // (Configuramos isso no ProdutoMapper)
        UUID fornecedorId,
        String nomeFornecedor,

        UUID categoriaId,
        String nomeCategoria
) {}
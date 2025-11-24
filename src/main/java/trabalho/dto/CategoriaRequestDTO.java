package trabalho.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CategoriaRequestDTO(

        @NotNull(message = "Fornecedor é obrigatório")
        UUID fornecedorId,

        @NotBlank(message = "Nome da categoria é obrigatório")
        String nome,

        String descricao
) {}

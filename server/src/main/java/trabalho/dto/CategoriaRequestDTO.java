package trabalho.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CategoriaRequestDTO(
        @NotBlank(message = "Nome é obrigatório")
        String nome,
        @NotNull(message = "Fornecedor é obrigatório")
        UUID fornecedorId,

        Boolean ativo
) {}


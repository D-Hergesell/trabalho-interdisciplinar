package trabalho.dto;

import java.util.UUID;

public record LojaResponseDTO(
        UUID id,
        String nomeFantasia,
        String razaoSocial,
        String cnpj,
        String emailContato,
        String cidade,
        String estado,
        Boolean ativo,
        UUID lojaMatrizId // Retornamos o ID da matriz para o front saber
) {}
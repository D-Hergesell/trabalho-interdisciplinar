package trabalho.repository;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import trabalho.entities.Fornecedor;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FornecedorRepository extends JpaRepository<Fornecedor, UUID> {
    List<Fornecedor> findByNomeFantasiaContainingIgnoreCase(String nomeFantasia);
    Optional<Fornecedor> findByCnpj(@NotBlank(message = "CNPJ é obrigatório") @Size(min = 14, max = 14, message = "CNPJ deve ter 14 dígitos") String cnpj);
}

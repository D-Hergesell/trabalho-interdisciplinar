package trabalho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import trabalho.entities.Fornecedor;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FornecedorRepository extends JpaRepository<Fornecedor, UUID> {
    Optional<Fornecedor> findByCnpj(String cnpj);
    List<Fornecedor> findByAtivoTrue();
    List<Fornecedor> findByCategorias_NomeContainingIgnoreCase(String nomeCategoria);
}

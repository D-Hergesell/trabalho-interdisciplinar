package trabalho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import trabalho.entities.Fornecedor;
import trabalho.entities.Produto;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, UUID> {
    List<Produto> findByNomeContainingIgnoreCase(String nome);
    List<Produto> findByAtivoTrue();
}

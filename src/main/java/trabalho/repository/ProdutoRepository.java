package trabalho.repository;

import trabalho.entities.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, UUID> {
    List<Produto> findByNomeContainingIgnoreCase(String nome);
    List<Produto> findByFornecedorId(UUID fornecedorId);
    List<Produto> findByCategoriaId(UUID categoriaId);
}

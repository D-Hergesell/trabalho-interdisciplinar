package trabalho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import trabalho.entities.FornecedorCategoriasPivot;
import java.util.UUID;

@Repository
public interface FornecedorCategoriasPivotRepository extends JpaRepository<FornecedorCategoriasPivot, UUID> {
}

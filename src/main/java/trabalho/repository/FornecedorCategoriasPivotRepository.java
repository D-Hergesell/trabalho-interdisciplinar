package trabalho.repository;

import trabalho.entities.FornecedorCategoriasPivot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface FornecedorCategoriasPivotRepository extends JpaRepository<FornecedorCategoriasPivot, UUID> {
}

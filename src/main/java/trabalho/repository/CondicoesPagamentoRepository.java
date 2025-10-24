package trabalho.repository;

import trabalho.entities.CondicoesPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface CondicoesPagamentoRepository extends JpaRepository<CondicoesPagamento, UUID> {
}

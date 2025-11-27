package trabalho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import trabalho.entities.CondicoesPagamento;
import java.util.UUID;

@Repository
public interface CondicoesPagamentoRepository extends JpaRepository<CondicoesPagamento, UUID> {
}

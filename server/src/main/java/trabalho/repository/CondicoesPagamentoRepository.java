package trabalho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import trabalho.entities.CondicoesPagamento;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CondicoesPagamentoRepository extends JpaRepository<CondicoesPagamento, UUID> {

    List<CondicoesPagamento> findByAtivoTrue();

    Optional<CondicoesPagamento> findByFornecedor_IdAndDescricaoIgnoreCase(UUID fornecedorId, String descricao);
}

package trabalho.repository;

import trabalho.entities.CondicoesEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CondicoesEstadoRepository extends JpaRepository<CondicoesEstado, UUID> {
    Optional<CondicoesEstado> findByFornecedorIdAndEstado(UUID fornecedorId, String estado);
}
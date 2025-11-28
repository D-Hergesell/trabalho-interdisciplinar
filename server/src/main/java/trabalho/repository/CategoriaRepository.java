package trabalho.repository;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import trabalho.entities.Categoria;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {
    List<Categoria> findByNomeContainingIgnoreCase(String nome);
    Optional<Object> findByFornecedor_IdAndNomeIgnoreCase(@NotNull(message = "Fornecedor é obrigatório") UUID uuid, @NotBlank(message = "Nome é obrigatório") String nome);
}

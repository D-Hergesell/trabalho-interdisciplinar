package trabalho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import trabalho.entities.Categoria;
import java.util.List;
import java.util.UUID;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {
    List<Categoria> findByNomeContainingIgnoreCase(String nome);
}

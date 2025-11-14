package trabalho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import trabalho.entities.Usuario;

import java.util.List;
import java.util.UUID;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario,UUID> {
    List<Usuario> findByNomeContainingIgnoreCase(String nome);
}

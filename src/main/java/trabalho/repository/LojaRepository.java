package trabalho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import trabalho.entities.Loja;
import java.util.UUID;

@Repository
public interface LojaRepository extends JpaRepository<Loja, UUID>{

}

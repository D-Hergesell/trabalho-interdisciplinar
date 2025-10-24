package trabalho.repository;

import trabalho.entities.Loja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

public interface LojaRepository extends JpaRepository<Loja, UUID>{

}

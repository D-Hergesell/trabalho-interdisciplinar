package trabalho.repository;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import trabalho.entities.Loja;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LojaRepository extends JpaRepository<Loja, UUID>{
    List<Loja> findByNomeFantasiaContainingIgnoreCase(String nomeFantasia);
    Optional<Loja> findByCnpj(@NotBlank(message = "CNPJ é obrigatório") @Size(min = 14, max = 14, message = "CNPJ deve ter 14 dígitos (apenas números)") String cnpj);
    Collection<Loja> findByAtivoTrue();
}

package trabalho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import trabalho.entities.Fornecedor;
import trabalho.entities.Loja;
import trabalho.entities.Pedido;

import java.util.Collection;
import java.util.UUID;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, UUID> {
    Collection<Pedido> findByLoja(Loja loja);
    Collection<Pedido> findByFornecedor(Fornecedor fornecedor);
}

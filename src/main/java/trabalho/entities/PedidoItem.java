package trabalho.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "pedido_itens")
public class PedidoItem {
    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(name = "quantidade", nullable = false)
    private Integer quantidade;

    @Column(name = "preco_unitario_momento", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoUnitarioMomento;

    @Column(name = "ajuste_unitario_aplicado", precision = 10, scale = 2)
    private BigDecimal ajusteUnitarioAplicado;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public BigDecimal getPrecoUnitarioMomento() {
        return precoUnitarioMomento;
    }

    public void setPrecoUnitarioMomento(BigDecimal precoUnitarioMomento) {
        this.precoUnitarioMomento = precoUnitarioMomento;
    }

    public BigDecimal getAjusteUnitarioAplicado() {
        return ajusteUnitarioAplicado;
    }

    public void setAjusteUnitarioAplicado(BigDecimal ajusteUnitarioAplicado) {
        this.ajusteUnitarioAplicado = ajusteUnitarioAplicado;
    }

}
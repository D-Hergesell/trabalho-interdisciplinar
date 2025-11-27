package trabalho.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import trabalho.enums.StatusPedido;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "pedidos", schema = "public")
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "loja_id", nullable = false)
    private Loja loja;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "criado_por_usuario_id", nullable = false)
    private Usuario criadoPorUsuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condicao_pagamento_id")
    private CondicoesPagamento condicaoPagamento;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'PENDENTE'")
    @Column(name = "status", nullable = false, length = 30)
    private StatusPedido status = StatusPedido.PENDENTE;

    @Column(name = "valor_total", precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(
            name = "data_pedido",
            insertable = false,
            updatable = false
    )
    @ColumnDefault("now()")
    private OffsetDateTime dataPedido;

    @OneToMany(
            mappedBy = "pedido",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<PedidoItem> itens = new HashSet<>();

}
package trabalho.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "condicoes_estado", schema = "public", uniqueConstraints = {
        @UniqueConstraint(name = "condicoes_estado_fornecedor_id_estado_key", columnNames = {"fornecedor_id", "estado"})
})
public class CondicoesEstado {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @Column(name = "estado", nullable = false, length = 2)
    private String estado;

    @Column(name = "cashback_percentual", precision = 5, scale = 2)
    private BigDecimal cashbackPercentual;

    @Column(name = "prazo_pagamento_dias")
    private Integer prazoPagamentoDias;

    @Column(name = "ajuste_unitario_aplicado", precision = 10, scale = 2)
    private BigDecimal ajusteUnitarioAplicado;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = false;

}
package trabalho.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

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

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Fornecedor getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(Fornecedor fornecedor) {
        this.fornecedor = fornecedor;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public BigDecimal getCashbackPercentual() {
        return cashbackPercentual;
    }

    public void setCashbackPercentual(BigDecimal cashbackPercentual) {
        this.cashbackPercentual = cashbackPercentual;
    }

    public Integer getPrazoPagamentoDias() {
        return prazoPagamentoDias;
    }

    public void setPrazoPagamentoDias(Integer prazoPagamentoDias) {
        this.prazoPagamentoDias = prazoPagamentoDias;
    }

    public BigDecimal getAjusteUnitarioAplicado() {
        return ajusteUnitarioAplicado;
    }

    public void setAjusteUnitarioAplicado(BigDecimal ajusteUnitarioAplicado) {
        this.ajusteUnitarioAplicado = ajusteUnitarioAplicado;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

}
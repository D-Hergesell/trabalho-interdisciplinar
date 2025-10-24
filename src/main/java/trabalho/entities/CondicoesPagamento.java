package trabalho.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
@Entity
@Table(name = "condicoes_pagamento", schema = "public")
public class CondicoesPagamento {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @Column(name = "descricao", nullable = false)
    private String descricao;

    @Column(name = "prazo_dias")
    private Integer prazoDias;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = false;

}
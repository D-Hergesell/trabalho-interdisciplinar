package trabalho.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
@Entity
@Table(name = "campanhas", schema = "public")
public class Campanha {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "tipo", nullable = false, length = 30)
    private String tipo;

    @Column(name = "valor_minimo_compra", precision = 10, scale = 2)
    private BigDecimal valorMinimoCompra;

    @Column(name = "cashback_valor", precision = 10, scale = 2)
    private BigDecimal cashbackValor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id_brinde")
    private Produto produtoIdBrinde;

    @Column(name = "quantidade_minima_produto")
    private Integer quantidadeMinimaProduto;

    @Lob
    @Column(name = "brinde_descricao")
    private String brindeDescricao;

    @Column(name = "percentual_desconto", precision = 5, scale = 2)
    private BigDecimal percentualDesconto;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = false;

}
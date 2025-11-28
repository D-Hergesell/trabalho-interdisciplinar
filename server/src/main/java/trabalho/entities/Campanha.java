package trabalho.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import trabalho.enums.TipoCampanha;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "campanhas", schema = "public")
public class Campanha {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 30)
    private TipoCampanha tipo;

    @Column(name = "valor_minimo_compra", precision = 10, scale = 2)
    private BigDecimal valorMinimoCompra;

    @Column(name = "cashback_valor", precision = 10, scale = 2)
    private BigDecimal cashbackValor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id_brinde")
    private Produto produtoIdBrinde;

    @Column(name = "quantidade_minima_produto")
    private Integer quantidadeMinimaProduto;

    @Column(name = "brinde_descricao", columnDefinition = "TEXT")
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
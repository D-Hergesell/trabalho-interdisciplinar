package trabalho.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "campanhas")
public class Campanha {
    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedore fornecedor;

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

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = false;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Fornecedore getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(Fornecedore fornecedor) {
        this.fornecedor = fornecedor;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public BigDecimal getValorMinimoCompra() {
        return valorMinimoCompra;
    }

    public void setValorMinimoCompra(BigDecimal valorMinimoCompra) {
        this.valorMinimoCompra = valorMinimoCompra;
    }

    public BigDecimal getCashbackValor() {
        return cashbackValor;
    }

    public void setCashbackValor(BigDecimal cashbackValor) {
        this.cashbackValor = cashbackValor;
    }

    public Produto getProdutoIdBrinde() {
        return produtoIdBrinde;
    }

    public void setProdutoIdBrinde(Produto produtoIdBrinde) {
        this.produtoIdBrinde = produtoIdBrinde;
    }

    public Integer getQuantidadeMinimaProduto() {
        return quantidadeMinimaProduto;
    }

    public void setQuantidadeMinimaProduto(Integer quantidadeMinimaProduto) {
        this.quantidadeMinimaProduto = quantidadeMinimaProduto;
    }

    public String getBrindeDescricao() {
        return brindeDescricao;
    }

    public void setBrindeDescricao(String brindeDescricao) {
        this.brindeDescricao = brindeDescricao;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

}
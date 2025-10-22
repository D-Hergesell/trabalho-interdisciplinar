package trabalho.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "fornecedor_categorias_pivot", schema = "public")
public class FornecedorCategoriasPivot {
    @EmbeddedId
    private FornecedorCategoriasPivotId id;

    @MapsId("fornecedorId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedore fornecedor;

    @MapsId("categoriaId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    public FornecedorCategoriasPivotId getId() {
        return id;
    }

    public void setId(FornecedorCategoriasPivotId id) {
        this.id = id;
    }

    public Fornecedore getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(Fornecedore fornecedor) {
        this.fornecedor = fornecedor;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

}
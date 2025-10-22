package trabalho.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class FornecedorCategoriasPivotId implements Serializable {
    private static final long serialVersionUID = 2807860215651671328L;
    @Column(name = "fornecedor_id", nullable = false)
    private UUID fornecedorId;

    @Column(name = "categoria_id", nullable = false)
    private UUID categoriaId;

    public UUID getFornecedorId() {
        return fornecedorId;
    }

    public void setFornecedorId(UUID fornecedorId) {
        this.fornecedorId = fornecedorId;
    }

    public UUID getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(UUID categoriaId) {
        this.categoriaId = categoriaId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FornecedorCategoriasPivotId entity = (FornecedorCategoriasPivotId) o;
        return Objects.equals(this.fornecedorId, entity.fornecedorId) &&
                Objects.equals(this.categoriaId, entity.categoriaId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(fornecedorId, categoriaId);
    }

}
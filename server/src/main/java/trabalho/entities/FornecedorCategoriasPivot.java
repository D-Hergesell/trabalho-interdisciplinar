package trabalho.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "fornecedor_categorias_pivot", schema = "public")
public class FornecedorCategoriasPivot {
    @EmbeddedId
    private FornecedorCategoriasPivotId id;

    @MapsId("fornecedorId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @MapsId("categoriaId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

}
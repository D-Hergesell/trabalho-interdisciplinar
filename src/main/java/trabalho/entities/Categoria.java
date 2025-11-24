package trabalho.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "categorias", schema = "public", uniqueConstraints = {
        @UniqueConstraint(name = "unique_pai_e_nome", columnNames = {"categoria_pai_id", "nome"})
})
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "categoria_pai_id")
    private Categoria categoriaPai;

    @OneToMany(
            mappedBy = "categoriaPai", // "mapeado pelo" campo 'categoriaPai' na classe Filha
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<Categoria> subCategorias = new HashSet<>();

    @OneToMany(
            mappedBy = "categoria",
            fetch = FetchType.LAZY
    )
    private Set<Produto> produtos = new HashSet<>();

}
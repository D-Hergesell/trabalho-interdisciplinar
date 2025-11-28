package trabalho.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "fornecedores", schema = "public", uniqueConstraints = {
        @UniqueConstraint(name = "fornecedores_cnpj_key", columnNames = {"cnpj"})
})
public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "nome_fantasia", nullable = false)
    private String nomeFantasia;

    @Column(name = "cnpj", nullable = false, length = 14, unique = true)
    private String cnpj;

    @Column(name = "responsavel_nome")
    private String responsavelNome;

    @Column(name = "email_contato")
    private String emailContato;

    @Column(name = "telefone", length = 20)
    private String telefone;

    @Column(name = "cep", length = 8)
    private String cep;

    @Column(name = "logradouro", length = 255)
    private String logradouro;

    @Column(name = "cidade", length = 100)
    private String cidade;

    @Column(name = "estado", length = 2)
    private String estado;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    @ColumnDefault("now()")
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "fornecedor", fetch = FetchType.LAZY)
    private Set<Produto> produtos;

    @OneToMany(mappedBy = "fornecedor", fetch = FetchType.LAZY)
    private Set<Campanha> campanhas;

    @OneToMany(mappedBy = "fornecedor", fetch = FetchType.LAZY)
    private Set<Categoria> categorias;

    @OneToMany(mappedBy = "fornecedor", fetch = FetchType.LAZY)
    private Set<CondicoesEstado> condicoesEstados;

    @OneToMany(mappedBy = "fornecedor", fetch = FetchType.LAZY)
    private Set<Usuario> usuarios;

    @OneToMany(mappedBy = "fornecedor", fetch = FetchType.LAZY)
    private Set<Pedido> pedidos;
}

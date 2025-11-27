package trabalho.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "lojas", schema = "public", uniqueConstraints = {
        @UniqueConstraint(name = "lojas_razao_social_key", columnNames = {"razao_social"}),
        @UniqueConstraint(name = "lojas_cnpj_key", columnNames = {"cnpj"})
})
public class Loja {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "nome_fantasia", nullable = false)
    private String nomeFantasia;

    @Column(name = "cnpj", nullable = false, length = 14)
    private String cnpj;

    @Column(name = "responsavel_nome")
    private String responsavelNome;

    @Column(name = "email_contato")
    private String emailContato;

    @Column(name = "telefone", length = 20)
    private String telefone;

    @Column(name = "cep", length = 8)
    private String cep;

    @Column(name = "logradouro")
    private String logradouro;

    @Column(name = "cidade", length = 100)
    private String cidade;

    @Column(name = "estado", nullable = false, length = 2)
    private String estado;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = false;

    @Column(
            name = "created_at",
            insertable = false,
            updatable = false
    )
    @ColumnDefault("now()")
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "lojaMatriz", fetch = FetchType.LAZY)
    private Set<Loja> filiais;

    @OneToMany(mappedBy = "loja", fetch = FetchType.LAZY)
    private Set<Pedido> pedidos;

    @OneToMany(mappedBy = "loja", fetch = FetchType.LAZY)
    private Set<Usuario> usuarios;

}
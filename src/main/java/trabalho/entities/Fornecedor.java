package trabalho.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Setter
@Getter
@Entity
@Table(name = "fornecedores", schema = "public", uniqueConstraints = {
        @UniqueConstraint(name = "fornecedores_razao_social_key", columnNames = {"razao_social"}),
        @UniqueConstraint(name = "fornecedores_cnpj_key", columnNames = {"cnpj"})
})
public class Fornecedor {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "nome_fantasia", nullable = false)
    private String nomeFantasia;

    @Column(name = "razao_social", nullable = false)
    private String razaoSocial;

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

    @Column(name = "estado", length = 2)
    private String estado;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = false;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

}
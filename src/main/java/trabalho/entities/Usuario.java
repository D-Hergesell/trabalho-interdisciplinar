package trabalho.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Setter
@Getter
@Entity
@Table(name = "usuarios", schema = "public", uniqueConstraints = {
        @UniqueConstraint(name = "usuarios_email_key", columnNames = {"email"})
})
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "nome")
    private String nome;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Column(name = "tipo_usuario", nullable = false, length = 20)
    private String tipoUsuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loja_id")
    private Loja loja;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fornecedor_id")
    private Fornecedor fornecedor;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = false;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

}
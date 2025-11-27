package trabalho.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import trabalho.dto.UsuarioRequestDTO;
import trabalho.dto.UsuarioResponseDTO;
import trabalho.entities.Usuario;
import trabalho.mapper.UsuarioMapper;
import trabalho.repository.UsuarioRepository;
import trabalho.enums.TipoUsuario;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Recebe um DTO, retorna um DTO.
     * Contém a lógica de negócio real.
     */
    @Transactional
    public UsuarioResponseDTO criarUsuario(UsuarioRequestDTO dto) {

        // 1. LÓGICA DE NEGÓCIO: O email já existe?
        if (usuarioRepository.findByEmail(dto.email()).isPresent()) {
            throw new RuntimeException("Email já cadastrado."); // (No futuro, uma exceção customizada)
        }

        // 2. TRADUÇÃO: DTO -> Entidade
        Usuario novoUsuario = usuarioMapper.toEntity(dto);

        // 3. LÓGICA DE NEGÓCIO: Hash da senha (JAMAIS salve texto puro)
        novoUsuario.setSenhaHash(passwordEncoder.encode(dto.senha()));

        // 4. LÓGICA DE NEGÓCIO: Definir padrões
        novoUsuario.setAtivo(true);

        if (dto.tipoUsuario() != null) {
            novoUsuario.setTipoUsuario(dto.tipoUsuario());
        } else {
            // Define um padrão caso não venha nada
            novoUsuario.setTipoUsuario(TipoUsuario.LOJA);
        }

        // 5. SALVAR: O repositório salva a Entidade
        Usuario usuarioSalvo = usuarioRepository.save(novoUsuario);

        // 6. TRADUÇÃO: Entidade -> DTO
        return usuarioMapper.toResponseDTO(usuarioSalvo);
    }

    /**
     * Retorna uma Lista de DTOs, não de Entidades.
     */
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarUsuarios() {
        return usuarioRepository.findAll()
                .stream()
                .map(usuarioMapper::toResponseDTO) // Converte cada Usuario em um UsuarioResponseDTO
                .collect(Collectors.toList());
    }

    /**
     * Retorna uma Lista de DTOs, não de Entidades.
     */
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarUsuariosPorNome(String nome) {
        return usuarioRepository.findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(usuarioMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
        return usuarioMapper.toResponseDTO(usuario);
    }

    @Transactional
    public UsuarioResponseDTO atualizarUsuario(UUID id, UsuarioRequestDTO dto) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        // Atualizações simples
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());

        // Atualiza senha somente se enviada
        if (dto.senha() != null && !dto.senha().isBlank()) {
            usuario.setSenhaHash(passwordEncoder.encode(dto.senha()));
        }

        // Atualiza o tipo do usuário
        if (dto.tipoUsuario() != null) {
            usuario.setTipoUsuario(dto.tipoUsuario());
        }

        Usuario salvo = usuarioRepository.save(usuario);

        return usuarioMapper.toResponseDTO(salvo);
    }

    @Transactional
    public UsuarioResponseDTO atualizarTipoUsuario(UUID id, TipoUsuario tipo) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        // Proteção extra opcional
        if (usuario.getTipoUsuario() == TipoUsuario.ADMIN && tipo != TipoUsuario.ADMIN) {
            throw new RuntimeException("Não é permitido alterar o tipo de um ADMIN.");
        }

        usuario.setTipoUsuario(tipo);

        Usuario salvo = usuarioRepository.save(usuario);
        return usuarioMapper.toResponseDTO(salvo);
    }

    @Transactional
    public void deletarUsuario(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        usuarioRepository.delete(usuario);
    }

}
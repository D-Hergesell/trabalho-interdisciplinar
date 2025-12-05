package trabalho.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import trabalho.dto.UsuarioRequestDTO;
import trabalho.dto.UsuarioResponseDTO;
import trabalho.dto.LoginRequestDTO;
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

    @Transactional
    public UsuarioResponseDTO criarUsuario(UsuarioRequestDTO dto) {

        if (usuarioRepository.findByEmail(dto.email()).isPresent()) {
            throw new RuntimeException("Email já cadastrado.");
        }

        // --- VALIDAÇÃO MANUAL DE SENHA (CRIAÇÃO) ---
        if (dto.senha() == null || dto.senha().isBlank() || dto.senha().length() < 8) {
            throw new RuntimeException("A senha é obrigatória e deve ter no mínimo 8 caracteres.");
        }
        // -------------------------------------------

        Usuario novoUsuario = usuarioMapper.toEntity(dto);
        novoUsuario.setSenhaHash(passwordEncoder.encode(dto.senha()));
        novoUsuario.setAtivo(true);

        if (dto.tipoUsuario() != null) {
            novoUsuario.setTipoUsuario(dto.tipoUsuario());
        } else {
            novoUsuario.setTipoUsuario(TipoUsuario.LOJA);
        }

        Usuario usuarioSalvo = usuarioRepository.save(novoUsuario);
        return usuarioMapper.toResponseDTO(usuarioSalvo);
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO autenticar(LoginRequestDTO loginDTO) {
        Usuario usuario = usuarioRepository.findByEmail(loginDTO.email())
                .orElseThrow(() -> new RuntimeException("Usuário ou senha inválidos"));

        if (!passwordEncoder.matches(loginDTO.senha(), usuario.getSenhaHash())) {
            throw new RuntimeException("Usuário ou senha inválidos");
        }

        if (!usuario.getAtivo()) {
            throw new RuntimeException("Usuário desativado.");
        }

        return usuarioMapper.toResponseDTO(usuario);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarUsuarios() {
        return usuarioRepository.findAll()
                .stream()
                .map(usuarioMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

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

        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());

        // --- VALIDAÇÃO MANUAL DE SENHA (ATUALIZAÇÃO) ---
        // Se vier preenchida, valida tamanho e atualiza. Se vier vazia, ignora.
        if (dto.senha() != null && !dto.senha().isBlank()) {
            if (dto.senha().length() < 8) {
                throw new RuntimeException("A nova senha deve ter no mínimo 8 caracteres.");
            }
            usuario.setSenhaHash(passwordEncoder.encode(dto.senha()));
        }
        // -----------------------------------------------

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
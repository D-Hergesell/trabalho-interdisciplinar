package trabalho.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import trabalho.dto.LojaRequestDTO;
import trabalho.dto.LojaResponseDTO;
import trabalho.entities.Loja;
import trabalho.entities.Usuario;
import trabalho.enums.TipoUsuario;
import trabalho.mapper.LojaMapper;
import trabalho.repository.LojaRepository;
import trabalho.repository.UsuarioRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LojaService {

    private final LojaRepository lojaRepository;
    private final LojaMapper lojaMapper;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    // -----------------------------------------
    // CREATE
    // -----------------------------------------
    @Transactional
    public LojaResponseDTO criarLoja(LojaRequestDTO dto) {

        // Garantir unicidade de CNPJ
        if (lojaRepository.findByCnpj(dto.cnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já cadastrado.");
        }

        Loja novaLoja = lojaMapper.toEntity(dto);

        novaLoja.setAtivo(true);

        Loja lojaSalva = lojaRepository.save(novaLoja);

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(dto.nomeFantasia());
        novoUsuario.setEmail(dto.emailContato());
        novoUsuario.setTipoUsuario(TipoUsuario.LOJA);
        novoUsuario.setAtivo(true);
        novoUsuario.setLoja(lojaSalva); // Vincula à loja criada

        String senhaRaw = (dto.senha() != null && !dto.senha().isBlank()) ? dto.senha() : "12345678";
        novoUsuario.setSenhaHash(passwordEncoder.encode(senhaRaw));

        usuarioRepository.save(novoUsuario);

        return lojaMapper.toResponseDTO(lojaSalva);
    }

    // -----------------------------------------
    // READ - Listar todas
    // -----------------------------------------
    @Transactional(readOnly = true)
    public List<LojaResponseDTO> listarLojas() {
        return lojaRepository.findAll().stream()
                .map(lojaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // -----------------------------------------
    // READ - Buscar por nome
    // -----------------------------------------
    @Transactional(readOnly = true)
    public List<LojaResponseDTO> listarLojasPorNome(String nomeFantasia) {
        return lojaRepository.findByNomeFantasiaContainingIgnoreCase(nomeFantasia).stream()
                .map(lojaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // -----------------------------------------
    // READ - Buscar por ID
    // -----------------------------------------
    @Transactional(readOnly = true)
    public LojaResponseDTO buscarPorId(UUID id) {
        Loja loja = lojaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loja não encontrada."));
        return lojaMapper.toResponseDTO(loja);
    }

    // -----------------------------------------
    // READ - Listar apenas lojas ativas
    // -----------------------------------------
    @Transactional(readOnly = true)
    public List<LojaResponseDTO> listarAtivas() {
        return lojaRepository.findByAtivoTrue().stream()
                .map(lojaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // -----------------------------------------
    // UPDATE
    // -----------------------------------------
    @Transactional
    public LojaResponseDTO atualizarLoja(UUID id, LojaRequestDTO dto) {
        Loja loja = lojaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loja não encontrada."));

        // Atualização de CNPJ com verificação de duplicação
        if (!loja.getCnpj().equals(dto.cnpj())) {
            if (lojaRepository.findByCnpj(dto.cnpj()).isPresent()) {
                throw new RuntimeException("CNPJ já cadastrado.");
            }
            loja.setCnpj(dto.cnpj());
        }

        // Campos simples
        loja.setNomeFantasia(dto.nomeFantasia());
        loja.setEmailContato(dto.emailContato());
        loja.setTelefone(dto.telefone());
        loja.setLogradouro(dto.logradouro());
        loja.setEstado(dto.estado());
        loja.setCidade(dto.cidade());

        if (dto.ativo() != null) {
            loja.setAtivo(dto.ativo());
        }

        Loja atualizada = lojaRepository.save(loja);
        return lojaMapper.toResponseDTO(atualizada);
    }

    // -----------------------------------------
    // DELETE
    // -----------------------------------------
    @Transactional
    public void deletarLoja(UUID id) {

        if (!lojaRepository.existsById(id)) {
            throw new RuntimeException("Loja não encontrada.");
        }

        lojaRepository.deleteById(id);
    }
}

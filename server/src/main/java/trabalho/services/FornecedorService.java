package trabalho.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import trabalho.dto.FornecedorRequestDTO;
import trabalho.dto.FornecedorResponseDTO;
import trabalho.entities.Fornecedor;
import trabalho.entities.Usuario;
import trabalho.enums.TipoUsuario;
import trabalho.mapper.FornecedorMapper;
import trabalho.repository.FornecedorRepository;
import trabalho.repository.UsuarioRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;
    private final FornecedorMapper fornecedorMapper;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public FornecedorResponseDTO criarFornecedor(FornecedorRequestDTO dto) {
        if (fornecedorRepository.findByCnpj(dto.cnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já cadastrado.");
        }

        Fornecedor fornecedor = fornecedorMapper.toEntity(dto);
        fornecedor.setAtivo(true);
        Fornecedor salvo = fornecedorRepository.save(fornecedor);

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(dto.nomeFantasia()); // Usa o nome da empresa
        novoUsuario.setEmail(dto.emailContato());
        novoUsuario.setTipoUsuario(TipoUsuario.FORNECEDOR);
        novoUsuario.setAtivo(true);
        novoUsuario.setFornecedor(salvo); // Vincula ao fornecedor criado

        // Define a senha (usa a enviada ou uma padrão se vier vazia)
        String senhaRaw = (dto.senha() != null && !dto.senha().isBlank()) ? dto.senha() : "12345678";
        novoUsuario.setSenhaHash(passwordEncoder.encode(senhaRaw));

        usuarioRepository.save(novoUsuario);

        return fornecedorMapper.toResponseDTO(salvo);
    }

    @Transactional(readOnly = true)
    public List<FornecedorResponseDTO> listarFornecedores() {
        return fornecedorRepository.findAll().stream()
                .map(fornecedorMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FornecedorResponseDTO> listarAtivos() {
        return fornecedorRepository.findByAtivoTrue().stream()
                .map(fornecedorMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FornecedorResponseDTO> buscarPorCategoria(String nomeCategoria) {
        return fornecedorRepository.findByCategorias_NomeContainingIgnoreCase(nomeCategoria)
                .stream()
                .map(fornecedorMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FornecedorResponseDTO buscarPorId(UUID id) {
        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
        return fornecedorMapper.toResponseDTO(fornecedor);
    }

    @Transactional
    public FornecedorResponseDTO atualizarFornecedor(UUID id, FornecedorRequestDTO dto) {
        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));

        if (!fornecedor.getCnpj().equals(dto.cnpj())) {
            if (fornecedorRepository.findByCnpj(dto.cnpj()).isPresent()) {
                throw new RuntimeException("CNPJ já cadastrado.");
            }
            fornecedor.setCnpj(dto.cnpj());
        }

        fornecedor.setNomeFantasia(dto.nomeFantasia());
        fornecedor.setResponsavelNome(dto.responsavelNome());
        fornecedor.setEmailContato(dto.emailContato());
        fornecedor.setTelefone(dto.telefone());
        fornecedor.setCep(dto.cep());
        fornecedor.setLogradouro(dto.logradouro());
        fornecedor.setCidade(dto.cidade());
        fornecedor.setEstado(dto.estado());

        if (dto.ativo() != null) {
            fornecedor.setAtivo(dto.ativo());
        }

        Fornecedor atualizado = fornecedorRepository.save(fornecedor);
        return fornecedorMapper.toResponseDTO(atualizado);
    }

    @Transactional
    public void deletarFornecedor(UUID id) {
        if (!fornecedorRepository.existsById(id)) {
            throw new RuntimeException("Fornecedor não encontrado.");
        }
        fornecedorRepository.deleteById(id);
    }
}

package trabalho.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import trabalho.dto.FornecedorRequestDTO;
import trabalho.dto.FornecedorResponseDTO;
import trabalho.entities.Fornecedor;
import trabalho.mapper.FornecedorMapper;
import trabalho.repository.FornecedorRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;
    private final FornecedorMapper fornecedorMapper;

    // -----------------------------------------
    // CREATE
    // -----------------------------------------
    @Transactional
    public FornecedorResponseDTO criarFornecedor(FornecedorRequestDTO dto) {

        if (fornecedorRepository.findByCnpj(dto.cnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já cadastrado.");
        }

        Fornecedor novoFornecedor = fornecedorMapper.toEntity(dto);
        novoFornecedor.setAtivo(true); // nasce ativo

        Fornecedor salvo = fornecedorRepository.save(novoFornecedor);
        return fornecedorMapper.toResponseDTO(salvo);
    }

    // -----------------------------------------
    // READ - Listar todos
    // -----------------------------------------
    @Transactional(readOnly = true)
    public List<FornecedorResponseDTO> listarFornecedores() {
        return fornecedorRepository.findAll().stream()
                .map(fornecedorMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // -----------------------------------------
    // READ - Buscar por ID
    // -----------------------------------------
    @Transactional(readOnly = true)
    public FornecedorResponseDTO buscarPorId(UUID id) {
        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));

        return fornecedorMapper.toResponseDTO(fornecedor);
    }

    // -----------------------------------------
    // READ - Buscar por CNPJ
    // -----------------------------------------
    @Transactional(readOnly = true)
    public FornecedorResponseDTO buscarPorCnpj(String cnpj) {
        Fornecedor fornecedor = fornecedorRepository.findByCnpj(cnpj)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado pelo CNPJ."));

        return fornecedorMapper.toResponseDTO(fornecedor);
    }

    // -----------------------------------------
    // READ - Apenas ativos
    // -----------------------------------------
    @Transactional(readOnly = true)
    public List<FornecedorResponseDTO> listarAtivos() {
        return fornecedorRepository.findByAtivoTrue().stream()
                .map(fornecedorMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // -----------------------------------------
    // UPDATE
    // -----------------------------------------
    @Transactional
    public FornecedorResponseDTO atualizarFornecedor(UUID id, FornecedorRequestDTO dto) {

        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));

        // Atualização de CNPJ (verifica duplicação)
        if (!fornecedor.getCnpj().equals(dto.cnpj())) {
            if (fornecedorRepository.findByCnpj(dto.cnpj()).isPresent()) {
                throw new RuntimeException("CNPJ já cadastrado.");
            }
            fornecedor.setCnpj(dto.cnpj());
        }

        // Atualizações simples
        fornecedor.setRazaoSocial(dto.razaoSocial());
        fornecedor.setNomeFantasia(dto.nomeFantasia());
        fornecedor.setEmailContato(dto.emailContato());
        fornecedor.setTelefone(dto.telefone());
        fornecedor.setLogradouro(dto.logradouro());
        fornecedor.setEstado(dto.estado());
        fornecedor.setCidade(dto.cidade());

        Fornecedor atualizado = fornecedorRepository.save(fornecedor);
        return fornecedorMapper.toResponseDTO(atualizado);
    }

    // -----------------------------------------
    // DELETE
    // -----------------------------------------
    @Transactional
    public void deletarFornecedor(UUID id) {

        if (!fornecedorRepository.existsById(id)) {
            throw new RuntimeException("Fornecedor não encontrado.");
        }

        fornecedorRepository.deleteById(id);
    }
}

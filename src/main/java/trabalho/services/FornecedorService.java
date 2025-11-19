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

    @Transactional
    public FornecedorResponseDTO criarFornecedor(FornecedorRequestDTO dto) {
        if (fornecedorRepository.findByCnpj(dto.cnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já cadastrado.");
        }

        Fornecedor novoFornecedor = fornecedorMapper.toEntity(dto);
        novoFornecedor.setAtivo(true); // Regra de negócio: nasce ativo

        Fornecedor salvo = fornecedorRepository.save(novoFornecedor);
        return fornecedorMapper.toResponseDTO(salvo);
    }

    @Transactional(readOnly = true)
    public List<FornecedorResponseDTO> listarFornecedores() {
        return fornecedorRepository.findAll().stream()
                .map(fornecedorMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FornecedorResponseDTO buscarPorId(UUID id) {
        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
        return fornecedorMapper.toResponseDTO(fornecedor);
    }

    // Atualizar e Deletar seguem o mesmo padrão...
}
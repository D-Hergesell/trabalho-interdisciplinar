package trabalho.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import trabalho.dto.CategoriaRequestDTO;
import trabalho.dto.CategoriaResponseDTO;
import trabalho.entities.Categoria;
import trabalho.entities.Fornecedor;
import trabalho.mapper.CategoriaMapper;
import trabalho.repository.CategoriaRepository;
import trabalho.repository.FornecedorRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final FornecedorRepository fornecedorRepository;
    private final CategoriaMapper categoriaMapper;

    @Transactional
    public CategoriaResponseDTO criarCategoria(CategoriaRequestDTO dto) {

        Categoria categoria = categoriaMapper.toEntity(dto);

        // fornecedor obrigatório
        Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
        categoria.setFornecedor(fornecedor);

        categoria.setAtivo(true);

        Categoria salva = categoriaRepository.save(categoria);
        return categoriaMapper.toResponseDTO(salva);
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> listarCategorias() {
        return categoriaRepository.findAll().stream()
                .map(categoriaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoriaResponseDTO buscarPorId(UUID id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada."));
        return categoriaMapper.toResponseDTO(categoria);
    }

    @Transactional
    public CategoriaResponseDTO atualizarCategoria(UUID id, CategoriaRequestDTO dto) {

        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada."));

        categoria.setNome(dto.nome());

        // caso fornecedor seja alterado
        if (!categoria.getFornecedor().getId().equals(dto.fornecedorId())) {
            Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                    .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
            categoria.setFornecedor(fornecedor);
        }

        Categoria atualizada = categoriaRepository.save(categoria);
        return categoriaMapper.toResponseDTO(atualizada);
    }

    @Transactional
    public void deletarCategoria(UUID id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("Categoria não encontrada.");
        }
        categoriaRepository.deleteById(id);
    }
}

package trabalho.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
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

        categoriaRepository
                .findByFornecedor_IdAndNomeIgnoreCase(dto.fornecedorId(), dto.nome())
                .ifPresent(cat -> {
                    throw new RuntimeException("Já existe uma categoria com esse nome para esse fornecedor.");
                });

        Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));

        Categoria categoria = categoriaMapper.toEntity(dto);
        categoria.setFornecedor(fornecedor);
        categoria.setAtivo(true);

        Categoria salva = categoriaRepository.save(categoria);

        return categoriaMapper.toResponseDTO(salva);
    }


    @Transactional
    public List<CategoriaResponseDTO> listarTodas() {
        return categoriaRepository.findAll().stream()
                .map(categoriaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoriaResponseDTO buscarPorId(UUID id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada."));
        return categoriaMapper.toResponseDTO(categoria);
    }

    @Transactional
    public List<CategoriaResponseDTO> buscarPorNome(String nome) {
        return categoriaRepository.findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(categoriaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoriaResponseDTO atualizar(UUID id, CategoriaRequestDTO dto) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("Categoria não encontrada.");
        }

        Categoria cat = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada."));

        if (dto.nome() != null && !dto.nome().isBlank()) {
            cat.setNome(dto.nome());
        }

        Categoria atualizada = categoriaRepository.save(cat);
        return categoriaMapper.toResponseDTO(atualizada);
    }

    @Transactional
    public void deletar(UUID id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("Categoria não encontrada.");
        }
        categoriaRepository.deleteById(id);
    }
}


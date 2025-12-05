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
        // Validação de duplicidade (Nome + Fornecedor)
        categoriaRepository
                .findByFornecedor_IdAndNomeIgnoreCase(dto.fornecedorId(), dto.nome())
                .ifPresent(cat -> {
                    throw new RuntimeException("Já existe uma categoria com esse nome para esse fornecedor.");
                });

        Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));

        Categoria categoria = categoriaMapper.toEntity(dto);
        categoria.setFornecedor(fornecedor);

        // Define ativo como true se vier nulo
        if (categoria.getAtivo() == null) {
            categoria.setAtivo(true);
        }

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
        Categoria cat = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada."));

        // Se mudar de nome, valida duplicidade novamente
        if (!cat.getNome().equalsIgnoreCase(dto.nome())) {
            categoriaRepository
                    .findByFornecedor_IdAndNomeIgnoreCase(dto.fornecedorId(), dto.nome())
                    .ifPresent(existente -> {
                        if (!existente.getId().equals(id)) {
                            throw new RuntimeException("Já existe uma categoria com esse nome para esse fornecedor.");
                        }
                    });
        }

        // Atualiza Fornecedor se mudar (embora raro mudar categoria de fornecedor)
        if (!cat.getFornecedor().getId().equals(dto.fornecedorId())) {
            Fornecedor novoFornecedor = fornecedorRepository.findById(dto.fornecedorId())
                    .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
            cat.setFornecedor(novoFornecedor);
        }

        // MapStruct atualiza campos simples (nome, ativo)
        categoriaMapper.updateFromDTO(dto, cat);

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
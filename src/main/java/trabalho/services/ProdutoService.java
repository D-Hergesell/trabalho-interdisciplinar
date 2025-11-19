package trabalho.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import trabalho.dto.ProdutoRequestDTO;
import trabalho.dto.ProdutoResponseDTO;
import trabalho.entities.Categoria;
import trabalho.entities.Fornecedor;
import trabalho.entities.Produto;
import trabalho.mapper.ProdutoMapper;
import trabalho.repository.CategoriaRepository;
import trabalho.repository.FornecedorRepository;
import trabalho.repository.ProdutoRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final FornecedorRepository fornecedorRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProdutoMapper produtoMapper;

    @Transactional
    public ProdutoResponseDTO criarProduto(ProdutoRequestDTO dto) {

        // 1. Tradução inicial
        Produto produto = produtoMapper.toEntity(dto);

        // 2. Vincular Fornecedor (Obrigatório)
        Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
        produto.setFornecedor(fornecedor);

        // 3. Vincular Categoria (Opcional ou Obrigatório dependendo da regra)
        if (dto.categoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new RuntimeException("Categoria não encontrada."));
            produto.setCategoria(categoria);
        }

        // 4. Padrões
        produto.setAtivo(true);
        if (produto.getQuantidadeEstoque() == null) {
            produto.setQuantidadeEstoque(0);
        }

        Produto salvo = produtoRepository.save(produto);
        return produtoMapper.toResponseDTO(salvo);
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutos() {
        return produtoRepository.findAll().stream()
                .map(produtoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // ... outros métodos CRUD
}
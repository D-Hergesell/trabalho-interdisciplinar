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

    // -------------------------------
    // CREATE
    // -------------------------------
    @Transactional
    public ProdutoResponseDTO criarProduto(ProdutoRequestDTO dto) {

        Produto produto = produtoMapper.toEntity(dto);

        // Fornecedor obrigatório
        Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
        produto.setFornecedor(fornecedor);

        // Categoria opcional
        if (dto.categoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new RuntimeException("Categoria não encontrada."));
            produto.setCategoria(categoria);
        }

        // Defaults
        produto.setAtivo(true);
        if (produto.getQuantidadeEstoque() == null) {
            produto.setQuantidadeEstoque(0);
        }

        Produto salvo = produtoRepository.save(produto);
        return produtoMapper.toResponseDTO(salvo);
    }

    // -------------------------------
    // READ 1 - Listar todos
    // -------------------------------
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutos() {
        return produtoRepository.findAll().stream()
                .map(produtoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // -------------------------------
    // READ 2 - Buscar por ID
    // -------------------------------
    @Transactional(readOnly = true)
    public ProdutoResponseDTO buscarPorId(UUID id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado."));
        return produtoMapper.toResponseDTO(produto);
    }

    // -------------------------------
    // READ 3 - Listar por fornecedor
    // -------------------------------
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarPorFornecedor(UUID fornecedorId) {

        Fornecedor fornecedor = fornecedorRepository.findById(fornecedorId)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));

        return produtoRepository.findByFornecedor(fornecedor).stream()
                .map(produtoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // -------------------------------
    // UPDATE
    // -------------------------------
    @Transactional
    public ProdutoResponseDTO atualizarProduto(UUID id, ProdutoRequestDTO dto) {

        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado."));

        // Atualizações simples
        produto.setNome(dto.nome());
        produto.setDescricao(dto.descricao());
        produto.setPrecoBase(dto.precoBase());
        produto.setQuantidadeEstoque(dto.quantidadeEstoque());

        // Atualizar fornecedor (se enviado)
        if (dto.fornecedorId() != null) {
            Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                    .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
            produto.setFornecedor(fornecedor);
        }

        // Atualizar categoria
        if (dto.categoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new RuntimeException("Categoria não encontrada."));
            produto.setCategoria(categoria);
        }

        Produto salvo = produtoRepository.save(produto);
        return produtoMapper.toResponseDTO(salvo);
    }

    // -------------------------------
    // DELETE
    // -------------------------------
    @Transactional
    public void deletarProduto(UUID id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado."));

        produtoRepository.delete(produto);
    }
}

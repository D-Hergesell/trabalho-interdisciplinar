package trabalho.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trabalho.dto.ProdutoRequestDTO;
import trabalho.dto.ProdutoResponseDTO;
import trabalho.services.ProdutoService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;

    // -----------------------------------------
    // POST - Criar Produto
    // -----------------------------------------
    @PostMapping
    public ResponseEntity<ProdutoResponseDTO> criarProduto(
            @Valid @RequestBody ProdutoRequestDTO dto
    ) {
        ProdutoResponseDTO novoProduto = produtoService.criarProduto(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoProduto);
    }

    // -----------------------------------------
    // GET - Listar todos
    // -----------------------------------------
    @GetMapping
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutos() {
        List<ProdutoResponseDTO> produtos = produtoService.listarProdutos();
        return ResponseEntity.ok(produtos);
    }

    // -----------------------------------------
    // GET - Buscar por ID
    // -----------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    // -----------------------------------------
    // PUT - Atualizar Produto
    // -----------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> atualizarProduto(
            @PathVariable UUID id,
            @Valid @RequestBody ProdutoRequestDTO dto
    ) {
        ProdutoResponseDTO atualizado = produtoService.atualizarProduto(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    // -----------------------------------------
    // DELETE - Remover Produto
    // -----------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        produtoService.deletarProduto(id);
        return ResponseEntity.noContent().build();
    }
}

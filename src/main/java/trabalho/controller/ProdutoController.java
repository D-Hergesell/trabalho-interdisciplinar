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

    @PostMapping
    public ResponseEntity<ProdutoResponseDTO> criarProduto(
            @Valid @RequestBody ProdutoRequestDTO dto
    ) {
        ProdutoResponseDTO novoProduto = produtoService.criarProduto(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoProduto);
    }

    @GetMapping
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutos() {
        List<ProdutoResponseDTO> produtos = produtoService.listarProdutos();
        return ResponseEntity.ok(produtos);
    }

    // Se você implementou buscarPorId no Service:
    /*
    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }
    */

    // Se você implementou atualizar no Service:
    /*
    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> atualizarProduto(
            @PathVariable UUID id,
            @Valid @RequestBody ProdutoRequestDTO dto
    ) {
        ProdutoResponseDTO atualizado = produtoService.atualizarProduto(id, dto);
        return ResponseEntity.ok(atualizado);
    }
    */

    // Se você implementou deletar no Service:
    /*
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        produtoService.deletarProduto(id);
        return ResponseEntity.noContent().build();
    }
    */
}
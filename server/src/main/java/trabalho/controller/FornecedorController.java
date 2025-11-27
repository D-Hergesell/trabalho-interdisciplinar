package trabalho.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trabalho.dto.FornecedorRequestDTO;
import trabalho.dto.FornecedorResponseDTO;
import trabalho.services.FornecedorService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fornecedores")
@RequiredArgsConstructor
public class FornecedorController {

    private final FornecedorService fornecedorService;

    // -----------------------------------------
    // POST - Criar fornecedor
    // -----------------------------------------
    @PostMapping
    public ResponseEntity<FornecedorResponseDTO> criarFornecedor(
            @Valid @RequestBody FornecedorRequestDTO dto
    ) {
        FornecedorResponseDTO novoFornecedor = fornecedorService.criarFornecedor(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoFornecedor);
    }

    // -----------------------------------------
    // GET - Listar todos
    // -----------------------------------------
    @GetMapping
    public ResponseEntity<List<FornecedorResponseDTO>> listarFornecedores() {
        return ResponseEntity.ok(fornecedorService.listarFornecedores());
    }

    // -----------------------------------------
    // GET - Listar somente ativos
    // -----------------------------------------
    @GetMapping("/ativos")
    public ResponseEntity<List<FornecedorResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(fornecedorService.listarAtivos());
    }

    // -----------------------------------------
    // GET - Buscar por ID
    // -----------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<FornecedorResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(fornecedorService.buscarPorId(id));
    }

    // -----------------------------------------
    // GET - Buscar por CNPJ
    // -----------------------------------------
    @GetMapping("/cnpj/{cnpj}")
    public ResponseEntity<FornecedorResponseDTO> buscarPorCnpj(@PathVariable String cnpj) {
        return ResponseEntity.ok(fornecedorService.buscarPorCnpj(cnpj));
    }

    // -----------------------------------------
    // PUT - Atualizar fornecedor
    // -----------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<FornecedorResponseDTO> atualizarFornecedor(
            @PathVariable UUID id,
            @Valid @RequestBody FornecedorRequestDTO dto
    ) {
        FornecedorResponseDTO atualizado = fornecedorService.atualizarFornecedor(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    // -----------------------------------------
    // DELETE - Remover fornecedor
    // -----------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        fornecedorService.deletarFornecedor(id);
        return ResponseEntity.noContent().build();
    }
}

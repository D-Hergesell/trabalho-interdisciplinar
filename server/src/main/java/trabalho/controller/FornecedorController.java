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

    @PostMapping
    public ResponseEntity<FornecedorResponseDTO> criar(@Valid @RequestBody FornecedorRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fornecedorService.criarFornecedor(dto));
    }

    @GetMapping
    public ResponseEntity<List<FornecedorResponseDTO>> listarTudo() {
        return ResponseEntity.ok(fornecedorService.listarFornecedores());
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<FornecedorResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(fornecedorService.listarAtivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FornecedorResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(fornecedorService.buscarPorId(id));
    }

    // -----------------------------------------
    // PUT - Atualizar fornecedor
    // -----------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<FornecedorResponseDTO> atualizar(@PathVariable UUID id, @Valid @RequestBody FornecedorRequestDTO dto) {
        return ResponseEntity.ok(fornecedorService.atualizarFornecedor(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        fornecedorService.deletarFornecedor(id);
        return ResponseEntity.noContent().build();
    }
}

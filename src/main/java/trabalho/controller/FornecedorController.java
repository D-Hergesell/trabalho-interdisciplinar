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
    public ResponseEntity<FornecedorResponseDTO> criarFornecedor(
            @Valid @RequestBody FornecedorRequestDTO dto
    ) {
        FornecedorResponseDTO novoFornecedor = fornecedorService.criarFornecedor(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoFornecedor);
    }

    @GetMapping
    public ResponseEntity<List<FornecedorResponseDTO>> listarFornecedores() {
        List<FornecedorResponseDTO> fornecedores = fornecedorService.listarFornecedores();
        return ResponseEntity.ok(fornecedores);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FornecedorResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(fornecedorService.buscarPorId(id));
    }

    // Assumindo que você criará o metodo atualizar no Service
    /*
    @PutMapping("/{id}")
    public ResponseEntity<FornecedorResponseDTO> atualizarFornecedor(
            @PathVariable UUID id,
            @Valid @RequestBody FornecedorRequestDTO dto
    ) {
        FornecedorResponseDTO atualizado = fornecedorService.atualizarFornecedor(id, dto);
        return ResponseEntity.ok(atualizado);
    }
    */

    // Assumindo que você criará o metodo deletar no Service
    /*
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        fornecedorService.deletarFornecedor(id);
        return ResponseEntity.noContent().build();
    }
    */
}
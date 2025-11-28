package trabalho.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trabalho.dto.LojaRequestDTO;
import trabalho.dto.LojaResponseDTO;
import trabalho.services.LojaService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/lojas")
@RequiredArgsConstructor
public class LojaController {

    private final LojaService lojaService;

    // -----------------------------------------
    // POST - Criar loja
    // -----------------------------------------
    @PostMapping
    public ResponseEntity<LojaResponseDTO> criarLoja(
            @Valid @RequestBody LojaRequestDTO dto
    ) {
        LojaResponseDTO novaLoja = lojaService.criarLoja(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaLoja);
    }

    // -----------------------------------------
    // GET - Listar todas
    // -----------------------------------------
    @GetMapping
    public ResponseEntity<List<LojaResponseDTO>> listarLojas() {
        List<LojaResponseDTO> lojas = lojaService.listarLojas();
        return ResponseEntity.ok(lojas);
    }

    // -----------------------------------------
    // GET - Listar apenas lojas ativas
    // -----------------------------------------
    @GetMapping("/ativas")
    public ResponseEntity<List<LojaResponseDTO>> listarLojasAtivas() {
        return ResponseEntity.ok(lojaService.listarAtivas());
    }

    // -----------------------------------------
    // GET - Buscar por ID
    // -----------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<LojaResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(lojaService.buscarPorId(id));
    }

    // -----------------------------------------
    // PUT - Atualizar loja
    // -----------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<LojaResponseDTO> atualizarLoja(
            @PathVariable UUID id,
            @Valid @RequestBody LojaRequestDTO dto
    ) {
        LojaResponseDTO atualizada = lojaService.atualizarLoja(id, dto);
        return ResponseEntity.ok(atualizada);
    }

    // -----------------------------------------
    // DELETE - Remover loja
    // -----------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        lojaService.deletarLoja(id);
        return ResponseEntity.noContent().build();
    }
}

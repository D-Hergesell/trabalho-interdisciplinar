package trabalho.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trabalho.dto.CampanhaRequestDTO;
import trabalho.dto.CampanhaResponseDTO;
import trabalho.services.CampanhaService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/campanhas")
@RequiredArgsConstructor
public class CampanhaController {

    private final CampanhaService campanhaService;

    @PostMapping
    public ResponseEntity<CampanhaResponseDTO> criar(@Valid @RequestBody CampanhaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(campanhaService.criarCampanha(dto));
    }

    @GetMapping
    public ResponseEntity<List<CampanhaResponseDTO>> listarTudo() {
        return ResponseEntity.ok(campanhaService.listarCampanhas());
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<CampanhaResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(campanhaService.listarCampanhasAtivas());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<CampanhaResponseDTO>> buscarPorNome(@RequestParam String nome) {
        return ResponseEntity.ok(campanhaService.buscarPorNome(nome));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampanhaResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(campanhaService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampanhaResponseDTO> atualizar(@PathVariable UUID id, @Valid @RequestBody CampanhaRequestDTO dto) {
        return ResponseEntity.ok(campanhaService.atualizarCampanha(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        campanhaService.deletarCampanha(id);
        return ResponseEntity.noContent().build();
    }
}

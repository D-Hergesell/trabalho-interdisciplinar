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

    @GetMapping
    public ResponseEntity<List<CampanhaResponseDTO>> listarTodas() {
        return ResponseEntity.ok(campanhaService.listarCampanhas());
    }

    @GetMapping("/ativas")
    public ResponseEntity<List<CampanhaResponseDTO>> listarAtivas() {
        return ResponseEntity.ok(campanhaService.listarAtivas());
    }

    @GetMapping("/nome/{nome}")
    public ResponseEntity<List<CampanhaResponseDTO>> buscarPorNome(@PathVariable String nome) {
        return ResponseEntity.ok(campanhaService.buscarPorNome(nome));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampanhaResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(campanhaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<CampanhaResponseDTO> criar(@Valid @RequestBody CampanhaRequestDTO dto) {
        var criada = campanhaService.criarCampanha(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampanhaResponseDTO> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody CampanhaRequestDTO dto
    ) {
        return ResponseEntity.ok(campanhaService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        campanhaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}


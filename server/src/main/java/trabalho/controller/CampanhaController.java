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
    public ResponseEntity<CampanhaResponseDTO> criarCampanha(
            @Valid @RequestBody CampanhaRequestDTO dto
    ) {
        CampanhaResponseDTO nova = campanhaService.criarCampanha(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nova);
    }

    @GetMapping
    public ResponseEntity<List<CampanhaResponseDTO>> listarCampanhas() {
        return ResponseEntity.ok(campanhaService.listarCampanhas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampanhaResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(campanhaService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampanhaResponseDTO> atualizarCampanha(
            @PathVariable UUID id,
            @Valid @RequestBody CampanhaRequestDTO dto
    ) {
        CampanhaResponseDTO atualizada = campanhaService.atualizarCampanha(id, dto);
        return ResponseEntity.ok(atualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        campanhaService.deletarCampanha(id);
        return ResponseEntity.noContent().build();
    }
}

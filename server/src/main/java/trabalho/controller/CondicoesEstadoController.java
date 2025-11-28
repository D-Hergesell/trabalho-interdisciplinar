package trabalho.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trabalho.dto.CondicoesEstadoRequestDTO;
import trabalho.dto.CondicoesEstadoResponseDTO;
import trabalho.services.CondicoesEstadoService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/condicoes-estado")
@RequiredArgsConstructor
public class CondicoesEstadoController {

    private final CondicoesEstadoService condicoesEstadoService;

    @PostMapping
    public ResponseEntity<CondicoesEstadoResponseDTO> criar(@Valid @RequestBody CondicoesEstadoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(condicoesEstadoService.criarCondicao(dto));
    }

    @GetMapping
    public ResponseEntity<List<CondicoesEstadoResponseDTO>> listarTudo() {
        return ResponseEntity.ok(condicoesEstadoService.listarTudo());
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<CondicoesEstadoResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(condicoesEstadoService.listarAtivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CondicoesEstadoResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(condicoesEstadoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CondicoesEstadoResponseDTO> atualizar(@PathVariable UUID id, @Valid @RequestBody CondicoesEstadoRequestDTO dto) {
        return ResponseEntity.ok(condicoesEstadoService.atualizarCondicao(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        condicoesEstadoService.deletarCondicao(id);
        return ResponseEntity.noContent().build();
    }
}

package trabalho.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trabalho.dto.CondicoesPagamentoRequestDTO;
import trabalho.dto.CondicoesPagamentoResponseDTO;
import trabalho.services.CondicoesPagamentoService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/condicoes-pagamento")
@RequiredArgsConstructor
public class CondicoesPagamentoController {

    private final CondicoesPagamentoService condicoesPagamentoService;

    // CREATE (POST)
    @PostMapping
    public ResponseEntity<CondicoesPagamentoResponseDTO> criar(
            @Valid @RequestBody CondicoesPagamentoRequestDTO dto
    ) {
        CondicoesPagamentoResponseDTO criada = condicoesPagamentoService.criarCondicao(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    // READ (GET) — Listar todos
    @GetMapping
    public ResponseEntity<List<CondicoesPagamentoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(condicoesPagamentoService.listarTodos());
    }

    // READ (GET) — Listar somente ativos
    @GetMapping("/ativos")
    public ResponseEntity<List<CondicoesPagamentoResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(condicoesPagamentoService.listarAtivos());
    }

    // READ (GET) — Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<CondicoesPagamentoResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(condicoesPagamentoService.buscarPorId(id));
    }

    // UPDATE (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<CondicoesPagamentoResponseDTO> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody CondicoesPagamentoRequestDTO dto
    ) {
        CondicoesPagamentoResponseDTO atualizada = condicoesPagamentoService.atualizarPorId(id, dto);
        return ResponseEntity.ok(atualizada);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        condicoesPagamentoService.deletarPorId(id);
        return ResponseEntity.noContent().build();
    }
}

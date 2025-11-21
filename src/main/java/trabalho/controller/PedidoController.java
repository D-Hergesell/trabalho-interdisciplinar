package trabalho.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trabalho.dto.PedidoRequestDTO;
import trabalho.dto.PedidoResponseDTO;
import trabalho.enums.StatusPedido;
import trabalho.services.PedidoService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    // -----------------------------------------
    // POST - Criar Pedido
    // -----------------------------------------
    @PostMapping
    public ResponseEntity<PedidoResponseDTO> criarPedido(
            @Valid @RequestBody PedidoRequestDTO dto
    ) {
        PedidoResponseDTO novoPedido = pedidoService.criarPedido(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoPedido);
    }

    // -----------------------------------------
    // GET - Listar todos os pedidos
    // -----------------------------------------
    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    // -----------------------------------------
    // GET - Buscar por ID
    // -----------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(pedidoService.buscarPorId(id));
    }

    // -----------------------------------------
    // GET - Buscar pedidos por loja
    // -----------------------------------------
    @GetMapping("/loja/{lojaId}")
    public ResponseEntity<List<PedidoResponseDTO>> listarPorLoja(@PathVariable UUID lojaId) {
        return ResponseEntity.ok(pedidoService.listarPorLoja(lojaId));
    }

    // -----------------------------------------
    // GET - Buscar pedidos por fornecedor
    // -----------------------------------------
    @GetMapping("/fornecedor/{fornecedorId}")
    public ResponseEntity<List<PedidoResponseDTO>> listarPorFornecedor(@PathVariable UUID fornecedorId) {
        return ResponseEntity.ok(pedidoService.listarPorFornecedor(fornecedorId));
    }

    // -----------------------------------------
    // PATCH - Atualizar status do pedido
    // -----------------------------------------
    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoResponseDTO> atualizarStatus(
            @PathVariable UUID id,
            @RequestParam StatusPedido status
    ) {
        PedidoResponseDTO atualizado = pedidoService.atualizarStatus(id, status);
        return ResponseEntity.ok(atualizado);
    }

    // -----------------------------------------
    // DELETE - Remover pedido
    // -----------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPedido(@PathVariable UUID id) {
        pedidoService.deletarPedido(id);
        return ResponseEntity.noContent().build();
    }
}

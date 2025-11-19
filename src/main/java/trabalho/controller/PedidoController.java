package trabalho.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trabalho.dto.PedidoRequestDTO;
import trabalho.dto.PedidoResponseDTO;
import trabalho.services.PedidoService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<PedidoResponseDTO> criarPedido(
            @Valid @RequestBody PedidoRequestDTO dto
    ) {
        PedidoResponseDTO novoPedido = pedidoService.criarPedido(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoPedido);
    }

    // Endpoint para o Painel da Loja ou Fornecedor (Listar tudo)
    /*
    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidos() {
        List<PedidoResponseDTO> pedidos = pedidoService.listarPedidos();
        return ResponseEntity.ok(pedidos);
    }
    */

    // Endpoint para buscar detalhes de um pedido específico
    /*
    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(pedidoService.buscarPorId(id));
    }
    */

    // Exemplo de Endpoint de Ação Específica (Bônus)
    /*
    @PatchMapping("/{id}/entregar")
    public ResponseEntity<PedidoResponseDTO> marcarComoEntregue(@PathVariable UUID id) {
        PedidoResponseDTO atualizado = pedidoService.confirmarEntrega(id);
        return ResponseEntity.ok(atualizado);
    }
    */
}
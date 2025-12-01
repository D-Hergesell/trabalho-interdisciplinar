package trabalho.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trabalho.dto.LoginRequestDTO;
import trabalho.dto.UsuarioResponseDTO;
import trabalho.services.UsuarioService;

@RestController
@RequestMapping("/auth") // Prefixo da rota
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<UsuarioResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginDTO) {
        UsuarioResponseDTO usuarioLogado = usuarioService.autenticar(loginDTO);
        return ResponseEntity.ok(usuarioLogado);
    }
}
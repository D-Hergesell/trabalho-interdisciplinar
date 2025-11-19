package trabalho.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import trabalho.dto.LojaRequestDTO;
import trabalho.dto.LojaResponseDTO;
import trabalho.entities.Loja;
import trabalho.mapper.LojaMapper;
import trabalho.repository.LojaRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LojaService {

    private final LojaRepository lojaRepository;
    private final LojaMapper lojaMapper;

    @Transactional
    public LojaResponseDTO criarLoja(LojaRequestDTO dto) {
        // 1. Validação de Unicidade
        if (lojaRepository.findByCnpj(dto.cnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já cadastrado.");
        }

        // 2. Conversão
        Loja novaLoja = lojaMapper.toEntity(dto);

        // 3. Lógica de Matriz (Recursividade)
        if (dto.lojaMatrizId() != null) {
            Loja matriz = lojaRepository.findById(dto.lojaMatrizId())
                    .orElseThrow(() -> new RuntimeException("Loja Matriz não encontrada."));
            novaLoja.setLojaMatriz(matriz);
        }

        // 4. Padrões
        novaLoja.setAtivo(true);

        // 5. Salvar
        Loja lojaSalva = lojaRepository.save(novaLoja);

        return lojaMapper.toResponseDTO(lojaSalva);
    }

    @Transactional(readOnly = true)
    public List<LojaResponseDTO> listarLojas() {
        return lojaRepository.findAll().stream()
                .map(lojaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LojaResponseDTO buscarPorId(UUID id) {
        Loja loja = lojaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loja não encontrada."));
        return lojaMapper.toResponseDTO(loja);
    }

    @Transactional
    public LojaResponseDTO atualizarLoja(UUID id, LojaRequestDTO dto) {
        Loja loja = lojaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loja não encontrada."));

        // Atualiza campos simples via Mapper ou setters manuais
        // Exemplo manual para controle total:
        loja.setNomeFantasia(dto.nomeFantasia());
        loja.setRazaoSocial(dto.razaoSocial());
        loja.setEmailContato(dto.emailContato());
        // ... outros campos ...

        Loja atualizada = lojaRepository.save(loja);
        return lojaMapper.toResponseDTO(atualizada);
    }

    @Transactional
    public void deletarLoja(UUID id) {
        if (!lojaRepository.existsById(id)) {
            throw new RuntimeException("Loja não encontrada.");
        }
        lojaRepository.deleteById(id);
    }
}
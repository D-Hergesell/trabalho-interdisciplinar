package trabalho.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import trabalho.dto.CondicoesPagamentoRequestDTO;
import trabalho.dto.CondicoesPagamentoResponseDTO;
import trabalho.entities.CondicoesPagamento;
import trabalho.repository.CondicoesPagamentoRepository;
import trabalho.repository.FornecedorRepository;
import trabalho.mapper.CondicoesPagamentoMapper;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CondicoesPagamentoService {

    private final CondicoesPagamentoRepository condicoesPagamentoRepository;
    private final FornecedorRepository fornecedorRepository;
    private final CondicoesPagamentoMapper condicoesPagamentoMapper;

    // -----------------------------------------
    // CREATE — registrar uma condição pro fornecedor
    // -----------------------------------------
    @Transactional
    public CondicoesPagamentoResponseDTO criarCondicao(CondicoesPagamentoRequestDTO dto) {

        CondicoesPagamento condicao = condicoesPagamentoMapper.toEntity(dto);

        // Fornecedor existe?
        condicao.setFornecedor(
                fornecedorRepository.findById(dto.fornecedorId())
                        .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."))
        );

        // Evitar duplicidade da mesma descrição pro fornecedor
        if (condicoesPagamentoRepository.findByFornecedor_IdAndDescricaoIgnoreCase(dto.fornecedorId(), dto.descricao()).isPresent()) {
            throw new RuntimeException("Já existe uma condição de pagamento com essa descrição para esse fornecedor.");
        }

        CondicoesPagamento salvo = condicoesPagamentoRepository.save(condicao);
        return condicoesPagamentoMapper.toResponseDTO(salvo);
    }

    // -----------------------------------------
    // READ — listar todas
    // -----------------------------------------
    @Transactional(readOnly = true)
    public List<CondicoesPagamentoResponseDTO> listarTodos() {
        return condicoesPagamentoRepository.findAll().stream()
                .map(condicoesPagamentoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // -----------------------------------------
    // READ — listar apenas ativos
    // -----------------------------------------
    @Transactional(readOnly = true)
    public List<CondicoesPagamentoResponseDTO> listarAtivos() {
        return condicoesPagamentoRepository.findByAtivoTrue().stream()
                .map(condicoesPagamentoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // READ BY ID (GET)
    @Transactional(readOnly = true)
    public CondicoesPagamentoResponseDTO buscarPorId(UUID id) {

        // 1. Busca a condição no banco
        CondicoesPagamento condicao = condicoesPagamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condição de pagamento não encontrada."));

        // 2. Converte entity -> response DTO
        return condicoesPagamentoMapper.toResponseDTO(condicao);
    }

    // -----------------------------------------
    // UPDATE por ID — Atualizar por ID
    // -----------------------------------------
    @Transactional
    public CondicoesPagamentoResponseDTO atualizarPorId(UUID id, CondicoesPagamentoRequestDTO dto) {

        CondicoesPagamento condicao = condicoesPagamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condição de pagamento não encontrada."));

        // Atualiza descrição somente se mudar e não conflitar
        if (!condicao.getDescricao().equalsIgnoreCase(dto.descricao())) {
            condicoesPagamentoRepository.findByFornecedor_IdAndDescricaoIgnoreCase(dto.fornecedorId(), dto.descricao())
                    .ifPresent(duplicada -> {
                        if (!duplicada.getId().equals(condicao.getId())) {
                            throw new RuntimeException("Já existe outra condição de pagamento com essa descrição para esse fornecedor.");
                        }
                    });
            condicao.setDescricao(dto.descricao());
        }

        condicao.setPrazoDias(dto.prazoDias());

        if (dto.ativo() != null) {
            condicao.setAtivo(dto.ativo());
        }

        CondicoesPagamento salvo = condicoesPagamentoRepository.save(condicao);
        return condicoesPagamentoMapper.toResponseDTO(salvo);
    }

    // -----------------------------------------
    // DELETE por ID — Apagar condição
    // -----------------------------------------
    @Transactional
    public void deletarPorId(UUID id) {
        if (!condicoesPagamentoRepository.existsById(id)) {
            throw new RuntimeException("Condição de pagamento não encontrada.");
        }
        condicoesPagamentoRepository.deleteById(id);
    }
}

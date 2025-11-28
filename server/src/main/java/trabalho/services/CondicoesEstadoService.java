package trabalho.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import trabalho.dto.CondicoesEstadoRequestDTO;
import trabalho.dto.CondicoesEstadoResponseDTO;
import trabalho.entities.CondicoesEstado;
import trabalho.entities.Fornecedor;
import trabalho.mapper.CondicoesEstadoMapper;
import trabalho.repository.CondicoesEstadoRepository;
import trabalho.repository.FornecedorRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CondicoesEstadoService {

    private final CondicoesEstadoRepository condicoesEstadoRepository;
    private final FornecedorRepository fornecedorRepository;
    private final CondicoesEstadoMapper condicoesEstadoMapper;

    @Transactional
    public CondicoesEstadoResponseDTO criarCondicao(CondicoesEstadoRequestDTO dto) {
        CondicoesEstado entity = condicoesEstadoMapper.toEntity(dto);

        Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
        entity.setFornecedor(fornecedor);

        entity.setAtivo(true);

        CondicoesEstado salvo = condicoesEstadoRepository.save(entity);
        return condicoesEstadoMapper.toResponseDTO(salvo);
    }

    @Transactional(readOnly = true)
    public List<CondicoesEstadoResponseDTO> listarTudo() {
        return condicoesEstadoRepository.findAll().stream()
                .map(condicoesEstadoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CondicoesEstadoResponseDTO> listarAtivos() {
        return condicoesEstadoRepository.findByAtivoTrue().stream()
                .map(condicoesEstadoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CondicoesEstadoResponseDTO buscarPorId(UUID id) {
        CondicoesEstado condicao = condicoesEstadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condição de estado não encontrada."));
        return condicoesEstadoMapper.toResponseDTO(condicao);
    }

    @Transactional
    public CondicoesEstadoResponseDTO atualizarCondicao(UUID id, CondicoesEstadoRequestDTO dto) {

        CondicoesEstado condicao = condicoesEstadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condição de estado não encontrada."));

        if (!condicao.getFornecedor().getId().equals(dto.fornecedorId())
                || !condicao.getEstado().equalsIgnoreCase(dto.estado())) {

            condicoesEstadoRepository.findByFornecedor_IdAndEstado(dto.fornecedorId(), dto.estado())
                    .ifPresent(outra -> {
                        if (!outra.getId().equals(condicao.getId())) {
                            throw new RuntimeException("Já existe uma condição ativa cadastrada para esse estado neste fornecedor.");
                        }
                    });
        }


        condicao.setCashbackPercentual(dto.cashbackPercentual());
        condicao.setAjusteUnitarioAplicado(dto.ajusteUnitarioAplicado());
        condicao.setPrazoPagamentoDias(dto.prazoPagamentoDias());
        condicao.setAtivo(dto.ativo());

        CondicoesEstado atualizado = condicoesEstadoRepository.save(condicao);

        return condicoesEstadoMapper.toResponseDTO(atualizado);
    }


    @Transactional
    public void deletarCondicao(UUID id) {
        if (!condicoesEstadoRepository.existsById(id)) {
            throw new RuntimeException("Condição de estado não encontrada.");
        }
        condicoesEstadoRepository.deleteById(id);
    }
}

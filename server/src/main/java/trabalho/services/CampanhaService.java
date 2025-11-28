package trabalho.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import trabalho.dto.CampanhaRequestDTO;
import trabalho.dto.CampanhaResponseDTO;
import trabalho.enums.TipoCampanha;
import trabalho.mapper.CampanhaMapper;
import trabalho.repository.CampanhaRepository;
import trabalho.repository.FornecedorRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CampanhaService {

    private final CampanhaRepository campanhaRepository;
    private final FornecedorRepository fornecedorRepository;
    private final CampanhaMapper campanhaMapper;

    @Transactional
    public CampanhaResponseDTO criarCampanha(CampanhaRequestDTO dto) {

        var fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));

        var campanha = campanhaMapper.toEntity(dto);
        campanha.setFornecedor(fornecedor);
        campanha.setAtivo(true);

        var salva = campanhaRepository.save(campanha);
        return campanhaMapper.toResponseDTO(salva);
    }

    @Transactional(readOnly = true)
    public List<CampanhaResponseDTO> listarCampanhas() {
        return campanhaRepository.findAll().stream()
                .map(campanhaMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CampanhaResponseDTO> listarAtivas() {
        return campanhaRepository.findByAtivoTrue().stream()
                .map(campanhaMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CampanhaResponseDTO> buscarPorNome(String nome) {
        return campanhaRepository.findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(campanhaMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CampanhaResponseDTO buscarPorId(UUID id) {
        var campanha = campanhaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campanha não encontrada."));
        return campanhaMapper.toResponseDTO(campanha);
    }

    @Transactional
    public CampanhaResponseDTO atualizar(UUID id, CampanhaRequestDTO dto) {

        var campanha = campanhaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campanha não encontrada."));

        // atualiza apenas os campos enviados
        campanha.setNome(dto.nome());
        campanha.setTipo(dto.tipo()); //arrumar
        campanha.setValorMinimoCompra(dto.valorMinimoCompra());
        campanha.setCashbackValor(dto.cashbackValor());
        campanha.setProdutoIdBrinde(dto.produtoIdBrinde());
        campanha.setQuantidadeMinimaProduto(dto.quantidadeMinimaProduto());
        campanha.setBrindeDescricao(dto.brindeDescricao());
        campanha.setPercentualDesconto(dto.percentualDesconto());
        campanha.setDataInicio(dto.dataInicio());
        campanha.setDataFim(dto.dataFim());

        // se o fornecedor foi alterado, atualiza relação
        if (dto.fornecedorId() != null &&
                !campanha.getFornecedor().getId().equals(dto.fornecedorId())) {

            var fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                    .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
            campanha.setFornecedor(fornecedor);
        }

        var salva = campanhaRepository.save(campanha);
        return campanhaMapper.toResponseDTO(salva);
    }

    @Transactional
    public void deletar(UUID id) {
        if (!campanhaRepository.existsById(id)) {
            throw new RuntimeException("Campanha não encontrada.");
        }
        campanhaRepository.deleteById(id);
    }
}


package trabalho.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import trabalho.dto.CampanhaRequestDTO;
import trabalho.dto.CampanhaResponseDTO;
import trabalho.entities.Campanha;
import trabalho.entities.Fornecedor;
import trabalho.entities.Produto;
import trabalho.mapper.CampanhaMapper;
import trabalho.repository.CampanhaRepository;
import trabalho.repository.FornecedorRepository;
import trabalho.repository.ProdutoRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CampanhaService {

    private final CampanhaRepository campanhaRepository;
    private final FornecedorRepository fornecedorRepository;
    private final ProdutoRepository produtoRepository;
    private final CampanhaMapper campanhaMapper;

    @Transactional
    public CampanhaResponseDTO criarCampanha(CampanhaRequestDTO dto) {

        Campanha campanha = campanhaMapper.toEntity(dto);

        // fornecedor obrigatório
        Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
        campanha.setFornecedor(fornecedor);

        // produto brinde opcional
        if (dto.produtoIdBrinde() != null) {
            Produto produto = produtoRepository.findById(dto.produtoIdBrinde())
                    .orElseThrow(() -> new RuntimeException("Produto de brinde não encontrado."));
            campanha.setProdutoIdBrinde(produto);
        }

        campanha.setAtivo(true);

        Campanha salva = campanhaRepository.save(campanha);
        return campanhaMapper.toResponseDTO(salva);
    }

    @Transactional(readOnly = true)
    public List<CampanhaResponseDTO> listarCampanhas() {
        return campanhaRepository.findAll().stream()
                .map(campanhaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CampanhaResponseDTO buscarPorId(UUID id) {
        Campanha campanha = campanhaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campanha não encontrada."));
        return campanhaMapper.toResponseDTO(campanha);
    }

    @Transactional
    public CampanhaResponseDTO atualizarCampanha(UUID id, CampanhaRequestDTO dto) {

        Campanha campanha = campanhaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campanha não encontrada."));

        campanha.setNome(dto.nome());
        campanha.setTipo(dto.tipo());
        campanha.setValorMinimoCompra(dto.valorMinimoCompra());
        campanha.setCashbackValor(dto.cashbackValor());
        campanha.setQuantidadeMinimaProduto(dto.quantidadeMinimaProduto());
        campanha.setBrindeDescricao(dto.brindeDescricao());
        campanha.setPercentualDesconto(dto.percentualDesconto());
        campanha.setDataInicio(dto.dataInicio());
        campanha.setDataFim(dto.dataFim());

        // atualizar fornecedor se mudar
        if (!campanha.getFornecedor().getId().equals(dto.fornecedorId())) {
            Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                    .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
            campanha.setFornecedor(fornecedor);
        }

        // atualizar brinde
        if (dto.produtoIdBrinde() != null) {
            Produto produto = produtoRepository.findById(dto.produtoIdBrinde())
                    .orElseThrow(() -> new RuntimeException("Produto de brinde não encontrado."));
            campanha.setProdutoIdBrinde(produto);
        } else {
            campanha.setProdutoIdBrinde(null);
        }

        Campanha atualizada = campanhaRepository.save(campanha);
        return campanhaMapper.toResponseDTO(atualizada);
    }

    @Transactional
    public void deletarCampanha(UUID id) {
        if (!campanhaRepository.existsById(id)) {
            throw new RuntimeException("Campanha não encontrada.");
        }
        campanhaRepository.deleteById(id);
    }
}

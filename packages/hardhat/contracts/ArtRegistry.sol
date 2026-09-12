// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721Enumerable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { GovBrIdentity } from "./GovBrIdentity.sol";

/**
 * @title ArtRegistry
 * @notice Registro de obras de arte tokenizadas com prova de autoria civil e lastro legal.
 *
 * Ciclo de vida de uma obra:
 *   SUBMETIDA  -> o autor (com identidade gov.br ativa) tokeniza a obra. Nesse momento a autoria
 *                 ainda NAO tem reconhecimento legal: e apenas uma declaracao carimbada no tempo.
 *   EM_ANALISE -> o agente autonomo abriu o processo de registro autoral.
 *   REGISTRADA -> o processo foi concluido. A obra ganha um contrato ricardiano (texto juridico
 *                 cujo hash fica na chain) e a lista de jurisdicoes onde a titularidade e oponivel.
 *   REJEITADA  -> o processo foi indeferido.
 *
 * Direito de sequencia (Lei 9.610/98, art. 38): o autor tem direito irrenunciavel e inalienavel
 * de receber no minimo 5% sobre o AUMENTO do preco verificado em cada revenda. Por isso a obra so
 * circula pelo marketplace registrado: fora dele nao ha como apurar a mais-valia nem reter o
 * percentual, e o direito seria burlado.
 */
contract ArtRegistry is ERC721Enumerable, Ownable {
    enum Status {
        NONE,
        SUBMETIDA,
        EM_ANALISE,
        REGISTRADA,
        REJEITADA
    }

    /// @notice Situacao da titularidade em cada pais.
    enum Coverage {
        PENDENTE, // processo local ainda nao concluido
        RECONHECIDA, // titularidade oponivel a terceiros
        NAO_COBERTA // exige providencia local que ainda nao foi tomada
    }

    struct Work {
        address creator; // autor original - nunca muda, mesmo apos revendas
        Status status;
        uint16 year;
        uint64 submittedAt;
        string title;
        string technique;
        string imageURI;
        string metadataURI;
        bytes32 fileHash; // sha256 do arquivo original enviado pelo autor
    }

    struct LegalRecord {
        string dossierNumber; // numero do processo administrativo
        string authority; // orgao registrador
        string opinionSummary; // resumo do parecer emitido pelo agente
        string ricardianURI; // texto integral do contrato ricardiano
        bytes32 ricardianHash; // hash do texto - torna o contrato imutavel
        uint64 registeredAt;
        uint16 resaleRoyaltyBps; // direito de sequencia, em basis points
    }

    struct Jurisdiction {
        string code; // ISO 3166-1 alfa-2
        string name;
        Coverage coverage;
        string basis; // fundamento juridico ou pendencia
    }

    struct RegistrationInput {
        string dossierNumber;
        string authority;
        string opinionSummary;
        string ricardianURI;
        bytes32 ricardianHash;
        uint16 resaleRoyaltyBps;
    }

    /// @notice Piso legal do direito de sequencia (art. 38: "no minimo cinco por cento").
    uint16 public constant MIN_RESALE_ROYALTY_BPS = 500;

    GovBrIdentity public immutable identity;

    /// @notice Agente autonomo autorizado a conduzir os processos de registro.
    address public legalAgent;
    /// @notice Unico contrato autorizado a movimentar as obras.
    address public marketplace;

    uint256 private _nextTokenId = 1;

    mapping(uint256 => Work) private _works;
    mapping(uint256 => LegalRecord) private _legalRecords;
    mapping(uint256 => Jurisdiction[]) private _jurisdictions;

    event LegalAgentUpdated(address indexed previousAgent, address indexed newAgent);
    event MarketplaceUpdated(address indexed previousMarketplace, address indexed newMarketplace);
    event WorkSubmitted(
        uint256 indexed tokenId,
        address indexed creator,
        string title,
        bytes32 fileHash,
        string imageURI
    );
    event DossierOpened(uint256 indexed tokenId, string dossierNumber, string authority);
    event WorkRegistered(
        uint256 indexed tokenId,
        address indexed creator,
        string dossierNumber,
        bytes32 ricardianHash,
        uint16 resaleRoyaltyBps
    );
    event WorkRejected(uint256 indexed tokenId, string reason);

    error NotLegalAgent();
    error UnknownWork(uint256 tokenId);
    error InvalidStatus(Status current, Status expected);
    error RoyaltyBelowLegalFloor(uint16 provided);
    error TransferNotAllowed(uint256 tokenId);
    error EmptyField(string field);

    modifier onlyLegalAgent() {
        if (msg.sender != legalAgent) revert NotLegalAgent();
        _;
    }

    constructor(
        address initialOwner,
        GovBrIdentity identity_,
        address legalAgent_
    ) ERC721("Obra Registrada", "OBRA") Ownable(initialOwner) {
        identity = identity_;
        legalAgent = legalAgent_;
        emit LegalAgentUpdated(address(0), legalAgent_);
    }

    function setLegalAgent(address newAgent) external onlyOwner {
        emit LegalAgentUpdated(legalAgent, newAgent);
        legalAgent = newAgent;
    }

    function setMarketplace(address newMarketplace) external onlyOwner {
        emit MarketplaceUpdated(marketplace, newMarketplace);
        marketplace = newMarketplace;
    }

    // --------------------------------------------------------------------
    // Autor
    // --------------------------------------------------------------------

    /**
     * @notice Tokeniza uma obra. Exige identidade gov.br ativa: sem autor civil identificado
     *         nao ha processo de registro autoral possivel.
     * @return tokenId identificador da obra.
     */
    function submitWork(
        string calldata title,
        string calldata technique,
        uint16 year,
        string calldata imageURI,
        string calldata metadataURI,
        bytes32 fileHash
    ) external returns (uint256 tokenId) {
        identity.requireVerified(msg.sender);
        if (bytes(title).length == 0) revert EmptyField("title");
        if (bytes(imageURI).length == 0) revert EmptyField("imageURI");

        tokenId = _nextTokenId++;

        _works[tokenId] = Work({
            creator: msg.sender,
            status: Status.SUBMETIDA,
            year: year,
            submittedAt: uint64(block.timestamp),
            title: title,
            technique: technique,
            imageURI: imageURI,
            metadataURI: metadataURI,
            fileHash: fileHash
        });

        _safeMint(msg.sender, tokenId);

        // Evento observado pelo agente autonomo: e ele quem dispara o processo legal.
        emit WorkSubmitted(tokenId, msg.sender, title, fileHash, imageURI);
    }

    // --------------------------------------------------------------------
    // Agente autonomo
    // --------------------------------------------------------------------

    /// @notice Protocola o processo de registro. Passo intermediario, auditavel na chain.
    function openDossier(
        uint256 tokenId,
        string calldata dossierNumber,
        string calldata authority
    ) external onlyLegalAgent {
        Work storage work = _works[tokenId];
        if (work.status == Status.NONE) revert UnknownWork(tokenId);
        if (work.status != Status.SUBMETIDA) revert InvalidStatus(work.status, Status.SUBMETIDA);

        work.status = Status.EM_ANALISE;
        _legalRecords[tokenId].dossierNumber = dossierNumber;
        _legalRecords[tokenId].authority = authority;

        emit DossierOpened(tokenId, dossierNumber, authority);
    }

    /**
     * @notice Conclui o processo: grava o contrato ricardiano e as jurisdicoes cobertas.
     *         A partir daqui a titularidade e reconhecida e a obra pode ser negociada.
     */
    function registerWork(
        uint256 tokenId,
        RegistrationInput calldata input,
        Jurisdiction[] calldata jurisdictions
    ) external onlyLegalAgent {
        Work storage work = _works[tokenId];
        if (work.status == Status.NONE) revert UnknownWork(tokenId);
        if (work.status != Status.EM_ANALISE) revert InvalidStatus(work.status, Status.EM_ANALISE);
        if (input.resaleRoyaltyBps < MIN_RESALE_ROYALTY_BPS) revert RoyaltyBelowLegalFloor(input.resaleRoyaltyBps);
        if (input.ricardianHash == bytes32(0)) revert EmptyField("ricardianHash");

        work.status = Status.REGISTRADA;

        LegalRecord storage record = _legalRecords[tokenId];
        record.dossierNumber = input.dossierNumber;
        record.authority = input.authority;
        record.opinionSummary = input.opinionSummary;
        record.ricardianURI = input.ricardianURI;
        record.ricardianHash = input.ricardianHash;
        record.registeredAt = uint64(block.timestamp);
        record.resaleRoyaltyBps = input.resaleRoyaltyBps;

        delete _jurisdictions[tokenId];
        for (uint256 i = 0; i < jurisdictions.length; i++) {
            _jurisdictions[tokenId].push(jurisdictions[i]);
        }

        emit WorkRegistered(tokenId, work.creator, input.dossierNumber, input.ricardianHash, input.resaleRoyaltyBps);
    }

    function rejectWork(uint256 tokenId, string calldata reason) external onlyLegalAgent {
        Work storage work = _works[tokenId];
        if (work.status == Status.NONE) revert UnknownWork(tokenId);
        if (work.status == Status.REGISTRADA) revert InvalidStatus(work.status, Status.EM_ANALISE);

        work.status = Status.REJEITADA;
        emit WorkRejected(tokenId, reason);
    }

    // --------------------------------------------------------------------
    // Leitura
    // --------------------------------------------------------------------

    function workOf(uint256 tokenId) external view returns (Work memory) {
        if (_works[tokenId].status == Status.NONE) revert UnknownWork(tokenId);
        return _works[tokenId];
    }

    function legalRecordOf(uint256 tokenId) external view returns (LegalRecord memory) {
        return _legalRecords[tokenId];
    }

    function jurisdictionsOf(uint256 tokenId) external view returns (Jurisdiction[] memory) {
        return _jurisdictions[tokenId];
    }

    function statusOf(uint256 tokenId) external view returns (Status) {
        return _works[tokenId].status;
    }

    function creatorOf(uint256 tokenId) external view returns (address) {
        return _works[tokenId].creator;
    }

    function isRegistered(uint256 tokenId) public view returns (bool) {
        return _works[tokenId].status == Status.REGISTRADA;
    }

    /**
     * @notice Calcula o direito de sequencia devido numa revenda.
     * @dev Deliberadamente NAO seguimos o ERC-2981: aquele padrao calcula royalty sobre o preco
     *      cheio da venda, enquanto o art. 38 da Lei 9.610/98 manda calcular sobre o aumento do
     *      preco ("mais-valia"). Se nao houve valorizacao, nada e devido.
     * @param previousPrice preco pago pelo vendedor atual quando adquiriu a obra.
     * @param newPrice preco da revenda.
     */
    function resaleRoyalty(
        uint256 tokenId,
        address seller,
        uint256 previousPrice,
        uint256 newPrice
    ) external view returns (address beneficiary, uint256 amount) {
        Work storage work = _works[tokenId];
        beneficiary = work.creator;

        // A primeira alienacao feita pelo proprio autor nao gera direito de sequencia:
        // o direito incide sobre a REVENDA de obra que o autor ja alienou.
        if (seller == work.creator || newPrice <= previousPrice) {
            return (beneficiary, 0);
        }

        amount = ((newPrice - previousPrice) * _legalRecords[tokenId].resaleRoyaltyBps) / 10_000;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        string memory uri = _works[tokenId].metadataURI;
        return bytes(uri).length > 0 ? uri : _works[tokenId].imageURI;
    }

    /// @notice Obras de um titular, para montar a carteira no frontend.
    function tokensOfOwner(address account) external view returns (uint256[] memory tokenIds) {
        uint256 count = balanceOf(account);
        tokenIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(account, i);
        }
    }

    /// @notice Acervo completo. Em escala real isso viraria indexacao off-chain.
    function allWorks() external view returns (uint256[] memory tokenIds, Work[] memory data) {
        uint256 total = totalSupply();
        tokenIds = new uint256[](total);
        data = new Work[](total);

        for (uint256 i = 0; i < total; i++) {
            uint256 tokenId = tokenByIndex(i);
            tokenIds[i] = tokenId;
            data[i] = _works[tokenId];
        }
    }

    /// @notice Obras criadas por um autor - inclui as que ele ja vendeu.
    function worksByCreator(address creator) external view returns (uint256[] memory tokenIds, Work[] memory data) {
        uint256 total = totalSupply();
        uint256 count;
        uint256[] memory buffer = new uint256[](total);

        for (uint256 i = 0; i < total; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (_works[tokenId].creator == creator) {
                buffer[count++] = tokenId;
            }
        }

        tokenIds = new uint256[](count);
        data = new Work[](count);
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = buffer[i];
            data[i] = _works[buffer[i]];
        }
    }

    /// @notice Obras que o endereco detem hoje.
    function worksByOwner(address account) external view returns (uint256[] memory tokenIds, Work[] memory data) {
        uint256 count = balanceOf(account);
        tokenIds = new uint256[](count);
        data = new Work[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(account, i);
            tokenIds[i] = tokenId;
            data[i] = _works[tokenId];
        }
    }

    // --------------------------------------------------------------------
    // Restricao de circulacao
    // --------------------------------------------------------------------

    /**
     * @dev Uma obra so pode mudar de maos depois de registrada e sempre atraves do marketplace,
     *      que e quem apura a mais-valia e retem o direito de sequencia do autor.
     */
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721Enumerable) returns (address) {
        address from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0)) {
            if (!isRegistered(tokenId)) revert TransferNotAllowed(tokenId);
            if (msg.sender != marketplace) revert TransferNotAllowed(tokenId);
        }

        return super._update(to, tokenId, auth);
    }
}

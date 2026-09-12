// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GovBrIdentity
 * @notice Vincula uma carteira Ethereum a uma identidade civil brasileira (mock do gov.br).
 *
 * Modelo de confianca:
 *  - o `issuer` representa o provedor de identidade (gov.br). Ele assina off-chain, no padrao
 *    EIP-712, uma credencial dizendo "o CPF X pertence ao titular do endereco Y";
 *  - quem envia a transacao e o proprio cidadao, a partir da carteira dele. Assim a prova de
 *    posse da chave privada e feita on-chain e a prova de identidade vem do gov.br.
 *
 * O CPF nunca e gravado em claro: guardamos apenas keccak256(cpf + sal). O nome civil e
 * guardado porque precisa aparecer no registro autoral e no contrato ricardiano.
 */
contract GovBrIdentity is EIP712, Ownable {
    /// @notice Niveis da conta gov.br.
    enum Level {
        NONE,
        BRONZE,
        PRATA,
        OURO
    }

    struct Identity {
        bytes32 cpfHash;
        string civilName;
        Level level;
        uint64 verifiedAt;
        bool active;
    }

    bytes32 private constant _CREDENTIAL_TYPEHASH =
        keccak256(
            "GovBrCredential(address subject,bytes32 cpfHash,string civilName,uint8 level,uint256 nonce,uint256 deadline)"
        );

    /// @notice Endereco que assina as credenciais (o "gov.br" mockado).
    address public issuer;

    mapping(address => Identity) private _identities;
    mapping(bytes32 => address) public walletOfCpf;
    mapping(address => uint256) public nonces;

    event IssuerUpdated(address indexed previousIssuer, address indexed newIssuer);
    event IdentityLinked(address indexed subject, bytes32 indexed cpfHash, string civilName, Level level);
    event IdentityRevoked(address indexed subject, bytes32 indexed cpfHash);

    error InvalidIssuerSignature();
    error CredentialExpired();
    error NotVerified(address subject);
    error ZeroAddress();

    constructor(address initialOwner, address initialIssuer) EIP712("GovBrIdentity", "1") Ownable(initialOwner) {
        if (initialIssuer == address(0)) revert ZeroAddress();
        issuer = initialIssuer;
        emit IssuerUpdated(address(0), initialIssuer);
    }

    /// @notice Troca o provedor de identidade (em producao seria uma chave do proprio gov.br).
    function setIssuer(address newIssuer) external onlyOwner {
        if (newIssuer == address(0)) revert ZeroAddress();
        emit IssuerUpdated(issuer, newIssuer);
        issuer = newIssuer;
    }

    /**
     * @notice Consome a credencial gov.br e vincula a identidade a carteira que assina a transacao.
     * @param cpfHash keccak256 do CPF com sal - o numero em si nunca vai para a chain.
     * @param civilName nome civil como consta no cadastro.
     * @param level nivel da conta gov.br (bronze/prata/ouro).
     * @param deadline validade da credencial, em segundos unix.
     * @param signature assinatura EIP-712 produzida pelo `issuer`.
     */
    function linkIdentity(
        bytes32 cpfHash,
        string calldata civilName,
        Level level,
        uint256 deadline,
        bytes calldata signature
    ) external {
        if (block.timestamp > deadline) revert CredentialExpired();

        uint256 nonce = nonces[msg.sender];
        bytes32 structHash = keccak256(
            abi.encode(
                _CREDENTIAL_TYPEHASH,
                msg.sender,
                cpfHash,
                keccak256(bytes(civilName)),
                uint8(level),
                nonce,
                deadline
            )
        );

        address recovered = ECDSA.recover(_hashTypedDataV4(structHash), signature);
        if (recovered != issuer) revert InvalidIssuerSignature();

        nonces[msg.sender] = nonce + 1;

        // Um CPF so pode estar ativo em uma carteira por vez: trocar de carteira revoga a anterior.
        address previousWallet = walletOfCpf[cpfHash];
        if (previousWallet != address(0) && previousWallet != msg.sender) {
            _identities[previousWallet].active = false;
            emit IdentityRevoked(previousWallet, cpfHash);
        }

        _identities[msg.sender] = Identity({
            cpfHash: cpfHash,
            civilName: civilName,
            level: level,
            verifiedAt: uint64(block.timestamp),
            active: true
        });
        walletOfCpf[cpfHash] = msg.sender;

        emit IdentityLinked(msg.sender, cpfHash, civilName, level);
    }

    function isVerified(address subject) public view returns (bool) {
        return _identities[subject].active;
    }

    function identityOf(address subject) external view returns (Identity memory) {
        return _identities[subject];
    }

    function civilNameOf(address subject) external view returns (string memory) {
        return _identities[subject].civilName;
    }

    /// @notice Reverte se o endereco nao tiver identidade civil ativa. Usado pelos demais contratos.
    function requireVerified(address subject) external view {
        if (!isVerified(subject)) revert NotVerified(subject);
    }
}

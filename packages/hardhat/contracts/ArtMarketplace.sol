// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC721Receiver } from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ArtRegistry } from "./ArtRegistry.sol";
import { GovBrIdentity } from "./GovBrIdentity.sol";

/**
 * @title ArtMarketplace
 * @notice Compra e venda de obras registradas, com entrega fisica e direito de sequencia embutido.
 *
 * A obra existe no mundo fisico, entao o pagamento fica em custodia ate o comprador confirmar que
 * recebeu a peca. Isso espelha o paragrafo unico do art. 38 da Lei 9.610/98, que trata o vendedor
 * como depositario do valor devido ao autor quando o direito de sequencia nao e pago no ato da
 * revenda: aqui o contrato e o depositario, e o pagamento ao autor acontece no mesmo instante em
 * que o vendedor recebe o dinheiro. Nao ha como pular a etapa.
 */
contract ArtMarketplace is IERC721Receiver, ReentrancyGuard {
    enum OrderState {
        NONE,
        EM_TRANSITO, // pago, aguardando o comprador confirmar o recebimento fisico
        CONCLUIDA,
        CANCELADA
    }

    struct Listing {
        address seller;
        uint256 price;
        uint64 listedAt;
        bool active;
    }

    struct Order {
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 price;
        uint256 royaltyPaid;
        uint256 previousPrice;
        OrderState state;
        uint64 createdAt;
        uint64 settledAt;
    }

    /// @notice Prazo apos o qual o comprador pode desfazer a compra por falta de entrega.
    uint64 public constant DELIVERY_DEADLINE = 30 days;

    ArtRegistry public immutable registry;
    GovBrIdentity public immutable identity;

    mapping(uint256 => Listing) private _listings;
    mapping(uint256 => Order) private _orders;
    /// @notice Ultimo preco efetivamente pago por uma obra - base de calculo da mais-valia.
    mapping(uint256 => uint256) public lastPaidPrice;
    mapping(uint256 => uint256) public openOrderOf;

    uint256 public nextOrderId = 1;

    event WorkListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event OrderOpened(uint256 indexed orderId, uint256 indexed tokenId, address indexed buyer, uint256 price);
    event ResaleRoyaltyPaid(
        uint256 indexed orderId,
        uint256 indexed tokenId,
        address indexed author,
        uint256 amount,
        uint256 priceIncrease
    );
    event OrderSettled(uint256 indexed orderId, uint256 indexed tokenId, address indexed buyer, uint256 sellerAmount);
    event OrderCancelled(uint256 indexed orderId, uint256 indexed tokenId, address indexed by);

    error WorkNotRegistered(uint256 tokenId);
    error NotOwner();
    error NotApproved();
    error InvalidPrice();
    error ListingNotActive(uint256 tokenId);
    error OrderInProgress(uint256 tokenId);
    error WrongAmount(uint256 expected, uint256 sent);
    error BuyerIsSeller();
    error BuyerNotVerified();
    error UnknownOrder(uint256 orderId);
    error NotOrderBuyer();
    error OrderNotOpen();
    error DeadlineNotReached(uint64 availableAt);
    error TransferFailed(address to);

    constructor(ArtRegistry registry_, GovBrIdentity identity_) {
        registry = registry_;
        identity = identity_;
    }

    // --------------------------------------------------------------------
    // Vendedor
    // --------------------------------------------------------------------

    /// @notice Coloca a obra a venda. Só obra com registro concluido pode circular.
    function listWork(uint256 tokenId, uint256 price) external {
        if (!registry.isRegistered(tokenId)) revert WorkNotRegistered(tokenId);
        if (registry.ownerOf(tokenId) != msg.sender) revert NotOwner();
        if (price == 0) revert InvalidPrice();
        if (openOrderOf[tokenId] != 0) revert OrderInProgress(tokenId);
        if (registry.getApproved(tokenId) != address(this) && !registry.isApprovedForAll(msg.sender, address(this))) {
            revert NotApproved();
        }

        _listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            listedAt: uint64(block.timestamp),
            active: true
        });

        emit WorkListed(tokenId, msg.sender, price);
    }

    function cancelListing(uint256 tokenId) external {
        Listing storage listing = _listings[tokenId];
        if (!listing.active) revert ListingNotActive(tokenId);
        if (listing.seller != msg.sender) revert NotOwner();

        listing.active = false;
        emit ListingCancelled(tokenId, msg.sender);
    }

    // --------------------------------------------------------------------
    // Comprador
    // --------------------------------------------------------------------

    /**
     * @notice Compra a obra. O ETH fica retido no contrato e a obra vai para custodia ate a
     *         confirmacao do recebimento fisico.
     */
    function buy(uint256 tokenId) external payable nonReentrant returns (uint256 orderId) {
        Listing storage listing = _listings[tokenId];
        if (!listing.active) revert ListingNotActive(tokenId);
        if (openOrderOf[tokenId] != 0) revert OrderInProgress(tokenId);
        if (listing.seller == msg.sender) revert BuyerIsSeller();
        if (msg.value != listing.price) revert WrongAmount(listing.price, msg.value);
        // A cadeia de titularidade precisa de compradores identificados: e o titular civil que
        // respondera pelo direito de sequencia na proxima revenda.
        if (!identity.isVerified(msg.sender)) revert BuyerNotVerified();

        address seller = listing.seller;
        uint256 price = listing.price;
        listing.active = false;

        orderId = nextOrderId++;
        _orders[orderId] = Order({
            tokenId: tokenId,
            seller: seller,
            buyer: msg.sender,
            price: price,
            royaltyPaid: 0,
            previousPrice: lastPaidPrice[tokenId],
            state: OrderState.EM_TRANSITO,
            createdAt: uint64(block.timestamp),
            settledAt: 0
        });
        openOrderOf[tokenId] = orderId;

        registry.safeTransferFrom(seller, address(this), tokenId);

        emit OrderOpened(orderId, tokenId, msg.sender, price);
    }

    /**
     * @notice O comprador confirma que recebeu a obra fisica. Nesse mesmo ato a titularidade
     *         passa para ele, o autor recebe o direito de sequencia e o vendedor recebe o saldo.
     */
    function confirmReceipt(uint256 orderId) external nonReentrant {
        Order storage order = _orders[orderId];
        if (order.state == OrderState.NONE) revert UnknownOrder(orderId);
        if (order.state != OrderState.EM_TRANSITO) revert OrderNotOpen();
        if (order.buyer != msg.sender) revert NotOrderBuyer();

        uint256 tokenId = order.tokenId;

        (address author, uint256 royalty) = registry.resaleRoyalty(
            tokenId,
            order.seller,
            order.previousPrice,
            order.price
        );

        order.state = OrderState.CONCLUIDA;
        order.settledAt = uint64(block.timestamp);
        order.royaltyPaid = royalty;
        openOrderOf[tokenId] = 0;
        lastPaidPrice[tokenId] = order.price;

        registry.safeTransferFrom(address(this), order.buyer, tokenId);

        if (royalty > 0) {
            _send(author, royalty);
            emit ResaleRoyaltyPaid(orderId, tokenId, author, royalty, order.price - order.previousPrice);
        }

        uint256 sellerAmount = order.price - royalty;
        _send(order.seller, sellerAmount);

        emit OrderSettled(orderId, tokenId, order.buyer, sellerAmount);
    }

    /**
     * @notice Desfaz a compra: o vendedor pode cancelar a qualquer momento antes da entrega,
     *         e o comprador pode cancelar se o prazo de entrega estourar. O ETH volta integral.
     */
    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = _orders[orderId];
        if (order.state == OrderState.NONE) revert UnknownOrder(orderId);
        if (order.state != OrderState.EM_TRANSITO) revert OrderNotOpen();

        bool isSeller = msg.sender == order.seller;
        bool isBuyer = msg.sender == order.buyer;
        if (!isSeller && !isBuyer) revert NotOrderBuyer();

        uint64 availableAt = order.createdAt + DELIVERY_DEADLINE;
        if (isBuyer && !isSeller && block.timestamp < availableAt) revert DeadlineNotReached(availableAt);

        order.state = OrderState.CANCELADA;
        order.settledAt = uint64(block.timestamp);
        openOrderOf[order.tokenId] = 0;

        registry.safeTransferFrom(address(this), order.seller, order.tokenId);
        _send(order.buyer, order.price);

        emit OrderCancelled(orderId, order.tokenId, msg.sender);
    }

    // --------------------------------------------------------------------
    // Leitura
    // --------------------------------------------------------------------

    function listingOf(uint256 tokenId) external view returns (Listing memory) {
        return _listings[tokenId];
    }

    function orderOf(uint256 orderId) external view returns (Order memory) {
        return _orders[orderId];
    }

    /// @notice Todas as obras a venda no momento.
    function activeListings() external view returns (uint256[] memory tokenIds, Listing[] memory data) {
        uint256 total = registry.totalSupply();
        uint256 count;
        uint256[] memory buffer = new uint256[](total);

        for (uint256 i = 0; i < total; i++) {
            uint256 tokenId = registry.tokenByIndex(i);
            if (_listings[tokenId].active && openOrderOf[tokenId] == 0) {
                buffer[count++] = tokenId;
            }
        }

        tokenIds = new uint256[](count);
        data = new Listing[](count);
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = buffer[i];
            data[i] = _listings[buffer[i]];
        }
    }

    /// @notice Pedidos em que o endereco aparece como comprador ou vendedor.
    function ordersOf(address account) external view returns (uint256[] memory orderIds, Order[] memory data) {
        uint256 total = nextOrderId;
        uint256 count;
        uint256[] memory buffer = new uint256[](total);

        for (uint256 id = 1; id < total; id++) {
            if (_orders[id].buyer == account || _orders[id].seller == account) {
                buffer[count++] = id;
            }
        }

        orderIds = new uint256[](count);
        data = new Order[](count);
        for (uint256 i = 0; i < count; i++) {
            orderIds[i] = buffer[i];
            data[i] = _orders[buffer[i]];
        }
    }

    /// @notice Simula o rateio de uma venda antes de ela acontecer - usado na tela de anuncio.
    function previewSettlement(
        uint256 tokenId,
        address seller,
        uint256 price
    ) external view returns (uint256 royalty, uint256 sellerAmount, uint256 previousPrice) {
        previousPrice = lastPaidPrice[tokenId];
        (, royalty) = registry.resaleRoyalty(tokenId, seller, previousPrice, price);
        sellerAmount = price - royalty;
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function _send(address to, uint256 amount) private {
        (bool ok, ) = payable(to).call{ value: amount }("");
        if (!ok) revert TransferFailed(to);
    }
}

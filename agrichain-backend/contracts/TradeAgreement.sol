// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TradeAgreement
 * @notice Immutable trade contracts between farmer (seller) and buyer.
 *         Stores only IDs and terms — no PII on-chain.
 *
 * Status flow:  Created → Confirmed → Delivered / Cancelled
 *
 * @dev Farmer never signs transactions. Backend custodial wallet handles all signing.
 */
contract TradeAgreement {
    // ── Types ────────────────────────────────────────────────────────────
    enum Status { Created, Confirmed, Delivered, Cancelled, Disputed }

    struct Trade {
        uint256 sellerId;        // off-chain farmer ID
        uint256 buyerId;         // off-chain buyer ID
        uint256 quantityKg;      // in grams (×1000 for precision)
        uint256 pricePerKg;      // in paise (×100 for precision)
        string  qualityGrade;    // A, B, C
        uint256 deliveryDeadline;// unix timestamp (0 = no deadline)
        uint256 penaltyRate;     // basis points (500 = 5%)
        Status  status;
        uint256 timestamp;
    }

    // ── State ────────────────────────────────────────────────────────────
    address public owner;
    uint256 public tradeCount;
    mapping(uint256 => Trade) public trades;

    // ── Events ───────────────────────────────────────────────────────────
    event TradeCreated(
        uint256 indexed tradeId,
        uint256 sellerId,
        uint256 buyerId,
        uint256 quantityKg,
        uint256 pricePerKg,
        uint256 timestamp
    );

    event TradeStatusChanged(
        uint256 indexed tradeId,
        Status  oldStatus,
        Status  newStatus,
        uint256 timestamp
    );

    // ── Modifiers ────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorised");
        _;
    }

    modifier tradeExists(uint256 tradeId) {
        require(trades[tradeId].timestamp != 0, "Trade does not exist");
        _;
    }

    // ── Constructor ──────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
    }

    // ── Core Functions ───────────────────────────────────────────────────

    /**
     * @notice Create a new trade agreement.
     * @return tradeId Sequential trade identifier
     */
    function createTrade(
        uint256 sellerId,
        uint256 buyerId,
        uint256 quantityKg,
        uint256 pricePerKg,
        string  calldata qualityGrade,
        uint256 deliveryDeadline,
        uint256 penaltyRate
    ) external onlyOwner returns (uint256) {
        require(sellerId != buyerId, "Seller cannot be buyer");
        require(quantityKg > 0, "Quantity must be > 0");
        require(pricePerKg > 0, "Price must be > 0");

        tradeCount++;

        trades[tradeCount] = Trade({
            sellerId:         sellerId,
            buyerId:          buyerId,
            quantityKg:       quantityKg,
            pricePerKg:       pricePerKg,
            qualityGrade:     qualityGrade,
            deliveryDeadline: deliveryDeadline,
            penaltyRate:      penaltyRate,
            status:           Status.Created,
            timestamp:        block.timestamp
        });

        emit TradeCreated(
            tradeCount,
            sellerId,
            buyerId,
            quantityKg,
            pricePerKg,
            block.timestamp
        );

        return tradeCount;
    }

    /**
     * @notice Confirm delivery for a trade.
     */
    function confirmDelivery(uint256 tradeId)
        external
        onlyOwner
        tradeExists(tradeId)
    {
        Trade storage t = trades[tradeId];
        require(
            t.status == Status.Created || t.status == Status.Confirmed,
            "Cannot confirm in current status"
        );

        Status old = t.status;
        t.status = Status.Delivered;

        emit TradeStatusChanged(tradeId, old, Status.Delivered, block.timestamp);
    }

    /**
     * @notice Cancel a trade agreement.
     */
    function cancelTrade(uint256 tradeId)
        external
        onlyOwner
        tradeExists(tradeId)
    {
        Trade storage t = trades[tradeId];
        require(
            t.status != Status.Delivered && t.status != Status.Cancelled,
            "Cannot cancel in current status"
        );

        Status old = t.status;
        t.status = Status.Cancelled;

        emit TradeStatusChanged(tradeId, old, Status.Cancelled, block.timestamp);
    }

    /**
     * @notice Read a trade by its ID.
     */
    function getTrade(uint256 tradeId)
        external
        view
        tradeExists(tradeId)
        returns (
            uint256 sellerId,
            uint256 buyerId,
            uint256 quantityKg,
            uint256 pricePerKg,
            string  memory qualityGrade,
            uint256 deliveryDeadline,
            uint256 penaltyRate,
            Status  status,
            uint256 timestamp
        )
    {
        Trade storage t = trades[tradeId];
        return (
            t.sellerId,
            t.buyerId,
            t.quantityKg,
            t.pricePerKg,
            t.qualityGrade,
            t.deliveryDeadline,
            t.penaltyRate,
            t.status,
            t.timestamp
        );
    }

    /**
     * @notice Check if delivery deadline has passed.
     */
    function isOverdue(uint256 tradeId)
        external
        view
        tradeExists(tradeId)
        returns (bool)
    {
        Trade storage t = trades[tradeId];
        if (t.deliveryDeadline == 0) return false;
        return (block.timestamp > t.deliveryDeadline && t.status != Status.Delivered);
    }
}

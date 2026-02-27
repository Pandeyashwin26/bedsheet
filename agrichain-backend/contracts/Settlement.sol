// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Settlement
 * @notice Escrow contract for trade settlements.
 *         Funds are locked → released on delivery / refunded on cancel.
 *
 * @dev Uses ReentrancyGuard pattern (manual, no OpenZeppelin import needed
 *      for gas savings on Polygon). Pure rule-based execution.
 *
 * Settlement flow:
 *   lockFunds()    → "Payment Locked 🔒"
 *   releaseFunds() → "Money Released 💰"
 *   applyPenalty() → partial release + penalty deduction
 *   refund()       → full refund on cancellation
 */
contract Settlement {
    // ── Types ────────────────────────────────────────────────────────────
    enum EscrowStatus { None, Locked, Released, Refunded, Penalized }

    struct Escrow {
        uint256       amount;
        EscrowStatus  status;
        uint256       timestamp;
        address       depositor;
    }

    // ── State ────────────────────────────────────────────────────────────
    address public owner;
    bool    private _locked;   // reentrancy guard
    mapping(uint256 => Escrow) public escrows;  // tradeId → Escrow

    // ── Events ───────────────────────────────────────────────────────────
    event FundsLocked(uint256 indexed tradeId, uint256 amount, uint256 timestamp);
    event FundsReleased(uint256 indexed tradeId, uint256 amount, uint256 timestamp);
    event PenaltyApplied(uint256 indexed tradeId, uint256 penaltyAmount, uint256 releasedAmount, uint256 timestamp);
    event FundsRefunded(uint256 indexed tradeId, uint256 amount, uint256 timestamp);

    // ── Modifiers ────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorised");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    // ── Constructor ──────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
    }

    // ── Core Functions ───────────────────────────────────────────────────

    /**
     * @notice Lock funds in escrow for a trade.
     *         Farmer sees: "Payment Locked 🔒"
     */
    function lockFunds(uint256 tradeId) external payable onlyOwner nonReentrant {
        require(msg.value > 0, "Must send funds");
        require(
            escrows[tradeId].status == EscrowStatus.None,
            "Escrow already exists"
        );

        escrows[tradeId] = Escrow({
            amount:    msg.value,
            status:    EscrowStatus.Locked,
            timestamp: block.timestamp,
            depositor: msg.sender
        });

        emit FundsLocked(tradeId, msg.value, block.timestamp);
    }

    /**
     * @notice Release full escrowed amount to the depositor (custodial wallet).
     *         Farmer sees: "Money Released 💰"
     */
    function releaseFunds(uint256 tradeId) external onlyOwner nonReentrant {
        Escrow storage e = escrows[tradeId];
        require(e.status == EscrowStatus.Locked, "Not in locked state");

        uint256 amount = e.amount;
        e.status = EscrowStatus.Released;

        (bool sent, ) = payable(owner).call{value: amount}("");
        require(sent, "Transfer failed");

        emit FundsReleased(tradeId, amount, block.timestamp);
    }

    /**
     * @notice Apply penalty: deduct penaltyBps from escrowed amount.
     * @param penaltyBps Penalty in basis points (e.g. 500 = 5%)
     */
    function applyPenalty(uint256 tradeId, uint256 penaltyBps)
        external
        onlyOwner
        nonReentrant
    {
        require(penaltyBps <= 10000, "Penalty > 100%");
        Escrow storage e = escrows[tradeId];
        require(e.status == EscrowStatus.Locked, "Not in locked state");

        uint256 penalty  = (e.amount * penaltyBps) / 10000;
        uint256 released = e.amount - penalty;

        e.status = EscrowStatus.Penalized;

        // Release remaining to depositor
        if (released > 0) {
            (bool sent, ) = payable(owner).call{value: released}("");
            require(sent, "Transfer failed");
        }

        emit PenaltyApplied(tradeId, penalty, released, block.timestamp);
    }

    /**
     * @notice Full refund of escrowed funds (trade cancelled).
     */
    function refund(uint256 tradeId) external onlyOwner nonReentrant {
        Escrow storage e = escrows[tradeId];
        require(
            e.status == EscrowStatus.Locked,
            "Not in locked state"
        );

        uint256 amount = e.amount;
        e.status = EscrowStatus.Refunded;

        (bool sent, ) = payable(e.depositor).call{value: amount}("");
        require(sent, "Refund failed");

        emit FundsRefunded(tradeId, amount, block.timestamp);
    }

    /**
     * @notice Read escrow details for a trade.
     */
    function getSettlement(uint256 tradeId)
        external
        view
        returns (uint256 amount, EscrowStatus status, uint256 timestamp)
    {
        Escrow storage e = escrows[tradeId];
        return (e.amount, e.status, e.timestamp);
    }

    /**
     * @notice Check contract balance (for monitoring).
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Allow contract to receive ETH/MATIC
    receive() external payable {}
}

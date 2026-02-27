// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RecommendationProof
 * @notice Anchors AI recommendation hashes on-chain for auditability.
 *         Only data hashes are stored — no sensitive farmer data on-chain.
 *
 * @dev Gas-optimised: ~60k gas per proof. Polygon PoS < $0.005/tx.
 */
contract RecommendationProof {
    // ── Types ────────────────────────────────────────────────────────────
    struct Proof {
        string   crop;
        string   region;
        bytes32  inputHash;      // SHA-256 of AI model input
        bytes32  outputHash;     // SHA-256 of recommendation output
        string   modelVersion;
        uint256  timestamp;
        address  creator;
    }

    // ── State ────────────────────────────────────────────────────────────
    address public owner;
    uint256 public proofCount;
    mapping(uint256 => Proof) public proofs;

    // ── Events ───────────────────────────────────────────────────────────
    event ProofCreated(
        uint256 indexed proofId,
        string   crop,
        string   region,
        bytes32  inputHash,
        bytes32  outputHash,
        string   modelVersion,
        uint256  timestamp
    );

    // ── Modifiers ────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorised");
        _;
    }

    // ── Constructor ──────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
    }

    // ── Core Functions ───────────────────────────────────────────────────

    /**
     * @notice Store a recommendation proof on-chain.
     * @param crop         Crop name (e.g. "onion")
     * @param region       Region / district name
     * @param inputHash    SHA-256 hash of model input data
     * @param outputHash   SHA-256 hash of recommendation output
     * @param modelVersion Semantic version of the AI model
     * @return proofId     The sequential proof identifier
     */
    function createProof(
        string  calldata crop,
        string  calldata region,
        bytes32 inputHash,
        bytes32 outputHash,
        string  calldata modelVersion
    ) external onlyOwner returns (uint256) {
        proofCount++;

        proofs[proofCount] = Proof({
            crop:         crop,
            region:       region,
            inputHash:    inputHash,
            outputHash:   outputHash,
            modelVersion: modelVersion,
            timestamp:    block.timestamp,
            creator:      msg.sender
        });

        emit ProofCreated(
            proofCount,
            crop,
            region,
            inputHash,
            outputHash,
            modelVersion,
            block.timestamp
        );

        return proofCount;
    }

    /**
     * @notice Read a proof by its ID.
     */
    function getProof(uint256 proofId)
        external
        view
        returns (
            string  memory crop,
            string  memory region,
            bytes32 inputHash,
            bytes32 outputHash,
            string  memory modelVersion,
            uint256 timestamp,
            address creator
        )
    {
        Proof storage p = proofs[proofId];
        require(p.timestamp != 0, "Proof does not exist");
        return (
            p.crop,
            p.region,
            p.inputHash,
            p.outputHash,
            p.modelVersion,
            p.timestamp,
            p.creator
        );
    }

    /**
     * @notice Verify that a given input/output hash pair matches a proof.
     */
    function verifyProof(
        uint256 proofId,
        bytes32 inputHash,
        bytes32 outputHash
    ) external view returns (bool) {
        Proof storage p = proofs[proofId];
        return (p.inputHash == inputHash && p.outputHash == outputHash);
    }
}

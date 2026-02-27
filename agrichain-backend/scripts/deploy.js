/**
 * AGRI-मित्र — Polygon Deployment Script
 * Deploy all 3 contracts: RecommendationProof, TradeAgreement, Settlement
 */

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // 1. RecommendationProof
  const ProofFactory = await hre.ethers.getContractFactory("RecommendationProof");
  const proof = await ProofFactory.deploy();
  await proof.waitForDeployment();
  const proofAddr = await proof.getAddress();
  console.log("✅ RecommendationProof deployed:", proofAddr);

  // 2. TradeAgreement
  const TradeFactory = await hre.ethers.getContractFactory("TradeAgreement");
  const trade = await TradeFactory.deploy();
  await trade.waitForDeployment();
  const tradeAddr = await trade.getAddress();
  console.log("✅ TradeAgreement deployed:", tradeAddr);

  // 3. Settlement (Escrow)
  const SettlementFactory = await hre.ethers.getContractFactory("Settlement");
  const settlement = await SettlementFactory.deploy();
  await settlement.waitForDeployment();
  const settlementAddr = await settlement.getAddress();
  console.log("✅ Settlement deployed:", settlementAddr);

  console.log("\n═══════════════════════════════════════════");
  console.log("Set these in your .env:");
  console.log(`PROOF_CONTRACT_ADDRESS=${proofAddr}`);
  console.log(`TRADE_CONTRACT_ADDRESS=${tradeAddr}`);
  console.log(`SETTLEMENT_CONTRACT_ADDRESS=${settlementAddr}`);
  console.log("═══════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

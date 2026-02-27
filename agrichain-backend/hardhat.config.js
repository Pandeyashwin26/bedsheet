require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,        // gas-optimised for Polygon PoS
      },
      evmVersion: "paris",
    },
  },

  networks: {
    hardhat: {},

    // Polygon Mumbai Testnet (for development)
    mumbai: {
      url: process.env.POLYGON_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.CUSTODIAL_PRIVATE_KEY
        ? [process.env.CUSTODIAL_PRIVATE_KEY]
        : [],
      chainId: 80001,
      gasPrice: 35000000000,   // 35 Gwei
    },

    // Polygon Amoy Testnet (Mumbai replacement)
    amoy: {
      url: process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: process.env.CUSTODIAL_PRIVATE_KEY
        ? [process.env.CUSTODIAL_PRIVATE_KEY]
        : [],
      chainId: 80002,
    },

    // Polygon Mainnet (production)
    polygon: {
      url: process.env.POLYGON_MAINNET_RPC || "https://polygon-rpc.com",
      accounts: process.env.CUSTODIAL_PRIVATE_KEY
        ? [process.env.CUSTODIAL_PRIVATE_KEY]
        : [],
      chainId: 137,
      gasPrice: 50000000000,   // 50 Gwei
    },
  },

  etherscan: {
    apiKey: {
      polygon:       process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      polygonAmoy:   process.env.POLYGONSCAN_API_KEY || "",
    },
  },

  paths: {
    sources:  "./contracts",
    tests:    "./test",
    cache:    "./cache",
    artifacts: "./artifacts",
  },
};

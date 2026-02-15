require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Ethereum Mainnet
    mainnet: {
      url: process.env.MAINNET_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
    },
    // Ethereum Sepolia Testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    // Polygon Mainnet
    polygon: {
      url: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
    },
    // Polygon Amoy Testnet
    amoy: {
      url: process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
    },
    // Base Mainnet
    base: {
      url: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
    },
    // Base Sepolia Testnet
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
    // Arbitrum One
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42161,
    },
    // Arbitrum Sepolia
    arbitrumSepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614,
    },
    // Optimism Mainnet
    optimism: {
      url: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 10,
    },
    // Optimism Sepolia
    optimismSepolia: {
      url: process.env.OPTIMISM_SEPOLIA_RPC_URL || 'https://sepolia.optimism.io',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155420,
    },
    // Local Hardhat Network
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || '',
      sepolia: process.env.ETHERSCAN_API_KEY || '',
      polygon: process.env.POLYGONSCAN_API_KEY || '',
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || '',
      base: process.env.BASESCAN_API_KEY || '',
      baseSepolia: process.env.BASESCAN_API_KEY || '',
      arbitrumOne: process.env.ARBISCAN_API_KEY || '',
      arbitrumSepolia: process.env.ARBISCAN_API_KEY || '',
      optimisticEthereum: process.env.OPTIMISM_API_KEY || '',
      optimismSepolia: process.env.OPTIMISM_API_KEY || '',
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};
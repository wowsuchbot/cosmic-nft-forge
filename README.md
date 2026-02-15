# Cosmic NFT Forge 🚀

A complete NFT contract deployment solution featuring Piñata IPFS integration and lazy minting functionality. Create, sign, and mint NFTs with gas-efficient lazy minting using EIP-712 signatures.

## Features

- ✨ **Lazy Minting**: Create signed vouchers off-chain, collectors pay gas to mint
- 🔐 **EIP-712 Signatures**: Secure cryptographic signatures for voucher validation
- 📦 **Piñata IPFS Integration**: Decentralized metadata and image storage
- 💰 **Configurable Pricing**: Set custom mint prices per NFT
- 🌐 **Multi-Network Support**: Deploy to Ethereum, Polygon, Base, Arbitrum, Optimism
- 🔧 **Complete Backend API**: Express server with all necessary endpoints
- 📝 **OpenZeppelin Contracts**: Built on battle-tested, secure smart contracts

## Table of Contents

- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Backend API](#backend-api)
- [Usage Examples](#usage-examples)
- [Contract Reference](#contract-reference)
- [API Reference](#api-reference)
- [Security](#security)
- [License](#license)

## Architecture

```
┌─────────────────┐
│   Creator       │
│  (Off-chain)    │
└────────┬────────┘
         │
         │ 1. Upload image to IPFS
         │ 2. Create metadata
         │ 3. Sign voucher
         ↓
┌─────────────────┐
│  Piñata IPFS    │
│   + Backend     │
└────────┬────────┘
         │
         │ Voucher
         ↓
┌─────────────────┐
│   Collector     │
│  (On-chain)     │
└────────┬────────┘
         │
         │ lazyMint(voucher)
         ↓
┌─────────────────┐
│  NFT Contract   │
│   (Ethereum)    │
└─────────────────┘
```

## Quick Start

```bash
# Clone the repository
git clone https://github.com/wowsuchbot/cosmic-nft-forge.git
cd cosmic-nft-forge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Compile contracts
npm run compile

# Deploy to testnet
npm run deploy:sepolia

# Start backend API
cd backend
npm install
npm start
```

## Installation

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Piñata account (free tier available)
- Wallet with testnet/mainnet ETH

### Install Dependencies

**Smart Contracts:**
```bash
npm install
```

**Backend API:**
```bash
cd backend
npm install
```

## Configuration

### 1. Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Private key for contract deployment
PRIVATE_KEY=your_private_key_here

# RPC URLs (get from Alchemy, Infura, etc.)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR-API-KEY

# Block explorer API keys
ETHERSCAN_API_KEY=your_etherscan_api_key

# Piñata credentials (get from https://pinata.cloud)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_api_key

# Contract settings
NFT_NAME=My NFT Collection
NFT_SYMBOL=MNFT
MINT_PRICE_ETH=0.01

# After deployment, add:
CONTRACT_ADDRESS=0x...
```

### 2. Get Piñata API Keys

1. Sign up at [https://pinata.cloud](https://pinata.cloud)
2. Navigate to API Keys section
3. Create a new API key with:
   - `pinFileToIPFS` permission
   - `pinJSONToIPFS` permission
4. Copy API Key and API Secret to `.env`

### 3. Get RPC URLs

**Recommended Providers:**
- [Alchemy](https://alchemy.com) - Free tier: 300M compute units/month
- [Infura](https://infura.io) - Free tier: 100k requests/day
- [QuickNode](https://quicknode.com) - Free tier available

## Deployment

### Compile Contracts

```bash
npm run compile
```

### Deploy to Network

**Testnets:**
```bash
# Ethereum Sepolia
npm run deploy:sepolia

# Polygon Amoy
npm run deploy:amoy

# Base Sepolia
npm run deploy:base-sepolia
```

**Mainnets:**
```bash
# Ethereum Mainnet
npm run deploy:mainnet

# Polygon
npm run deploy:polygon

# Base
npm run deploy:base
```

### Verify Contract

After deployment, verify on block explorer:

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS "NFT_NAME" "NFT_SYMBOL" MINT_PRICE_WEI
```

Example:
```bash
npx hardhat verify --network sepolia 0x123... "Cosmic Art" "COSMIC" 10000000000000000
```

## Backend API

### Start the Server

```bash
cd backend
npm start

# Or with auto-reload for development
npm run dev
```

Server runs on `http://localhost:3000` by default.

### API Endpoints

#### Health Check
```
GET /health
```

#### Get Configuration
```
GET /config
```

#### Test Piñata Connection
```
GET /api/test-pinata
```

#### Upload Image
```
POST /api/upload-image
Content-Type: multipart/form-data

Body:
  image: [file]
```

#### Upload Metadata
```
POST /api/upload-metadata
Content-Type: application/json

Body:
{
  "name": "NFT Name",
  "description": "NFT Description",
  "image": "ipfs://QmHash",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    }
  ]
}
```

#### Create Voucher
```
POST /api/create-voucher
Content-Type: application/json

Body:
{
  "tokenId": 1,
  "price": "0.01",
  "uri": "ipfs://QmHash",
  "minter": "0xAddress"
}
```

#### Complete NFT Creation
```
POST /api/create-nft
Content-Type: multipart/form-data

Body:
  image: [file]
  tokenId: 1
  price: 0.01
  minter: 0xAddress
  name: NFT Name
  description: NFT Description
  attributes: [{"trait_type": "Rarity", "value": "Legendary"}]
```

## Usage Examples

### Example 1: Upload to IPFS

```bash
node examples/upload-to-pinata.js
```

This will:
1. Upload an image to Piñata IPFS
2. Create metadata with the image URL
3. Upload metadata to IPFS
4. Return the metadata IPFS URL

### Example 2: Create a Voucher

```bash
node examples/create-voucher.js
```

This creates a signed voucher that a collector can use to mint.

### Example 3: Mint an NFT

```bash
node examples/mint-nft.js
```

This redeems a voucher and mints the NFT on-chain.

### Full Flow Example

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// 1. Upload everything and create voucher
const formData = new FormData();
formData.append('image', fs.createReadStream('./my-nft.png'));
formData.append('tokenId', '1');
formData.append('price', '0.01');
formData.append('minter', '0xCollectorAddress');
formData.append('name', 'Cosmic Art #1');
formData.append('description', 'A beautiful piece');
formData.append('attributes', JSON.stringify([{
  trait_type: 'Rarity',
  value: 'Legendary'
}]));

const response = await axios.post('http://localhost:3000/api/create-nft', formData);
const { voucher } = response.data;

// 2. Send voucher to collector
// Collector uses voucher to mint on-chain
```

## Contract Reference

### LazyNFT.sol

**Constructor:**
```solidity
constructor(
    string memory name,
    string memory symbol,
    uint256 _mintPrice
)
```

**Key Functions:**

- `lazyMint(NFTVoucher calldata voucher)` - Mint NFT using signed voucher
- `setMintPrice(uint256 _newPrice)` - Update mint price (owner only)
- `withdraw()` - Withdraw contract balance (owner only)
- `isVoucherRedeemed(NFTVoucher calldata voucher)` - Check if voucher was used
- `getCurrentTokenId()` - Get current token ID counter

**Events:**

- `NFTMinted(uint256 indexed tokenId, address indexed minter, string uri, uint256 price)`
- `MintPriceUpdated(uint256 newPrice)`
- `Withdrawn(address indexed owner, uint256 amount)`

## API Reference

See [API Documentation](./docs/API.md) for detailed endpoint documentation.

## Security

### Best Practices

1. **Never commit private keys** - Use environment variables
2. **Verify vouchers** - Always verify signatures before accepting
3. **Test on testnets first** - Deploy to Sepolia/Amoy before mainnet
4. **Audit contracts** - Consider professional audit for production
5. **Rate limit API** - Implement rate limiting in production
6. **Secure backend** - Use HTTPS and authentication in production

### Contract Security

- Uses OpenZeppelin's audited contracts
- EIP-712 typed structured data signing
- Reentrancy protection via OpenZeppelin
- Owner-only functions for critical operations
- Voucher redemption tracking to prevent replay attacks

## Troubleshooting

### Common Issues

**Contract deployment fails:**
- Check you have enough testnet/mainnet ETH
- Verify RPC URL is correct
- Ensure private key is valid

**Piñata uploads fail:**
- Verify API keys are correct
- Check Piñata account limits
- Ensure file size is within limits

**Voucher verification fails:**
- Ensure contract address matches
- Verify chain ID is correct
- Check signer is contract owner

**Mint transaction fails:**
- Verify voucher hasn't been used
- Ensure sufficient ETH sent with transaction
- Check minter address matches voucher

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT License - see LICENSE file for details

## Resources

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [EIP-712 Specification](https://eips.ethereum.org/EIPS/eip-712)
- [Piñata Documentation](https://docs.pinata.cloud/)
- [Hardhat Documentation](https://hardhat.org/docs)

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions

---

Built with ❤️ using Hardhat, OpenZeppelin, and Piñata
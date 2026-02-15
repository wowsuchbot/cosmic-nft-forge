# Complete Setup Guide

This guide walks you through the complete setup process for Cosmic NFT Forge, from getting API keys to deploying your first NFT contract.

## Table of Contents

1. [Piñata IPFS Setup](#pinata-ipfs-setup)
2. [RPC Provider Setup](#rpc-provider-setup)
3. [Wallet Setup](#wallet-setup)
4. [Contract Deployment](#contract-deployment)
5. [Backend Configuration](#backend-configuration)
6. [Testing the Setup](#testing-the-setup)

---

## Piñata IPFS Setup

### Step 1: Create a Piñata Account

1. Go to [https://pinata.cloud](https://pinata.cloud)
2. Click "Sign Up" (free tier available)
3. Verify your email address
4. Complete account setup

### Step 2: Generate API Keys

1. Log in to your Piñata dashboard
2. Navigate to **API Keys** in the left sidebar
3. Click **New Key** button
4. Configure your API key:
   - **Key Name**: `cosmic-nft-forge` (or your preferred name)
   - **Permissions**:
     - ☑ Admin (recommended) OR:
     - ☑ `pinFileToIPFS`
     - ☑ `pinJSONToIPFS`
     - ☑ `pinByHash` (optional)
5. Click **Generate Key**
6. **IMPORTANT**: Copy both values immediately:
   - `API Key`
   - `API Secret`
   - You won't be able to see the secret again!

### Step 3: Add to Environment

Add your Piñata credentials to `.env`:

```env
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_API_KEY=your_secret_key_here
```

### Step 4: Test Connection

Test your Piñata setup:

```bash
# Start the backend
cd backend
npm start

# In another terminal, test the connection
curl http://localhost:3000/api/test-pinata
```

You should see:
```json
{
  "success": true,
  "message": "Congratulations! You are communicating with the Pinata API!"
}
```

### Piñata Free Tier Limits

- **Storage**: 1 GB
- **Bandwidth**: 100 GB/month
- **Requests**: Unlimited
- **Files**: Unlimited

For most NFT projects, the free tier is sufficient to get started.

---

## RPC Provider Setup

### Option 1: Alchemy (Recommended)

1. Go to [https://alchemy.com](https://alchemy.com)
2. Sign up for a free account
3. Click **Create App**
4. Configure your app:
   - **Name**: Cosmic NFT Forge
   - **Chain**: Ethereum (or your preferred chain)
   - **Network**: Sepolia (for testing) or Mainnet
5. Click **Create App**
6. View your app and copy the **HTTPS URL**

**Free Tier:**
- 300M compute units per month
- Multiple networks supported
- Enhanced APIs included

### Option 2: Infura

1. Go to [https://infura.io](https://infura.io)
2. Sign up and create a new project
3. Copy the project ID from the settings
4. Your RPC URL will be:
   - Mainnet: `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`
   - Sepolia: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

**Free Tier:**
- 100,000 requests per day
- Core API access

### Add to Environment

Add your RPC URLs to `.env`:

```env
# Ethereum
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY

# Polygon
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR-API-KEY
AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR-API-KEY

# Base
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR-API-KEY
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR-API-KEY
```

---

## Wallet Setup

### Step 1: Get Testnet ETH

Before deploying to mainnet, test on a testnet:

**Ethereum Sepolia:**
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [Chainlink Faucet](https://faucets.chain.link/sepolia)

**Polygon Amoy:**
- [Polygon Faucet](https://faucet.polygon.technology/)

**Base Sepolia:**
- [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

### Step 2: Export Private Key

**MetaMask:**
1. Open MetaMask
2. Click the three dots menu
3. Select **Account Details**
4. Click **Export Private Key**
5. Enter your password
6. Copy the private key

**⚠️ SECURITY WARNING:**
- NEVER share your private key
- NEVER commit it to version control
- Use a separate wallet for development
- Keep mainnet keys separate from testnet keys

### Step 3: Add to Environment

```env
PRIVATE_KEY=your_private_key_here_without_0x_prefix
```

---

## Contract Deployment

### Step 1: Configure Contract Parameters

Edit `.env` with your NFT collection details:

```env
NFT_NAME=Cosmic Art Collection
NFT_SYMBOL=COSMIC
MINT_PRICE_ETH=0.01
```

### Step 2: Compile Contracts

```bash
npm run compile
```

You should see:
```
Compiling 1 file with 0.8.20
Compilation finished successfully
```

### Step 3: Deploy to Testnet

**Deploy to Sepolia:**
```bash
npm run deploy:sepolia
```

**Expected Output:**
```
===========================================
Deploying LazyNFT Contract
===========================================

Contract Parameters:
  Name: Cosmic Art Collection
  Symbol: COSMIC
  Mint Price: 0.01 ETH

Deploying with account: 0x...
Account balance: 1.5 ETH

Network: sepolia
Chain ID: 11155111

Deploying contract...

===========================================
Deployment Successful!
===========================================

Contract Address: 0x...
Contract Owner: 0x...

Transaction Hash: 0x...

Contract Configuration:
  Domain Separator: 0x...
  Chain ID: 11155111
  Current Token ID: 1

Add this to your .env file:
CONTRACT_ADDRESS=0x...
```

### Step 4: Update Environment

Add the deployed contract address to `.env`:

```env
CONTRACT_ADDRESS=0xYourDeployedContractAddress
CHAIN_ID=11155111
```

### Step 5: Verify Contract (Optional but Recommended)

```bash
npx hardhat verify --network sepolia \
  0xYourContractAddress \
  "Cosmic Art Collection" \
  "COSMIC" \
  10000000000000000
```

Verification allows users to:
- Read contract source code on Etherscan
- Interact with contract directly on block explorer
- Build trust in your contract

### Step 6: Deploy to Mainnet

**⚠️ Before mainnet deployment:**
- Test thoroughly on testnet
- Verify all functions work correctly
- Consider a professional security audit
- Ensure you have enough ETH for gas fees

```bash
# Deploy to Ethereum Mainnet
npm run deploy:mainnet

# Deploy to Polygon
npm run deploy:polygon

# Deploy to Base
npm run deploy:base
```

---

## Backend Configuration

### Step 1: Copy Environment to Backend

The backend needs the same `.env` file:

```bash
cp .env backend/.env
```

Or manually create `backend/.env` with:

```env
# Contract Configuration
CONTRACT_ADDRESS=0xYourContractAddress
CHAIN_ID=11155111
PRIVATE_KEY=your_private_key

# Piñata Configuration
PINATA_API_KEY=your_api_key
PINATA_SECRET_API_KEY=your_secret_key

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Start Backend Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Step 4: Test Backend Endpoints

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Get Configuration:**
```bash
curl http://localhost:3000/config
```

**Test Piñata:**
```bash
curl http://localhost:3000/api/test-pinata
```

---

## Testing the Setup

### End-to-End Test

#### 1. Upload Test Metadata

```bash
node examples/upload-to-pinata.js
```

This uploads sample metadata and returns an IPFS URL.

#### 2. Create a Voucher

Edit `examples/create-voucher.js` with your values:

```javascript
const voucherParams = {
  tokenId: 1,
  price: '0.01',
  uri: 'ipfs://QmYourHashFromStep1',
  minter: '0xYourTestWalletAddress',
  contractAddress: CONTRACT_ADDRESS,
  chainId: CHAIN_ID,
};
```

Run:
```bash
node examples/create-voucher.js
```

Save the voucher output.

#### 3. Mint the NFT

Edit `examples/mint-nft.js` with the voucher from step 2:

```javascript
const voucher = {
  tokenId: '1',
  price: '10000000000000000',
  uri: 'ipfs://QmYourHash',
  minter: '0xYourAddress',
  signature: '0xSignatureFromStep2',
};
```

Run:
```bash
node examples/mint-nft.js
```

You should see a successful mint transaction!

#### 4. Verify on Block Explorer

Check your transaction on Etherscan:
- Sepolia: `https://sepolia.etherscan.io/tx/YOUR_TX_HASH`
- Mainnet: `https://etherscan.io/tx/YOUR_TX_HASH`

---

## Production Checklist

Before going to production:

- [ ] Test all functionality on testnet
- [ ] Verify contracts on block explorer
- [ ] Set up proper error handling
- [ ] Implement rate limiting on API
- [ ] Use HTTPS for backend API
- [ ] Set up monitoring and logging
- [ ] Create backup of private keys (securely)
- [ ] Document your API for users
- [ ] Test with real users on testnet
- [ ] Consider security audit for smart contracts
- [ ] Set up alerting for critical functions
- [ ] Implement authentication for backend if needed

---

## Troubleshooting

### Contract Deployment Fails

**Error: Insufficient funds**
- Get more testnet ETH from faucets
- Check your wallet has enough balance

**Error: Invalid private key**
- Ensure private key is in correct format (no 0x prefix)
- Check for extra spaces or characters

### Piñata Upload Fails

**Error: Unauthorized**
- Verify API keys are correct
- Check API key has correct permissions
- Ensure no extra spaces in .env file

**Error: Rate limit exceeded**
- Wait a few minutes and try again
- Consider upgrading Piñata plan

### Backend Won't Start

**Error: Port already in use**
```bash
# Change port in .env
PORT=3001
```

**Error: Module not found**
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules
npm install
```

### Mint Transaction Fails

**Error: Voucher already redeemed**
- Each voucher can only be used once
- Create a new voucher with different tokenId

**Error: Invalid signature**
- Verify signer is contract owner
- Check contract address matches
- Ensure chain ID is correct

**Error: Insufficient payment**
- Verify you're sending enough ETH
- Check mint price in contract

---

## Next Steps

Now that your setup is complete:

1. Read the [API Reference](./API.md)
2. Explore the [Examples](../examples/)
3. Build your frontend integration
4. Deploy to mainnet when ready

## Support

If you run into issues:
- Check this documentation first
- Review the troubleshooting section
- Open an issue on GitHub
- Join our community discussions

---

Happy minting! 🚀
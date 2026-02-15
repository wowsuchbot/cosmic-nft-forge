/**
 * Example: Mint an NFT using a signed voucher
 * This demonstrates how a collector can redeem a voucher and mint an NFT
 */

const { ethers } = require('ethers');
require('dotenv').config();

// Import the contract ABI (you'll need to compile the contract first)
const LazyNFTABI = require('../artifacts/contracts/LazyNFT.sol/LazyNFT.json').abi;

async function main() {
  // Configuration
  const RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY';
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  const MINTER_PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY || process.env.PRIVATE_KEY;

  if (!CONTRACT_ADDRESS || !MINTER_PRIVATE_KEY) {
    console.error('Error: CONTRACT_ADDRESS and MINTER_PRIVATE_KEY must be set');
    process.exit(1);
  }

  // Example voucher (replace with actual voucher from create-voucher.js)
  const voucher = {
    tokenId: '1',
    price: '10000000000000000', // 0.01 ETH in wei
    uri: 'ipfs://QmYourIPFSHashHere/metadata.json',
    minter: '0xYourMinterAddressHere',
    signature: '0xYourSignatureHere',
  };

  console.log('Minting NFT with voucher:');
  console.log(JSON.stringify(voucher, null, 2));
  console.log('');

  try {
    // Connect to the network
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(MINTER_PRIVATE_KEY, provider);

    console.log('Connected as:', wallet.address);
    console.log('Balance:', ethers.formatEther(await provider.getBalance(wallet.address)), 'ETH');
    console.log('');

    // Connect to the contract
    const contract = new ethers.Contract(CONTRACT_ADDRESS, LazyNFTABI, wallet);

    // Check if voucher matches minter
    if (voucher.minter.toLowerCase() !== wallet.address.toLowerCase()) {
      console.warn('WARNING: Voucher minter address does not match wallet address!');
      console.warn(`Voucher minter: ${voucher.minter}`);
      console.warn(`Wallet address: ${wallet.address}`);
    }

    // Prepare voucher for contract call
    const voucherTuple = [
      voucher.tokenId,
      voucher.price,
      voucher.uri,
      voucher.minter,
      voucher.signature,
    ];

    // Estimate gas
    console.log('Estimating gas...');
    const gasEstimate = await contract.lazyMint.estimateGas(voucherTuple, {
      value: voucher.price,
    });
    console.log('Estimated gas:', gasEstimate.toString());
    console.log('');

    // Mint the NFT
    console.log('Sending transaction...');
    const tx = await contract.lazyMint(voucherTuple, {
      value: voucher.price,
    });

    console.log('Transaction hash:', tx.hash);
    console.log('Waiting for confirmation...');

    const receipt = await tx.wait();

    console.log('\n===========================================');
    console.log('NFT Minted Successfully!');
    console.log('===========================================\n');
    console.log('Transaction hash:', receipt.hash);
    console.log('Block number:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
    console.log('Token ID:', voucher.tokenId);
    console.log('Token URI:', voucher.uri);
    console.log('\nView on block explorer:');
    console.log(`https://sepolia.etherscan.io/tx/${receipt.hash}`);
  } catch (error) {
    console.error('\nError minting NFT:', error.message);
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
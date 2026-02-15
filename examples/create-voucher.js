/**
 * Example: Create a signed voucher for lazy minting
 * This demonstrates how to create a voucher off-chain that can be redeemed on-chain
 */

const { createVoucher } = require('../backend/utils/voucher');
require('dotenv').config();

async function main() {
  // Configuration
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  const CHAIN_ID = parseInt(process.env.CHAIN_ID || '11155111'); // Sepolia by default
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!CONTRACT_ADDRESS || !PRIVATE_KEY) {
    console.error('Error: CONTRACT_ADDRESS and PRIVATE_KEY must be set in .env');
    process.exit(1);
  }

  // Voucher parameters
  const voucherParams = {
    tokenId: 1,
    price: '0.01', // Price in ETH
    uri: 'ipfs://QmYourIPFSHashHere/metadata.json',
    minter: '0xYourMinterAddressHere', // Address that will mint the NFT
    contractAddress: CONTRACT_ADDRESS,
    chainId: CHAIN_ID,
  };

  console.log('Creating voucher with parameters:');
  console.log(JSON.stringify(voucherParams, null, 2));
  console.log('');

  try {
    // Create and sign the voucher
    const voucher = await createVoucher(voucherParams, PRIVATE_KEY);

    console.log('\nVoucher created successfully!');
    console.log('\n--- VOUCHER DATA ---');
    console.log(JSON.stringify(voucher, null, 2));
    console.log('\n--- IMPORTANT ---');
    console.log('Save this voucher data. The minter can use it to mint the NFT on-chain.');
    console.log('The voucher can only be used once and must match the signed parameters exactly.');
  } catch (error) {
    console.error('\nError creating voucher:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
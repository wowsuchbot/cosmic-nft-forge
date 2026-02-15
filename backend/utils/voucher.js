const { ethers } = require('ethers');

/**
 * Create a typed data domain for EIP-712 signing
 */
function createDomain(contractAddress, chainId) {
  return {
    name: 'LazyNFT-Voucher',
    version: '1',
    chainId: chainId,
    verifyingContract: contractAddress,
  };
}

/**
 * Create the types for EIP-712 signing
 */
function createTypes() {
  return {
    NFTVoucher: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'price', type: 'uint256' },
      { name: 'uri', type: 'string' },
      { name: 'minter', type: 'address' },
    ],
  };
}

/**
 * Create and sign an NFT voucher
 * @param {Object} params - Voucher parameters
 * @param {number} params.tokenId - Token ID
 * @param {string} params.price - Price in ETH (will be converted to wei)
 * @param {string} params.uri - Token URI (IPFS hash or URL)
 * @param {string} params.minter - Minter's address
 * @param {string} params.contractAddress - Contract address
 * @param {number} params.chainId - Chain ID
 * @param {string} privateKey - Private key of the signer (contract owner)
 * @returns {Object} Signed voucher
 */
async function createVoucher(params, privateKey) {
  const { tokenId, price, uri, minter, contractAddress, chainId } = params;

  // Convert price from ETH to wei
  const priceWei = ethers.parseEther(price.toString());

  // Create the voucher object
  const voucher = {
    tokenId: tokenId,
    price: priceWei.toString(),
    uri: uri,
    minter: minter,
  };

  // Create signer from private key
  const wallet = new ethers.Wallet(privateKey);

  // Create domain and types
  const domain = createDomain(contractAddress, chainId);
  const types = createTypes();

  // Sign the voucher
  const signature = await wallet.signTypedData(domain, types, voucher);

  return {
    ...voucher,
    signature: signature,
  };
}

/**
 * Verify a voucher signature
 * @param {Object} voucher - The voucher to verify
 * @param {string} contractAddress - Contract address
 * @param {number} chainId - Chain ID
 * @returns {string} Recovered signer address
 */
function verifyVoucher(voucher, contractAddress, chainId) {
  const domain = createDomain(contractAddress, chainId);
  const types = createTypes();

  const voucherData = {
    tokenId: voucher.tokenId,
    price: voucher.price,
    uri: voucher.uri,
    minter: voucher.minter,
  };

  const recoveredAddress = ethers.verifyTypedData(
    domain,
    types,
    voucherData,
    voucher.signature
  );

  return recoveredAddress;
}

/**
 * Format voucher for contract interaction
 * @param {Object} voucher - The signed voucher
 * @returns {Array} Formatted voucher tuple for contract call
 */
function formatVoucherForContract(voucher) {
  return [
    voucher.tokenId,
    voucher.price,
    voucher.uri,
    voucher.minter,
    voucher.signature,
  ];
}

module.exports = {
  createVoucher,
  verifyVoucher,
  formatVoucherForContract,
  createDomain,
  createTypes,
};
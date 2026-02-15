const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
  console.log('\n===========================================');
  console.log('Deploying LazyNFT Contract');
  console.log('===========================================\n');

  // Get contract parameters from environment
  const nftName = process.env.NFT_NAME || 'Cosmic NFT Collection';
  const nftSymbol = process.env.NFT_SYMBOL || 'COSMIC';
  const mintPriceEth = process.env.MINT_PRICE_ETH || '0.01';
  
  // Convert price to wei
  const mintPriceWei = ethers.parseEther(mintPriceEth);

  console.log('Contract Parameters:');
  console.log('  Name:', nftName);
  console.log('  Symbol:', nftSymbol);
  console.log('  Mint Price:', mintPriceEth, 'ETH');
  console.log('  Mint Price (Wei):', mintPriceWei.toString());
  console.log('');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const deployerBalance = await ethers.provider.getBalance(deployer.address);

  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(deployerBalance), 'ETH');
  console.log('');

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log('Network:', network.name);
  console.log('Chain ID:', network.chainId.toString());
  console.log('');

  // Deploy the contract
  console.log('Deploying contract...');
  const LazyNFT = await ethers.getContractFactory('LazyNFT');
  const contract = await LazyNFT.deploy(nftName, nftSymbol, mintPriceWei);
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log('\n===========================================');
  console.log('Deployment Successful!');
  console.log('===========================================\n');
  console.log('Contract Address:', contractAddress);
  console.log('Contract Owner:', deployer.address);
  console.log('\nTransaction Hash:', contract.deploymentTransaction().hash);
  console.log('');

  // Get domain separator and chain ID for EIP-712 signing
  const domainSeparator = await contract.getDomainSeparator();
  const chainId = await contract.getChainId();

  console.log('\nContract Configuration:');
  console.log('  Domain Separator:', domainSeparator);
  console.log('  Chain ID:', chainId.toString());
  console.log('  Current Token ID:', (await contract.getCurrentTokenId()).toString());
  console.log('');

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: chainId.toString(),
    contractAddress: contractAddress,
    owner: deployer.address,
    nftName: nftName,
    nftSymbol: nftSymbol,
    mintPrice: mintPriceEth,
    mintPriceWei: mintPriceWei.toString(),
    domainSeparator: domainSeparator,
    deploymentHash: contract.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
  };

  console.log('\n===========================================');
  console.log('IMPORTANT: Save this information!');
  console.log('===========================================');
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log('');
  console.log('Add this to your .env file:');
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  console.log('');

  // Verification instructions
  if (network.chainId !== 31337n) {
    console.log('\nTo verify the contract on block explorer, run:');
    console.log(`npx hardhat verify --network ${network.name} ${contractAddress} "${nftName}" "${nftSymbol}" ${mintPriceWei}`);
    console.log('');
  }

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\nDeployment failed:', error);
    process.exit(1);
  });
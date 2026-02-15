/**
 * Example: Upload image and metadata to Pinata IPFS
 * This demonstrates the complete flow of preparing NFT data
 */

const {
  uploadFileToPinata,
  uploadJSONToPinata,
  createNFTMetadata,
} = require('../backend/utils/pinata');
require('dotenv').config();

async function main() {
  // Configuration
  const PINATA_API_KEY = process.env.PINATA_API_KEY;
  const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    console.error('Error: PINATA_API_KEY and PINATA_SECRET_API_KEY must be set in .env');
    process.exit(1);
  }

  console.log('Uploading NFT data to Pinata IPFS...');
  console.log('');

  try {
    // Step 1: Upload image (replace with your actual image path)
    console.log('Step 1: Uploading image...');
    const imagePath = './examples/sample-image.png'; // Replace with actual path

    // For this example, we'll skip the actual file upload and use a placeholder
    console.log('Note: Replace imagePath with your actual image file');
    const imageIpfsUrl = 'ipfs://QmPlaceholderImageHash'; // Replace with actual upload result

    // If you have an actual image file, uncomment this:
    // const imageResult = await uploadFileToPinata(imagePath, PINATA_API_KEY, PINATA_SECRET_API_KEY);
    // const imageIpfsUrl = imageResult.ipfsUrl;
    // console.log('Image uploaded:', imageResult.ipfsHash);
    // console.log('Gateway URL:', imageResult.gatewayUrl);

    console.log('Image IPFS URL:', imageIpfsUrl);
    console.log('');

    // Step 2: Create metadata
    console.log('Step 2: Creating metadata...');
    const metadata = createNFTMetadata({
      name: 'Cosmic Art #1',
      description: 'A beautiful piece of digital art from the Cosmic NFT Collection',
      image: imageIpfsUrl,
      attributes: [
        {
          trait_type: 'Rarity',
          value: 'Legendary',
        },
        {
          trait_type: 'Background',
          value: 'Cosmic Purple',
        },
        {
          trait_type: 'Edition',
          value: '1 of 1',
        },
      ],
      externalUrl: 'https://yourwebsite.com',
    });

    console.log('Metadata created:');
    console.log(JSON.stringify(metadata, null, 2));
    console.log('');

    // Step 3: Upload metadata to Pinata
    console.log('Step 3: Uploading metadata to Pinata...');
    const metadataResult = await uploadJSONToPinata(
      metadata,
      PINATA_API_KEY,
      PINATA_SECRET_API_KEY
    );

    console.log('\n===========================================');
    console.log('Upload Complete!');
    console.log('===========================================\n');
    console.log('Metadata IPFS Hash:', metadataResult.ipfsHash);
    console.log('Metadata IPFS URL:', metadataResult.ipfsUrl);
    console.log('Gateway URL:', metadataResult.gatewayUrl);
    console.log('\nUse this IPFS URL as the token URI when creating a voucher:');
    console.log(metadataResult.ipfsUrl);
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

/**
 * Upload JSON metadata to Pinata IPFS
 * @param {Object} metadata - NFT metadata object
 * @param {string} pinataApiKey - Pinata API key
 * @param {string} pinataSecretKey - Pinata secret API key
 * @returns {Object} Upload result with IPFS hash
 */
async function uploadJSONToPinata(metadata, pinataApiKey, pinataSecretKey) {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

  const data = {
    pinataContent: metadata,
    pinataMetadata: {
      name: metadata.name || 'NFT Metadata',
    },
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretKey,
      },
    });

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      ipfsUrl: `ipfs://${response.data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      timestamp: response.data.Timestamp,
    };
  } catch (error) {
    console.error('Error uploading to Pinata:', error.response?.data || error.message);
    throw new Error(`Failed to upload to Pinata: ${error.message}`);
  }
}

/**
 * Upload file to Pinata IPFS
 * @param {string} filePath - Path to file
 * @param {string} pinataApiKey - Pinata API key
 * @param {string} pinataSecretKey - Pinata secret API key
 * @returns {Object} Upload result with IPFS hash
 */
async function uploadFileToPinata(filePath, pinataApiKey, pinataSecretKey) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));

  const metadata = JSON.stringify({
    name: filePath.split('/').pop(),
  });
  formData.append('pinataMetadata', metadata);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretKey,
      },
      maxBodyLength: Infinity,
    });

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      ipfsUrl: `ipfs://${response.data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      timestamp: response.data.Timestamp,
    };
  } catch (error) {
    console.error('Error uploading file to Pinata:', error.response?.data || error.message);
    throw new Error(`Failed to upload file to Pinata: ${error.message}`);
  }
}

/**
 * Upload buffer to Pinata IPFS
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Filename
 * @param {string} pinataApiKey - Pinata API key
 * @param {string} pinataSecretKey - Pinata secret API key
 * @returns {Object} Upload result with IPFS hash
 */
async function uploadBufferToPinata(buffer, filename, pinataApiKey, pinataSecretKey) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  const formData = new FormData();
  formData.append('file', buffer, filename);

  const metadata = JSON.stringify({
    name: filename,
  });
  formData.append('pinataMetadata', metadata);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretKey,
      },
      maxBodyLength: Infinity,
    });

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      ipfsUrl: `ipfs://${response.data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      timestamp: response.data.Timestamp,
    };
  } catch (error) {
    console.error('Error uploading buffer to Pinata:', error.response?.data || error.message);
    throw new Error(`Failed to upload buffer to Pinata: ${error.message}`);
  }
}

/**
 * Create NFT metadata following OpenSea standards
 * @param {Object} params - Metadata parameters
 * @returns {Object} Formatted metadata
 */
function createNFTMetadata(params) {
  const {
    name,
    description,
    image,
    attributes = [],
    externalUrl,
    animationUrl,
    backgroundColor,
  } = params;

  const metadata = {
    name,
    description,
    image,
  };

  if (attributes.length > 0) {
    metadata.attributes = attributes;
  }

  if (externalUrl) {
    metadata.external_url = externalUrl;
  }

  if (animationUrl) {
    metadata.animation_url = animationUrl;
  }

  if (backgroundColor) {
    metadata.background_color = backgroundColor;
  }

  return metadata;
}

/**
 * Test Pinata connection
 * @param {string} pinataApiKey - Pinata API key
 * @param {string} pinataSecretKey - Pinata secret API key
 * @returns {Object} Connection status
 */
async function testPinataConnection(pinataApiKey, pinataSecretKey) {
  const url = 'https://api.pinata.cloud/data/testAuthentication';

  try {
    const response = await axios.get(url, {
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretKey,
      },
    });

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Pinata connection test failed:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  uploadJSONToPinata,
  uploadFileToPinata,
  uploadBufferToPinata,
  createNFTMetadata,
  testPinataConnection,
};
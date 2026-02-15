const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const { createVoucher, verifyVoucher } = require('./utils/voucher');
const {
  uploadJSONToPinata,
  uploadBufferToPinata,
  createNFTMetadata,
  testPinataConnection,
} = require('./utils/pinata');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Configuration from environment
const PORT = process.env.PORT || 3000;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '1');
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

// Validate environment variables
if (!CONTRACT_ADDRESS) {
  console.warn('WARNING: CONTRACT_ADDRESS not set in .env');
}
if (!PRIVATE_KEY) {
  console.warn('WARNING: PRIVATE_KEY not set in .env');
}
if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
  console.warn('WARNING: Pinata credentials not set in .env');
}

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Cosmic NFT Forge API',
    status: 'running',
    endpoints: [
      'GET /health',
      'GET /config',
      'POST /api/upload-metadata',
      'POST /api/upload-image',
      'POST /api/create-voucher',
      'POST /api/verify-voucher',
      'GET /api/test-pinata',
    ],
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get configuration (public info only)
app.get('/config', (req, res) => {
  res.json({
    contractAddress: CONTRACT_ADDRESS,
    chainId: CHAIN_ID,
    pinataConfigured: !!(PINATA_API_KEY && PINATA_SECRET_API_KEY),
  });
});

// Test Pinata connection
app.get('/api/test-pinata', async (req, res) => {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      return res.status(400).json({
        error: 'Pinata credentials not configured',
      });
    }

    const result = await testPinataConnection(PINATA_API_KEY, PINATA_SECRET_API_KEY);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload image to Pinata
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      return res.status(400).json({ error: 'Pinata credentials not configured' });
    }

    const result = await uploadBufferToPinata(
      req.file.buffer,
      req.file.originalname,
      PINATA_API_KEY,
      PINATA_SECRET_API_KEY
    );

    res.json(result);
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload metadata to Pinata
app.post('/api/upload-metadata', async (req, res) => {
  try {
    const { name, description, image, attributes, externalUrl, animationUrl, backgroundColor } =
      req.body;

    if (!name || !description || !image) {
      return res.status(400).json({
        error: 'Missing required fields: name, description, image',
      });
    }

    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      return res.status(400).json({ error: 'Pinata credentials not configured' });
    }

    // Create metadata object
    const metadata = createNFTMetadata({
      name,
      description,
      image,
      attributes,
      externalUrl,
      animationUrl,
      backgroundColor,
    });

    // Upload to Pinata
    const result = await uploadJSONToPinata(metadata, PINATA_API_KEY, PINATA_SECRET_API_KEY);

    res.json({
      ...result,
      metadata,
    });
  } catch (error) {
    console.error('Upload metadata error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a signed voucher
app.post('/api/create-voucher', async (req, res) => {
  try {
    const { tokenId, price, uri, minter } = req.body;

    if (!tokenId || !price || !uri || !minter) {
      return res.status(400).json({
        error: 'Missing required fields: tokenId, price, uri, minter',
      });
    }

    if (!CONTRACT_ADDRESS) {
      return res.status(400).json({ error: 'Contract address not configured' });
    }

    if (!PRIVATE_KEY) {
      return res.status(400).json({ error: 'Private key not configured' });
    }

    // Create and sign voucher
    const voucher = await createVoucher(
      {
        tokenId: parseInt(tokenId),
        price: price.toString(),
        uri,
        minter,
        contractAddress: CONTRACT_ADDRESS,
        chainId: CHAIN_ID,
      },
      PRIVATE_KEY
    );

    res.json({
      success: true,
      voucher,
      contractAddress: CONTRACT_ADDRESS,
      chainId: CHAIN_ID,
    });
  } catch (error) {
    console.error('Create voucher error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify a voucher signature
app.post('/api/verify-voucher', async (req, res) => {
  try {
    const { voucher } = req.body;

    if (!voucher) {
      return res.status(400).json({ error: 'Voucher is required' });
    }

    if (!CONTRACT_ADDRESS) {
      return res.status(400).json({ error: 'Contract address not configured' });
    }

    const signer = verifyVoucher(voucher, CONTRACT_ADDRESS, CHAIN_ID);

    res.json({
      valid: true,
      signer,
      contractAddress: CONTRACT_ADDRESS,
      chainId: CHAIN_ID,
    });
  } catch (error) {
    console.error('Verify voucher error:', error);
    res.status(400).json({
      valid: false,
      error: error.message,
    });
  }
});

// Complete flow: Upload image + metadata + create voucher
app.post('/api/create-nft', upload.single('image'), async (req, res) => {
  try {
    const { tokenId, price, minter, name, description, attributes, externalUrl } = req.body;

    if (!tokenId || !price || !minter || !name || !description) {
      return res.status(400).json({
        error: 'Missing required fields: tokenId, price, minter, name, description',
      });
    }

    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      return res.status(400).json({ error: 'Pinata credentials not configured' });
    }

    if (!CONTRACT_ADDRESS || !PRIVATE_KEY) {
      return res.status(400).json({ error: 'Contract configuration incomplete' });
    }

    let imageUrl;

    // Step 1: Upload image if provided
    if (req.file) {
      const imageResult = await uploadBufferToPinata(
        req.file.buffer,
        req.file.originalname,
        PINATA_API_KEY,
        PINATA_SECRET_API_KEY
      );
      imageUrl = imageResult.ipfsUrl;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    } else {
      return res.status(400).json({ error: 'Image is required (file or URL)' });
    }

    // Step 2: Create and upload metadata
    const metadata = createNFTMetadata({
      name,
      description,
      image: imageUrl,
      attributes: attributes ? JSON.parse(attributes) : [],
      externalUrl,
    });

    const metadataResult = await uploadJSONToPinata(
      metadata,
      PINATA_API_KEY,
      PINATA_SECRET_API_KEY
    );

    // Step 3: Create signed voucher
    const voucher = await createVoucher(
      {
        tokenId: parseInt(tokenId),
        price: price.toString(),
        uri: metadataResult.ipfsUrl,
        minter,
        contractAddress: CONTRACT_ADDRESS,
        chainId: CHAIN_ID,
      },
      PRIVATE_KEY
    );

    res.json({
      success: true,
      image: {
        url: imageUrl,
      },
      metadata: {
        ...metadataResult,
        content: metadata,
      },
      voucher,
      contractAddress: CONTRACT_ADDRESS,
      chainId: CHAIN_ID,
    });
  } catch (error) {
    console.error('Create NFT error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log('\n===========================================');
  console.log('Cosmic NFT Forge API Server');
  console.log('===========================================\n');
  console.log(`Server running on port ${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  http://localhost:${PORT}/`);
  console.log(`  http://localhost:${PORT}/health`);
  console.log(`  http://localhost:${PORT}/config`);
  console.log(`  http://localhost:${PORT}/api/test-pinata`);
  console.log(`\nConfiguration:`);
  console.log(`  Contract: ${CONTRACT_ADDRESS || 'NOT SET'}`);
  console.log(`  Chain ID: ${CHAIN_ID}`);
  console.log(`  Pinata: ${PINATA_API_KEY && PINATA_SECRET_API_KEY ? 'CONFIGURED' : 'NOT SET'}`);
  console.log('\n===========================================\n');
});

module.exports = app;
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title LazyNFT
 * @dev NFT contract with lazy minting using EIP-712 signatures
 * Allows creators to sign vouchers off-chain, and collectors to mint on-chain
 */
contract LazyNFT is ERC721URIStorage, EIP712, Ownable {
    using ECDSA for bytes32;

    string private constant SIGNING_DOMAIN = "LazyNFT-Voucher";
    string private constant SIGNATURE_VERSION = "1";

    // Tracks which vouchers have been redeemed
    mapping(bytes32 => bool) private usedVouchers;
    
    // Current token ID counter
    uint256 private _tokenIdCounter;

    // Mint price in wei
    uint256 public mintPrice;

    // Voucher structure for lazy minting
    struct NFTVoucher {
        uint256 tokenId;
        uint256 price;
        string uri;
        address minter;
        bytes signature;
    }

    event NFTMinted(uint256 indexed tokenId, address indexed minter, string uri, uint256 price);
    event MintPriceUpdated(uint256 newPrice);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        uint256 _mintPrice
    ) ERC721(name, symbol) EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) Ownable(msg.sender) {
        mintPrice = _mintPrice;
        _tokenIdCounter = 1;
    }

    /**
     * @dev Lazy mint an NFT using a signed voucher
     * @param voucher The NFTVoucher containing token details and signature
     */
    function lazyMint(NFTVoucher calldata voucher) public payable returns (uint256) {
        // Verify the voucher hasn't been used
        bytes32 voucherHash = _hashVoucher(voucher);
        require(!usedVouchers[voucherHash], "Voucher already redeemed");

        // Verify the signature
        address signer = _verify(voucher);
        require(signer == owner(), "Invalid signature");

        // Verify payment
        require(msg.value >= voucher.price, "Insufficient payment");
        require(msg.value >= mintPrice, "Below minimum mint price");

        // Mark voucher as used
        usedVouchers[voucherHash] = true;

        // Mint the token
        uint256 tokenId = voucher.tokenId;
        _safeMint(voucher.minter, tokenId);
        _setTokenURI(tokenId, voucher.uri);

        // Increment counter if this is a new token
        if (tokenId >= _tokenIdCounter) {
            _tokenIdCounter = tokenId + 1;
        }

        emit NFTMinted(tokenId, voucher.minter, voucher.uri, voucher.price);

        return tokenId;
    }

    /**
     * @dev Verify that a voucher was signed by the contract owner
     */
    function _verify(NFTVoucher calldata voucher) internal view returns (address) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("NFTVoucher(uint256 tokenId,uint256 price,string uri,address minter)"),
                    voucher.tokenId,
                    voucher.price,
                    keccak256(bytes(voucher.uri)),
                    voucher.minter
                )
            )
        );
        return digest.recover(voucher.signature);
    }

    /**
     * @dev Generate a hash of the voucher for tracking redemptions
     */
    function _hashVoucher(NFTVoucher calldata voucher) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                voucher.tokenId,
                voucher.price,
                voucher.uri,
                voucher.minter
            )
        );
    }

    /**
     * @dev Check if a voucher has been redeemed
     */
    function isVoucherRedeemed(NFTVoucher calldata voucher) public view returns (bool) {
        bytes32 voucherHash = _hashVoucher(voucher);
        return usedVouchers[voucherHash];
    }

    /**
     * @dev Get the chain ID for EIP-712 signing
     */
    function getChainId() external view returns (uint256) {
        return block.chainid;
    }

    /**
     * @dev Update the minimum mint price (owner only)
     */
    function setMintPrice(uint256 _newPrice) external onlyOwner {
        mintPrice = _newPrice;
        emit MintPriceUpdated(_newPrice);
    }

    /**
     * @dev Withdraw contract balance to owner
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawn(owner(), balance);
    }

    /**
     * @dev Get current token counter
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Get the domain separator for EIP-712
     */
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
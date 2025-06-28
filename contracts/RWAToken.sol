// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract RWAToken is ERC20, ERC20Burnable, Ownable, Pausable, ReentrancyGuard {
    struct AssetInfo {
        string name;
        string category;
        string location;
        string verification;
        uint256 totalValue;
        uint256 lastUpdated;
        bool isActive;
    }

    struct PriceData {
        uint256 price;
        uint256 timestamp;
        uint256 confidence;
    }

    AssetInfo public assetInfo;
    PriceData public currentPrice;
    AggregatorV3Interface public priceFeed;
    
    mapping(address => bool) public authorizedUpdaters;
    mapping(uint256 => PriceData) public priceHistory;
    uint256 public priceHistoryCount;
    
    uint256 public constant PRICE_DECIMALS = 8;
    uint256 public constant MAX_SUPPLY = 1000000 * 10**decimals();
    uint256 public mintingFee = 100; // 1% in basis points
    uint256 public tradingFee = 30;  // 0.3% in basis points
    
    event AssetInfoUpdated(string name, string category, uint256 totalValue);
    event PriceUpdated(uint256 newPrice, uint256 confidence, uint256 timestamp);
    event TokensMinted(address indexed to, uint256 amount, uint256 fee);
    event TokensBurned(address indexed from, uint256 amount);
    event FeesUpdated(uint256 mintingFee, uint256 tradingFee);

    constructor(
        string memory _name,
        string memory _symbol,
        address _priceFeed,
        AssetInfo memory _assetInfo
    ) ERC20(_name, _symbol) {
        priceFeed = AggregatorV3Interface(_priceFeed);
        assetInfo = _assetInfo;
        assetInfo.lastUpdated = block.timestamp;
        assetInfo.isActive = true;
        
        authorizedUpdaters[msg.sender] = true;
        
        // Initialize with current price from Chainlink
        updatePriceFromChainlink();
    }

    modifier onlyAuthorizedUpdater() {
        require(authorizedUpdaters[msg.sender], "Not authorized to update");
        _;
    }

    function mint(address to, uint256 amount) external payable nonReentrant whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        
        uint256 fee = (amount * mintingFee) / 10000;
        uint256 netAmount = amount - fee;
        
        require(msg.value >= fee, "Insufficient fee payment");
        
        _mint(to, netAmount);
        
        // Refund excess payment
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }
        
        emit TokensMinted(to, netAmount, fee);
    }

    function updatePriceFromChainlink() public onlyAuthorizedUpdater {
        (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        
        require(price > 0, "Invalid price from Chainlink");
        require(updatedAt > 0, "Invalid timestamp from Chainlink");
        
        currentPrice = PriceData({
            price: uint256(price),
            timestamp: updatedAt,
            confidence: 95 // High confidence for Chainlink data
        });
        
        priceHistory[priceHistoryCount] = currentPrice;
        priceHistoryCount++;
        
        emit PriceUpdated(uint256(price), 95, updatedAt);
    }

    function updatePriceManual(uint256 _price, uint256 _confidence) external onlyAuthorizedUpdater {
        require(_price > 0, "Price must be greater than 0");
        require(_confidence <= 100, "Confidence cannot exceed 100");
        
        currentPrice = PriceData({
            price: _price,
            timestamp: block.timestamp,
            confidence: _confidence
        });
        
        priceHistory[priceHistoryCount] = currentPrice;
        priceHistoryCount++;
        
        emit PriceUpdated(_price, _confidence, block.timestamp);
    }

    function updateAssetInfo(
        string memory _name,
        string memory _category,
        string memory _location,
        string memory _verification,
        uint256 _totalValue
    ) external onlyOwner {
        assetInfo.name = _name;
        assetInfo.category = _category;
        assetInfo.location = _location;
        assetInfo.verification = _verification;
        assetInfo.totalValue = _totalValue;
        assetInfo.lastUpdated = block.timestamp;
        
        emit AssetInfoUpdated(_name, _category, _totalValue);
    }

    function setAuthorizedUpdater(address updater, bool authorized) external onlyOwner {
        authorizedUpdaters[updater] = authorized;
    }

    function updateFees(uint256 _mintingFee, uint256 _tradingFee) external onlyOwner {
        require(_mintingFee <= 1000, "Minting fee too high"); // Max 10%
        require(_tradingFee <= 500, "Trading fee too high");   // Max 5%
        
        mintingFee = _mintingFee;
        tradingFee = _tradingFee;
        
        emit FeesUpdated(_mintingFee, _tradingFee);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner()).transfer(balance);
    }

    function getAssetInfo() external view returns (AssetInfo memory) {
        return assetInfo;
    }

    function getCurrentPrice() external view returns (PriceData memory) {
        return currentPrice;
    }

    function getPriceHistory(uint256 count) external view returns (PriceData[] memory) {
        require(count <= priceHistoryCount, "Count exceeds history length");
        
        PriceData[] memory history = new PriceData[](count);
        uint256 startIndex = priceHistoryCount > count ? priceHistoryCount - count : 0;
        
        for (uint256 i = 0; i < count; i++) {
            history[i] = priceHistory[startIndex + i];
        }
        
        return history;
    }

    function calculateTradingFee(uint256 amount) external view returns (uint256) {
        return (amount * tradingFee) / 10000;
    }

    // Override transfer functions to include trading fees
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        uint256 fee = calculateTradingFee(amount);
        uint256 netAmount = amount - fee;
        
        _transfer(_msgSender(), to, netAmount);
        if (fee > 0) {
            _transfer(_msgSender(), owner(), fee);
        }
        
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        uint256 fee = calculateTradingFee(amount);
        uint256 netAmount = amount - fee;
        
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, netAmount);
        if (fee > 0) {
            _transfer(from, owner(), fee);
        }
        
        return true;
    }
}
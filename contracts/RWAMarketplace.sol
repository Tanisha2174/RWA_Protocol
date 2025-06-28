// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./RWAToken.sol";

contract RWAMarketplace is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct Order {
        uint256 id;
        address seller;
        address tokenAddress;
        uint256 amount;
        uint256 pricePerToken;
        uint256 timestamp;
        bool isActive;
        OrderType orderType;
    }

    struct Trade {
        uint256 orderId;
        address buyer;
        address seller;
        uint256 amount;
        uint256 price;
        uint256 timestamp;
    }

    enum OrderType { MARKET, LIMIT }

    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public userOrders;
    mapping(address => bool) public supportedTokens;
    
    uint256 public nextOrderId = 1;
    uint256 public marketplaceFee = 250; // 2.5% in basis points
    uint256 public totalTrades;
    
    Trade[] public tradeHistory;
    
    event OrderCreated(uint256 indexed orderId, address indexed seller, address indexed token, uint256 amount, uint256 price);
    event OrderCancelled(uint256 indexed orderId);
    event OrderFilled(uint256 indexed orderId, address indexed buyer, uint256 amount, uint256 price);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event FeesUpdated(uint256 newFee);

    constructor() {}

    modifier onlySupportedToken(address token) {
        require(supportedTokens[token], "Token not supported");
        _;
    }

    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }

    function createOrder(
        address tokenAddress,
        uint256 amount,
        uint256 pricePerToken,
        OrderType orderType
    ) external nonReentrant onlySupportedToken(tokenAddress) {
        require(amount > 0, "Amount must be greater than 0");
        require(pricePerToken > 0, "Price must be greater than 0");
        
        IERC20 token = IERC20(tokenAddress);
        require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        
        // Transfer tokens to marketplace
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        Order memory newOrder = Order({
            id: nextOrderId,
            seller: msg.sender,
            tokenAddress: tokenAddress,
            amount: amount,
            pricePerToken: pricePerToken,
            timestamp: block.timestamp,
            isActive: true,
            orderType: orderType
        });
        
        orders[nextOrderId] = newOrder;
        userOrders[msg.sender].push(nextOrderId);
        
        emit OrderCreated(nextOrderId, msg.sender, tokenAddress, amount, pricePerToken);
        nextOrderId++;
    }

    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.seller == msg.sender, "Not the seller");
        require(order.isActive, "Order not active");
        
        order.isActive = false;
        
        // Return tokens to seller
        IERC20 token = IERC20(order.tokenAddress);
        token.safeTransfer(order.seller, order.amount);
        
        emit OrderCancelled(orderId);
    }

    function fillOrder(uint256 orderId, uint256 amount) external payable nonReentrant {
        Order storage order = orders[orderId];
        require(order.isActive, "Order not active");
        require(order.seller != msg.sender, "Cannot buy own order");
        require(amount <= order.amount, "Amount exceeds order");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 totalPrice = amount * order.pricePerToken;
        uint256 fee = (totalPrice * marketplaceFee) / 10000;
        uint256 sellerAmount = totalPrice - fee;
        
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Update order
        order.amount -= amount;
        if (order.amount == 0) {
            order.isActive = false;
        }
        
        // Transfer tokens to buyer
        IERC20 token = IERC20(order.tokenAddress);
        token.safeTransfer(msg.sender, amount);
        
        // Transfer payment to seller
        payable(order.seller).transfer(sellerAmount);
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        // Record trade
        Trade memory newTrade = Trade({
            orderId: orderId,
            buyer: msg.sender,
            seller: order.seller,
            amount: amount,
            price: order.pricePerToken,
            timestamp: block.timestamp
        });
        
        tradeHistory.push(newTrade);
        totalTrades++;
        
        emit OrderFilled(orderId, msg.sender, amount, order.pricePerToken);
    }

    function getActiveOrders(address tokenAddress) external view returns (Order[] memory) {
        uint256 activeCount = 0;
        
        // Count active orders
        for (uint256 i = 1; i < nextOrderId; i++) {
            if (orders[i].isActive && orders[i].tokenAddress == tokenAddress) {
                activeCount++;
            }
        }
        
        // Create array of active orders
        Order[] memory activeOrders = new Order[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextOrderId; i++) {
            if (orders[i].isActive && orders[i].tokenAddress == tokenAddress) {
                activeOrders[index] = orders[i];
                index++;
            }
        }
        
        return activeOrders;
    }

    function getUserOrders(address user) external view returns (uint256[] memory) {
        return userOrders[user];
    }

    function getRecentTrades(uint256 count) external view returns (Trade[] memory) {
        require(count <= tradeHistory.length, "Count exceeds trade history");
        
        Trade[] memory recentTrades = new Trade[](count);
        uint256 startIndex = tradeHistory.length > count ? tradeHistory.length - count : 0;
        
        for (uint256 i = 0; i < count; i++) {
            recentTrades[i] = tradeHistory[startIndex + i];
        }
        
        return recentTrades;
    }

    function updateMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        marketplaceFee = newFee;
        emit FeesUpdated(newFee);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
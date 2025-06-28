// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CrossChainBridge is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct BridgeRequest {
        uint256 id;
        address user;
        address token;
        uint256 amount;
        uint256 targetChainId;
        uint256 timestamp;
        BridgeStatus status;
    }

    enum BridgeStatus { PENDING, COMPLETED, FAILED }

    mapping(uint256 => BridgeRequest) public bridgeRequests;
    mapping(address => bool) public supportedTokens;
    mapping(uint256 => bool) public supportedChains;
    mapping(address => bool) public validators;
    
    uint256 public nextRequestId = 1;
    uint256 public bridgeFee = 100; // 1% in basis points
    uint256 public minValidators = 2;
    
    event BridgeInitiated(uint256 indexed requestId, address indexed user, address token, uint256 amount, uint256 targetChain);
    event BridgeCompleted(uint256 indexed requestId);
    event BridgeFailed(uint256 indexed requestId, string reason);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);

    constructor() {
        validators[msg.sender] = true;
        
        // Add supported chains
        supportedChains[1] = true;     // Ethereum
        supportedChains[137] = true;   // Polygon
        supportedChains[42161] = true; // Arbitrum
        supportedChains[10] = true;    // Optimism
    }

    modifier onlyValidator() {
        require(validators[msg.sender], "Not a validator");
        _;
    }

    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function addSupportedChain(uint256 chainId) external onlyOwner {
        supportedChains[chainId] = true;
    }

    function addValidator(address validator) external onlyOwner {
        validators[validator] = true;
        emit ValidatorAdded(validator);
    }

    function removeValidator(address validator) external onlyOwner {
        validators[validator] = false;
        emit ValidatorRemoved(validator);
    }

    function initiateBridge(
        address token,
        uint256 amount,
        uint256 targetChainId
    ) external payable nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(supportedChains[targetChainId], "Target chain not supported");
        require(targetChainId != block.chainid, "Cannot bridge to same chain");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 fee = (amount * bridgeFee) / 10000;
        require(msg.value >= fee, "Insufficient bridge fee");
        
        IERC20 tokenContract = IERC20(token);
        require(tokenContract.balanceOf(msg.sender) >= amount, "Insufficient token balance");
        require(tokenContract.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        
        // Lock tokens
        tokenContract.safeTransferFrom(msg.sender, address(this), amount);
        
        BridgeRequest memory request = BridgeRequest({
            id: nextRequestId,
            user: msg.sender,
            token: token,
            amount: amount,
            targetChainId: targetChainId,
            timestamp: block.timestamp,
            status: BridgeStatus.PENDING
        });
        
        bridgeRequests[nextRequestId] = request;
        
        // Refund excess fee
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }
        
        emit BridgeInitiated(nextRequestId, msg.sender, token, amount, targetChainId);
        nextRequestId++;
    }

    function completeBridge(uint256 requestId) external onlyValidator {
        BridgeRequest storage request = bridgeRequests[requestId];
        require(request.status == BridgeStatus.PENDING, "Request not pending");
        
        request.status = BridgeStatus.COMPLETED;
        
        // In a real implementation, this would mint tokens on the target chain
        // For now, we'll just mark as completed
        
        emit BridgeCompleted(requestId);
    }

    function failBridge(uint256 requestId, string memory reason) external onlyValidator {
        BridgeRequest storage request = bridgeRequests[requestId];
        require(request.status == BridgeStatus.PENDING, "Request not pending");
        
        request.status = BridgeStatus.FAILED;
        
        // Return tokens to user
        IERC20 token = IERC20(request.token);
        token.safeTransfer(request.user, request.amount);
        
        emit BridgeFailed(requestId, reason);
    }

    function getBridgeRequest(uint256 requestId) external view returns (BridgeRequest memory) {
        return bridgeRequests[requestId];
    }

    function updateBridgeFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        bridgeFee = newFee;
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
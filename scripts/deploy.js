const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying RWA Tokenization Platform contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Mock Chainlink price feed address (for local testing)
  const mockPriceFeed = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"; // ETH/USD on mainnet
  
  // Deploy RWA Token for Gold
  const RWAToken = await ethers.getContractFactory("RWAToken");
  const goldAssetInfo = {
    name: "Tokenized Gold Vault",
    category: "commodities",
    location: "Swiss Secure Vaults",
    verification: "Chainlink Proof of Reserve",
    totalValue: ethers.utils.parseEther("1000000"), // $1M worth
    lastUpdated: 0,
    isActive: true
  };

  const goldToken = await RWAToken.deploy(
    "Tokenized Gold",
    "GOLD",
    mockPriceFeed,
    goldAssetInfo
  );
  await goldToken.deployed();
  console.log("Gold Token deployed to:", goldToken.address);

  // Deploy RWA Token for Real Estate
  const reitAssetInfo = {
    name: "Commercial Real Estate Portfolio",
    category: "real-estate",
    location: "New York, London, Tokyo",
    verification: "Third-party Property Audit",
    totalValue: ethers.utils.parseEther("5000000"), // $5M worth
    lastUpdated: 0,
    isActive: true
  };

  const reitToken = await RWAToken.deploy(
    "Real Estate Investment Trust",
    "REIT",
    mockPriceFeed,
    reitAssetInfo
  );
  await reitToken.deployed();
  console.log("REIT Token deployed to:", reitToken.address);

  // Deploy Marketplace
  const RWAMarketplace = await ethers.getContractFactory("RWAMarketplace");
  const marketplace = await RWAMarketplace.deploy();
  await marketplace.deployed();
  console.log("Marketplace deployed to:", marketplace.address);

  // Deploy Cross-Chain Bridge
  const CrossChainBridge = await ethers.getContractFactory("CrossChainBridge");
  const bridge = await CrossChainBridge.deploy();
  await bridge.deployed();
  console.log("Cross-Chain Bridge deployed to:", bridge.address);

  // Add tokens to marketplace
  await marketplace.addSupportedToken(goldToken.address);
  await marketplace.addSupportedToken(reitToken.address);
  console.log("Tokens added to marketplace");

  // Add tokens to bridge
  await bridge.addSupportedToken(goldToken.address);
  await bridge.addSupportedToken(reitToken.address);
  console.log("Tokens added to bridge");

  // Save deployment addresses
  const deploymentInfo = {
    goldToken: goldToken.address,
    reitToken: reitToken.address,
    marketplace: marketplace.address,
    bridge: bridge.address,
    deployer: deployer.address,
    network: await ethers.provider.getNetwork()
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Save to file for frontend
  const fs = require('fs');
  fs.writeFileSync(
    './src/contracts/deployments.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment info saved to src/contracts/deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
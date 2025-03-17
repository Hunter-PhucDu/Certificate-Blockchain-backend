import '@nomiclabs/hardhat-ethers';
import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

async function main() {
  const CertificateStorage = await ethers.getContractFactory('CertificateStorage');

  const certificateStorage = await CertificateStorage.deploy();

  await certificateStorage.waitForDeployment();

  const contractAddress = await certificateStorage.getAddress();

  console.log('CertificateStorage deployed to:', contractAddress);
  console.log('Verification command:');
  console.log(`npx hardhat verify --network sepolia ${contractAddress}`);

  const addressesPath = path.join(__dirname, '..', 'deployments.json');
  const addresses = {
    contractAddress: contractAddress,
  };

  let existingAddresses = {};
  if (fs.existsSync(addressesPath)) {
    const existingData = fs.readFileSync(addressesPath, 'utf-8');
    existingAddresses = JSON.parse(existingData);
  }

  existingAddresses = { ...existingAddresses, ...addresses };

  fs.writeFileSync(addressesPath, JSON.stringify(existingAddresses, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

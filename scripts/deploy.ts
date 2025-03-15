import '@nomiclabs/hardhat-ethers';
import { ethers } from 'hardhat';

async function main() {
  const CertificateStorage = await ethers.getContractFactory('CertificateStorage');
  const certificateStorage = await CertificateStorage.deploy();

  await certificateStorage.waitForDeployment();

  const contractAddress = await certificateStorage.getAddress();

  console.log('CertificateStorage deployed to:', contractAddress);

  console.log('Verification command:');
  console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

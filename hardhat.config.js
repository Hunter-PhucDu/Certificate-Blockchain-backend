// // /** @type import('hardhat/config').HardhatUserConfig */
// // module.exports = {
// //   solidity: '0.8.28',
// // };

// require('@nomicfoundation/hardhat-toolbox');
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// require('dotenv').config();

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: '0.8.28',
//   networks: {
//     sepolia: {
//       url: process.env.BLOCKCHAIN_RPC_URL,
//       accounts: [`0x${process.env.BLOCKCHAIN_PRIVATE_KEY}`],
//       timeout: 1000000,
//     },
//   },
// };

require('@nomicfoundation/hardhat-toolbox');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    myQuickNode: {
      url: process.env.BLOCKCHAIN_MYQUICKNODE_URL,
      accounts: [process.env.BLOCKCHAIN_PRIVATE_KEY],
    },
    sepolia: {
      url: process.env.BLOCKCHAIN_RPC_URL,
      accounts: [process.env.BLOCKCHAIN_PRIVATE_KEY],
    },
  },
  solidity: '0.8.28',
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },
  sourcify: {
    enabled: true,
  },
};

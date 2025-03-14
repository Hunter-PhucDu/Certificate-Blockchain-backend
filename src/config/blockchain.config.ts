import { registerAs } from '@nestjs/config';

export default registerAs('blockchain', () => ({
  rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
  contractAddress: process.env.CONTRACT_ADDRESS,
  privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY,
}));

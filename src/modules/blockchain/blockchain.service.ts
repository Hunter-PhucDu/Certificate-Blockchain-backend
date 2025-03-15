import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { CertificateContractABI } from './constants/contract.abi';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private web3: Web3;
  private contract: Contract<typeof CertificateContractABI>;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.web3 = new Web3(this.configService.get<string>('BLOCKCHAIN_RPC_URL'));

      // Khởi tạo contract instance
      this.contract = new this.web3.eth.Contract(
        CertificateContractABI,
        this.configService.get<string>('BLOCKCHAIN_CONTRACT_ADDRESS'),
      );

      // Set up account từ private key
      const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');
      if (!privateKey) {
        throw new Error('Blockchain private key not configured');
      }

      const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
      this.web3.eth.accounts.wallet.add(account);

      // Kiểm tra kết nối
      await this.web3.eth.net.isListening();
    } catch (error) {
      throw new Error(`Blockchain initialization failed: ${error.message}`);
    }
  }

  async storeCertificate(data: any): Promise<{ blockId: string; transactionHash: string }> {
    try {
      if (!this.contract || !this.web3.eth.accounts.wallet[0]) {
        throw new Error('Blockchain service not properly initialized');
      }

      // Hash dữ liệu certificate
      const certificateHash = this.web3.utils.sha3(JSON.stringify(data));
      if (!certificateHash) {
        throw new Error('Failed to generate certificate hash');
      }

      // Tạo transaction
      const tx = await this.contract.methods.storeCertificate(certificateHash).send({
        from: this.web3.eth.accounts.wallet[0].address,
        gas: '500000',
      });

      if (!tx.blockNumber || !tx.transactionHash) {
        throw new Error('Transaction failed');
      }

      return {
        blockId: tx.blockNumber.toString(),
        transactionHash: tx.transactionHash,
      };
    } catch (error) {
      throw new BadRequestException(`Blockchain error: ${error.message}`);
    }
  }

  async verifyCertificate(blockId: string, transactionHash: string): Promise<boolean> {
    try {
      if (!this.web3) {
        throw new Error('Blockchain service not properly initialized');
      }

      // Lấy transaction receipt
      const receipt = await this.web3.eth.getTransactionReceipt(transactionHash);
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      // Kiểm tra block number
      if (receipt.blockNumber.toString() !== blockId) {
        return false;
      }

      // Kiểm tra status của transaction (1 = success, 0 = failure)
      return Number(receipt.status) === 1;
    } catch (error) {
      throw new BadRequestException(`Verification error: ${error.message}`);
    }
  }

  async getCertificateData(transactionHash: string): Promise<any> {
    try {
      if (!this.web3 || !this.contract) {
        throw new Error('Blockchain service not properly initialized');
      }

      const tx = await this.web3.eth.getTransaction(transactionHash);
      if (!tx) {
        throw new Error('Transaction not found');
      }

      const decodedData = await this.contract.methods.decodeCertificateData(tx.input).call();
      if (!decodedData || typeof decodedData !== 'string') {
        throw new Error('Decoded data is not a valid string');
      }
      return JSON.parse(decodedData);
    } catch (error) {
      throw new BadRequestException(`Error getting certificate data: ${error.message}`);
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.web3.eth.net.isListening();
      return true;
    } catch {
      return false;
    }
  }
}

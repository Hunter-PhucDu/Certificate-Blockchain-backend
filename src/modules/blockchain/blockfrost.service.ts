import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlockfrostService {
  private readonly logger = new Logger(BlockfrostService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('BLOCKFROST_API_URL');
    this.apiKey = this.configService.get<string>('BLOCKFROST_PROJECT_ID');

    if (!this.baseUrl) {
      throw new Error('BLOCKFROST_API_URL environment variable is not defined');
    }

    if (!this.apiKey) {
      throw new Error('BLOCKFROST_PROJECT_ID environment variable is not defined');
    }
  }

  async getUTxOs(address: string): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/addresses/${address}/utxos`;

      const response = await axios.get(url, {
        headers: { project_id: this.apiKey },
      });

      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return [];
      }

      this.logger.error(`Error in getUTxOs: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
        this.logger.error(`Response status: ${error.response.status}`);
      }

      throw error;
    }
  }

  async getCurrentSlot(): Promise<{
    slot: string;
    epoch: number;
    height: number;
  }> {
    try {
      const url = `${this.baseUrl}/blocks/latest`;

      const response = await axios.get(url, {
        headers: { project_id: this.apiKey },
      });

      return {
        slot: response.data.slot,
        epoch: response.data.epoch,
        height: response.data.height,
      };
    } catch (error: any) {
      this.logger.error(`Error in getCurrentSlot: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
        this.logger.error(`Response status: ${error.response.status}`);
      }

      throw new Error('Error getting current slot: ' + (error.response?.data?.message || error.message));
    }
  }

  async submitTransaction(txHex: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/tx/submit`;

      const txBuffer = Buffer.from(txHex, 'hex');

      const response = await axios.post(url, txBuffer, {
        headers: {
          project_id: this.apiKey,
          'Content-Type': 'application/cbor',
        },
        timeout: 30000,
      });

      return response.data;
    } catch (error: any) {
      this.logger.error(`Error in submitTransaction: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
        this.logger.error(`Response status: ${error.response.status}`);
      }

      if (error.response) {
        throw new Error(`Transaction submission failed: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        throw new Error('No response received from Blockfrost API');
      } else {
        throw new Error('Error setting up request to Blockfrost API: ' + error.message);
      }
    }
  }

  async getTransaction(txHash: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/txs/${txHash}`;
      this.logger.log(`Fetching transaction info from URL: ${url}`);
      const response = await axios.get(url, {
        headers: { project_id: this.apiKey },
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error fetching transaction info: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
        this.logger.error(`Response status: ${error.response.status}`);
      }
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async getTransactionMetadata(txHash: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/txs/${txHash}/metadata`;
      this.logger.log(`Fetching metadata from URL: ${url}`);

      const response = await axios.get(url, {
        headers: { project_id: this.apiKey },
      });

      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        this.logger.warn(`No metadata found for transaction: ${txHash}`);
        return [];
      }

      this.logger.error(`Error fetching metadata for transaction ${txHash}: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
        this.logger.error(`Response status: ${error.response.status}`);
      }

      throw new Error(`Error fetching metadata: ${error.response?.data?.message || error.message}`);
    }
  }
}

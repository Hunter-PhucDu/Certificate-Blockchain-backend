import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlockfrostService {
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
      const response = await axios.get(url, {
        headers: { project_id: this.apiKey },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async getTransactionMetadata(txHash: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/txs/${txHash}/metadata`;
      const response = await axios.get(url, {
        headers: { project_id: this.apiKey },
      });

      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return [];
      }
      throw new Error(`Error fetching metadata: ${error.response?.data?.message || error.message}`);
    }
  }

  async getBulkTransactionMetadata(txHash: string, index?: number): Promise<any> {
    try {
      const metadata = await this.getTransactionMetadata(txHash);

      if (!metadata || metadata.length === 0) {
        throw new Error(`No metadata found for transaction: ${txHash}`);
      }

      // If index is not provided, return all metadata
      if (index === undefined) {
        return metadata;
      }

      // Filter metadata by index
      // Based on the metadata structure defined in buildBulkCertificateMetadata
      const indexStr = `${674}${index + 1}`;
      const filteredMetadata = metadata.filter((item) => item.label === indexStr);

      if (filteredMetadata.length === 0) {
        throw new Error(`No metadata found for certificate index ${index} in transaction: ${txHash}`);
      }

      return filteredMetadata;
    } catch (error: any) {
      throw new Error(`Error fetching bulk metadata: ${error.message}`);
    }
  }
}

/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import * as bip39 from 'bip39';
import * as Cardano from '@emurgo/cardano-serialization-lib-nodejs';

@Injectable()
export class KeyManagementService {
  // eslint-disable-next-line @typescript-eslint/require-await
  async getPrivateKeyFromMnemonic(mnemonic: string): Promise<string> {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic provided');
    }

    const entropy = bip39.mnemonicToEntropy(mnemonic);

    const seed = Cardano.Bip32PrivateKey.from_bip39_entropy(Buffer.from(entropy, 'hex'), Buffer.from(''));

    // m/1852'/1815'/0'/0/0 (hardened derivation)
    const accountKey = seed
      .derive(1852 | 0x80000000)
      .derive(1815 | 0x80000000)
      .derive(0 | 0x80000000);

    const utxoKey = accountKey.derive(0).derive(0);
    const privateKey = utxoKey.to_raw_key();
    const privateKeyBech32 = privateKey.to_bech32();

    return privateKeyBech32;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getBaseAddressFromPrivateKey(mnemonic: string, privateKeyBech32: string): Promise<string> {
    try {
      const privateKey = Cardano.PrivateKey.from_bech32(privateKeyBech32);
      const publicKey = privateKey.to_public();

      const entropy = bip39.mnemonicToEntropy(mnemonic);
      const rootKey = Cardano.Bip32PrivateKey.from_bip39_entropy(Buffer.from(entropy, 'hex'), Buffer.from(''));

      const accountKey = rootKey
        .derive(1852 | 0x80000000)
        .derive(1815 | 0x80000000)
        .derive(0 | 0x80000000);
      const stakingKey = accountKey.derive(2).derive(0).to_raw_key().to_public();

      const networkId = process.env.CARDANO_NETWORK === 'mainnet' ? 1 : 0;

      const baseAddr = Cardano.BaseAddress.new(
        networkId,
        Cardano.Credential.from_keyhash(publicKey.hash()),
        Cardano.Credential.from_keyhash(stakingKey.hash()),
      );

      const baseAddrBech32 = baseAddr.to_address().to_bech32();
      return baseAddrBech32;
    } catch (error) {
      throw new Error(`Error in getBaseAddressFromPrivateKey:', ${error}`);
    }
  }

  async getAddressFromPrivateKey(privateKeyBech32: string): Promise<string> {
    const privateKey = Cardano.PrivateKey.from_bech32(privateKeyBech32);

    const publicKey = privateKey.to_public();
    const networkId = 0; // Preprod/testnet
    const enterpriseAddress = Cardano.EnterpriseAddress.new(
      networkId,
      Cardano.Credential.from_keyhash(publicKey.hash()),
    );
    return enterpriseAddress.to_address().to_bech32();
  }

  async validatePrivateKeyWithMnemonic(mnemonic: string, walletAddress: string): Promise<boolean> {
    const privateKeyBech32 = await this.getPrivateKeyFromMnemonic(mnemonic);
    const derivedAddress = await this.getBaseAddressFromPrivateKey(mnemonic, privateKeyBech32);

    if (derivedAddress === walletAddress) {
      return true;
    } else {
      return false;
    }
  }

  private async deriveChildKey(parentKey: Cardano.PrivateKey, index: number): Promise<Cardano.PrivateKey> {
    const parentKeyBytes = parentKey.as_bytes();
    const combinedBytes = Buffer.concat([Buffer.from(parentKeyBytes), Buffer.from([index])]);

    const entropy = await this.hashData(combinedBytes);

    return Cardano.PrivateKey.from_extended_bytes(Buffer.from(entropy.slice(0, 64)));
  }

  private async hashData(data: Buffer): Promise<Uint8Array> {
    const { createHash } = require('crypto');
    const hash = createHash('sha512');
    hash.update(data);
    return new Uint8Array(hash.digest());
  }

  async generateChildAddresses(privateKeyBech32: string, count: number): Promise<string[]> {
    const privateKey = Cardano.PrivateKey.from_bech32(privateKeyBech32);
    const addresses: string[] = [];

    for (let i = 0; i < count; i++) {
      const childKey = await this.deriveChildKey(privateKey, i);
      const publicKey = childKey.to_public();

      const networkId = 0;
      const enterpriseAddress = Cardano.EnterpriseAddress.new(
        networkId,
        Cardano.Credential.from_keyhash(publicKey.hash()),
      );

      addresses.push(enterpriseAddress.to_address().to_bech32());
    }

    return addresses;
  }
}

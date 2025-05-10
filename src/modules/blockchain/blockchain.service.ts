import { Injectable } from '@nestjs/common';
import { blake2b } from 'blakejs';
import * as Cardano from '@emurgo/cardano-serialization-lib-nodejs';
import { BlockfrostService } from './blockfrost.service';
import { KeyManagementService } from './key-management.service';
import { BlockchainRequestDto } from '../certificate/dtos/request.dto';
import { buildCertificateMetadata, buildBulkCertificateMetadata } from './utils/metadata-builder';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlockchainService {
  private readonly walletAddress: string;

  constructor(
    private readonly blockfrostService: BlockfrostService,
    private readonly keyManagementService: KeyManagementService,
    private readonly configService: ConfigService,
  ) {
    this.walletAddress = this.configService.get<string>('WALLET_ADDRESS');
    if (!this.walletAddress) {
      throw new Error('WALLET_ADDRESS not set in environment variables');
    }
  }

  async buildAndSignTransaction(certData: BlockchainRequestDto, privateKeyBech32: string): Promise<string> {
    const metadata = buildCertificateMetadata(certData);
    const fromAddress = this.walletAddress;

    const currentSlotInfo = await this.blockfrostService.getCurrentSlot();
    const utxos = await this.blockfrostService.getUTxOs(fromAddress);
    if (!utxos || utxos.length === 0) throw new Error('No UTxO found');

    const protocolParameters = {
      linearFee: { minFeeA: '44', minFeeB: '155381' },
      minUtxo: '1000000',
      poolDeposit: '500000000',
      keyDeposit: '2000000',
      maxTxSize: 16384,
      maxValueSize: 5000,
      coinsPerUtxoByte: '4310',
    };

    const linearFee = Cardano.LinearFee.new(
      Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeA),
      Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeB),
    );

    const txBuilderCfg = Cardano.TransactionBuilderConfigBuilder.new()
      .fee_algo(linearFee)
      .pool_deposit(Cardano.BigNum.from_str(protocolParameters.poolDeposit))
      .key_deposit(Cardano.BigNum.from_str(protocolParameters.keyDeposit))
      .coins_per_utxo_byte(Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoByte))
      .max_value_size(protocolParameters.maxValueSize)
      .max_tx_size(protocolParameters.maxTxSize)
      .build();

    const txBuilder = Cardano.TransactionBuilder.new(txBuilderCfg);
    const inputUtxo = utxos[0];

    const address = Cardano.Address.from_bech32(fromAddress);
    const txHash = Cardano.TransactionHash.from_bytes(Buffer.from(inputUtxo.tx_hash, 'hex'));
    const outputIndex = parseInt(inputUtxo.output_index);
    const txInput = Cardano.TransactionInput.new(txHash, outputIndex);
    const inputAmount = Cardano.BigNum.from_str(inputUtxo.amount[0].quantity);
    const inputValue = Cardano.Value.new(inputAmount);

    const txInputsBuilder = Cardano.TxInputsBuilder.new();
    txInputsBuilder.add_regular_input(address, txInput, inputValue);
    txBuilder.set_inputs(txInputsBuilder);

    const ttl = parseInt(currentSlotInfo.slot) + parseInt(this.configService.get('DEFAULT_TTL') || '7200');
    txBuilder.set_ttl(ttl);

    const auxData = Cardano.AuxiliaryData.new();
    auxData.set_metadata(metadata);
    txBuilder.set_auxiliary_data(auxData);

    const minFee = txBuilder.min_fee();

    const bufferPercentage = 10;
    const bufferValue = Math.floor((Number(minFee.to_str()) * bufferPercentage) / 100);
    const fee = Cardano.BigNum.from_str((Number(minFee.to_str()) + bufferValue).toString());

    const changeAmount = inputAmount.checked_sub(fee);
    const minUtxo = Cardano.BigNum.from_str(protocolParameters.minUtxo);
    if (changeAmount.compare(minUtxo) < 0) throw new Error('Insufficient funds after fee.');

    txBuilder.add_output(Cardano.TransactionOutput.new(address, Cardano.Value.new(changeAmount)));

    txBuilder.set_fee(fee);

    const txBody = txBuilder.build();
    const privateKey = Cardano.PrivateKey.from_bech32(privateKeyBech32);

    const txBodyHash = Cardano.TransactionHash.from_bytes(blake2b(txBody.to_bytes(), null, 32));
    const witnessSet = Cardano.TransactionWitnessSet.new();
    const vkeyWitness = Cardano.make_vkey_witness(txBodyHash, privateKey);
    const vkeys = Cardano.Vkeywitnesses.new();
    vkeys.add(vkeyWitness);
    witnessSet.set_vkeys(vkeys);

    const signedTx = Cardano.Transaction.new(txBody, witnessSet, auxData);
    const txHex = Buffer.from(signedTx.to_bytes()).toString('hex');

    const txId = await this.blockfrostService.submitTransaction(txHex);

    // const blockId = await this.waitForTransactionConfirmation(txId);
    return txId;
  }

  // private async waitForTransactionConfirmation(txId: string, maxAttempts = 3, delayMs = 4000): Promise<string> {
  //   for (let attempt = 0; attempt < maxAttempts; attempt++) {
  //     try {
  //       const txInfo = await this.blockfrostService.getTransaction(txId);
  //       if (txInfo && txInfo.block) {
  //         return txInfo.block;
  //       }
  //     } catch (e) {
  //       this.logger.warn(`Attempt ${attempt + 1}: Transaction info not available yet.`);
  //     }
  //     await new Promise((resolve) => setTimeout(resolve, delayMs));
  //   }
  //   throw new Error(`Transaction ${txId} not confirmed within expected time.`);
  // }

  async getPrivateKeyFromMnemonic(): Promise<string> {
    const mnemonic = this.configService.get<string>('MNEMONIC');
    if (!mnemonic) {
      throw new Error('MNEMONIC not set in env');
    }
    return this.keyManagementService.getPrivateKeyFromMnemonic(mnemonic);
  }

  getWalletAddress(): string {
    return this.walletAddress;
  }

  async buildAndSignBulkTransaction(
    certDataList: BlockchainRequestDto[],
    privateKeyBech32: string,
  ): Promise<{ txId: string; childAddresses: string[] }> {
    const metadata = buildBulkCertificateMetadata(certDataList);
    const fromAddress = this.walletAddress;

    const currentSlotInfo = await this.blockfrostService.getCurrentSlot();
    const utxos = await this.blockfrostService.getUTxOs(fromAddress);
    if (!utxos || utxos.length === 0) throw new Error('No UTxO found');

    // Create child addresses for each certificate
    const numCertificates = certDataList.length;
    const childAddresses = await this.keyManagementService.generateChildAddresses(privateKeyBech32, numCertificates);

    const protocolParameters = {
      linearFee: { minFeeA: '44', minFeeB: '155381' },
      minUtxo: '1000000',
      poolDeposit: '500000000',
      keyDeposit: '2000000',
      maxTxSize: 16384,
      maxValueSize: 5000,
      coinsPerUtxoByte: '4310',
    };

    const linearFee = Cardano.LinearFee.new(
      Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeA),
      Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeB),
    );

    const txBuilderCfg = Cardano.TransactionBuilderConfigBuilder.new()
      .fee_algo(linearFee)
      .pool_deposit(Cardano.BigNum.from_str(protocolParameters.poolDeposit))
      .key_deposit(Cardano.BigNum.from_str(protocolParameters.keyDeposit))
      .coins_per_utxo_byte(Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoByte))
      .max_value_size(protocolParameters.maxValueSize)
      .max_tx_size(protocolParameters.maxTxSize)
      .build();

    const txBuilder = Cardano.TransactionBuilder.new(txBuilderCfg);

    // Select UTXO with enough value
    const inputUtxo = utxos.sort((a, b) => parseInt(b.amount[0].quantity) - parseInt(a.amount[0].quantity))[0];

    const senderAddress = Cardano.Address.from_bech32(fromAddress);

    const txHash = Cardano.TransactionHash.from_bytes(Buffer.from(inputUtxo.tx_hash, 'hex'));
    const outputIndex = parseInt(inputUtxo.output_index);
    const txInput = Cardano.TransactionInput.new(txHash, outputIndex);
    const inputAmount = Cardano.BigNum.from_str(inputUtxo.amount[0].quantity);
    const inputValue = Cardano.Value.new(inputAmount);

    const txInputsBuilder = Cardano.TxInputsBuilder.new();
    txInputsBuilder.add_regular_input(senderAddress, txInput, inputValue);
    txBuilder.set_inputs(txInputsBuilder);

    const ttl = parseInt(currentSlotInfo.slot) + parseInt(this.configService.get('DEFAULT_TTL') || '7200');
    txBuilder.set_ttl(ttl);

    const auxData = Cardano.AuxiliaryData.new();
    auxData.set_metadata(metadata);
    txBuilder.set_auxiliary_data(auxData);

    // Fee
    const minFee = txBuilder.min_fee();
    const bufferPercentage = 10;
    const bufferValue = Math.floor((Number(minFee.to_str()) * bufferPercentage) / 100);
    const estimatedFee = Cardano.BigNum.from_str((Number(minFee.to_str()) + bufferValue).toString());

    // Min UTXO value
    const minUtxoValue = Cardano.BigNum.from_str(protocolParameters.minUtxo);

    // Total ADA needed for child addresses
    const totalForChildAddresses = minUtxoValue.checked_mul(Cardano.BigNum.from_str(numCertificates.toString()));

    // Calculate remaining ADA to return to the main address
    const changeAmount = inputAmount.checked_sub(estimatedFee).checked_sub(totalForChildAddresses);

    // Check if there is enough ADA after subtracting fees and distributing to child addresses
    if (changeAmount.compare(minUtxoValue) < 0) {
      throw new Error('Insufficient funds for bulk transaction. Need more ADA in wallet.');
    }

    // Add output to return remaining ADA to the main address
    txBuilder.add_output(Cardano.TransactionOutput.new(senderAddress, Cardano.Value.new(changeAmount)));

    // Add output for each child address (each certificate)
    childAddresses.forEach((childAddressStr) => {
      const childAddress = Cardano.Address.from_bech32(childAddressStr);
      txBuilder.add_output(Cardano.TransactionOutput.new(childAddress, Cardano.Value.new(minUtxoValue)));
    });

    // Set transaction fee
    txBuilder.set_fee(estimatedFee);

    // Build and sign transaction
    const txBody = txBuilder.build();
    const privateKey = Cardano.PrivateKey.from_bech32(privateKeyBech32);
    const txBodyHash = Cardano.TransactionHash.from_bytes(blake2b(txBody.to_bytes(), null, 32));

    // Logger.log(`Transaction with ${numCertificates} certificates built successfully`);

    const witnessSet = Cardano.TransactionWitnessSet.new();
    const vkeyWitness = Cardano.make_vkey_witness(txBodyHash, privateKey);
    const vkeys = Cardano.Vkeywitnesses.new();
    vkeys.add(vkeyWitness);
    witnessSet.set_vkeys(vkeys);

    const signedTx = Cardano.Transaction.new(txBody, witnessSet, auxData);
    const txHex = Buffer.from(signedTx.to_bytes()).toString('hex');

    // Submit transaction to network
    const txId = await this.blockfrostService.submitTransaction(txHex);

    return {
      txId,
      childAddresses,
    };
  }
}

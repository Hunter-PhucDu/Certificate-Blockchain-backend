import { Injectable, Logger } from '@nestjs/common';
import { blake2b } from 'blakejs';
import * as Cardano from '@emurgo/cardano-serialization-lib-nodejs';
import { BlockfrostService } from './blockfrost.service';
import { KeyManagementService } from './key-management.service';
import { CertificateRequestDto } from '../certificate/dtos/request.dto';
import { buildCertificateMetadata } from './utils/metadata-builder';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
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
    this.logger.log(`Using wallet address: ${this.walletAddress}`);
  }

  async buildAndSignTransaction(certData: CertificateRequestDto, privateKeyBech32: string): Promise<{ txId: string }> {
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

    // Thêm metadata vào transaction
    const auxData = Cardano.AuxiliaryData.new();
    auxData.set_metadata(metadata);
    txBuilder.set_auxiliary_data(auxData);

    // Tính toán phí tối thiểu cần thiết
    const minFee = txBuilder.min_fee();

    // Thêm phí buffer để đảm bảo đủ (thêm 10%)
    // Thay vì sử dụng checked_div và checked_mul, ta sẽ tính toán theo cách khác
    const bufferPercentage = 10; // 10%
    const bufferValue = Math.floor((Number(minFee.to_str()) * bufferPercentage) / 100);
    const fee = Cardano.BigNum.from_str((Number(minFee.to_str()) + bufferValue).toString());

    this.logger.log(`Minimum transaction fee: ${minFee.to_str()}, with buffer: ${fee.to_str()}`);

    // Tính toán số tiền còn lại sau khi trừ phí
    const changeAmount = inputAmount.checked_sub(fee);
    const minUtxo = Cardano.BigNum.from_str(protocolParameters.minUtxo);
    if (changeAmount.compare(minUtxo) < 0) throw new Error('Insufficient funds after fee.');

    // Thêm output thực tế - không cần xóa output trước đó vì chúng ta chưa thêm output nào
    txBuilder.add_output(Cardano.TransactionOutput.new(address, Cardano.Value.new(changeAmount)));

    // Đặt phí đã tính toán
    txBuilder.set_fee(fee);

    const txBody = txBuilder.build();
    const privateKey = Cardano.PrivateKey.from_bech32(privateKeyBech32);

    const txBodyHash = Cardano.TransactionHash.from_bytes(blake2b(txBody.to_bytes(), null, 32));
    const witnessSet = Cardano.TransactionWitnessSet.new();
    const vkeyWitness = Cardano.make_vkey_witness(txBodyHash, privateKey);
    const vkeys = Cardano.Vkeywitnesses.new();
    vkeys.add(vkeyWitness);
    witnessSet.set_vkeys(vkeys);

    // Tạo transaction đã ký
    const signedTx = Cardano.Transaction.new(txBody, witnessSet, auxData);
    const txHex = Buffer.from(signedTx.to_bytes()).toString('hex');

    // Submit transaction qua Blockfrost
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
}

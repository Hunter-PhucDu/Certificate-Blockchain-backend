import * as Cardano from '@emurgo/cardano-serialization-lib-nodejs';
import { BlockchainRequestDto } from 'modules/certificate/dtos/request.dto';

export function buildCertificateMetadata(certData: BlockchainRequestDto): Cardano.GeneralTransactionMetadata {
  const metadataMap = Cardano.MetadataMap.new();

  if (!certData.certificateType || certData.certificateType.length === 0) {
    throw new Error('certificateType is required');
  }

  if (!certData.certificateType || certData.certificateType.length === 0) {
    throw new Error('certificateType is required');
  }
  metadataMap.insert(
    Cardano.TransactionMetadatum.new_text('certificateType'),
    Cardano.TransactionMetadatum.new_text(certData.certificateType),
  );

  if (!certData.certificateData || certData.certificateData.length === 0) {
    throw new Error('certificateData is required and must contain at least one item');
  }

  const dataMap = Cardano.MetadataMap.new();

  const keySet = new Set<string>();

  certData.certificateData.forEach((item) => {
    if (!item.key || item.key.length === 0) {
      throw new Error('Each item in certificateData must have a non-empty key');
    }

    if (keySet.has(item.key)) {
      throw new Error(`Duplicate key found in certificateData: ${item.key}`);
    }

    keySet.add(item.key);

    const valuesArray = Cardano.MetadataList.new();
    item.values.forEach((valueItem) => {
      const valueMap = Cardano.MetadataMap.new();
      valueMap.insert(
        Cardano.TransactionMetadatum.new_text('label'),
        Cardano.TransactionMetadatum.new_text(valueItem.label),
      );
      valueMap.insert(
        Cardano.TransactionMetadatum.new_text('value'),
        Cardano.TransactionMetadatum.new_text(valueItem.value),
      );
      valueMap.insert(
        Cardano.TransactionMetadatum.new_text('type'),
        Cardano.TransactionMetadatum.new_text(valueItem.type),
      );
      valueMap.insert(
        Cardano.TransactionMetadatum.new_text('isUnique'),
        Cardano.TransactionMetadatum.new_text(valueItem.isUnique ? 'true' : 'false'),
      );
      valuesArray.add(Cardano.TransactionMetadatum.new_map(valueMap));
    });

    dataMap.insert(Cardano.TransactionMetadatum.new_text(item.key), Cardano.TransactionMetadatum.new_list(valuesArray));
  });

  metadataMap.insert(
    Cardano.TransactionMetadatum.new_text('certificateData'),
    Cardano.TransactionMetadatum.new_map(dataMap),
  );

  const generalMetadata = Cardano.GeneralTransactionMetadata.new();
  generalMetadata.insert(Cardano.BigNum.from_str('674'), Cardano.TransactionMetadatum.new_map(metadataMap));

  return generalMetadata;
}

export function buildBulkCertificateMetadata(certDatas: BlockchainRequestDto[]): Cardano.GeneralTransactionMetadata {
  const generalMetadata = Cardano.GeneralTransactionMetadata.new();

  certDatas.forEach((certData, index) => {
    const metadataMap = Cardano.MetadataMap.new();

    if (!certData.certificateType || certData.certificateType.length === 0) {
      throw new Error(`Certificate at index ${index}: certificateType is required`);
    }

    metadataMap.insert(
      Cardano.TransactionMetadatum.new_text('certificateType'),
      Cardano.TransactionMetadatum.new_text(certData.certificateType),
    );

    metadataMap.insert(
      Cardano.TransactionMetadatum.new_text('certificateIndex'),
      Cardano.TransactionMetadatum.new_text(index.toString()),
    );

    if (!certData.certificateData || certData.certificateData.length === 0) {
      throw new Error(`Certificate at index ${index}: certificateData is required and must contain at least one item`);
    }

    const dataMap = Cardano.MetadataMap.new();
    const keySet = new Set<string>();

    certData.certificateData.forEach((item) => {
      if (!item.key || item.key.length === 0) {
        throw new Error(`Certificate at index ${index}: Each item in certificateData must have a non-empty key`);
      }

      if (keySet.has(item.key)) {
        throw new Error(`Certificate at index ${index}: Duplicate key found in certificateData: ${item.key}`);
      }

      keySet.add(item.key);

      const valuesArray = Cardano.MetadataList.new();
      item.values.forEach((valueItem) => {
        const valueMap = Cardano.MetadataMap.new();
        valueMap.insert(
          Cardano.TransactionMetadatum.new_text('label'),
          Cardano.TransactionMetadatum.new_text(valueItem.label),
        );
        valueMap.insert(
          Cardano.TransactionMetadatum.new_text('value'),
          Cardano.TransactionMetadatum.new_text(valueItem.value),
        );
        valueMap.insert(
          Cardano.TransactionMetadatum.new_text('type'),
          Cardano.TransactionMetadatum.new_text(valueItem.type),
        );
        valueMap.insert(
          Cardano.TransactionMetadatum.new_text('isUnique'),
          Cardano.TransactionMetadatum.new_text(valueItem.isUnique ? 'true' : 'false'),
        );
        valuesArray.add(Cardano.TransactionMetadatum.new_map(valueMap));
      });

      dataMap.insert(
        Cardano.TransactionMetadatum.new_text(item.key),
        Cardano.TransactionMetadatum.new_list(valuesArray),
      );
    });

    metadataMap.insert(
      Cardano.TransactionMetadatum.new_text('certificateData'),
      Cardano.TransactionMetadatum.new_map(dataMap),
    );

    generalMetadata.insert(
      Cardano.BigNum.from_str(`${674}${index + 1}`),
      Cardano.TransactionMetadatum.new_map(metadataMap),
    );
  });

  return generalMetadata;
}

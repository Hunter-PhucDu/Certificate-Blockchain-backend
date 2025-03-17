export const CertificateContractABI = [
  {
    inputs: [
      {
        internalType: 'string',
        name: '_certificateHash',
        type: 'string',
      },
    ],
    name: 'storeCertificate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_transactionHash',
        type: 'bytes32',
      },
    ],
    name: 'getCertificate',
    outputs: [
      {
        internalType: 'string',
        name: 'hash',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'issuer',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_transactionHash',
        type: 'bytes32',
      },
      {
        internalType: 'string',
        name: '_hash',
        type: 'string',
      },
    ],
    name: 'verifyCertificate',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'transactionHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'hash',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'issuer',
        type: 'address',
      },
    ],
    name: 'CertificateStored',
    type: 'event',
  },
] as const;

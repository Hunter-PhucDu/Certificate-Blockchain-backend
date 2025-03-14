export const CertificateContractABI = [
  {
    inputs: [
      {
        internalType: 'string',
        name: 'certificateHash',
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
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'decodeCertificateData',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
] as const;

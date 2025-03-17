// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateStorage {
    struct Certificate {
        string hash;
        uint256 timestamp;
        address issuer;
    }

    mapping(bytes32 => Certificate) private certificates;
    
    event CertificateStored(
        bytes32 indexed transactionHash,
        string hash,
        uint256 timestamp,
        address indexed issuer
    );

    function storeCertificate(string memory _certificateHash) public {
        bytes32 transactionHash = keccak256(abi.encodePacked(_certificateHash, block.timestamp, msg.sender));
        
        certificates[transactionHash] = Certificate({
            hash: _certificateHash,
            timestamp: block.timestamp,
            issuer: msg.sender
        });

        emit CertificateStored(
            transactionHash,
            _certificateHash,
            block.timestamp,
            msg.sender
        );
    }

    function getCertificate(bytes32 _transactionHash) public view returns (
        string memory hash,
        uint256 timestamp,
        address issuer
    ) {
        Certificate memory cert = certificates[_transactionHash];
        require(bytes(cert.hash).length > 0, "Certificate not found");
        
        return (cert.hash, cert.timestamp, cert.issuer);
    }

    function verifyCertificate(bytes32 _transactionHash, string memory _hash) public view returns (bool) {
        Certificate memory cert = certificates[_transactionHash];
        return keccak256(abi.encodePacked(cert.hash)) == keccak256(abi.encodePacked(_hash));
}
}
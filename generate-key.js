const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log(" Generating Ed25519 key pair...");

// Generate the key pair with the exact configurations required for Open Payments
crypto.generateKeyPair('ed25519', {
  publicKeyEncoding: {
    type: 'spki',       // SubjectPublicKeyInfo standard
    format: 'pem'       // ASCII text representation
  },
  privateKeyEncoding: {
    type: 'pkcs8',      // Public-Key Cryptography Standards #8
    format: 'pem'       // ASCII text representation
  }
}, (err, publicKey, privateKey) => {
  if (err) {
    console.error("❌ Error generating keys:", err);
    return;
  }

  // Define file paths
  const publicKeyPath = path.join(__dirname, 'public.pem');
  const privateKeyPath = path.join(__dirname, 'private.pem');

  // Write files to your project directory
  fs.writeFileSync(publicKeyPath, publicKey);
  fs.writeFileSync(privateKeyPath, privateKey);
  
  console.log("✅ Success! Keys generated securely.");
  console.log(`📂 Public Key saved to:  ${publicKeyPath}`);
  console.log(`📂 Private Key saved to: ${privateKeyPath}`);
  console.log("\n⚠️  CRITICAL SAFETY REMINDER: Never commit 'private.pem' to Git or GitHub!");
});
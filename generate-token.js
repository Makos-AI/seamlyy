const { createAuthenticatedClient } = require("@interledger/open-payments");
const readline = require("readline");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function formatWalletPointer(pointer) {
  if (!pointer) return "";
  let clean = pointer.trim();
  // Remove leading $ or $$
  if (clean.startsWith("$$")) {
    clean = clean.slice(2);
  } else if (clean.startsWith("$")) {
    clean = clean.slice(1);
  }
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    return `https://${clean}`;
  }
  return clean;
}

async function main() {
  console.log("==============================================");
  console.log("   Open Payments Outgoing Token Generator     ");
  console.log("==============================================\n");

  console.log("Select credentials to use:");
  console.log("1) Seamlyy Platform Wallet (WALLET_ADDRESS in .env)");
  console.log("2) Victor's Wallet (PLATFORM_WALLET_POINTER in .env)");
  console.log("3) Custom Wallet Address and Key details");
  
  const choice = await askQuestion("\nEnter choice (1, 2, or 3): ");

  let walletAddressUrl = "";
  let keyId = "";
  let privateKey = "";

  if (choice.trim() === "1") {
    walletAddressUrl = formatWalletPointer(process.env.WALLET_ADDRESS);
    keyId = process.env.KEY_ID;
    privateKey = process.env.PRIVATE_KEY;
  } else if (choice.trim() === "2") {
    walletAddressUrl = formatWalletPointer(process.env.PLATFORM_WALLET_POINTER);
    keyId = process.env.PLATFORM_KEY_ID;
    privateKey = process.env.PLATFORM_PRIVATE_KEY;
  } else {
    walletAddressUrl = formatWalletPointer(await askQuestion("Enter Wallet Pointer (e.g. $ilp.interledger-test.dev/victor): "));
    keyId = await askQuestion("Enter Key ID: ");
    console.log("Enter Private Key PEM (press Enter, paste content, then type 'END' on a new line and press Enter):");
    let keyLines = [];
    for await (const line of rl) {
      if (line.trim() === "END") break;
      keyLines.push(line);
    }
    privateKey = keyLines.join("\n");
  }

  if (!walletAddressUrl || !keyId || !privateKey) {
    console.error("❌ Error: Missing required credentials (walletAddress, keyId, or privateKey).");
    rl.close();
    return;
  }

  console.log(`\nUsing Wallet Address: ${walletAddressUrl}`);
  console.log(`Using Key ID: ${keyId}`);
  console.log("Initializing Open Payments authenticated client...");

  try {
    const client = await createAuthenticatedClient({
      walletAddressUrl,
      keyId,
      privateKey
    });

    const walletAddress = await client.walletAddress.get({
      url: walletAddressUrl
    });

    console.log("Wallet address resolved successfully!");
    console.log(`Asset: ${walletAddress.assetCode} (Scale: ${walletAddress.assetScale})`);

    const limitAmountValue = "100000000"; // 1,000,000 in scale 2 or similar large amount
    console.log(`\nRequesting interactive outgoing payment grant with a limit of 1,000,000 ${walletAddress.assetCode}...`);

    const grantRequest = await client.grant.request(
      { url: walletAddress.authServer },
      {
        access_token: {
          access: [
            {
              type: "outgoing-payment",
              actions: ["create", "read", "list"],
              identifier: walletAddress.id,
              limits: {
                debitAmount: {
                  value: limitAmountValue,
                  assetCode: walletAddress.assetCode,
                  assetScale: walletAddress.assetScale
                }
              }
            }
          ]
        },
        interact: {
          start: ["redirect"],
          finish: {
            method: "redirect",
            uri: "http://localhost:3000/callback",
            nonce: crypto.randomUUID()
          }
        }
      }
    );

    if (!grantRequest.interact || !grantRequest.interact.redirect) {
      throw new Error("No interaction redirect URL returned from auth server.");
    }

    console.log("\n======================================================================");
    console.log("👉 ACTION REQUIRED: Open the following URL in your browser and authorize the grant:");
    console.log("======================================================================");
    console.log(grantRequest.interact.redirect);
    console.log("======================================================================\n");

    console.log("Once you approve the payment grant, your browser will redirect you to a URL like:");
    console.log("http://localhost:3000/callback?interact_ref=XXXX&result=grant_approved\n");

    const redirectUrl = await askQuestion("Paste the complete redirect URL here: ");

    const urlObj = new URL(redirectUrl.trim());
    const interactRef = urlObj.searchParams.get("interact_ref");

    if (!interactRef) {
      throw new Error("Could not find 'interact_ref' in the pasted URL.");
    }

    console.log(`\nExchanging interact_ref: ${interactRef} for the long-lived token...`);

    const continuedGrant = await client.grant.continue(
      {
        url: grantRequest.continue.uri,
        accessToken: grantRequest.continue.access_token.value
      },
      {
        interact_ref: interactRef
      }
    );

    if (!continuedGrant.access_token || !continuedGrant.access_token.value) {
      throw new Error("Grant continuation did not return an access token.");
    }

    console.log("\n======================================================================");
    console.log("🎉 SUCCESS! Long-lived Access Token generated successfully.");
    console.log("======================================================================");
    console.log(`Token Value:  ${continuedGrant.access_token.value}`);
    console.log("======================================================================\n");
    console.log("If this is for Seamlyy, configure it in your .env file as:");
    console.log(`SEAMLYY_LONG_LIVED_TOKEN="${continuedGrant.access_token.value}"\n`);
    console.log("If this is for Victor (not required unless you start sending money from Victor):");
    console.log(`VICTOR_LONG_LIVED_TOKEN="${continuedGrant.access_token.value}"\n`);

  } catch (error) {
    console.error("\n❌ Error generating token:", error.message || error);
    if (error.description) {
      console.error("Description:", error.description);
    }
  } finally {
    rl.close();
  }
}

main().catch(console.error);

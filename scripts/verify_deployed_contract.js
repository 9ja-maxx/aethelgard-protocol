/**
 * Test reading from live deployed AethelgardMarket contract on StudioNet.
 */
const { createClient } = require("genlayer-js");
const { studionet } = require("genlayer-js/chains");

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS || "0xA724D3D1d898343f53F9610cf28Bb6f19Ef82892";

async function main() {
  console.log("Connecting to GenLayer StudioNet...");
  console.log("Contract Address:", CONTRACT_ADDRESS);

  const client = createClient({ chain: studionet });

  try {
    const marketCount = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_market_count",
      args: [],
    });
    console.log("Market Count:", Number(marketCount));
  } catch (err) {
    console.log("get_market_count error:", err.message);
  }

  try {
    const domains = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_authorized_domains",
      args: [],
    });
    console.log("Authorized Domains Count:", domains?.length ?? 0);
  } catch (err) {
    console.log("get_authorized_domains error:", err.message);
  }

  try {
    const summary = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_protocol_summary",
      args: [],
    });
    console.log("Protocol Summary:", JSON.stringify(summary));
  } catch (err) {
    console.log("get_protocol_summary error:", err.message);
  }
}

main().catch(console.error);

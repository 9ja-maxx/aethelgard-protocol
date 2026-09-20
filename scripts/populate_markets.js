/**
 * Aethelgard Protocol — Automated Market Seeder Utility
 * =============================================================================
 * Seeds realistic benchmark markets and initial liquidity onto GenLayer StudioNet.
 */

const { createClient, createAccount } = require("genlayer-js");
const { studionet } = require("genlayer-js/chains");

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.GENLAYER_PRIVATE_KEY;

const BENCHMARK_MARKETS = [
  {
    title: "Will NASA officially announce crew assignments for the Artemis III lunar landing mission before 2027?",
    criteria: "Resolves YES if NASA officially publishes a press release confirming astronauts assigned to the Artemis III surface landing crew before December 31, 2026. Resolves NO otherwise.",
    primaryUrl: "https://www.nasa.gov/news",
    secondaryUrl: "https://www.nature.com",
    deadlineDays: 45,
    initialYesStake: "2.0",
    initialNoStake: "1.5",
  },
  {
    title: "Will the US Securities and Exchange Commission (SEC) issue final rules on autonomous AI trading disclosure by Q4 2026?",
    criteria: "Resolves YES if the SEC issues an official regulatory framework or final rule notice covering algorithmic and autonomous AI agent asset management. Resolves NO otherwise.",
    primaryUrl: "https://www.sec.gov/news",
    secondaryUrl: "https://www.reuters.com",
    deadlineDays: 60,
    initialYesStake: "4.0",
    initialNoStake: "3.0",
  },
  {
    title: "Will NOAA's official annual report classify the 2026 Atlantic hurricane season as above-average in accumulated cyclone energy?",
    criteria: "Resolves YES if NOAA's official post-season tropical weather summary confirms Accumulated Cyclone Energy (ACE) exceeding 103% of median. Resolves NO otherwise.",
    primaryUrl: "https://www.noaa.gov/news",
    secondaryUrl: "",
    deadlineDays: 120,
    initialYesStake: "1.5",
    initialNoStake: "2.5",
  },
  {
    title: "Will Nature or Science publish a peer-reviewed replication of room-temperature ambient superconductivity in 2026?",
    criteria: "Resolves YES if Nature or Science publishes a confirmed, peer-reviewed independent replication of ambient-pressure superconductivity above 273 Kelvin. Resolves NO otherwise.",
    primaryUrl: "https://www.nature.com",
    secondaryUrl: "https://arxiv.org",
    deadlineDays: 90,
    initialYesStake: "5.0",
    initialNoStake: "8.0",
  }
];

async function main() {
  if (!CONTRACT_ADDRESS) {
    console.error("Error: NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS is not set.");
    process.exit(1);
  }
  if (!PRIVATE_KEY) {
    console.error("Error: GENLAYER_PRIVATE_KEY is not set.");
    process.exit(1);
  }

  console.log("===============================================================");
  console.log("  Aethelgard Protocol — Market Population Seeder");
  console.log("  Contract Address:", CONTRACT_ADDRESS);
  console.log("===============================================================");

  const account = createAccount(PRIVATE_KEY);
  const client = createClient({
    chain: studionet,
    account: account,
  });

  console.log("Seeding operator address:", account.address);

  for (let i = 0; i < BENCHMARK_MARKETS.length; i++) {
    const m = BENCHMARK_MARKETS[i];
    const deadline = new Date(Date.now() + m.deadlineDays * 24 * 3600 * 1000).toISOString();
    console.log(`\n[${i + 1}/${BENCHMARK_MARKETS.length}] Creating: "${m.title.slice(0, 50)}..."`);

    try {
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "create_market",
        args: [m.title, m.criteria, m.primaryUrl, m.secondaryUrl, deadline],
      });
      console.log(`  -> Market created! Tx hash: ${tx}`);
    } catch (err) {
      console.error(`  -> Failed to create market: ${err.message}`);
    }
  }

  console.log("\nMarket seeding completed successfully!");
}

if (require.main === module) {
  main().catch(console.error);
}

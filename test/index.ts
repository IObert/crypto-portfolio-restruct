import { PortfolioManager } from "../src/PortfolioManager";
import { config } from "dotenv";

config();

async function perform() {
  const myManager = new PortfolioManager();
  await myManager.init({
    // krakenKey: process.env.KRAKEN_KEY,
    // krakenSecret: process.env.KRAKEN_SECRET,
    binanceKey: process.env.BINANCE_KEY,
    binanceSecret: process.env.BINANCE_SECRET,
    ignoreCoins: ["NFT"],
    baseCurrency: "EUR"
  });

  myManager.setGoalState([{
    asset: "ETH",
    name: "Ethereum",
    ratio: 0.2
  }, {
    asset: "XRP",
    name: "Ripple",
    ratio: 0.1
  }, {
    asset: "BTC",
    name: "Bitcoin",
    ratio: 0.2
  }, {
    asset: "LTC",
    name: "Litecoin",
    ratio: 0.1
  }, {
    asset: "BNB",
    name: "Binance",
    ratio: 0.2
  }, {
    asset: "XMR",
    name: "Monero",
    ratio: 0.1
  }, {
    asset: "DASH",
    name: "Dashcoin",
    ratio: 0.1
  }]);

  console.log(myManager.getPortfolio());
  // console.log(myManager.getOrders());
  // myManager.testOrders();
}

perform();

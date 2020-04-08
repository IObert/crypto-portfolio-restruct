import { PortfolioManager } from "../src/PortfolioManager";
import { config } from "dotenv";

config();

async function perform() {
  const myManager = new PortfolioManager();
  await myManager.init({
    binanceSecret: process.env.BINANCE_SECRET,
    binanceKey: process.env.BINANCE_KEY,
    baseCurrency: "BNB",
    ignoreCoins: ["HIVE"]
  });

  myManager.setGoalState([{
    asset: "ETH",
    name: "Ethereum",
    ratio: 0.162
  }, {
    asset: "XRP",
    name: "Ripple",
    ratio: 0.151
  }, {
    asset: "BTC",
    name: "Bitcoin",
    ratio: 0.14
  }, {
    asset: "BCH",
    name: "Bitcoin Cash ABC",
    ratio: 0.134
  }, {
    asset: "LTC",
    name: "Litecoin",
    ratio: 0.113
  }, {
    asset: "EOS",
    name: "EOS",
    ratio: 0.091
  }, {
    asset: "BNB",
    name: "Binance",
    ratio: 0.085
  }, {
    asset: "XTZ",
    name: "Tezos",
    ratio: 0.049
  }, {
    asset: "XMR",
    name: "Monero",
    ratio: 0.038
  }, {
    asset: "XLM",
    name: "Stellar",
    ratio: 0.036
  }]);

  console.log(myManager.getOrders());
  myManager.testOrders();
}

perform();

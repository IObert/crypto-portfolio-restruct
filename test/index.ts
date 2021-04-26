import { PortfolioManager } from "../src/PortfolioManager";
import { config } from "dotenv";

config();

async function perform() {
  const myManager = new PortfolioManager();
  await myManager.init({
    binanceSecret: process.env.BINANCE_SECRET,
    binanceKey: process.env.BINANCE_KEY,
    baseCurrency: "BTC",
    fiatCurrency: "EUR",
    ignoreCoins: [
      "GAS",
      "BCHA",
      "WIN",
      "TLM"
    ]
  });

  myManager.setGoalState([{
    asset: "ETH",
    name: "Ethereum",
    ratio: 0.145
  }, {
    asset: "XRP",
    name: "Ripple",
    ratio: 0.116
  }, {
    asset: "BTC",
    name: "Bitcoin",
    ratio: 0.115
  }, {
    asset: "BCH",
    name: "Bitcoin Cash ABC",
    ratio: 0.116
  }, {
    asset: "LTC",
    name: "Litecoin",
    ratio: 0.097
  }, {
    asset: "EOS",
    name: "EOS",
    ratio: 0.081
  }, {
    asset: "BNB",
    name: "Binance",
    ratio: 0.093
  }, {
    asset: "XTZ",
    name: "Tezos",
    ratio: 0.056
    // }, {
    //     asset: "LINK",
    //     name: "Chainlink",
    //     ratio: 0.036
  }, {
    asset: "XLM",
    name: "Stellar",
    ratio: 0.033
  }, {
    asset: "XMR",
    name: "Monero",
    ratio: 0.033
  }, {
    asset: "ADA",
    name: "Cardano",
    ratio: 0.029
  }, {
    asset: "TRX",
    name: "Tron",
    ratio: 0.029
  }, {
    asset: "DASH",
    name: "Dashcoin",
    ratio: 0.025
  }, {
    asset: "NEO",
    name: "Neo",
    ratio: 0.018
  }]);

  console.log(myManager.getPortfolio());
  // console.log(myManager.getOrders());
  // myManager.testOrders();
}

perform();

import { PortfolioManager } from "../src/PortfolioManager";
import { config } from "dotenv";

config();

async function perform() {
  const myManager = new PortfolioManager();
  await myManager.initPublicClient({
    client: "binance",
    baseCurrency: "EUR"
  });

  console.log(myManager.calcPortfolio([{
    asset: "ETH",
    free: "1"
  }, {
    asset: "BTC",
    free: "0.07"
  }, {
    asset: "LTC",
    free: "10"
  }, {
    asset: "BNB",
    free: "6"
  }, {
    asset: "XMR",
    free: "7"
  }, {
    asset: "DASH",
    free: "9"
  }]));
}

perform();

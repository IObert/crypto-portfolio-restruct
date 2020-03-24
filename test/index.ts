import { PortfolioManager } from '../src/PortfolioManager';
const myManager = new PortfolioManager({
  test: true,
  prices: {
    "USDTBTC": 0.0001666666,
    "ETHUSDT": 130,
    "XRMUSDT": 40
  },
  balances: [{
    asset: "BTC",
    free: "2",
    locked: "0"
  },
  {
    asset: "ETH",
    free: "50",
    locked: "0"
  },
  {
    asset: "XRM",
    free: "0",
    locked: "0"
  }]

});

myManager.setGoalState([{
  asset: "BTC",
  name: "BitCoin",
  ratio: 0.33
}, {
  asset: "ETH",
  name: "Ethereum",
  ratio: 0.33
}, {
  asset: "XRM",
  name: "Monero",
  ratio: 0.34
}])

console.log(myManager.getOrders());
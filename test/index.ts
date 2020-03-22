import { PortfolioManager } from '../src/PortfolioManager';
const myManager = new PortfolioManager({
  test: true,
  prices: {
    "BTCUSDT": 6000,
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
    free: "0",
    locked: "0"
  },
  {
    asset: "XRM",
    free: "0",
    locked: "0"
  }]

});

myManager.setGoalState([{
  symbol: "BTC",
  name: "BitCoin",
  ratio: 0.5
}, {
  symbol: "ETH",
  name: "Ethereum",
  ratio: 0.25
}, {
  symbol: "XRM",
  name: "Monero",
  ratio: 0.25
}])
console.log(myManager.getOrders());
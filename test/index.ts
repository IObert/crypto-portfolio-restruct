import { PortfolioManager } from "../src/PortfolioManager";
const myManager = new PortfolioManager({
  test: true,
  prices: {
    STEEMUSDT: "0.176360",
    BNBUSDT: "11.88240000",
    XRPUSDT: "0.17236000",
    BTCUSDT: "6121.51000000",
    ETHUSDT: "126.66000000",
    XMRUSDT: "46.83000000",
    EOSUSDT: "2.12130000",
    LTCUSDT: "37.81000000",
    XTZUSDT: "1.53500000",
    BCHUSDT: "206.53000000",
    XLMUSDT: "0.03920000"
  },
  balances: [{
    asset: "BTC",
    free: "1",
    locked: "0"
  }, {
    asset: "STEEM",
    free: "4589.53",
    locked: "0"
  }, {
    asset: "BNB",
    free: "248",
    locked: "0"
  }, {
    asset: "ETH",
    free: "0",
    locked: "0"
  }, {
    asset: "XRP",
    free: "0",
    locked: "0"
  }, {
    asset: "EOS",
    free: "0",
    locked: "0"
  }, {
    asset: "LTC",
    free: "0",
    locked: "0"
  }, {
    asset: "BNB",
    free: "0",
    locked: "0"
  }, {
    asset: "XTZ",
    free: "0",
    locked: "0"
  }, {
    asset: "BCH",
    free: "0",
    locked: "0"
  }, {
    asset: "XMR",
    free: "0",
    locked: "0"
  }, {
    asset: "XLM",
    free: "0",
    locked: "0"
  }]
});

myManager.setGoalState([{ // TODO sums up to 99.9, check if that makes a problem
  asset: "ETH",
  name: "Ethereum",
  ratio: 16.2
}, {
  asset: "XRP",
  name: "Ripple",
  ratio: 15.1
}, {
  asset: "BTC",
  name: "Bitcoin",
  ratio: 14
}, {
  asset: "BCH",
  name: "Bitcoin Cash ABC",
  ratio: 13.4
}, {
  asset: "LTC",
  name: "Litecoin",
  ratio: 11.3
}, {
  asset: "EOS",
  name: "EOS",
  ratio: 9.1
}, {
  asset: "BNB",
  name: "Binance",
  ratio: 8.5
}, {
  asset: "XTZ",
  name: "Tezos",
  ratio: 4.9
}, {
  asset: "XMR",
  name: "Monero",
  ratio: 3.8
}, {
  asset: "XLM",
  name: "Stellar",
  ratio: 3.6
}]);

console.log(myManager.getOrders());

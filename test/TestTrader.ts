
import { PortfolioManager } from "../src/PortfolioManager";
import { expect, assert } from "chai";
import "mocha";

describe("Portfolio Manager with unit prices", () => {

  it("should compute orders with one current holding", () => {
    // asumptions:
    // no need to differentiate between sell and buy orders
    // No check for symbol substituion
    // trading via USDT
    // start state= one holding

    const myManager = new PortfolioManager();
    myManager.init({
      test: true,
      prices: {
        "BNB,USDT": 1,
        "BTC,USDT": 1,
        "ETH,USDT": 1,
        "TRX,USDT": 1,
        "XRM,USDT": 1
      },
      balances: [{
        asset: "BTC",
        free: "5",
        locked: "0"
      }, {
        asset: "BNB",
        free: "0",
        locked: "0"
      }, {
        asset: "ETH",
        free: "0",
        locked: "0"
      }, {
        asset: "TRX",
        free: "0",
        locked: "0"
      }, {
        asset: "XRM",
        free: "0",
        locked: "0"
      }]
    });

    myManager.setGoalState([{
      asset: "BNB",
      name: "Binance Coin",
      ratio: 0.2
    }, {
      asset: "BTC",
      name: "BitCoin",
      ratio: 0.2
    }, {
      asset: "ETH",
      name: "Ethereum",
      ratio: 0.2
    }, {
      asset: "TRX",
      name: "TRON",
      ratio: 0.2
    }, {
      asset: "XRM",
      name: "Monero",
      ratio: 0.2
    }]);

    assert.sameDeepMembers(myManager.getOrders(), [{
      symbol: "BNBUSDT",
      side: "BUY",
      quantity: 1,
      type: "MARKET"
    }, {
      symbol: "BTCUSDT",
      side: "SELL",
      quantity: 4,
      type: "MARKET"
    }, {
      symbol: "ETHUSDT",
      side: "BUY",
      quantity: 1,
      type: "MARKET"
    }, {
      symbol: "TRXUSDT",
      side: "BUY",
      quantity: 1,
      type: "MARKET"
    }, {
      symbol: "XRMUSDT",
      side: "BUY",
      quantity: 1,
      type: "MARKET"
    }]);

  });

  it("should compute orders with one ccurrent holding and reduced orders", () => {
    // asumptions:
    // no need to differentiate between sell and buy orders
    // No check for symbol substituion
    // trading via USDT
    // start state= one holding

    const myManager = new PortfolioManager();
    myManager.init({
      test: true,
      prices: {
        "BNB,USDT": 1,
        "BTC,USDT": 1,
        "ETH,USDT": 1,
        "TRX,USDT": 1,
        "XRM,USDT": 1
      },
      balances: [{
        asset: "BTC",
        free: "4",
        locked: "0"
      }, {
        asset: "BNB",
        free: "1",
        locked: "0"
      }, {
        asset: "ETH",
        free: "0",
        locked: "0"
      }, {
        asset: "TRX",
        free: "0",
        locked: "0"
      }, {
        asset: "XRM",
        free: "0",
        locked: "0"
      }]
    });

    myManager.setGoalState([{
      asset: "BTC",
      name: "BitCoin",
      ratio: 0.25
    }, {
      asset: "ETH",
      name: "Ethereum",
      ratio: 0.25
    }, {
      asset: "TRX",
      name: "TRON",
      ratio: 0.25
    }, {
      asset: "XRM",
      name: "Monero",
      ratio: 0.25
    }]);

    assert.sameDeepMembers(myManager.getOrders(), [{
      symbol: "BTCUSDT",
      side: "SELL",
      quantity: 2.75,
      type: "MARKET"
    }, {
      symbol: "ETHUSDT",
      side: "BUY",
      quantity: 1.25,
      type: "MARKET"
    }, {
      symbol: "TRXUSDT",
      side: "BUY",
      quantity: 1.25,
      type: "MARKET"
    }, {
      symbol: "XRMUSDT",
      side: "BUY",
      quantity: 1.25,
      type: "MARKET"
    }, {
      quantity: 1,
      side: "SELL",
      symbol: "BNBUSDT",
      type: "MARKET"
    }]);
  });

});

describe("Portfolio Manager with simplified prices", () => {

  it("should compute orders with one current holding", () => {
    // asumptions:
    // no need to differentiate between sell and buy orders
    // trading via USDT
    // start state= one holding

    const myManager = new PortfolioManager(); myManager.init({
      test: true,
      prices: {
        "BTC,USDT": 6000,
        "ETH,USDT": 130,
        "XRM,USDT": 40
      },
      balances: [{
        asset: "BTC",
        free: "2",
        locked: "0"
      }, {
        asset: "ETH",
        free: "0",
        locked: "0"
      }, {
        asset: "XRM",
        free: "0",
        locked: "0"
      }]
    });

    myManager.setGoalState([{
      asset: "BTC",
      name: "BitCoin",
      ratio: 0.5
    }, {
      asset: "ETH",
      name: "Ethereum",
      ratio: 0.25
    }, {
      asset: "XRM",
      name: "Monero",
      ratio: 0.25
    }]);

    assert.sameDeepMembers(myManager.getOrders(), [{
      symbol: "BTCUSDT",
      side: "SELL",
      quantity: 1,
      type: "MARKET"
    }, {
      symbol: "ETHUSDT",
      side: "BUY",
      quantity: 23.076923076923077,
      type: "MARKET"
    }, {
      symbol: "XRMUSDT",
      side: "BUY",
      quantity: 75,
      type: "MARKET"
    }]);
  });

  it("should compute orders with two current holdings and a reversed trading pairs", () => {
    // asumptions:
    // trading via USDT

    const myManager = new PortfolioManager(); myManager.init({
      test: true,
      prices: {
        "BTC,USDT": 6000,
        "USDT,ETH": 0.0076923077,
        "USDT,XRM": 0.025
      },
      balances: [{
        asset: "BTC",
        free: "2",
        locked: "0"
      }, {
        asset: "ETH",
        free: "50",
        locked: "0"
      }, {
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
    }]);

    assert.sameDeepMembers(myManager.getOrders(), [{
      symbol: "BTCUSDT",
      side: "SELL",
      quantity: 0.9825000003575,
      type: "MARKET"
    }, {
      symbol: "USDTETH",
      side: "BUY",
      quantity: 394.9999956450001,
      type: "MARKET"
    }, {
      symbol: "USDTXRM",
      side: "SELL",
      quantity: 6289.999997790001,
      type: "MARKET"
    }]);
  });

  it("should compute orders with two current holdings and a reversed trading pairs with convertion flipping", () => {
    // asumptions:
    // trading via USDT

    const myManager = new PortfolioManager(); myManager.init({
      test: true,
      prices: {
        "USDT,BTC": 0.0001666666,
        "ETH,USDT": 130,
        "XRM,USDT": 40
      },
      balances: [{
        asset: "BTC",
        free: "2",
        locked: "0"
      }, {
        asset: "ETH",
        free: "50",
        locked: "0"
      }, {
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
    }]);

    assert.sameDeepMembers(myManager.getOrders(), [{
      symbol: "USDTBTC",
      side: "BUY",
      quantity: 5895.003216001286,
      type: "MARKET"
    }, {
      symbol: "ETHUSDT",
      side: "SELL",
      quantity: 3.0384493538412802,
      type: "MARKET"
    }, {
      symbol: "XRMUSDT",
      side: "BUY",
      quantity: 157.25004080001634,
      type: "MARKET"
    }]);

  });

  it("should throw error", () => {
    // asumptions:
    // trading via USDT

    const myManager = new PortfolioManager(); myManager.init({
      test: true,
      prices: {
        "BTC,USDT": 6000,
        "USDT,ETH": 0.0076923077,
        "USDT,XRM": 0.025
      },
      balances: [{
        asset: "BTC",
        free: "2",
        locked: "0"
      }, {
        asset: "ETH",
        free: "50",
        locked: "0"
      }, {
        asset: "XRM",
        free: "0",
        locked: "0"
      }]
    });

    myManager.setGoalState([{
      asset: "BTC",
      name: "BitCoin",
      ratio: 0.25
    }, {
      asset: "ETH",
      name: "Ethereum",
      ratio: 0.25
    }, {
      asset: "XRM",
      name: "Monero",
      ratio: 0.25
    }, {
      asset: "IMG",
      name: "Imaginary Coin",
      ratio: 0.25
    }]);

    expect(() => myManager.getOrders()).to.throw(`Asset missing in current balance: IMG`);
  });
});

describe("Portfolio Manager with realistic prices", () => {

  it("should compute orders and three current holdings and top 10 currencies and throw a warning", () => {
    // asumptions:
    // trading via USDT

    const myManager = new PortfolioManager(); myManager.init({
      test: true,
      prices: {
        "STEEM,USDT": "0.176360", // till here fakes
        "STEEM,BTC": "0.00002395", // use this one when using alt base coins
        "BNB,USDT": "11.88240000",
        "XRP,USDT": "0.17236000",
        "BTC,USDT": "6121.51000000",
        "ETH,USDT": "126.66000000",
        "XMR,USDT": "46.83000000",
        "EOS,USDT": "2.12130000",
        "LTC,USDT": "37.81000000",
        "XTZ,USDT": "1.53500000",
        "BCH,USDT": "206.53000000",
        "XLM,USDT": "0.03920000"
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

    expect(() => myManager.setGoalState([{
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
    }])).to.throw("Ratios do not add up: 99.899");

  });

  it("should compute orders and three current holdings and top 10 currencies", () => {
    // asumptions:
    // trading via USDT

    const myManager = new PortfolioManager(); myManager.init({
      test: true,
      prices: {
        "STEEM,USDT": "0.176360",
        "BNB,USDT": "11.88240000",
        "XRP,USDT": "0.17236000",
        "BTC,USDT": "6121.51000000",
        "ETH,USDT": "126.66000000",
        "XMR,USDT": "46.83000000",
        "EOS,USDT": "2.12130000",
        "LTC,USDT": "37.81000000",
        "XTZ,USDT": "1.53500000",
        "BCH,USDT": "206.53000000",
        "XLM,USDT": "0.03920000"
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

    assert.sameDeepMembers(myManager.getOrders(), [{
      symbol: "ETHUSDT",
      side: "BUY",
      quantity: 12.633793329777358,
      type: "MARKET"
    }, {
      symbol: "XRPUSDT",
      side: "BUY",
      quantity: 8653.637510621953,
      type: "MARKET"
    }, {
      symbol: "BTCUSDT",
      side: "SELL",
      quantity: 0.7740940291673134,
      type: "MARKET"
    }, {
      symbol: "BCHUSDT",
      side: "BUY",
      quantity: 6.4088468079562295,
      type: "MARKET"
    }, {
      symbol: "LTCUSDT",
      side: "BUY",
      quantity: 29.52092785824914,
      type: "MARKET"
    }, {
      symbol: "EOSUSDT",
      side: "BUY",
      quantity: 423.7381222282562,
      type: "MARKET"
    }, {
      symbol: "BNBUSDT",
      side: "SELL",
      quantity: 177.3401038158958,
      type: "MARKET"
    }, {
      symbol: "XTZUSDT",
      side: "BUY",
      quantity: 315.3159484229316,
      type: "MARKET"
    }, {
      symbol: "XMRUSDT",
      side: "BUY",
      quantity: 8.015261136245996,
      type: "MARKET"
    }, {
      symbol: "XLMUSDT",
      side: "BUY",
      quantity: 9071.407387469388,
      type: "MARKET"
    }, {
      symbol: "STEEMUSDT",
      side: "SELL",
      quantity: 4589.53,
      type: "MARKET"
    }]);
  });

  it("should compute orders and three current holdings and top 10 currencies via BNB", () => {
    // asumptions:
    // trading via BNB

    const myManager = new PortfolioManager(); myManager.init({
      test: true,
      baseCurrency: "BNB",
      prices: {
        "STEEM,BNB": "0.01185000",
        "XRP,BNB": "0.01450000",
        "BNB,BTC": "0.00193670",
        "BNB,ETH": "0.09227800",
        "XMR,BNB": "3.89600000",
        "EOS,BNB": "0.18270000",
        "LTC,BNB": "3.23400000",
        "XTZ,BNB": "0.13117000",
        "BCH,BNB": "17.82600000",
        "XLM,BNB": "0.00333300"
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

    assert.sameDeepMembers(myManager.getOrders(), [{
      symbol: "BNBETH",
      side: "SELL",
      quantity: 132.63396226524227,
      type: "MARKET"
    }, {
      symbol: "XRPBNB",
      side: "BUY",
      quantity: 8526.065688399993,
      type: "MARKET"
    }, {
      symbol: "BNBBTC",
      side: "BUY",
      quantity: 401.72028893276763,
      type: "MARKET"
    }, {
      symbol: "BCHBNB",
      side: "BUY",
      quantity: 6.154469523480914,
      type: "MARKET"
    }, {
      symbol: "LTCBNB",
      side: "BUY",
      quantity: 28.607384762157434,
      type: "MARKET"
    }, {
      symbol: "EOSBNB",
      side: "BUY",
      quantity: 407.79563631052207,
      type: "MARKET"
    }, {
      symbol: "XTZBNB",
      side: "BUY",
      quantity: 305.84493363135726,
      type: "MARKET"
    }, {
      symbol: "XMRBNB",
      side: "BUY",
      quantity: 7.985541622428839,
      type: "MARKET"
    }, {
      symbol: "XLMBNB",
      side: "BUY",
      quantity: 8843.148465862736,
      type: "MARKET"
    }, {
      symbol: "STEEMBNB",
      side: "SELL",
      quantity: 4589.53,
      type: "MARKET"
    }]);
  });

});

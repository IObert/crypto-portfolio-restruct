
import { PortfolioManager } from '../src/PortfolioManager';
import { expect, assert } from 'chai';
import 'mocha';

describe('Portfolio Manager with unit prices', () => {

  it('should compute orders with one current holding', () => {
    //asumptions: 
    // no need to differentiate between sell and buy orders
    // No check for symbol substituion
    // trading via USDT
    // start state= one holding

    const myManager = new PortfolioManager({
      test: true,
      prices: {
        "BNBUSDT": 1,
        "BTCUSDT": 1,
        "ETHUSDT": 1,
        "TRXUSDT": 1,
        "XRMUSDT": 1
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
      tradingpair: "BNBUSDT",
      side: "BUY",
      quantity: 1
    }, {
      tradingpair: "BTCUSDT",
      side: "SELL",
      quantity: 4
    }, {
      tradingpair: "ETHUSDT",
      side: "BUY",
      quantity: 1
    }, {
      tradingpair: "TRXUSDT",
      side: "BUY",
      quantity: 1
    }, {
      tradingpair: "XRMUSDT",
      side: "BUY",
      quantity: 1
    }]);

  });

  it('should compute orders with one ccurrent holding and reduced orders', () => {
    //asumptions: 
    // no need to differentiate between sell and buy orders
    // No check for symbol substituion
    // trading via USDT
    // start state= one holding

    const myManager = new PortfolioManager({
      test: true,
      prices: {
        "BNBUSDT": 1,
        "BTCUSDT": 1,
        "ETHUSDT": 1,
        "TRXUSDT": 1,
        "XRMUSDT": 1
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
      tradingpair: "BTCUSDT",
      side: "SELL",
      quantity: 2.75
    }, {
      tradingpair: "ETHUSDT",
      side: "BUY",
      quantity: 1.25
    }, {
      tradingpair: "TRXUSDT",
      side: "BUY",
      quantity: 1.25
    }, {
      tradingpair: "XRMUSDT",
      side: "BUY",
      quantity: 1.25
    }, {
      quantity: 1,
      side: "SELL",
      tradingpair: "BNBUSDT"
    }]);
  });

});

describe('Portfolio Manager with simplified prices', () => {

  it('should compute orders with one current holding', () => {
    //asumptions: 
    // no need to differentiate between sell and buy orders
    // trading via USDT
    // start state= one holding

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
      tradingpair: "BTCUSDT",
      side: "SELL",
      quantity: 1
    }, {
      tradingpair: "ETHUSDT",
      side: "BUY",
      quantity: 23.076923076923077
    }, {
      tradingpair: "XRMUSDT",
      side: "BUY",
      quantity: 75
    }]);
  });

  it('should compute orders with two current holdings and a reversed trading pairs', () => {
    //asumptions: 
    // trading via USDT

    const myManager = new PortfolioManager({
      test: true,
      prices: {
        "BTCUSDT": 6000,
        "USDTETH": 0.0076923077,
        "USDTXRM": 0.025
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
      tradingpair: "BTCUSDT",
      side: "SELL",
      quantity: 0.9825000003575
    }, {
      tradingpair: "USDTETH",
      side: "BUY",
      quantity: 394.9999956450001
    }, {
      tradingpair: "USDTXRM",
      side: "SELL",
      quantity: 6289.999997790001
    }]);
  });

  it('should compute orders with two current holdings and a reversed trading pairs with convertion flipping', () => {
    //asumptions: 
    // trading via USDT

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
      tradingpair: "USDTBTC",
      side: "BUY",
      quantity: 5895.003216001286
    }, {
      tradingpair: "ETHUSDT",
      side: "SELL",
      quantity: 3.0384493538412802
    }, {
      tradingpair: "XRMUSDT",
      side: "BUY",
      quantity: 157.25004080001634
    }]);

  });

  it('should throw error', () => {
    //asumptions: 
    // trading via USDT

    const myManager = new PortfolioManager({
      test: true,
      prices: {
        "BTCUSDT": 6000,
        "USDTETH": 0.0076923077,
        "USDTXRM": 0.025
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

describe('Portfolio Manager with realistic prices', () => {

  it('should compute orders and three current holdings and top 10 currencies and throw a warning', () => {
    //asumptions: 
    // trading via USDT

    const myManager = new PortfolioManager({
      test: true,
      prices: {
        "STEEMUSDT": "0.176360", // till here fakes
        "STEEMBTC": "0.00002395", // use this one when using alt base coins
        "BNBUSDT": "11.88240000",
        "XRPUSDT": "0.17236000",
        "BTCUSDT": "6121.51000000",
        "ETHUSDT": "126.66000000",
        "XMRUSDT": "46.83000000",
        "EOSUSDT": "2.12130000",
        "LTCUSDT": "37.81000000",
        "XTZUSDT": "1.53500000",
        "BCHUSDT": "206.53000000",
        "XLMUSDT": "0.03920000"
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



  it('should compute orders and three current holdings and top 10 currencies', () => {
    //asumptions: 
    // trading via USDT

    const myManager = new PortfolioManager({
      test: true,
      prices: {
        "STEEMUSDT": "0.176360", //till here fakes
        "STEEMBTC": "0.00002395", // use this one when using alt base coins
        "BNBUSDT": "11.88240000",
        "XRPUSDT": "0.17236000",
        "BTCUSDT": "6121.51000000",
        "ETHUSDT": "126.66000000",
        "XMRUSDT": "46.83000000",
        "EOSUSDT": "2.12130000",
        "LTCUSDT": "37.81000000",
        "XTZUSDT": "1.53500000",
        "BCHUSDT": "206.53000000",
        "XLMUSDT": "0.03920000"
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
      tradingpair:
        'ETHUSDT',
      side: 'BUY',
      quantity: 12.633793329777358
    }, {
      tradingpair: 'XRPUSDT',
      side: 'BUY',
      quantity: 8653.637510621953
    }, {
      tradingpair: 'BTCUSDT',
      side: 'SELL',
      quantity: 0.7740940291673134
    }, {
      tradingpair: 'BCHUSDT',
      side: 'BUY',
      quantity: 6.4088468079562295
    }, {
      tradingpair: 'LTCUSDT',
      side: 'BUY',
      quantity: 29.52092785824914
    }, {
      tradingpair: 'EOSUSDT',
      side: 'BUY',
      quantity: 423.7381222282562
    }, {
      tradingpair: 'BNBUSDT',
      side: 'SELL',
      quantity: 177.3401038158958
    }, {
      tradingpair: 'XTZUSDT',
      side: 'BUY',
      quantity: 315.3159484229316
    }, {
      tradingpair: 'XMRUSDT',
      side: 'BUY',
      quantity: 8.015261136245996
    }, {
      tradingpair: 'XLMUSDT',
      side: 'BUY',
      quantity: 9071.407387469388
    }, {
      tradingpair: 'STEEMUSDT',
      side: 'SELL',
      quantity: 4589.53
    }]);

  });

  // it('should compute orders without rebalancing, one ccurrent holding and reduced orders', () => {
  //   //asumptions: 
  //   // no need to differentiate between sell and buy orders
  //   // No check for symbol substituion
  //   // trading via USDT
  //   // start state= one holding

  //   const myManager = new PortfolioManager({
  //     test: true,
  //     prices: {
  //       "BNBUSDT": 1,
  //       "BTCUSDT": 1,
  //       "ETHUSDT": 1,
  //       "TRXUSDT": 1,
  //       "XRMUSDT": 1
  //     },
  //     balances: [{
  //       asset: "BTC",
  //       free: "4",
  //       locked: "0"
  //     }, {
  //       asset: "BNB",
  //       free: "1",
  //       locked: "0"
  //     }, {
  //       asset: "ETH",
  //       free: "0",
  //       locked: "0"
  //     }, {
  //       asset: "TRX",
  //       free: "0",
  //       locked: "0"
  //     }, {
  //       asset: "XRM",
  //       free: "0",
  //       locked: "0"
  //     }]
  //   });

  //   myManager.setGoalState([{
  //     asset: "BTC",
  //     name: "BitCoin",
  //     ratio: 0.2
  //   }, {
  //     asset: "ETH",
  //     name: "Ethereum",
  //     ratio: 0.2
  //   }, {
  //     asset: "TRX",
  //     name: "TRON",
  //     ratio: 0.2
  //   }, {
  //     asset: "XRM",
  //     name: "Monero",
  //     ratio: 0.2
  //   }]);

  //   assert.sameDeepMembers(myManager.getOrders(), [{
  //     tradingpair: "BTCUSDT",
  //     side: "SELL",
  //     quantity: 3
  //   }, {
  //     tradingpair: "ETHUSDT",
  //     side: "BUY",
  //     quantity: 1
  //   }, {
  //     tradingpair: "TRXUSDT",
  //     side: "BUY",
  //     quantity: 1
  //   }, {
  //     tradingpair: "XRMUSDT",
  //     side: "BUY",
  //     quantity: 1
  //   }
  //   ]);
  // });

});

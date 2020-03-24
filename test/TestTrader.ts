
import { PortfolioManager } from '../src/PortfolioManager';
import { expect, assert } from 'chai';
import 'mocha';

describe('Portfolio Manager with unit prices', () => {

  it('should compute orders without rebalancing and one current holding', () => {
    //asumptions: 
    // no need to differentiate between sell and buy orders
    // No rebalancing
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

  it('should compute orders without rebalancing, one ccurrent holding and reduced orders', () => {
    //asumptions: 
    // no need to differentiate between sell and buy orders
    // No rebalancing
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
      tradingpair: "BTCUSDT",
      side: "SELL",
      quantity: 3
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
    }
    ]);
  });

});

describe('Portfolio Manager with simplified prices', () => {

  it('should compute orders without rebalancing and one current holding', () => {
    //asumptions: 
    // no need to differentiate between sell and buy orders
    // No rebalancing No check for symbol substituion
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
    // No rebalancing No check for symbol substituion
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
    // No rebalancing No check for symbol substituion
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

});
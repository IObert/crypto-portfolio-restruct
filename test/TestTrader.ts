
import { PortfolioManager } from '../src/PortfolioManager';
import { expect } from 'chai';
import 'mocha';

describe('Portfolio Manager with unit prices', () => {

  it('should compute orders without rebalancing', () => {
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
      },
      {
        asset: "BNB",
        free: "0",
        locked: "0"
      },
      {
        asset: "ETH",
        free: "0",
        locked: "0"
      }, {
        asset: "TRX",
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
      symbol: "BNB",
      name: "Binance Coin",
      ratio: 0.2
    }, {
      symbol: "BTC",
      name: "BitCoin",
      ratio: 0.2
    }, {
      symbol: "ETH",
      name: "Ethereum",
      ratio: 0.2
    }, {
      symbol: "TRX",
      name: "TRON",
      ratio: 0.2
    }, {
      symbol: "XRM",
      name: "Monero",
      ratio: 0.2
    }])

    expect(myManager.getOrders()).to.have.members([{
      tradingpair: "BNBUSDT",
      side: "BUY",
      quantity: 1
    },
    {
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
    }
    ]);

  });

  it('should compute orders without rebalancing and filter', () => {
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
      },
      {
        asset: "BNB",
        free: "1",
        locked: "0"
      },
      {
        asset: "ETH",
        free: "0",
        locked: "0"
      }, {
        asset: "TRX",
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
      ratio: 0.2
    }, {
      symbol: "ETH",
      name: "Ethereum",
      ratio: 0.2
    }, {
      symbol: "TRX",
      name: "TRON",
      ratio: 0.2
    }, {
      symbol: "XRM",
      name: "Monero",
      ratio: 0.2
    }])

    expect(myManager.getOrders()).to.have.members([
      {
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


  it('should compute orders without rebalancing and filter', () => {
    //asumptions: 
    // no need to differentiate between sell and buy orders
    // No rebalancing
    // No check for symbol substituion
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

    expect(myManager.getOrders()).to.have.members([
      {
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
      }
    ]);
  });


});
# Binance Asset Allocation Tool

Get an overview of your current crypto portfolio and to calculate trades to reallocate your assets.

![](https://github.com/IObert/crypto-portfolio-restruct/workflows/Run%20Tests/badge.svg)

```
const { PortfolioManager } = require('binance-portfolioo-restruct');

(async () => {
    const myManager = new PortfolioManager();
    await myManager.init({
        binanceSecret: process.env.BINANCE_SECRET,
        binanceKey: process.env.BINANCE_KEY
    });

    console.log(myManager.getPortfolio());
})();
```
Would print something like:
```
{
  sum: { asset: 'BNB', amount: 100 },
  portfolio: [
    { asset: 'ETH', ratio: 18.6, string: 'ETH: 18.60%' },
    { asset: 'XRP', ratio: 18.6, string: 'XRP: 18.60%' },
    { asset: 'BTC', ratio: 18.6, string: 'BTC: 18.60%' },
    { asset: 'BNB', ratio: 18.6, string: 'BNB: 18.60%' },
    { asset: 'LTC', ratio: 18.6, string: 'LTC: 18.60%' },
    { asset: 'BCH', ratio: 7, string: 'BCH: 7.00%' }
}

```

## Features


## Documentation

First, you need to create an instance of the `PortfolioManager`.

```
const myManager = new PortfolioManager();
```


### `init`

Before the portfolio manager can be used, you need to initialize it.

```
await myManager.init({
    binanceSecret: process.env.BINANCE_SECRET,
    binanceKey: process.env.BINANCE_KEY,
    baseCurrency: "EUR"
});
```

Parameters:
- binanceSecret: The Binance [API key](https://www.binance.com/en/support/faq/360002502072-How-to-create-API) secret
- binanceKey: The Binance [API key](https://www.binance.com/en/support/faq/360002502072-How-to-create-API)
- baseCurrency: The portfolio manager will calculate the portfolio sum in this asset.

> For testing purposes, you can add `test: true` to the config and pass in `prices` and `balances` as well.

### `setGoalState`

Set the desired distribution of the assets in your portfolio.

```
myManager.setGoalState([{
        asset: "ETH",
        name: "Ethereum",
        ratio: 0.145
    }, {
        asset: "XRP",
        name: "Ripple",
        ratio: 0.116
    }, {
```

Parameters:
- asset: Specify the currency symbol
- ratio: The percentage of the desired state (0.7 = 70%)
- ? name: Name of the curreny


### `getOrders`

> Need to set the goal state first.
Will return the orders that are required to restructure the portfolio.

```
myManager.getOrders()
```

### `sendOrders`

Same as `getOrders` but actually sends to orders to the Binance API interface.

```
myManager.sendOrders()
```

### `testOrders`

Same as `sendOrders` but it will only send the orders to the **DEMO endpoint** of the Binance API interface. This can be used to test if the trade parameters are valid.

```
myManager.testOrders()
```



## Known Issues

- Sometimes the `sendOrders` method needs to be called multiple times (needs to be fixed)
- Currently only works with Binance exchange
- A lot of room for improvement :)

## How to obtain support - Contributing

Feel free to open an issue, leave a comment, or even open a pull request.

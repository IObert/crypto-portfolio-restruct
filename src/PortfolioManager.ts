import BinanceClient, { Binance, AssetBalance } from "binance-api-node";

interface Order {
  tradingpair: string;
  side: string;
  quantity: number;
}

interface TargetAsset {
  asset: string;
  name?: string;
  ratio: number;
  delta?: number;
}

interface Configuration {
  binance_key?: string;
  binance_secret?: string;
  baseCurrency?: string;
  prices?: any;
  balances?: AssetBalance[];
  test?: boolean;
}

export class PortfolioManager {
  client?: Binance; // TODO stay optional?
  prices: any;
  balances: AssetBalance[];
  baseCurrency: string = "USDT";
  targetBalances: TargetAsset[] = []; // TODO stay optional?

  constructor(config: Configuration) {

    this.baseCurrency = config.baseCurrency || this.baseCurrency;

    if (config.test) {
      this.prices = config.prices;
      this.balances = config.balances || [];

    } else {
      this.client = BinanceClient();
      // { apikey, apisecret } = any;
      this.balances = [];
      this.client.exchangeInfo().then(console.log);

    }

    // this.fullName = "test"
    // TODO fetch info form binance here
  }

  async init() {// should return promise that might resolve immeditatly
    if (this.client) {
      this.prices = await this.client.prices();
      const accountInfo = await this.client.accountInfo();
      this.balances = accountInfo.balances;
    }

    // enforce correct data types, e.g. convert strings to float
    // filter current assets
    // throw warning for missing/untradable coins
    // rebalance
  }

  setGoalState(assets: TargetAsset[]) {
    this.targetBalances = assets;
    const targetAssets = assets.map(asset => asset.asset);

    const total: number = assets.reduce((sum: number, goalItem: TargetAsset): number => {
      return sum + goalItem.ratio;
    }, 0);

    if (total > 1.02 || total < 0.98) {
      throw new Error(`Ratios do not add up: ${Math.floor(total * 1000) / 1000}`);
    }

    this.balances.forEach(oBalance => {
      if (!targetAssets.includes(oBalance.asset)) {
        this.targetBalances.push({
          asset: oBalance.asset,
          ratio: 0
        });
      }
    });
  }

  private getConvertionRate(asset1: string, asset2: string): number {
    const buyConvertionRate = this.prices[asset1 + asset2];
    const sellConvertionRate = this.prices[asset2 + asset1];

    if (buyConvertionRate) {
      return +buyConvertionRate;
    }
    if (sellConvertionRate) {
      return 1 / +sellConvertionRate;
    }
    if (asset1 === asset2) {
      return 1;
    }
    throw new Error(`Missing convertion rate: ${asset1}${asset2} / ${asset2}${asset1}`);
  }

  getOrders(): Order[] {
    const sumOfCurrentAssets = this.balances.reduce((sum: number, balanceItem: AssetBalance) => {
      return +balanceItem.free * this.getConvertionRate(balanceItem.asset, this.baseCurrency) + sum;
    }, 0);

    this.targetBalances.forEach((targetBalanceItem) => {

      const targetAmountInBaseCurrency = targetBalanceItem.ratio * sumOfCurrentAssets;

      const owning = this.balances.find(currentBalanceItem => currentBalanceItem.asset === targetBalanceItem.asset);
      if (!owning) {
        throw new Error(`Asset missing in current balance: ${targetBalanceItem.asset}`);
      }

      const currentAmountInBaseCurrency = +owning.free * this.getConvertionRate(targetBalanceItem.asset, this.baseCurrency);

      targetBalanceItem.delta = targetAmountInBaseCurrency - currentAmountInBaseCurrency;
    });

    this.targetBalances = this.targetBalances.filter(targetBalanceItem => (targetBalanceItem.delta !== 0) && (targetBalanceItem.asset !== this.baseCurrency));

    const orders = this.targetBalances.map(targetBalanceItem => {

      const buyPair = `${targetBalanceItem.asset}${this.baseCurrency}`;
      const buyConvertionRate = this.prices[buyPair];
      const sellPair = `${this.baseCurrency}${targetBalanceItem.asset}`;
      const sellConvertionRate = this.prices[sellPair];

      if (targetBalanceItem.delta === undefined) {
        throw new Error(`Delta has not been calculated: ${targetBalanceItem}`);
      }

      if (buyConvertionRate) {
        if (targetBalanceItem.delta > 0) {
          return {
            tradingpair: buyPair,
            side: "BUY",
            quantity: targetBalanceItem.delta / buyConvertionRate
          };
        }
        if (targetBalanceItem.delta < 0) {
          return {
            tradingpair: buyPair,
            side: "SELL",
            quantity: -targetBalanceItem.delta / buyConvertionRate
          };
        }
      }
      if (sellConvertionRate) {
        if (targetBalanceItem.delta > 0) {
          return {
            tradingpair: sellPair,
            side: "SELL",
            quantity: targetBalanceItem.delta
          };
        }
        if (targetBalanceItem.delta < 0) {
          return {
            tradingpair: sellPair,
            side: "BUY",
            quantity: -targetBalanceItem.delta
          };
        }
      }
      throw new Error(`Cannot find matching trading pair for ${buyPair} / ${sellPair}.`);
    });

    return orders;
  }

  sendOrders() {
    // TODO missing implementation
  }

}

import BinanceClient, { Binance, AssetBalance } from "binance-api-node";

interface Order {
  symbol: string;
  side: string;
  quantity: number;
  type: string;
}

interface TargetAsset {
  asset: string;
  name?: string;
  ratio: number;
  delta?: number;
}

interface Configuration {
  binanceKey?: string;
  binanceSecret?: string;
  baseCurrency?: string;
  prices?: any;
  balances?: AssetBalance[];
  ignoreCoins?: string[];
  test?: boolean;
}

export class PortfolioManager {
  client?: Binance;
  prices: any;
  initialized: boolean = false;
  balances: AssetBalance[] = [];
  symbols: import("binance-api-node").Symbol[] = [];
  baseCurrency: string = "USDT";
  targetBalances: TargetAsset[] = [];

  // TODO write readme
  // TODO idea, floor to cent value to avoid rounding errors

  async init(config: Configuration): Promise<any> {

    this.baseCurrency = config.baseCurrency || this.baseCurrency;
    const ignoreCoins = config.ignoreCoins || [];

    return new Promise(async (resolve) => {

      if (config.test) {
        this.prices = config.prices;
        this.balances = config.balances || [];
      } else {
        if (!config.binanceKey || !config.binanceSecret) {
          throw new Error("Missing credentials");
        }
        this.client = BinanceClient({
          apiKey: config.binanceKey,
          apiSecret: config.binanceSecret
        });
        const accountInfo = await this.client.accountInfo();
        const exInfo = await this.client.exchangeInfo();
        this.prices = await this.client.prices();
        this.balances = accountInfo.balances;
        this.symbols = exInfo.symbols;
      }

      this.balances = this.balances.filter(oBalanceItem => !ignoreCoins.includes(oBalanceItem.asset));

      this.initialized = true;
      resolve();
    });
  }

  setGoalState(assets: TargetAsset[]) {
    if (!this.initialized) {
      throw new Error("Instance was never initialized.");
    }
    this.targetBalances = assets;
    const targetAssets = assets.map(asset => asset.asset);

    const total: number = assets.reduce((sum: number, goalItem: TargetAsset): number => {
      return sum + goalItem.ratio;
    }, 0);

    if (total > 1.02 || total < 0.98) {
      throw new Error(`Ratios do not add up: ${Math.floor(total * 1000) / 1000}`);
    }

    this.balances.forEach(oBalanceItem => {
      if (!targetAssets.includes(oBalanceItem.asset)) {
        const amount = +oBalanceItem.free;
        if (amount === 0) {
          return;
        }
        this.targetBalances.push({
          asset: oBalanceItem.asset,
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



  private roundAmount(symbol: string, amount: number): number {
    if (!this.client) { //TODO add test data for rounding, remove this when ready
      return amount;
    }
    const oInfo = this.symbols.find(oS => oS.symbol === symbol);
    if (!oInfo || oInfo.status !== "TRADING") {
      throw new Error("Inactive trading pair: " + symbol);
    }


    // @ts-ignore
    const lotFilter = oInfo.filters.find((oFilter) => oFilter.filterType === "LOT_SIZE");
    // @ts-ignore
    const log10 = Math.log10(+lotFilter.stepSize);

    // @ts-ignore
    const minFilter = oInfo.filters.find((oFilter) => oFilter.filterType === "MIN_NOTIONAL");
    // @ts-ignore
    const min = +minFilter.minNotional;


    const candidate = +amount.toFixed(-log10);
    // return candidate;
    return candidate > min ? candidate : 0;
  }

  getOrders(): Order[] {
    if (!this.initialized) {
      throw new Error("Instance was never initialized.");
    }
    const sumOfCurrentAssets = this.balances.reduce((sum: number, balanceItem: AssetBalance) => {
      const amount = +balanceItem.free;
      if (amount === 0) {
        return sum;
      }
      return amount * this.getConvertionRate(balanceItem.asset, this.baseCurrency) + sum;
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

    this.targetBalances = this.targetBalances.filter(targetBalanceItem =>
      (targetBalanceItem.delta !== 0) &&
      (targetBalanceItem.asset !== this.baseCurrency));

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
            symbol: buyPair,
            side: "BUY",
            type: "MARKET",
            quantity: this.roundAmount(buyPair, targetBalanceItem.delta / buyConvertionRate)
          };
        }
        if (targetBalanceItem.delta < 0) {
          return {
            symbol: buyPair,
            side: "SELL",
            type: "MARKET",
            quantity: this.roundAmount(buyPair, -targetBalanceItem.delta / buyConvertionRate)
          };
        }
      }
      if (sellConvertionRate) {
        if (targetBalanceItem.delta > 0) {
          return {
            symbol: sellPair,
            side: "SELL",
            type: "MARKET",
            quantity: this.roundAmount(sellPair, targetBalanceItem.delta)
          };
        }
        if (targetBalanceItem.delta < 0) {
          return {
            symbol: sellPair,
            side: "BUY",
            type: "MARKET",
            quantity: this.roundAmount(sellPair, -targetBalanceItem.delta)
          };
        }
      }
      throw new Error(`Cannot find matching trading pair for ${buyPair} / ${sellPair}.`);
    });
    return orders.filter((o) => {
      if (o.quantity < 1) {
        // console.log(o);
        return false;
      }
      return true;
    }
    );
  }

  async sendOrders() {
    if (!this.initialized || !this.client) {
      throw new Error("Instance was never initialized.");
    }

    // @ts-ignore
    this.getOrders().map(this.client.order);
  }

  async testOrders() {
    if (!this.initialized || !this.client) {
      throw new Error("Instance was never initialized.");
    }

    // @ts-ignore
    this.getOrders().map(this.client.orderTest);
  }
}

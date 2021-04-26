import binanceApiNode, { Binance, AssetBalance, Symbol } from "binance-api-node";
import { assert } from "chai";
//@ts-ignore
import { single_source_shortest_paths } from "dijkstrajs";

import SymbolMapper from "./SymbolMapper";

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
  graph?: any;
  balances?: AssetBalance[];
  test?: boolean;
}

interface RatioAsset {
  asset: string;
  string: string;
  base: number;
  ratio: number;
}

export class PortfolioManager {
  client?: Binance;
  prices: any;
  initialized: boolean = false;
  balances: AssetBalance[] = [];
  symbols: import("binance-api-node").Symbol[] = [];
  baseCurrency: string = "USDT";
  graph: any;
  targetBalances: TargetAsset[] = [];

  // TODO write readme
  // TODO idea, floor to cent value to avoid rounding errors

  async init(config: Configuration): Promise<any> {

    this.baseCurrency = config.baseCurrency || this.baseCurrency;

    if (config.test) {
      this.prices = config.prices;
      this.graph = config.graph;
      this.balances = config.balances || [];
      this.initialized = true;
    }

    return new Promise(async (resolve) => {

      if (!config.test) {
        if (!config.binanceKey || !config.binanceSecret) {
          throw new Error("Missing credentials");
        }
        this.client = binanceApiNode({
          apiKey: config.binanceKey,
          apiSecret: config.binanceSecret
        });

        const accountInfo = await this.client.accountInfo();
        const exInfo = await this.client.exchangeInfo();
        this.prices = await this.client.prices();
        this.balances = accountInfo.balances;
        this.symbols = exInfo.symbols;
        this.graph = {};

        const assets = new Set<string>();
        this.symbols.forEach((symbol: Symbol) => {
          //build up assets
          assets.add(symbol.baseAsset);
          assets.add(symbol.quoteAsset);

          if (symbol.status === "TRADING") {
            //build up graph
            if (!this.graph[symbol.baseAsset]) {
              this.graph[symbol.baseAsset] = {};
            }
            this.graph[symbol.baseAsset][symbol.quoteAsset] = 1;


            if (!this.graph[symbol.quoteAsset]) {
              this.graph[symbol.quoteAsset] = {};
            }
            this.graph[symbol.quoteAsset][symbol.baseAsset] = 1;
          }
        });
        this.balances.forEach((oBalanceItem: any) => {
          oBalanceItem.asset = SymbolMapper(oBalanceItem.asset, assets);
        });

        this.initialized = true;
      }
      resolve({});
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

    this.balances.forEach((oBalanceItem: any) => {
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

  private getVirtualConvertionRate(asset1: string, asset2: string): number {
    if (asset1 === asset2) {
      return 1;
    }

    const path = single_source_shortest_paths(this.graph, asset1, asset2);
    let rate = 1;
    let intermed = asset2;
    do {
      asset2 = intermed;
      intermed = path[intermed];
      rate *= this.getConvertionRate(intermed, asset2);
    } while (intermed !== asset1 && intermed);

    return rate;
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
    throw new Error(`Missing convertion rate: ${asset1}${asset2} / ${asset2}${asset1}`);
  }

  private roundAmount(symbol: string, amount: number): number {
    if (!this.client) { // TODO add test data for rounding, remove this when ready
      return amount;
    }
    const oInfo = this.symbols.find(oS => oS.symbol === symbol);
    if (!oInfo || oInfo.status !== "TRADING") {
      throw new Error(`Inactive trading pair: ${symbol}`);
    }

    // @ts-ignore
    const lotFilter = oInfo.filters.find((oFilter: any) => oFilter.filterType === "LOT_SIZE");
    // @ts-ignore
    const log10 = Math.log10(+lotFilter.stepSize);

    // @ts-ignore
    const minFilter = oInfo.filters.find((oFilter: any) => oFilter.filterType === "MIN_NOTIONAL");
    // @ts-ignore
    const min = +minFilter.minNotional;

    const candidate = +amount.toFixed(-log10);
    // return candidate;
    return candidate > min ? candidate : 0;
  }

  getPortfolio(precision: number = 2): any {
    let sumOfCurrentAssets = this.getPortfolioValue();

    const aRatioBalances: RatioAsset[] = [];

    this.balances.forEach((balanceItem: AssetBalance) => {
      const amount = +balanceItem.free;
      if (amount !== 0) {
        const base = amount * this.getVirtualConvertionRate(balanceItem.asset, this.baseCurrency);
        const ratio = base / sumOfCurrentAssets * 100;
        const currentItem = aRatioBalances.find((o: any) => o.asset === balanceItem.asset);

        if (currentItem) {
          currentItem.base += base;
          currentItem.ratio += base;
          currentItem.string = `${currentItem.asset}: ${currentItem.ratio.toFixed(precision)}%`;
        } else {
          aRatioBalances.push({
            base,
            ratio,
            asset: balanceItem.asset,
            string: `${balanceItem.asset}: ${ratio.toFixed(precision)}%`
          });
        }
      }
    });

    aRatioBalances.sort((a, b) => b.ratio - a.ratio);

    return {
      sum: { asset: this.baseCurrency, amount: sumOfCurrentAssets },
      portfolio: aRatioBalances
    };
  }

  getPortfolioValue(): number {
    return this.balances.reduce((sum: number, balanceItem: AssetBalance) => {
      const amount = +balanceItem.free;
      if (amount === 0) {
        return sum;
      }
      return amount * this.getVirtualConvertionRate(balanceItem.asset, this.baseCurrency) + sum;
    }, 0);
  }

  getOrders(): Order[] {
    if (!this.initialized) {
      throw new Error("Instance was never initialized.");
    }
    const sumOfCurrentAssets = this.getPortfolioValue();

    this.targetBalances.forEach((targetBalanceItem) => {

      const targetAmountInBaseCurrency = targetBalanceItem.ratio * sumOfCurrentAssets;

      const owning = this.balances.find(currentBalanceItem => currentBalanceItem.asset === targetBalanceItem.asset);
      if (!owning) {
        throw new Error(`Asset missing in current balance: ${targetBalanceItem.asset}`);
      }

      const currentAmountInBaseCurrency = +owning.free * this.getVirtualConvertionRate(targetBalanceItem.asset, this.baseCurrency);

      targetBalanceItem.delta = targetAmountInBaseCurrency - currentAmountInBaseCurrency;
    });

    this.targetBalances = this.targetBalances.filter(targetBalanceItem =>
      (targetBalanceItem.delta !== 0) &&
      (targetBalanceItem.asset !== this.baseCurrency));

    const orders = this.targetBalances.map((targetBalanceItem: TargetAsset) => {

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
    return orders;
    // return orders.filter((o) => {
    //   if (o.quantity < 1) {
    //     return false;
    //   }
    //   return true;
    // }
    // );
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

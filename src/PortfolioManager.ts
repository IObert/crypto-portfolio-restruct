import binanceApiNode, { Binance, Symbol } from "binance-api-node";
//@ts-ignore
import KrakenClient from "kraken-api";
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

interface AssetBalance {
  asset: string;
  free: string;
}

interface Configuration {
  baseCurrency?: string;
  prices?: any;
  graph?: any;
  balances?: AssetBalance[];
  test?: boolean;
  krakenKey?: string;
  krakenSecret?: string;
  binanceKey?: string;
  binanceSecret?: string;
}

interface RatioAsset {
  asset: string;
  string: string;
  base: number;
  ratio: number;
}

export class PortfolioManager {
  client?: any;
  prices: any;
  initialized: boolean = false;
  balances: AssetBalance[] = [];
  tradingPairs: any[] = [];
  baseCurrency: string = "USDT";
  graph: any;
  targetBalances: TargetAsset[] = [];

  // TODO write readme
  // TODO idea, floor to cent value to avoid rounding errors

  async init(config: Configuration): Promise<any> {

    this.graph = {};
    this.baseCurrency = config.baseCurrency || this.baseCurrency;

    if (config.test) {
      this.prices = {};
      Object.keys(config.prices).forEach((pair: string) => {
        const splitted = pair.split(",");
        this.prices[splitted.join("")] = config.prices[pair];

        //build up graph
        if (!this.graph[splitted[0]]) {
          this.graph[splitted[0]] = {};
        }
        this.graph[splitted[0]][splitted[1]] = 1;


        if (!this.graph[splitted[1]]) {
          this.graph[splitted[1]] = {};
        }
        this.graph[splitted[1]][splitted[0]] = 1;
      });
      this.balances = config.balances || [];
      this.initialized = true;
    }

    return new Promise(async (resolve) => {

      if (!config.test) {
        if (config.binanceKey && config.binanceSecret) {
          this.client = binanceApiNode({
            apiKey: config.binanceKey,
            apiSecret: config.binanceSecret
          });
          const accountInfo = await this.client.accountInfo();
          const exInfo = await this.client.exchangeInfo();
          this.prices = await this.client.prices();
          this.balances = accountInfo.balances;
          this.tradingPairs = exInfo.symbols;

          const assets = new Set<string>();
          this.tradingPairs.forEach((pair: Symbol) => {

            const base = pair.baseAsset;
            const quote = pair.quoteAsset;
            //build up assets

            assets.add(base);
            assets.add(quote);

            if (pair.status === "TRADING") {
              //build up graph
              if (!this.graph[base]) {
                this.graph[base] = {};
              }
              this.graph[base][quote] = 1;


              if (!this.graph[quote]) {
                this.graph[quote] = {};
              }
              this.graph[quote][base] = 1;
            }
          });
          this.balances.forEach((oBalanceItem: any) => {
            oBalanceItem.asset = SymbolMapper(oBalanceItem.asset, assets, /LD(.*)/);
          });

        } else if (config.krakenKey && config.krakenSecret) {
          this.baseCurrency = `Z${this.baseCurrency}`;
          this.client = new KrakenClient(config.krakenKey, config.krakenSecret);
          const pairs = await this.client.api('AssetPairs');
          this.tradingPairs = pairs.result; //TODO wrong type assignment


          const assets = new Set<string>();
          Object.values(this.tradingPairs).forEach((symbol: any) => {

            const base = symbol.base;
            const quote = symbol.quote;

            //build up assets
            assets.add(base);
            assets.add(quote);

            //build up graph
            if (!this.graph[base]) {
              this.graph[base] = {};
            }
            this.graph[base][quote] = 1;


            if (!this.graph[quote]) {
              this.graph[quote] = {};
            }
            this.graph[quote][base] = 1;
          });

          const prices = await this.client.api('Ticker', { pair: Object.keys(this.tradingPairs).join(",") })
          this.prices = {};
          Object.keys(prices.result).forEach((pair: string) => {
            const fullPair = pairs.result[pair];
            this.prices[pair] = prices.result[pair].o;
            this.prices[`${fullPair.base}${fullPair.quote}`] = prices.result[pair].o;
          })


          const balances = await this.client.api('Balance');
          this.balances = Object.keys(balances.result)
            .filter((asset: string) => asset !== "BSV")
            .map((asset: string) => {
              let convertedAsset = asset === "ZEUR" ? "EUR" :
                asset === "ZUSD" ? "USD" : SymbolMapper(asset, assets, /(.*)\.S/);
              return {
                asset: convertedAsset,
                free: balances.result[asset]
              }
            })
        } else {
          throw new Error("Missing credentials");
        }



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
    return amount;
    // if (!this.client) { // TODO add test data for rounding, remove this when ready
    //   return amount;
    // }
    // const oInfo = this.tradingPairs.find(oS => oS.symbol === symbol);
    // if (!oInfo || oInfo.status !== "TRADING") {
    //   throw new Error(`Inactive trading pair: ${symbol}`);
    // }

    // // @ts-ignore
    // const lotFilter = oInfo.filters.find((oFilter: any) => oFilter.filterType === "LOT_SIZE");
    // // @ts-ignore
    // const log10 = Math.log10(+lotFilter.stepSize);

    // // @ts-ignore
    // const minFilter = oInfo.filters.find((oFilter: any) => oFilter.filterType === "MIN_NOTIONAL");
    // // @ts-ignore
    // const min = +minFilter.minNotional;

    // const candidate = +amount.toFixed(-log10);
    // // return candidate;
    // return candidate > min ? candidate : 0;
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

  private getOrder(targetBalanceItem: any, exchangeAsset: string): Order {
    const buyPair = `${targetBalanceItem.asset}${exchangeAsset}`;
    const buyConvertionRate = this.prices[buyPair];
    const sellPair = `${exchangeAsset}${targetBalanceItem.asset}`;
    const sellConvertionRate = this.prices[sellPair];

    if (buyConvertionRate) {
      if (targetBalanceItem.amount > 0) {
        return {
          symbol: buyPair,
          side: "BUY",
          type: "MARKET",
          quantity: this.roundAmount(buyPair, targetBalanceItem.amount)
        };
      }
      if (targetBalanceItem.amount < 0) {
        return {
          symbol: buyPair,
          side: "SELL",
          type: "MARKET",
          quantity: this.roundAmount(buyPair, -targetBalanceItem.amount / buyConvertionRate)
        };
      }
    }
    if (sellConvertionRate) {
      if (targetBalanceItem.amount > 0) {
        return {
          symbol: sellPair,
          side: "SELL",
          type: "MARKET",
          quantity: this.roundAmount(sellPair, targetBalanceItem.amount / buyConvertionRate)
        };
      }
      if (targetBalanceItem.amount < 0) {
        return {
          symbol: sellPair,
          side: "BUY",
          type: "MARKET",
          quantity: this.roundAmount(sellPair, -targetBalanceItem.amount)
        };
      }
    }
    throw new Error(`Cannot find matching trading pair for ${buyPair} / ${sellPair}.`);
  }

  private getVirtualOrders(targetBalanceItem: TargetAsset): Order[] {
    const path = single_source_shortest_paths(this.graph, this.baseCurrency, targetBalanceItem.asset);
    const virtualRate = this.getVirtualConvertionRate(targetBalanceItem.asset, this.baseCurrency);
    let convertibleAmount = targetBalanceItem.delta;
    let convertibleAsset = targetBalanceItem.asset;

    if (convertibleAmount === undefined) {
      throw new Error(`Delta has not been calculated: ${targetBalanceItem}`);
    }

    let virtualOrders: Order[] = [];
    let intermedAsset = convertibleAsset;
    let thereIsAnotherOrderNeeded: boolean;
    do {
      // asset2 = intermed;
      intermedAsset = path[intermedAsset];
      thereIsAnotherOrderNeeded = intermedAsset !== this.baseCurrency;
      if (thereIsAnotherOrderNeeded) {
        debugger
        const factor = this.getConvertionRate(convertibleAsset, intermedAsset);
        virtualOrders = [...virtualOrders, this.getOrder({
          asset: convertibleAsset,
          amount: convertibleAmount / virtualRate * factor
        }, intermedAsset)];
        convertibleAsset = intermedAsset;

      } else {
        virtualOrders = [...virtualOrders, this.getOrder({
          asset: convertibleAsset,
          amount: convertibleAmount
        }, intermedAsset)];
      }

    } while (thereIsAnotherOrderNeeded);

    return virtualOrders;
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

    const orders = this.targetBalances.map((targetBalanceItem: TargetAsset) => this.getVirtualOrders(targetBalanceItem));
    //@ts-ignore
    return orders.flat();
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

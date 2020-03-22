import BinanceClient, { Binance, AssetBalance } from "binance-api-node";


interface Order {
    tradingpair: String; //TODO Tradingpair;
    side: String;
    quantity: number;
}

interface TargetAsset {
    symbol: String; //TODO also use enum?
    name?: String; //TODO also use enum?
    ratio: number;
    delta?: number;
}

interface Configuration {
    binance_key?: String;
    binance_secret?: String;
    max_price_diff?: String;
    base_currency?: String; //TODO AssetSymbol;
    prices?: any;
    balances?: AssetBalance[];
    test?: boolean;
}

export class PortfolioManager {
    client?: Binance; //TODO stay optional?
    prices: any;
    balances: AssetBalance[];
    targetBalances: TargetAsset[] = []; //TODO stay optional?

    constructor(config: Configuration) {

        if (config.test) {
            this.prices = config.prices;
            this.balances = config.balances || [];

        } else {
            this.client = BinanceClient();
            // { apikey, apisecret } = any;
            this.balances = [];
            this.client.exchangeInfo().then(console.log)

        }

        // this.fullName = "test"
        //TODO fetch info form binance here
    }

    async init() {// should return promise that might resolve immeditatly
        if (this.client) {
            this.prices = await this.client.prices();
            const accountInfo = await this.client.accountInfo();
            this.balances = accountInfo.balances;
        }


        // enforce correct data types, e.g. convert strings to float
        //filter current assets
        //throw warning for missing/untradable coins
        // rebalance
    }

    setGoalState(assets: TargetAsset[]) {
        this.targetBalances = assets;
        // Do some of the validation mentioned in the comment above here
    }

    getOrders(): Order[] {
        const sumOfCurrentAssets = this.balances.reduce((sum: number, balanceItem: AssetBalance) => {
            return +balanceItem.free * +this.prices[balanceItem.asset + "USDT"] + sum; //TODO change to base currency here
        }, 0); //error here: cannot just sum up values, should be USD value, 

        this.targetBalances.forEach((targetBalanceItem) => {

            const tradingPair = targetBalanceItem.symbol + "USDT";
            const convertionRate = +this.prices[tradingPair];

            const targetAmountInBaseCurrency = targetBalanceItem.ratio * sumOfCurrentAssets;

            const owning = this.balances.find((currentBalanceItem) => currentBalanceItem.asset === targetBalanceItem.symbol);
            if (!owning) {
                throw new Error("Asset missing in current balance: " + targetBalanceItem.symbol);
            }

            const currentAmountInBaseCurrency = +owning.free * convertionRate;

            targetBalanceItem.delta = targetAmountInBaseCurrency - currentAmountInBaseCurrency;
        });

        this.targetBalances = this.targetBalances.filter((targetBalanceItem) => targetBalanceItem.delta !== 0);

        //TODO can simply here in one function

        const orders = this.targetBalances.map(targetBalanceItem => {

            const buyPair = targetBalanceItem.symbol + "USDT";
            const buyConvertionRate = this.prices[buyPair];
            const sellPair = "USDT" + targetBalanceItem.symbol;
            const sellConvertionRate = this.prices[sellPair];

            if (buyConvertionRate) {
                // @ts-ignore
                if (targetBalanceItem.delta > 0) {
                    return {
                        tradingpair: buyPair,
                        side: "BUY",
                        // @ts-ignore
                        quantity: targetBalanceItem.delta / buyConvertionRate
                    }
                }
                // @ts-ignore
                if (targetBalanceItem.delta < 0) {
                    return {
                        tradingpair: buyPair,
                        side: "SELL",
                        // @ts-ignore
                        quantity: -targetBalanceItem.delta / buyConvertionRate//TODO does this work? I just guessed here
                    }
                }
            }
            if (sellConvertionRate) {
                // @ts-ignore
                if (targetBalanceItem.delta > 0) {
                    return {
                        tradingpair: sellPair,
                        side: "SELL",
                        // @ts-ignore
                        quantity: targetBalanceItem.delta //TODO does this work? I just guessed here
                    }
                }
                // @ts-ignore
                if (targetBalanceItem.delta < 0) {
                    return {
                        tradingpair: sellPair,
                        side: "BUY",
                        // @ts-ignore
                        quantity: -targetBalanceItem.delta
                    }
                }
            }
            throw new Error(`Cannot find matching trading pair for ${buyPair} / ${sellPair}.`)
        })

        // @ts-ignore
        return orders;
    }

    //second same test with one already perfect asset


    // sendOrders(){
    // }

}

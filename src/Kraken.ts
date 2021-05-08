import Axios from "axios";
//@ts-ignore
import { stringify } from "qs";
import { createHash, createHmac } from "crypto";

// Method names
const methods = {
    public: ['Time', 'Assets', 'AssetPairs', 'Ticker', 'Depth', 'Trades', 'Spread', 'OHLC'],
    private: ['Balance', 'TradeBalance', 'OpenOrders', 'ClosedOrders', 'QueryOrders', 'TradesHistory', 'QueryTrades', 'OpenPositions', 'Ledgers', 'QueryLedgers', 'TradeVolume', 'AddOrder', 'CancelOrder', 'DepositMethods', 'DepositAddresses', 'DepositStatus', 'WithdrawInfo', 'Withdraw', 'WithdrawStatus', 'WithdrawCancel', 'GetWebSocketsToken'],
};

// Default options
const defaults = {
    url: 'https://api.kraken.com',
    version: 0,
};

// Create a signature for a request
const getMessageSignature = (path: string, request: any, secret: string) => {
    const message = stringify(request);
    const secret_buffer = Buffer.from(secret, 'base64');
    const hash = createHash('sha256');
    const hmac = createHmac('sha512', secret_buffer);
    //@ts-ignore
    const hash_digest = hash.update(request.nonce + message).digest('binary');
    //@ts-ignore
    const hmac_digest = hmac.update(path + hash_digest, 'binary').digest('base64');

    return hmac_digest;
};

// Send an API request
const rawRequest = async (url: string, headers: any, data: any, timeout: number) => {
    let response: any;

    try {
        response = await Axios({
            method: "POST",
            headers: {
                ...headers,
                "content-type": "application/x-www-form-urlencoded; charset=utf-8"
            },
            data: stringify(data),
            url
        });
    } catch (error) {
        throw new Error("Kraken API returned an unknown error");
    }

    if (response.data.error?.length > 0) {
        const error = response.data.error
            .filter((e: string) => e.startsWith('E'))
            .map((e: string) => e.substr(1));

        throw new Error(error.join(', '));
    }

    return response.data;
};

/**
 * KrakenClient connects to the Kraken.com API
 * @param {String}        key               API Key
 * @param {String}        secret            API Secret
 */
class KrakenClient {

    config: any;

    constructor(key: string, secret: string) {
        // Allow passing the OTP as the third argument for backwards compatibility
        this.config = Object.assign({ key, secret }, defaults);
    }

    /**
     * This method makes a public or private API request.
     */
    api(method: string, params: any, callback: Function): any {
        // Default params to empty object
        if (typeof params === 'function') {
            callback = params;
            params = {};
        }

        if (methods.public.includes(method)) {
            return this.publicMethod(method, params, callback);
        }
        else if (methods.private.includes(method)) {
            return this.privateMethod(method, params, callback);
        }
        else {
            throw new Error(method + ' is not a valid API method.');
        }
    }

    /**
     * This method makes a public API request.
     */
    publicMethod(method: string, params: any, callback: Function): any {
        params = params || {};

        // Default params to empty object
        if (typeof params === 'function') {
            callback = params;
            params = {};
        }

        const path = '/' + this.config.version + '/public/' + method;
        const url = this.config.url + path;
        const response = rawRequest(url, {}, params, this.config.timeout);

        if (typeof callback === 'function') {
            response
                .then((result) => callback(null, result))
                .catch((error) => callback(error, null));
        }

        return response;
    }

    /**
     * This method makes a private API request.
     */
    privateMethod(method: string, params: any, callback: Function): any {
        params = params || {};

        // Default params to empty object
        if (typeof params === 'function') {
            callback = params;
            params = {};
        }

        const path = '/' + this.config.version + '/private/' + method;
        const url = this.config.url + path;

        if (!params.nonce) {
            params.nonce = Date.now() * 1000; // spoof microsecond
        }

        if (this.config.otp !== undefined) {
            params.otp = this.config.otp;
        }

        const signature = getMessageSignature(
            path,
            params,
            this.config.secret
        );

        const headers = {
            'API-Key': this.config.key,
            'API-Sign': signature,
        };

        const response = rawRequest(url, headers, params, this.config.timeout);

        if (typeof callback === 'function') {
            response
                .then((result) => callback(null, result))
                .catch((error) => callback(error, null));
        }

        return response;
    }
}

module.exports = KrakenClient;
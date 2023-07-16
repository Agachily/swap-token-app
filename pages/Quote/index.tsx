import useSWR from "swr";
import {ETHEREUM_TOKENS_BY_ADDRESS} from "@/lib/constants";
import {fetcher} from "@/pages/Price";
import type {PriceResponse, QuoteResponse} from "@/pages/api/types";
import {formatUnits} from "ethers"

import {type Address, useAccount, usePrepareSendTransaction, useSendTransaction} from "wagmi";

export default function QuoteView({price, quote, setQuote, takerAddress}: {
    price: PriceResponse;
    quote: QuoteResponse | undefined;
    setQuote: (price: any) => void;
    takerAddress: Address | undefined;
}) {
    const {address} = useAccount();

    const {isLoading: isLoadingPrice} = useSWR(
        [
            "/api/quote",
            {
                sellToken: price.sellTokenAddress,
                buyToken: price.buyTokenAddress,
                sellAmount: price.sellAmount,
                takerAddress,
            },
        ],
        fetcher,
        {
            // @ts-ignore
            onSuccess: (data) => {
                setQuote(data);
                console.log("quote: ", data)
            }
        }
    );

    const {config} = usePrepareSendTransaction({
        // the address of the contract to send call data to
        // here the 0x Exchange Proxy
        to: quote?.to,
        // the call data required to be sent to the contract address
        data: quote?.data,
    });

    const {sendTransaction} = useSendTransaction(config);

    if (!quote) {
        return <div>Getting best quote...</div>;
    }

    console.log("=========Output of price=========")
    console.log(price)
    console.log(price.buyTokenAddress)
    console.log(typeof price.buyTokenAddress)
    console.log(price.buyTokenAddress.toUpperCase())
    console.log("=========================================")

    const sellTokenInfo = ETHEREUM_TOKENS_BY_ADDRESS[price.sellTokenAddress]

    console.log("=========Output of sellTokenInfo=========")
    console.log(sellTokenInfo)
    console.log("=========================================")

    return (
        <div className="p-3 mx-auto max-w-screen-sm">
            <form>
                <div className="bg-slate-200 dark:bg-slate-800 p-4 rounded-sm mb-3">
                    <div className="text-xl mb-2 text-white">You Pay</div>
                    <div className="flex items-center text-lg sm:text-3xl text-white">
                        <img className="h-9 w-9 mr-2 rounded-md" src={sellTokenInfo.logoURI}
                             alt={sellTokenInfo.symbol}/>
                        <span>{formatUnits(quote.sellAmount, sellTokenInfo.decimals)}</span>
                        <div className="ml-2">{sellTokenInfo.symbol}</div>
                    </div>
                </div>

                <div className="bg-slate-200 dark:bg-slate-800 p-4 rounded-sm mb-3">
                    <div className="text-xl mb-2 text-white">You receive</div>
                    <div className="flex items-center text-lg sm:text-3xl text-white">
                        <img
                            alt={ETHEREUM_TOKENS_BY_ADDRESS[price.buyTokenAddress.toLowerCase()].symbol}
                            className="h-9 w-9 mr-2 rounded-md"
                            src={ETHEREUM_TOKENS_BY_ADDRESS[price.buyTokenAddress.toLowerCase()].logoURI}
                        />
                        <span>
                            {formatUnits(quote.buyAmount,
                                ETHEREUM_TOKENS_BY_ADDRESS[price.buyTokenAddress.toLowerCase()].decimals)}

                        </span>
                        <div className="ml-2">
                            {ETHEREUM_TOKENS_BY_ADDRESS[price.buyTokenAddress.toLowerCase()].symbol}
                        </div>
                    </div>
                </div>
            </form>

            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                onClick={() => {
                    console.log("submitting quote to blockchain");
                    sendTransaction && sendTransaction();
                }}
            >
                Place Order
            </button>
        </div>
    );
}
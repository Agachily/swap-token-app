// @ts-ignore
import qs from "qs";
import useSWR from "swr";
import {ConnectKitButton} from "connectkit";
import {useState, ChangeEvent, useEffect} from "react";
import {formatUnits, parseUnits} from "ethers";

import {
    erc20ABI,
    useBalance,
    useContractRead,
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
    type Address
} from "wagmi";

import {ETHEREUM_TOKENS, ETHEREUM_TOKENS_BY_SYMBOL, MAX_ALLOWANCE, exchangeProxy} from "../../lib/constants";
import Image from "next/image";
import Ethereum from "../../public/ethereum-eth-logo.png"
import zeroxpic from "../../public/0xpic.png"
import {Card, Input, Text, Loading, Link} from "@nextui-org/react"

interface PriceRequestParams {
    sellToken: string;
    buyToken: string;
    buyAmount?: string;
    sellAmount?: string;
    takerAddress?: string;
}

export const fetcher = ([endpoint, params]: [string, PriceRequestParams]) => {
    const {sellAmount, buyAmount} = params;
    if (!sellAmount && !buyAmount) return;
    const query = qs.stringify(params);
    return fetch(`${endpoint}?${query}`).then((res) => res.json());
};

export default function PriceView({
                                      setPrice,
                                      setFinalize,
                                      takerAddress
                                  }: {
    price: any;
    setPrice: (price: any) => void;
    setFinalize: (finalize: boolean) => void;
    takerAddress: Address | undefined;
}) {
    // fetch price
    const [sellAmount, setSellAmount] = useState("")
    const [buyAmount, setBuyAmount] = useState("")
    const [tradeDirection, setTradeDirection] = useState("sell")
    const [sellToken, setSellToken] = useState("matic");
    const [buyToken, setBuyToken] = useState("dai");


    const {data, isError, isLoading} = useBalance({
            address: takerAddress,
            token: ETHEREUM_TOKENS_BY_SYMBOL[sellToken].address
        }
    )

    const handleSellTokenChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSellToken(event.target.value);
    }

    const handleBuyTokenChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setBuyToken(event.target.value)
    }

    const sellTokenDecimals = ETHEREUM_TOKENS_BY_SYMBOL[sellToken].decimals;
    const parsedSellAmount =
        sellAmount && tradeDirection === "sell" ? parseUnits(sellAmount, sellTokenDecimals).toString() : undefined;


    const buyTokenDecimals = ETHEREUM_TOKENS_BY_SYMBOL[buyToken].decimals;
    const parsedBuyAmount = buyAmount && tradeDirection === "buy" ? parseUnits(buyAmount, buyTokenDecimals).toString() : undefined

    const {isLoading: isLoadingPrice} = useSWR(
        [
            "/api/price",
            {
                sellToken: ETHEREUM_TOKENS_BY_SYMBOL[sellToken].address,
                buyToken: ETHEREUM_TOKENS_BY_SYMBOL[buyToken].address,
                sellAmount: parsedSellAmount,
                buyAmount: parsedBuyAmount,
                takerAddress,
            },
        ],
        fetcher,
        {
            // @ts-ignore
            onSuccess: (data) => {
                setPrice(data);
                if (tradeDirection === "sell") {
                    setBuyAmount(formatUnits(data.buyAmount, buyTokenDecimals))
                } else {
                    setSellAmount(formatUnits(data.sellAmount, sellTokenDecimals))
                }
            }
        }
    );

    // @ts-ignore
    return (
        <form>
            <Card>
                <Card.Header>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Image src={Ethereum} alt="polygon" className="polygon"
                               style={{width: '30px', height: '30px'}}/>
                        <span style={{marginLeft: '10px'}}>Ethereum network</span>
                        <Image src={zeroxpic} alt="zeroxpic" className="zeroxpic"
                               style={{width: '200px', height: '46px', marginLeft: '50px'}}/>
                    </div>
                </Card.Header>
                <Text h1 size={30} weight="bold" style={ {textAlign: 'center',marginBottom: '10px'}}>Swap Token App</Text>
                <Card.Divider></Card.Divider>
                <Card.Body>
                    <div style={{display: 'flex'}}>
                        <Text h3 weight="bold" style={{marginLeft:"30px"}}>{"From : "}</Text>
                        <Text h3 weight="bold" style={{marginLeft: "120px"}}>{"Amount : "}</Text>
                    </div>
                    <section className="mt-4 flex items-start justify-center">
                        <label htmlFor="sell-select" className="sr-only"></label>
                        <img alt={sellToken}
                             className="h-9 w-9 mr-2 rounded-md"
                             src={ETHEREUM_TOKENS_BY_SYMBOL[sellToken].logoURI}/>
                        <div className="h-14 w-30 sm:mr-2">
                            <select
                                value={sellToken}
                                name="sell-token-select"
                                id="sell-token-select"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-30 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                onChange={handleSellTokenChange}
                            >
                                {ETHEREUM_TOKENS.map((token) => {
                                    return (
                                        <option
                                            key={token.address}
                                            value={token.symbol.toLowerCase()}
                                        >
                                            {token.symbol}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                        <label htmlFor="sell-amount" className="sr-only"></label>
                        <Input
                            clearable
                            bordered
                            id="sell-amount"
                            value={sellAmount}
                            size="lg"
                            onChange={(event) => {
                                setTradeDirection("sell");
                                setSellAmount(event.target.value);
                            }}
                        />
                    </section>

                    <div style={{display: 'flex'}}>
                        <Text h3 weight="bold" style={{marginLeft: "30px"}}>{"Current Balance : "}</Text>
                        <Text h3 weight="bold" style={{marginLeft: "10px"}}>{data?.formatted} {data?.symbol}</Text>
                    </div>

                    <div style={{display: 'flex'}}>
                        <Text h3 weight="bold" style={{marginTop: "30px",marginLeft:"30px"}}>{"To : "}</Text>
                        <Text h3 weight="bold" style={{marginLeft: "140px", marginTop: "30px"}}>{"Amount : "}</Text>
                    </div>

                    <section className="flex mt-4 items-start justify-center">
                        <label htmlFor="buy-token" className="sr-only"></label>
                        <img
                            alt={buyToken}
                            className="h-9 w-9 mr-2 rounded-md"
                            src={ETHEREUM_TOKENS_BY_SYMBOL[buyToken].logoURI}
                        />
                        <div className="h-14 w-30 sm:mr-2">
                            <select
                                name="buy-token-select"
                                id="buy-token-select"
                                value={buyToken}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-30 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                onChange={(event) => handleBuyTokenChange(event)}
                            >
                                {ETHEREUM_TOKENS.map((token) => {
                                    return (
                                        <option key={token.address} value={token.symbol.toLowerCase()}
                                        >{token.symbol}</option>
                                    );
                                })}
                            </select>
                        </div>
                        <label htmlFor="buy-amount" className="sr-only"></label>
                        <Input
                            bordered
                            size="lg"
                            color="default"
                            id="buy-amount"
                            value={buyAmount}
                            readOnly
                            onChange={(event) => {
                                setTradeDirection("buy");
                                setBuyAmount(event.target.value)
                            }}
                        />
                    </section>

                    {takerAddress ? (
                        <ApproveOrReviewButton
                            sellTokenAddress={ETHEREUM_TOKENS_BY_SYMBOL[sellToken].address}
                            takerAddress={takerAddress}
                            onClick={() => {
                                setFinalize(true);
                            }}
                        ></ApproveOrReviewButton>
                    ) : (
                        <ConnectKitButton.Custom>
                            {({
                                  isConnected,
                                  isConnecting,
                                  show,
                                  hide,
                                  address,
                                  ensName,
                                  chain
                              }) => {
                                return (
                                    <div className="flex items-center justify-center">
                                        <button onClick={show}
                                                type="button"
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                                                style={{marginTop: '10px'}}>
                                            {isConnected ? address : "Connect Wallet"}
                                        </button>
                                    </div>
                                )
                            }}
                        </ConnectKitButton.Custom>
                    )}

                </Card.Body>

                <Card.Footer>
                    <Link
                        icon
                        color="primary"
                        target="_blank"
                        href="https://github.com/nextui-org/nextui"
                    >
                        Visit source code on GitHub
                    </Link>
                </Card.Footer>
            </Card>
            {isLoadingPrice && (
                <div style={{display: 'flex', justifyContent: 'center', marginTop: "10px"}}>
                    <Loading>Fetching the best price...</Loading>
                </div>

            )}
        </form>

    )

}


function ApproveOrReviewButton({
                                   takerAddress,
                                   onClick,
                                   sellTokenAddress
                               }: {
    takerAddress: Address;
    onClick: () => void;
    sellTokenAddress: Address
}) {

    // spender (0x Exchange Proxy) have allowance?
    const {data: allowance, refetch} = useContractRead({
        address: sellTokenAddress,
        abi: erc20ABI,
        functionName: "allowance",
        args: [takerAddress, exchangeProxy]
    });

    // if no allowance, write to erc20, approve 0x Exchange Proxy to spend max integer
    const {config} = usePrepareContractWrite({
        address: sellTokenAddress,
        abi: erc20ABI,
        functionName: "approve",
        args: [exchangeProxy, MAX_ALLOWANCE],
    });

    const {
        data: writeContractResult,
        writeAsync: approveAsync,
        error,
    } = useContractWrite(config)

    const {isLoading: isApproving} = useWaitForTransaction({
        hash: writeContractResult ? writeContractResult.hash : undefined,
        onSuccess(data) {
            refetch();
        }
    })

    if (error) {
        return <div>Something went wrong: {error.message}</div>
    }

    // @ts-ignore
    if (allowance === 0n && approveAsync) {
        return (
            <div className="flex items-center justify-center">
                <button type="button"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                        style={{marginTop: "10px"}}
                        onClick={async () => {
                            const writtenValue = await approveAsync();
                        }}
                >
                    {isApproving ? "Approving..." : "Approve"}
                </button>
            </div>
        )
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
            Review Trade
        </button>
    )
}
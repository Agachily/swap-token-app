import {Address} from "wagmi";

export interface PriceResponse {
    chainId: number;
    price: string;
    estimatedPriceImpact: string;
    value: string;
    gasPrice: string;
    gas: string;
    estimatedGas: string;
    protocolFee: string;
    minimumProtocolFee: string;
    buyTokenAddress: string;
    buyAmount: string;
    sellTokenAddress: string;
    sellAmount: string;
    sources: any[];
    allowanceTarget: string;
    sellTokenToEthRate: string;
    buyTokenToEthRate: string;
    expectedSlippage: string | null;
}

export interface QuoteResponse {
    chainId: number;
    price: string;
    guaranteedPrice: string;
    estimatedPriceImpact: string;
    to: string;
    from: string;
    data: Address;
    value: string;
    gas: string;
    estimatedGas: string;
    gasPrice: string;
    protocolFee: string;
    minimumProtocolFee: string;
    buyTokenAddress: string;
    sellTokenAddress: string;
    buyAmount: string;
    sellAmount: string;
    sources: any[];
    orders: any[];
    allowanceTarget: string;
    decodedUniqueId: string;
    sellTokenToEthRate: string;
    buyTokenToEthRate: string;
    expectedSlippage: string | null;
}
import {useState} from "react";
import PriceView from "@/pages/Price";
import QuoteView from "@/pages/Quote";
import type {PriceResponse} from "@/pages/api/types";
import {useAccount} from "wagmi";

export default function Home() {
  // to record the trade direction of the user's token swap action, the default value is to sell token
  const [tradeDirection, setTradeDirection] = useState("sell");
  // Boolean type, to track the
  const [finalize, setFinalize] = useState(false);
  // the store price value fetched from /swap/v1/price API
  const [price, setPrice] = useState<PriceResponse | undefined>();
  // the store quote value fetched from /swap/v1/quote API
  const [quote, setQuote] = useState();
  // the store the user's crypto wallet account address
  const {address} = useAccount();

  return (
      <main
          className={`flex min-h-screen flex-col items-center justify-between p-24`}
      >
        {finalize && price ? (
            <QuoteView price={price} quote={quote} setQuote={setQuote} takerAddress={address}/>
        ) : (<PriceView price={price} setPrice={setPrice} setFinalize={setFinalize} takerAddress={address}/>)}

      </main>
  )
}

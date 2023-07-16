// @ts-ignore
import qs from "qs";
import type {NextApiRequest,NextApiResponse} from "next";
// the interfaces provide type definitions for incoming HTTP requests (res is an instance of http.IncomingMessage) and outgoing HTTP responses (res is an instance of http.ServerResponse)

type Data={
  name:string
}

export default async function handler (
    req:NextApiRequest,
    res:NextApiResponse<any>
) {
  // the user's token pair query
  const query=qs.stringify(req.query);
  const response= await fetch(
      // the swap/v1/price API
      `https://api.0x.org/swap/v1/price?${query}`,
      // with the 0x-api-key added in the headers parameter for authentication
      {
        headers:{
          "0x-api-key":"22397bbd-56d2-4e15-a721-d8ea2510632c",
          "Content-Type": "application/json"
        }
      }
  )
  // return the data object as a JSON response back to the client with the status code 200 (OK)
  const data = await response.json();
  res.status(200).json(data);
}


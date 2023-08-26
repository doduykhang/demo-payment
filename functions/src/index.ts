/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import Stripe from 'stripe';
import { Configuration, CountryCode, PlaidApi, PlaidEnvironments, Products } from 'plaid';
// const publicKey = "pk_test_51Ljb1BD91dNqCN3mgr6a2iFQnQbbiNi3v11Uy5O0KPAvMTQiXWGKQNz2zdmBpZaLOTVl7dWWsdhVmFriC6CxotRL00yvmSbf5T"
const privateKey = "sk_test_51Ljb1BD91dNqCN3mxZNHu0Cl7PJjYfzJD3LrPVMgZePSjVudCC14duULb7661kwH6XTwI0uuUdU83A1hbLUGnxpR000qzHfgYq"

const stripe = new Stripe(privateKey, {
  apiVersion: "2023-08-16"
});

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': "64e9bed00c30980015ee79fc",
      'PLAID-SECRET': "16988b6c138f300681bf594fea6e75",
    },
  },
});

const client = new PlaidApi(configuration);
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

 export const helloWorld =  onRequest(async (request, response) => {
   logger.info("Hello logs!", {structuredData: true});
   const token: string = (request?.query?.token || "") as string
   const charge = await stripe.charges.create({
    amount: 999,
    currency: 'usd',
    description: 'Example charge',
    source: token,
    metadata: {order_id: '6735'},
  });
  response.send(charge)
 });

 export const getAccsessToken =  onRequest(async (request, response) => {
  const token: string = (request?.query?.publicToken || "") as string
  const result = await client.itemPublicTokenExchange({
    public_token: token
  })

  console.log(result, "result");
  
 response.send(result.data.access_token)
});

 export const linkAccount = onRequest(async (request, response) => {
  try {
    console.log("here")
    const token = await client.linkTokenCreate({
      user: {
        client_user_id: "123"
      },
      client_name: "Plaid test app",
      products: [Products.Auth],
      country_codes: [CountryCode.Us],
      language: "en",
      redirect_uri: "http://localhost:3000/redirect",
    })
    console.log("token", token)
   response.send("Token " + token.data);
  } catch (error) {
    console.log("error", error);
    
   response.send("Error ");
    
  }
 });

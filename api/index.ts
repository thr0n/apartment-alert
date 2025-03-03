import "dotenv/config";

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";
import { sendMail } from "../src/sendMail";
import { getCurrentLiveOffers } from "../src/crawlPage";

dotenv.config();

export type Advertisement = {
  title: string;
  href: string | null;
  found: number;
};

const app = express();
const PORT = process.env.PORT;

app.get("/get-offers", async (request: Request, response: Response) => {
  const result = await x();
  const resultString = `Current offer count: ${result.liveOffers}; new offers: ${result.new}`;
  response.status(200).send(resultString);
});

app
  .listen(PORT, () => {
    console.log("Server running at PORT: ", PORT);
  })
  .on("error", (error) => {
    // gracefully handle error
    throw new Error(error.message);
  });

const x = async () => {
  const foundDate = Date.now();
  const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.s3uiq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  const alertDb = client.db("aparment-alert");
  const advertisements = alertDb.collection("advertisements");

  const mappedLiveOffers: Advertisement[] = await getCurrentLiveOffers();
  console.log(mappedLiveOffers);

  const allOffers = await Promise.all(
    mappedLiveOffers.map(async (liveOffer) => {
      const findResult = await advertisements.findOne({
        title: liveOffer.title,
      });

      if (findResult != null)
        return {
          title: findResult.title,
          href: findResult.href,
          found: findResult.found,
        };

      const doc: Advertisement = {
        title: liveOffer.title,
        href: liveOffer.href,
        found: foundDate,
      };
      const result = await advertisements.insertOne(doc);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);

      return doc;
    }),
  );

  const newDbEntries = allOffers.filter((it) => it.found == foundDate);

  console.log("new entries:");
  console.log(newDbEntries);

  if (newDbEntries.length > 0) {
    console.log("New offers! Message to recepients will be send");
    sendMail(newDbEntries);
  }

  client.close();

  return {
    new: newDbEntries.length,
    liveOffers: mappedLiveOffers.length,
  };
};

module.exports = app;

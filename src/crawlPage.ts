import axios from "axios";
import * as cheerio from "cheerio";
import { Advertisement } from "../api";

export const getCurrentLiveOffers = async () => {
  const HOST_NAME = process.env.HOST_NAME;

  const page = await axios.get(`https://${HOST_NAME}/vermietung/`);
  const $ = cheerio.load(page.data);

  const offers = $(".elementor-post__card .elementor-post__title");
  console.log(
    `Im Moment gibt es ${offers.length} Angebot${offers.length > 1 ? "e" : ""}:\n`,
  );

  const mappedLiveOffers: Advertisement[] = [];
  offers.each((_, element) => {
    const text = $(element).text().trim();
    const href = $(element).find("a").attr("href") || "";

    mappedLiveOffers.push({
      href,
      title: text,
      found: Date.now(),
    });
  });

  console.log(mappedLiveOffers);

  return mappedLiveOffers;
};

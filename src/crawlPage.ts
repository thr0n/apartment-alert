import puppeteer from "puppeteer";

export const getCurrentLiveOffers = async () => {
  const HOST_NAME = process.env.HOST_NAME;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(`https://${HOST_NAME}/vermietung/`);
  await page.setViewport({ width: 1080, height: 1024 });

  const paragraphs = await page.$$(".elementor-post");
  console.log(`Im Moment gibt es ${paragraphs.length} Angebote:\n`);

  const mappedLiveOffers = await Promise.all(
    Object.values(paragraphs).map(async (paragraph) => {
      const hyperlink = await paragraph.$eval("a", (el) =>
        el.getAttribute("href"),
      );
      const text = await paragraph.$eval(
        "div.elementor-post__text h3",
        (el) => el.innerText,
      );

      return {
        hyperlink,
        text,
      };
    }),
  );
  console.log(mappedLiveOffers);

  browser.close();

  return mappedLiveOffers;
};

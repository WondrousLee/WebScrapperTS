import { chromium } from "playwright";
import { writeFileSync } from "fs";
const fs = require("fs");
const url = process.argv[2];

//to run use command:
//Based on webscrapper.io template site.
//ts-node main.ts https://webscraper.io/test-sites/e-commerce/scroll/computers/laptops
if (!url) {
  console.error("Please provide a URL to scrape site.");
  process.exit(1);
}

async function scrapeSite(inputSite: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(inputSite);

  console.log("Scrolling the site for possible additonal products...");
  //Scroll until products are loaded.
  let siteIsScrolled = false;
  let previousHeight = 0;
  while (siteIsScrolled == false) {
    await page.mouse.wheel(0, 5000);
    await page.waitForTimeout(1000);
    const newHeight = await page.evaluate(() => document.body.scrollHeight);
    if (newHeight === previousHeight) siteIsScrolled = true;
    previousHeight = newHeight;
  }

  //Get the products from the site.
  console.log("Scraping products...");
  const products = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("div.caption"));
    return items.map((item) => {
      const titleElement = item.querySelector("a.title");
      const descriptionElement = item.querySelector("p.description.card-text");
      const priceElement = item.querySelector("h4.price.float-end.pull-right");
      const linkElement = item.querySelector("a.title").getAttribute("href");

      return {
        //For safety if the data is missing return null
        title: titleElement ? titleElement.textContent.trim() : null,
        link: linkElement ? "webscraper.io" + linkElement : null,
        description: descriptionElement
          ? descriptionElement.textContent.trim()
          : null,
        price: priceElement ? priceElement.textContent.trim() : null,
      };
    });
  });
  fs.writeFileSync(
    "./scrappedProducts.txt",
    JSON.stringify(products, null, "\n")
  ); //Saves the data to a file
  console.log(products);
  await browser.close();
}

scrapeSite(url);

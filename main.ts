import axios from "axios";
import * as cheerio from "cheerio";

const url = process.argv[2];

if (!url) {
  console.error("Please provide a URL");
  process.exit(1);
}

async function scrapeSite(newsURL: string) {
  try {
    const { data: html } = await axios.get(newsURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
      // proxy: {
      //     host: "185.175.110.232",
      //     port: 3128
      // }
    });
    const $ = cheerio.load(html);
    $("div.caption").each((index, element) => {
        const productTitle = $(element).find("a.title")
        if (productTitle !== null) {
            console.log("Listing Number: " + (index+1))
            const price = $(element).find("span")
            const description = $(element).find("p.description.card-text");
            console.log("Product Title: " + productTitle.text().trim());
            console.log("Description: " + description.text().trim())
            console.log("Price: " + price.text())
        }
    });
  } catch (error) {
    console.error(`Error fetching data from ${newsURL}: ${error}`);
  }
}
scrapeSite(url);

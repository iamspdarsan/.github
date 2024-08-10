import { readFileSync } from "fs";
import { parse as mdParse } from "marked";
import { parse as htmlParse } from "node-html-parser";

interface ReadmeMeta {
  description: string;
  keywords: string[];
  homepage: string;
}

/* Read readme file and extract meta description, keywords and homepage link */
async function loadMeta(): Promise<ReadmeMeta> {
  const readmeFilePath: string = "README.md";

  const readmeFileContent: string = readFileSync(readmeFilePath, {
    encoding: "utf8",
  });

  const parsedMD: string = await mdParse(readmeFileContent, {
    gfm: true,
  });

  const parsedHTML = htmlParse(parsedMD);

  const description: string = (
    parsedHTML.querySelector("#intro")?.innerText ?? ""
  ).replace(/\n/g, " ");

  const keywords: string[] =
    parsedHTML
      .querySelector("#keywords")
      ?.childNodes.filter((child) => child.rawTagName === "li")
      .map((child) => child.innerText ?? "") ?? [];

  const homepage: string =
    parsedHTML.querySelector("#url")?.getAttribute("href") ?? "";

  return {
    description: description,
    keywords: keywords,
    homepage: homepage,
  };
}

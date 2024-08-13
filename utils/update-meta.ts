import { readFileSync, writeFileSync } from "fs";
import { parse as mdParse } from "marked";
import { parse as htmlParse } from "node-html-parser";

interface ReadmeMeta {
  description: string;
  keywords: string[];
  homepage: string;
}

/* Read readme file and extract meta description, keywords and homepage link */
async function loadMeta(): Promise<ReadmeMeta> {
  const readmeFilePath: string = "../README.md";

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
      .map((child) => child.innerText?.toLowerCase() ?? "") ?? [];

  const homepage: string =
    parsedHTML.querySelector("#url")?.getAttribute("href") ?? "";

  return {
    description: description,
    keywords: keywords,
    homepage: homepage,
  };
}

function updateNpmJson(meta: ReadmeMeta): void {
  const jsonPath: string = "../package.json";

  try {
    const jsonData: string = JSON.parse(
      readFileSync(jsonPath, { encoding: "utf8" })
    );

    /* Updating content */
    jsonData["homepage"] = meta.homepage;
    jsonData["description"] = meta.description;
    jsonData["keywords"] = meta.keywords;

    writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), {
      encoding: "utf8",
    });
  } catch (err) {
    console.log("package.json not-found so skipped");
    console.log(err);
  }
}

async function updateGHmeta(meta: ReadmeMeta): Promise<void> {
  const ghContext: string[] = process.env.REPO_META.split("/") ?? ["", ""];

  const owner: string = ghContext[0];
  const repoName: string = ghContext[1];

  const { Octokit } = await import("@octokit/rest");

  const octakit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const {
    repos: { replaceAllTopics, update },
  } = octakit;

  replaceAllTopics({
    owner: owner,
    repo: repoName,
    names: meta.keywords.map((kw: string) => kw.replace(/[^a-zA-Z0-9]/g, "-")),
  });

  update({
    owner: owner,
    repo: repoName,
    description: meta.description,
    homepage: meta.homepage,
  });
}

async function main() {
  try {
    const meta: ReadmeMeta = await loadMeta();

    updateNpmJson(meta);
    updateGHmeta(meta);
  } catch (err) {
    console.error(err);
  }
}

main();

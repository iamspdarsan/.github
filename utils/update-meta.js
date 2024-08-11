import { readFileSync, writeFileSync } from "fs";
import { parse as mdParse } from "marked";
import { parse as htmlParse } from "node-html-parser";
/* Read readme file and extract meta description, keywords and homepage link */
async function loadMeta() {
    const readmeFilePath = "README.md";
    const readmeFileContent = readFileSync(readmeFilePath, {
        encoding: "utf8",
    });
    const parsedMD = await mdParse(readmeFileContent, {
        gfm: true,
    });
    const parsedHTML = htmlParse(parsedMD);
    const description = (parsedHTML.querySelector("#intro")?.innerText ?? "").replace(/\n/g, " ");
    const keywords = parsedHTML
        .querySelector("#keywords")
        ?.childNodes.filter((child) => child.rawTagName === "li")
        .map((child) => child.innerText?.toLowerCase() ?? "") ?? [];
    const homepage = parsedHTML.querySelector("#url")?.getAttribute("href") ?? "";
    return {
        description: description,
        keywords: keywords,
        homepage: homepage,
    };
}
function updateNpmJson(meta) {
    const jsonPath = "package.json";
    try {
        const jsonData = JSON.parse(readFileSync(jsonPath, { encoding: "utf8" }));
        /* Updating content */
        jsonData["homepage"] = meta.homepage;
        jsonData["description"] = meta.description;
        jsonData["keywords"] = meta.keywords;
        writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), {
            encoding: "utf8",
        });
    }
    catch (err) {
        console.log("package.json not-found so skipped");
        console.log(err);
    }
}
async function updateGHmeta(meta) {
    const owner = process.env.REPO_OWNER ?? "";
    const repoName = process.env.REPO_NAME ?? "";
    const { Octokit } = await import("@octokit/rest");
    const octakit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const { repos: { replaceAllTopics, update }, } = octakit;
    replaceAllTopics({ owner: owner, repo: repoName, names: meta.keywords });
    update({
        owner: owner,
        repo: repoName,
        description: meta.description,
        homepage: meta.homepage,
    });
}
async function main() {
    try {
        const meta = await loadMeta();
        updateNpmJson(meta);
        updateGHmeta(meta);
    }
    catch (err) {
        console.error(err);
    }
}
main();

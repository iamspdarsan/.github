"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const marked_1 = require("marked");
const node_html_parser_1 = require("node-html-parser");
/* Read readme file and extract meta description, keywords and homepage link */
async function loadMeta() {
    const readmeFilePath = "../README.md";
    const readmeFileContent = (0, fs_1.readFileSync)(readmeFilePath, {
        encoding: "utf8",
    });
    const parsedMD = await (0, marked_1.parse)(readmeFileContent, {
        gfm: true,
    });
    const parsedHTML = (0, node_html_parser_1.parse)(parsedMD);
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
        const jsonData = JSON.parse((0, fs_1.readFileSync)(jsonPath, { encoding: "utf8" }));
        /* Updating content */
        jsonData["homepage"] = meta.homepage;
        jsonData["description"] = meta.description;
        jsonData["keywords"] = meta.keywords;
        (0, fs_1.writeFileSync)(jsonPath, JSON.stringify(jsonData, null, 2), {
            encoding: "utf8",
        });
    }
    catch (err) {
        console.log("package.json not-found so skipped");
        console.log(err);
    }
}
async function updateGHmeta(meta) {
    const ghContext = process.env.REPO_META.split("/") ?? ["", ""];
    const owner = ghContext[0];
    const repoName = ghContext[1];
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

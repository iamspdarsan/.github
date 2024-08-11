"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var marked_1 = require("marked");
var node_html_parser_1 = require("node-html-parser");
/* Read readme file and extract meta description, keywords and homepage link */
function loadMeta() {
    return __awaiter(this, void 0, void 0, function () {
        var readmeFilePath, readmeFileContent, parsedMD, parsedHTML, description, keywords, homepage;
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    readmeFilePath = "README.md";
                    readmeFileContent = (0, fs_1.readFileSync)(readmeFilePath, {
                        encoding: "utf8",
                    });
                    return [4 /*yield*/, (0, marked_1.parse)(readmeFileContent, {
                            gfm: true,
                        })];
                case 1:
                    parsedMD = _g.sent();
                    parsedHTML = (0, node_html_parser_1.parse)(parsedMD);
                    description = ((_b = (_a = parsedHTML.querySelector("#intro")) === null || _a === void 0 ? void 0 : _a.innerText) !== null && _b !== void 0 ? _b : "").replace(/\n/g, " ");
                    keywords = (_d = (_c = parsedHTML
                        .querySelector("#keywords")) === null || _c === void 0 ? void 0 : _c.childNodes.filter(function (child) { return child.rawTagName === "li"; }).map(function (child) { var _a, _b; return (_b = (_a = child.innerText) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : ""; })) !== null && _d !== void 0 ? _d : [];
                    homepage = (_f = (_e = parsedHTML.querySelector("#url")) === null || _e === void 0 ? void 0 : _e.getAttribute("href")) !== null && _f !== void 0 ? _f : "";
                    return [2 /*return*/, {
                            description: description,
                            keywords: keywords,
                            homepage: homepage,
                        }];
            }
        });
    });
}
function updateNpmJson(meta) {
    var jsonPath = "package.json";
    try {
        var jsonData = JSON.parse((0, fs_1.readFileSync)(jsonPath, { encoding: "utf8" }));
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
function updateGHmeta(meta) {
    return __awaiter(this, void 0, void 0, function () {
        var owner, repoName, Octokit, octakit, _a, replaceAllTopics, update;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    owner = (_b = process.env.REPO_OWNER) !== null && _b !== void 0 ? _b : "";
                    repoName = (_c = process.env.REPO_NAME) !== null && _c !== void 0 ? _c : "";
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("@octokit/rest"); })];
                case 1:
                    Octokit = (_d.sent()).Octokit;
                    octakit = new Octokit({ auth: process.env.GITHUB_TOKEN });
                    _a = octakit.repos, replaceAllTopics = _a.replaceAllTopics, update = _a.update;
                    replaceAllTopics({ owner: owner, repo: repoName, names: meta.keywords });
                    update({
                        owner: owner,
                        repo: repoName,
                        description: meta.description,
                        homepage: meta.homepage,
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var meta, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, loadMeta()];
                case 1:
                    meta = _a.sent();
                    updateNpmJson(meta);
                    updateGHmeta(meta);
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.error(err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
main();

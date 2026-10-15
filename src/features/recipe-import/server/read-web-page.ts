import "server-only";

import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";

import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

import { importConfig } from "../config";
import { findRecipeNode, recipeNodeToText } from "../lib/recipe-json-ld";
import { ImportError, importError } from "./import-recipe";

// Fetches a recipe page for the import and keeps only the recipe text
// (ADR-0023): the page's JSON-LD Recipe when it has one, else its article
// text. Only public http(s) addresses are fetched.

const privateRanges = new BlockList();
for (const [network, prefix] of [
	["0.0.0.0", 8],
	["10.0.0.0", 8],
	["100.64.0.0", 10],
	["127.0.0.0", 8],
	["169.254.0.0", 16],
	["172.16.0.0", 12],
	["192.168.0.0", 16],
] as const) {
	privateRanges.addSubnet(network, prefix, "ipv4");
}
for (const [network, prefix] of [
	["::", 128],
	["::1", 128],
	["fc00::", 7],
	["fe80::", 10],
] as const) {
	privateRanges.addSubnet(network, prefix, "ipv6");
}

/** Throws unless the address is http(s) on a host that resolves publicly. */
async function checkAddress(url: URL): Promise<void> {
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw importError("urlScheme");
	}
	const host = url.hostname.replace(/^\[|\]$/g, "");
	const addresses = isIP(host)
		? [{ address: host, family: isIP(host) }]
		: await lookup(host, { all: true }).catch(() => {
				throw importError("siteNotFound");
			});
	const blocked = addresses.some(({ address, family }) => {
		const mapped = address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
		return mapped
			? privateRanges.check(mapped, "ipv4")
			: privateRanges.check(address, family === 6 ? "ipv6" : "ipv4");
	});
	if (blocked) throw importError("notPublicSite");
}

/** The body as text, failing once it passes the size limit. */
async function readBody(response: Response): Promise<string> {
	const reader = response.body?.getReader();
	if (!reader) return "";
	const chunks: Uint8Array[] = [];
	let size = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		size += value.byteLength;
		if (size > importConfig.url.maxBytes) {
			await reader.cancel();
			throw importError("pageTooLarge");
		}
		chunks.push(value);
	}
	return new TextDecoder().decode(Buffer.concat(chunks));
}

/** Fetches the page, following redirects only to public addresses. */
async function fetchPage(
	address: string,
	signal: AbortSignal
): Promise<string> {
	let url = new URL(address);
	for (let hop = 0; hop < 5; hop++) {
		await checkAddress(url);
		const response = await fetch(url, {
			redirect: "manual",
			signal,
			headers: { accept: "text/html,application/xhtml+xml" },
		});
		const location = response.headers.get("location");
		if (response.status >= 300 && response.status < 400 && location) {
			url = new URL(location, url);
			continue;
		}
		if (!response.ok) {
			throw new ImportError({
				key: "pageStatus",
				values: { status: response.status },
			});
		}
		const type = response.headers.get("content-type") ?? "";
		if (!/html/i.test(type)) {
			throw importError("notWebPage");
		}
		return readBody(response);
	}
	throw importError("tooManyRedirects");
}

/** The recipe text of the page at `address`. Throws ImportError. */
export async function readWebPage(
	address: string,
	signal: AbortSignal
): Promise<string> {
	let html: string;
	try {
		html = await fetchPage(
			address,
			AbortSignal.any([signal, AbortSignal.timeout(importConfig.url.timeoutMs)])
		);
	} catch (error) {
		if (error instanceof ImportError || signal.aborted) throw error;
		throw importError("pageLoadFailed");
	}

	const { document } = parseHTML(html);
	for (const script of document.querySelectorAll(
		'script[type="application/ld+json"]'
	)) {
		try {
			const node = findRecipeNode(JSON.parse(script.textContent ?? ""));
			if (node) return recipeNodeToText(node);
		} catch {
			// Malformed JSON-LD: try the next block, then the page text.
		}
	}

	const article = new Readability(document).parse();
	const text = (article?.textContent ?? "")
		.replace(/[ \t]+/g, " ")
		.replace(/\s*\n\s*/g, "\n")
		.trim();
	if (!text) {
		throw importError("noRecipeText");
	}
	const title = article?.title ? `${article.title}\n\n` : "";
	return (title + text).slice(0, importConfig.url.maxTextLength);
}

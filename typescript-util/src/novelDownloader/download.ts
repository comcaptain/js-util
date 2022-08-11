import fetch from "node-fetch";
import parse from "node-html-parser";

export default async function download()
{
	const response = await fetch("https://www.exambook.net/book/28282.html");
	const binary = await response.arrayBuffer();
	const decoder = new TextDecoder("GBK");
	const html = decoder.decode(binary);
	const doc = parse(html);
	const chapterLinks = doc.querySelectorAll("#list-chapterAll > dl > dd > a");
	chapterLinks.forEach(a =>
	{
		console.log(`${a.textContent} ${a.getAttribute("href")}`)
	})
}
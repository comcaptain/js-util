import { existsSync, readFileSync, writeFileSync } from "fs";
import fetch from "node-fetch";
import parse from "node-html-parser";

interface Chapter
{
	name: string;
	url: string;
	content?: string;
}

export default async function download()
{
	const hostName = "https://www.youkong.org";
	const chapters = (await downloadDoc(`${hostName}/shu_11425_index.html`))
		.querySelectorAll(".chapter-list > li > span > a")
		.map(link =>
		{
			const chapter: Chapter = {
				name: link.textContent.trim().replace("章", "章 "),
				url: `${hostName}${link.getAttribute("href")}`
			}
			return chapter;
		});
	const count = Math.min(chapters.length, chapters.length);
	const batchSize = 30;
	for (let i = 0; i < count; i += batchSize)
	{
		const endIndex = Math.min(count, i + batchSize);
		const chapterBatch = chapters.slice(i, endIndex);
		await Promise.all(chapterBatch.map(c => downloadChapter(c, hostName)));
		console.info(`Downloaded ${endIndex}/${count}`);
	}
	writeFileSync(`./output/老街中的痞子.txt`, chapters.slice(0, count).map(c => `${c.name}\n\n${c.content}`).join("\n\n"));
}

async function downloadChapter(chapter: Chapter, hostName: string): Promise<Chapter>
{
	let content = "";
	const cacheFilePath = `./output/cache/${chapter.name}.txt`;
	if (existsSync(cacheFilePath))
	{
		content = readFileSync(cacheFilePath).toString();
	}
	else
	{
		let doc = await downloadDoc(chapter.url);
		while (true)
		{
			let currentContent = doc.querySelector("#BookText")?.textContent.trim();
			content += currentContent;
			const nextLink = doc.querySelector(".article-infos + .articlebtn > a:last-child");
			if (!nextLink || nextLink.textContent.trim() !== "下一页") break;
			doc = await downloadDoc(hostName + nextLink.getAttribute("href")!.trim())
		}
		writeFileSync(cacheFilePath, content);
	}
	content = content.replace(/    /g, "\n");
	chapter.content = content;
	return chapter;
}

async function downloadDoc(url: string, encoding: string = "GBK")
{
	console.info("Downloading", url)
	const response = await fetch(url);
	const binary = await response.arrayBuffer();
	const decoder = new TextDecoder(encoding);
	const html = decoder.decode(binary);
	return parse(html);
}
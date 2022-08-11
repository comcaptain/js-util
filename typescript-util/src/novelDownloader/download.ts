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
	const hostName = "https://www.exambook.net";
	const chapters = (await downloadDoc(`${hostName}/book/28282.html`))
		.querySelectorAll("#list-chapterAll > dl > dd > a")
		.map(link =>
		{
			const chapter: Chapter = {
				name: link.textContent.trim(),
				url: `${hostName}${link.getAttribute("href")}`
			}
			return chapter;
		})
	console.log(await downloadChapter(chapters[0]));
}

async function downloadChapter(chapter: Chapter): Promise<Chapter>
{
	let doc = await downloadDoc(chapter.url);
	let content = "";
	while (true)
	{
		let currentContent = doc.querySelector("#htmlContent")?.textContent.trim();
		content += currentContent;
		const nextLink = doc.querySelector("#linkNext");
		if (!nextLink || nextLink.textContent.trim() !== "下一页") break;
		doc = await downloadDoc(nextLink.getAttribute("href")!.trim())
	}
	return {
		...chapter,
		content
	};
}

async function downloadDoc(url: string, encoding: string = "GBK")
{
	const response = await fetch(url);
	const binary = await response.arrayBuffer();
	const decoder = new TextDecoder(encoding);
	const html = decoder.decode(binary);
	return parse(html);
}
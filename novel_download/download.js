var CHAPTER_URL_SELECTOR = "#chapterList > li > a"
var CHAPTER_CONTENT_SELECTOR = "#contentbox"

function extractContent(doc) {
	var content = doc.querySelector(CHAPTER_CONTENT_SELECTOR);
	[].slice.call(content.children)
		.filter(function(node){return node.nodeName.toLowerCase() !== "br"})
		.forEach(function(node) {node.remove()})
	content.innerHTML = content.innerHTML.replace(/<br\s*\/?>/ig, "\n");
	return content.textContent;
} 

function crawlChapter(chapterInfo) {
	var url = chapterInfo.url;
	return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.addEventListener("load", function() {
			var doc = xhr.response;
			var chapter = {
				url: url,
				chapterName: chapterInfo.chapter_name,
				content: extractContent(doc)
			}
			console.info(`${++window.crawledCount}/${window.chapterCount} crawled chapter ${chapter.chapterName}`);
			resolve(chapter);
		});
		xhr.responseType = "document";
		xhr.open("GET", url);
		xhr.send();
		console.info("crawling: ", url);
	})
}

function extractChapterInfos() {
	return [].slice.apply(document.querySelectorAll(CHAPTER_URL_SELECTOR))
		.map(a => ({url: a.href, chapter_name: a.textContent}));
}

function generateNovelContent(novel) {
	var novelContent = "";
	for (var i in novel.chapters) {
		var chapter = novel.chapters[i];
		novelContent += chapter.chapterName + "\n\n";
		novelContent += chapter.content + "\n";
	}
	return novelContent;
}

function downloadTxt() {
	var novel = {};
	var chapterInfos = extractChapterInfos();
	window.chapterCount = chapterInfos.length;
	window.crawledCount = 0;
	Promise.all(chapterInfos.map(function(chapterInfo){return crawlChapter(chapterInfo)}))
	.then(function(chapters) {
		var chaptersMapByUrl = {};
		for (var i in chapters) {
			chaptersMapByUrl[chapters[i].url] = chapters[i]
		}
		novel.chapters = chapterInfos.map(function(chapterInfo){return chaptersMapByUrl[chapterInfo.url];});
	})
	.then(function(novelInfo) {
		novel.novelName = "new";
		var novelContent = generateNovelContent(novel);
		novel.chapters = undefined;
		novel.content = novelContent;
		download(novel);
	});
}
function download(novel) {
	var a = document.createElement('a');
	a.href = window.URL.createObjectURL(new Blob([novel.content], {type: 'text/plain'}));
	a.setAttribute('download', novel.novelName);

	a.style.display = 'none';
	document.body.appendChild(a);

	a.click();

	document.body.removeChild(a);
}

downloadTxt();
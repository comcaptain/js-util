// 笔趣阁 https://www.biduo.cc/
// var CHAPTER_URL_SELECTOR = "#list > dl > dd > a"
// var CHAPTER_CONTENT_SELECTOR = "#content"

// 顶点小说 https://www.23us.cc
// var CHAPTER_URL_SELECTOR = "dl.chapterlist > dd > a"
// var CHAPTER_CONTENT_SELECTOR = "#content"

// 笔下文学 http://www.bxwx3.org
var CHAPTER_URL_SELECTOR = "#list > dl > dd > a"
var CHAPTER_CONTENT_SELECTOR = "#zjneirong"

function extractContent(doc) {
	let contentNode = doc.querySelector(CHAPTER_CONTENT_SELECTOR);
	[].slice.apply(contentNode.querySelectorAll("#xuanchuan")).forEach(node => node.remove());
	return contentNode.innerText.trim();
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
			if (!chapter.content) {
				console.error(`Failed to crawl chapter ${chapter.chapterName} ${url}`);
				crawlChapter(chapterInfo).then(resolve);
			}
			else {
				console.info(`${++window.crawledCount}/${window.chapterCount} crawled chapter ${chapter.chapterName}`);
				resolve(chapter);
			}
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

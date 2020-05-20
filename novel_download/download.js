// 笔趣阁 https://www.biduo.cc/
var CHAPTER_URL_SELECTOR = "#list > dl > dd > a"
var CHAPTER_CONTENT_SELECTOR = "#content"
// https://www.booktxt.com/24_24720/
// 诡秘之主: http://www.173kt.net/book/16688/ 1300
// 从姑获鸟开始：http://www.054.la/shu4055/ 9
// 我师兄实在太稳健了: https://www.23txt.com/files/article/html/56/56263/
// 九星毒奶 http://www.853.la/shu1609/
 
// 顶点小说 https://www.23us.cc
// var CHAPTER_URL_SELECTOR = "dl.chapterlist > dd > a"
// var CHAPTER_CONTENT_SELECTOR = "#content"

// 笔下文学 http://www.bxwx3.org
// var CHAPTER_URL_SELECTOR = "#list > dl > dd > a"
// var CHAPTER_CONTENT_SELECTOR = "#zjneirong"

// 顶点小说 https://www.23us.so
// var CHAPTER_URL_SELECTOR = "#a_main .bdsub #at td.L > a"
// var CHAPTER_CONTENT_SELECTOR = "#contents"

function extractContent(doc, url) {
	let contentNode = doc.querySelector(CHAPTER_CONTENT_SELECTOR);
	if (contentNode == null) console.info("bad url", url, doc.body.innerHTML);
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
				content: extractContent(doc, url)
			}
			if (!chapter.content) {
				console.error(`Failed to crawl chapter ${chapter.chapterName} ${url}`);
				resolve(chapter);
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
		.map(a => ({url: a.href, chapter_name: a.textContent}))
		.slice(1300);
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

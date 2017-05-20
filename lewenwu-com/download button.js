//Now this is for website: http://www.xs82.net/
function extractContent(doc) {
	var content = doc.querySelector("#book_text");
	[].slice.call(content.children)
		.filter(function(node){return node.nodeName.toLowerCase() !== "br"})
		.forEach(function(node) {node.remove()})
	content.innerHTML = content.innerHTML.replace(/<br\s*\/?>/ig, "\n");
	return content.textContent;
} 

function extractChapterName(doc) {
	return doc.querySelector("#mains > .book_content_text > h1").textContent.trim();
}

function crawlChapter(url) {
	return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.addEventListener("load", function() {
			var doc = xhr.response;
			var chapter = {
				url: url,
				chapterName: extractChapterName(doc),
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

function extractChapterUrls() {
	var chapterNamesMap = {};
	return [].slice.apply(document.querySelectorAll("ul[id=chapterlist] > li > a")).filter(a => {
		var chapterName = a.textContent.trim();
		if (chapterNamesMap[chapterName] !== undefined) return false;
		chapterNamesMap[chapterName] = true;
		return true;
	}).map(function(a) {return a.href});
}

function generateNovelContent(novel) {
	var novelContent = novel.novelName + "\n" + novel.author + "\n\n";
	for (var i in novel.chapters) {
		var chapter = novel.chapters[i];
		novelContent += chapter.chapterName + "\n\n";
		novelContent += chapter.content + "\n";
	}
	return novelContent;
}

function downloadTxt(downloadNew) {
	if (!downloadNew) {		
		var cachedNovel = localStorage.getItem(window.location.href);
		if (cachedNovel != null) {
			console.info("cache found for current novel");
			download(JSON.parse(cachedNovel));
			return;
		}
	}
	var novel = {};
	var chapterUrls = extractChapterUrls();
	window.chapterCount = chapterUrls.length;
	window.crawledCount = 0;
	Promise.all(chapterUrls.map(function(url){return crawlChapter(url)}))
	.then(function(chapters) {
		var chaptersMapByUrl = {};
		for (var i in chapters) {
			chaptersMapByUrl[chapters[i].url] = chapters[i]
		}
		novel.chapters = chapterUrls.map(function(url){return chaptersMapByUrl[url];});
		novel.novelName = document.querySelector('#maininfo > div.info > h1').textContent;
		novel.author = document.querySelector('#maininfo > div.info > h3 > a').textContent;
		var novelContent = generateNovelContent(novel);
		novel.chapters = undefined;
		novel.content = novelContent;
		var serializableNovel = JSON.stringify(novel);
		try {
			localStorage.setItem(location.href, serializableNovel)
		}
		catch(e) {
			//storage is full now
			localStorage.clear();
			try {
				localStorage.setItem(location.href, serializableNovel)
			}
			catch(e) {
				console.warn("Novel is too large to store into local storage");
			}
		}
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

function createDownloadButton() {
	var downloadButton = document.createElement("button");
	downloadButton.textContent = "download";
	downloadButton.id = "downloadNovel";
	document.querySelector("body").appendChild(downloadButton);
	downloadButton.addEventListener("click", function() {
		downloadTxt(!confirm("你接受从缓存中下载吗？"));
 	})
}
document.addEventListener("DOMContentLoaded", function() {
	if (document.querySelector("#chapterlist")) {
		createDownloadButton();	
	}
})

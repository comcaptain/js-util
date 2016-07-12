function extractContent(doc) {
	var content = doc.querySelector("#content");
	[].slice.call(content.children)
		.filter(function(node){return node.nodeName.toLowerCase() !== "br"})
		.forEach(function(node) {node.remove()})
	content.innerHTML = content.innerHTML.replace(/<br\s*\/?>/ig, "\n");
	return content.textContent;
} 

function extractChapterName(doc) {
	return doc.querySelector(".kfyd > h1").textContent.trim().replace(/^(\d+)/, "第$1章");
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
			console.info("crawled chapter ", chapter.chapterName);
			resolve(chapter);
		});
		xhr.responseType = "document";
		xhr.open("GET", url);
		xhr.send();
		console.info("crawling: ", url);
	})
}

function crawlNovelInfo(url) {
	return new Promise(function(resolve, reject){
		var xhr = new XMLHttpRequest();
		xhr.addEventListener("load", function() {
			var doc = xhr.response;
			var h1 = doc.querySelector(".f20h");
			var authorEm = h1.querySelector("em");
			var author = authorEm.textContent.trim().replace("作者：","");
			authorEm.remove();
			var novelName = h1.textContent.trim();
			console.info("crawled novel information ", novelName, author);
			resolve({
				novelName: novelName,
				author: author
			});
		});
		xhr.responseType = "document";
		xhr.open("GET", url);
		xhr.send();
		console.info("crawling: ", url);
	});
}

function extractChapterUrls() {
	return [].slice.apply(document.querySelectorAll(".chapterlist > li > a")).map(function(a) {return a.href});
}

function extractNovelInfoUrl() {
	return document.querySelectorAll("ul.bread-crumbs > li > a")[1].href;
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
		var cachedNovel = localStorage.getItem(window.url);
		if (cachedNovel != null) {
			console.info("cache found for current novel");
			download(JSON.parse(cachedNovel));
			return;
		}
	}
	var novel = {};
	var chapterUrls = extractChapterUrls();
	Promise.all(chapterUrls.map(function(url){return crawlChapter(url)}))
	.then(function(chapters) {
		var chaptersMapByUrl = {};
		for (var i in chapters) {
			chaptersMapByUrl[chapters[i].url] = chapters[i]
		}
		novel.chapters = chapterUrls.map(function(url){return chaptersMapByUrl[url];});
		var novelInfoUrl = extractNovelInfoUrl();
		return crawlNovelInfo(novelInfoUrl)
	})
	.then(function(novelInfo) {
		novel.novelName = novelInfo.novelName;
		novel.author = novelInfo.author;
		var novelContent = generateNovelContent(novel);
		novel.chapters = undefined;
		novel.content = novelContent;
		var serializableNovel = JSON.stringify(novel);
		try {
			localStorage.setItem(window.url, serializableNovel)
		}
		catch(e) {
			//storage is full now
			localStorage.clear();
			localStorage.setItem(window.url, serializableNovel)
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
	if (document.querySelector("ul.chapterlist")) {
		createDownloadButton();	
	}
})
function retrieveDocument(url) {
	return new Promise(function(resolve, reject){
		var xhr = new XMLHttpRequest();
		xhr.addEventListener("load", function() {
			var doc = xhr.response;
			console.info("crawled ", doc.title);
			resolve(doc);
		});
		xhr.responseType = "document";
		xhr.open("GET", url);
		xhr.send();
		console.info("crawling: ", url);
	});
}
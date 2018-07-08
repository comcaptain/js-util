/*
U2FsdGVkX18znzYS8bddRnHYU3NGVnw/71MJ60JXOMK0lMsSvjPIlK41VXBOPvX0
RxEXgy4vMpLWVfqZ2W0zuc9U2XmsoW3zYONvfgghnYtDF1sdbm8nmWqt9B/z6Pkh
6MCOf/yxoGeRfMuRcsSaQY3yT64LhgyZcWSaO146nx0icYp6G+Wl2158xOghT1Ks
j3GoE6LPAQ0sFhY/yVxyACzJNFXvUg24KKWy+CKV14OkKtFiRL9s7fzdQx6UgDLw
zBCopDMLiuqjzrHX7L17CgU5tjFnQ66zTj30O0+lkNw7umd3I7ZF+YbPo7dAbInl
JPfqIXf2SSgM15S9vN29T5yJz5NAxOl7OwXPSssNCRNfbVUe3lLNgt4Hv+XSPyeq
Ir3HTf+pcX+YB3XB0aT3BWuOlYn7OMxWvKRgEgCGv5YnUQd837v2bYVuHtytIqF1
mBroGzWLkXZNIFttwhgMl8jGatF4SB3VFRLP1glZ10v4DFdHJMqB6QenEkN0/1S7
tosLZIAQDtnDPS0CZ87otzaI6rMmCrTNMMr0E7T9YvQ=
 */

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

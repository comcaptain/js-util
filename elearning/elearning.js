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

function extractTestLink(doc) {
	return doc.querySelector("a[href^=testFinishInit\\.do]");
}

function getScore(url) {
	return retrieveDocument(url).then(function(doc){
		var testLink = extractTestLink(doc);
		if (testLink === undefined) return 100;
		var tr = testLink.parentNode.parentNode;
		var scoreTd = tr.children[2];
		var scoreText = scoreTd.textContent.trim();
		return scoreText === "-" ? 0 : parseInt(scoreText.split("/")[0]);
	})
}
// formData exmaple:
// {
// 	courseid: 32,
// 	courseDetailID: 1,
// 	staffID: 111,
// 	optionsList: [['A', 'B', 'C', 'D'], ['A', 'B', 'C', 'D', 'E'], ['A', 'B', 'C', 'D']]
// }
// progress exmaple:
// 2: last try is guessing on the 3rd question
// lastAnswer example:
// [0, 1, 2, 3, 0, 1, 2, 3, 0, 1], means answering A,B,C,D,A,B,C,D,A,B
function doTest(formData, progress, lastAnswer, lastScore) {
	if (progress === undefined) {
		progress = 0;
	}
	var optionsList = formData.optionsList;
	var newAnswer;
	if (lastAnswer === undefined) {
		newAnswer = optionsList.map(function(options){return 0});
	}
	else {
		var currentOptions = optionsList[progress];
		if (lastAnswer[progress] === currentOptions.length - 1) {
			throw "没能找到第" + (progress + 1) + "个问题的答案，当前答案是" + stringifyAnswer(optionsList, lastAnswer) + ",这不科学!!!";
		}
		newAnswer = lastAnswer.slice();
		newAnswer[progress]++;
	}
	submitAnswer(formData, newAnswer.map(function(value, index) {return optionsList[index][value]})).then(function() {
		return getScore(window.location.href);
	}).then(function(score) {
		console.info("答案", stringifyAnswer(optionsList, newAnswer), "的分数是", score);
		if (score === 100) {
			alert("100分拿好了~ 正确答案是：" + stringifyAnswer(optionsList, newAnswer));
			return;
		}
		//this is the first test or score does not change
		if (lastScore === undefined || lastScore === score) {
			doTest(formData, progress, newAnswer, score);
			return;
		}
		//this answer is correct!
		if (score > lastScore) {
			if (progress === optionsList.length - 1) {
				throw "做完最后一题仍然没有拿到100分，不开心，当前答案是" + stringifyAnswer(optionsList, newAnswer);
			}
			doTest(formData, progress + 1, newAnswer, score);
			return;
		}

		//rest is lastScore is greater than current score
		doTest(formData, progress + 1, lastAnswer, lastScore);
	});
}

function getScore100() {
	var testingPageUrl = extractTestLink(document).href;
	crawlTestingPage(testingPageUrl).then(function(formData){
		doTest(formData);
	});
}

function submitAnswer(formData, answer) {
	console.info("提交答案", answer);
	return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function(e) {
			resolve();
		}
		var postData = new FormData();
		postData.append("time", "00:01:00");
		postData.append("checkboxcount", "+" + answer.length);
		postData.append("selectValue", answer.map(function(value, index){return (index + 1) + ":" + value}).join(",;") + ",;");
		postData.append("courseid", formData.courseid);
		postData.append("courseDetailID", formData.courseDetailID);
		postData.append("staffID", formData.staffID);
		xhr.open("post", "testFinish.do");
		xhr.send(postData);
	});
}

function stringifyAnswer(optionsList, currentAnswer) {
	return currentAnswer.map(function(answer, index){return optionsList[index][answer]}).join(", ");
}

function crawlTestingPage(url) {
	var formData = {};
	return retrieveDocument(url).then(function(doc) {
		formData.courseid = doc.querySelector("input[name=courseid]").value;
		formData.courseDetailID = doc.querySelector("input[name=courseDetailID]").value;
		formData.staffID = doc.querySelector("input[name=staffID]").value;
		var answerPageUrl = 'TestLoadServlet?courseId=' + formData.courseid + '&courseDetailId=' + formData.courseDetailID;
		return retrieveDocument(answerPageUrl);
	})
	.then(function(doc) {
		formData.optionsList = extractOptionList(doc);
		return formData;
	})
}

//example of return value: [['A', 'B', 'C', 'D'], ['A', 'B', 'C', 'D', 'E'], ['A', 'B', 'C', 'D']]
function extractOptionList(doc) {
	var checkboxes = doc.querySelectorAll("input[type=checkbox][id^=checkbox]");
	var optionsList = [];
	var questionIndex = 0;
	var lastQuestionId = undefined;
	for (var i = 0; i < checkboxes.length; i++) {
		var checkbox = checkboxes[i];
		var questionId = checkbox.getAttribute("name");
		var optionValue = checkbox.value;
		if (lastQuestionId !== undefined && lastQuestionId != questionId) {
			questionIndex++;
		}
		lastQuestionId = questionId;
		var optionValues = optionsList[questionIndex];
		if (!optionValues) {
			optionValues = [];
			optionsList[questionIndex] = optionValues;
		}
		optionValues.push(optionValue);
	}
	return optionsList;
}
getScore100();
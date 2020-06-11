let next;
async function timeTravel(targetTime)
{
	const url = `http://lkong.cn/forum/60/index.php?mod=data&sars=forum/60/thread_dateline&nexttime=${new Date(targetTime).getTime() / 1000}&_=1591495974215`;
	const xhr = new XMLHttpRequest();
	const responsePromise = new Promise(resolve => xhr.addEventListener("load", () => resolve(xhr.response)));
	xhr.responseType = "json";
	xhr.open("GET", url);
	xhr.send();
	const response = await responsePromise;
	const dataList = response.data;
	console.info(dataList);
	console.info(dataList.map(d => {
		const title = d.subject.replace(/.*>(.*)<.*/, "$1");
		const url = `http://lkong.cn/thread/${d.id.replace("thread_", "")}`;
		return title + " " + url;
	}).join("\n"));
	if (dataList.length > 0)
	{
		next = dataList[0].dateline;
		console.info(`Next is ${next}`);
	}
	for (let i = 0; i < 20; i++) console.info("")
}

async function n()
{
	if (!next)
	{
		console.error("No next");
		return;
	}
	timeTravel(next);
}

timeTravel("2012-06-12 22:00")
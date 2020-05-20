const PRICE_SELECTOR = "p.ml-2";
const QUEUE_STATUS_SELECTOR = "p.mr-1";
const TEXT_SELECTOR = "p.text-xs.p-4";
const ISLAND_SELECTOR = "div.note";

const PRICE_NAME = "price";
const QUEUE_SIZE_NAME = "queue-size";

function extractInfo(islandNode) {
	let price = parseInt(islandNode.querySelector(PRICE_SELECTOR).textContent.replace(" Bells", ""));
	let queueText = islandNode.querySelector(QUEUE_STATUS_SELECTOR).textContent.trim();
	let queueSize = parseInt(queueText.match(/^Waiting: (\d+)\/\d+/)[1]);
	let text = islandNode.querySelector(TEXT_SELECTOR).textContent;
	return {
		node: islandNode,
		price: price,
		text: text,
		queueSize: queueSize
	}
}

function filter() {
	let islandNodes = document.querySelectorAll(ISLAND_SELECTOR);
	console.info(`Found ${islandNodes.length} islands`);
	let priceThreshold = parseInt(document.querySelector(`[name=${PRICE_NAME}]:checked`).value);
	let queueSizeThreshold = parseInt(document.querySelector(`[name=${QUEUE_SIZE_NAME}]:checked`).value);
	for (let islandNode of islandNodes) {
		let info = extractInfo(islandNode);
		if (info.price < priceThreshold || info.queueSize > queueSizeThreshold 
			|| info.text.toLowerCase().includes("nmt")
			|| info.text.toLowerCase().includes("99k")
			|| info.text.toLowerCase().includes("stacks of turnip")) {
			islandNode.style.display = "none";
		}
	}
}

/*
<span>
	<input class="my-checkbox" type="radio" name="price" id="price-450" value="450">
	<label class="for-my-checkbox" for="price-450">
		<span data-hover="450$">450$</span>
	</label>
</span>
*/
function createCheckBox(name, value, isChecked, suffix) {
	if (suffix === undefined) suffix = "";
	let checked = isChecked ? "checked" : "";
	let container = document.createElement("span");
	container.innerHTML = 
		`<input class="my-checkbox" type="radio" ${checked} name="${name}" id="${name}-${value}" value="${value}">
		<label class="for-my-checkbox" for="${name}-${value}">
			<span data-hover="${value}${suffix}">${value}${suffix}</span>
		</label>`;
	return container;
}

function drawGUI() {
	let container = document.createElement("div");
	container.id = "tony-exchange";
	container.appendChild(createCheckBox(PRICE_NAME, "400", false, "$"));
	container.appendChild(createCheckBox(PRICE_NAME, "450", false, "$"));
	container.appendChild(createCheckBox(PRICE_NAME, "500", true, "$"));
	container.appendChild(createCheckBox(QUEUE_SIZE_NAME, "5", true));
	container.appendChild(createCheckBox(QUEUE_SIZE_NAME, "10"));
	container.appendChild(createCheckBox(QUEUE_SIZE_NAME, "20"));
	document.body.appendChild(container);
}

async function waitUntilLoaded() {
	if (!window.location.href.endsWith("turnip.exchange/islands")) return;
	while (true) {
		let islandCount = document.querySelectorAll(ISLAND_SELECTOR).length;
		console.info(`There are ${islandCount} islands now`);
		if (islandCount > 0) break;
		await new Promise(resolve => setTimeout(resolve, 100));	
	}
	drawGUI();
	filter();
}

window.onload = waitUntilLoaded

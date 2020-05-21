// Minify code in https://javascript-minifier.com/
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

function process() {
	// Find all islands
	let islandNodes = [].slice.apply(document.querySelectorAll(ISLAND_SELECTOR));
	if (islandNodes.length === 0) return;
	console.info(`Found ${islandNodes.length} islands`);
	let islands = islandNodes.map(extractInfo);

	// Sort islands by price descending
	let container = islandNodes[0].parentNode;
	islandNodes.forEach(n => container.removeChild(n));
	islands.sort((a, b) => b.price - a.price).forEach(i => container.appendChild(i.node));

	// Filter
	let priceThreshold = parseInt(document.querySelector(`[name=${PRICE_NAME}]:checked`).value);
	let queueSizeThreshold = parseInt(document.querySelector(`[name=${QUEUE_SIZE_NAME}]:checked`).value);
	let foundIsland = false;
	for (let island of islands) {
		if (island.price < priceThreshold || island.queueSize > queueSizeThreshold 
			|| island.text.toLowerCase().includes("nmt")
			|| island.text.toLowerCase().includes("99k")
			|| island.text.toLowerCase().includes("stacks of turnip")) {
			island.node.style.display = "none";
		}
		else {
			island.node.style.display = null;
			foundIsland = true;
		}
	}
	if (foundIsland) {
		notify();
	}
	else {
		let waitSeconds = 25 + parseInt(Math.random() * 10);
		console.info("island not found, going to refresh within " + waitSeconds + " seconds")
		setTimeout(() => location.reload(), waitSeconds * 1000);
	}
}

function notify() {
	new Audio("https://raw.githubusercontent.com/comcaptain/js-util/master/turnip_exchange/notify.mp3").play();
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
	container.appendChild(createCheckBox(PRICE_NAME, "500", false, "$"));
	container.appendChild(createCheckBox(PRICE_NAME, "600", true, "$"));
	container.appendChild(createCheckBox(QUEUE_SIZE_NAME, "5", true));
	container.appendChild(createCheckBox(QUEUE_SIZE_NAME, "10"));
	container.appendChild(createCheckBox(QUEUE_SIZE_NAME, "20"));
	document.body.appendChild(container);
}

function bindListeners() {
	document.querySelector("#tony-exchange").addEventListener("change", event => {
		if (event.target.getAttribute("type") !== "radio") return;
		process();
	})
}

function initialize() {
	drawGUI();
	process();
	bindListeners();	
}

async function waitUntilLoaded() {
	if (!window.location.href.endsWith("turnip.exchange/islands")) return;
	while (true) {
		let islandCount = document.querySelectorAll(ISLAND_SELECTOR).length;
		console.info(`There are ${islandCount} islands now`);
		if (islandCount > 0) break;
		await new Promise(resolve => setTimeout(resolve, 100));	
	}
	initialize();
}

window.onload = waitUntilLoaded

// initialize();

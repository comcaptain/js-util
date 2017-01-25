var tableSelector = "input[name=\\.done] + table";
function sortByBuyer() {
	var trs = [].slice.apply(document.querySelectorAll(tableSelector + " > tbody > tr"))
	trs = trs.slice(1)
	var tbody = document.querySelector(tableSelector + " > tbody");
	trs.forEach(tr => tbody.removeChild(tr))
	trs = trs.sort((tr1, tr2) => {
		var buyer1 = extractBuyer(tr1);
		var buyer2 = extractBuyer(tr2);
		if (buyer1 === buyer2) {
			return extractEndTime(tr1) > extractEndTime(tr2) ? 1 : -1;
		}
		return buyer1 > buyer2 ? 1 : -1;
	})
	trs.forEach(tr => tbody.appendChild(tr))
}
function extractBuyer(tr) {
	return tr.children[5].querySelector("a").textContent;
}
function extractEndTime(tr) {
	return tr.children[4].textContent;
}
function createSortButton() {
	var sortButton = document.createElement("button");
	sortButton.textContent = "sort";
	sortButton.id = "sortButton";
	document.querySelector("body").appendChild(sortButton);
	sortButton.addEventListener("click", sortByBuyer)
}
document.addEventListener("DOMContentLoaded", function() {
	if (document.querySelector(tableSelector)) {
		createSortButton();	
	}
})
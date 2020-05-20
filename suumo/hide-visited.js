// item list selector: .l-cassette > li
// link selector: a.cassette-header-title

class HouseItem {
	constructor(node, userPreference) {
		this.node = node;
		this.userPreference = userPreference;
	}

	hide() {
		this.node.style.display = "none";
	}

	getId() {
		return this.node.querySelector("a.cassette-header-title, .property_unit-title a").href;
	}

	getName() {
		return this.node.querySelector("a.cassette-header-title, .property_unit-title a").textContent.trim();
	}

	addButton() {
		this.node.style.position = "relative";
		var button = document.createElement("button");
		button.classList.add("hide-house-item");
		this.node.appendChild(button);
		button.addEventListener("click", event => {
			event.preventDefault();
			event.stopPropagation();
			if (!confirm("Are you sure to hide " + this.getName() + "?")) return;
			this.hide();
			this.userPreference.hide(this);
		});
	}

	static load(userPreference) {
		var items = [];
		for (let node of document.querySelectorAll(".l-cassette > li, .property_unit")) {
			items.push(new HouseItem(node, userPreference));
		}
		return items;
	}
}

class UserPreference {

	constructor(hideItemIds) {
		this.hideItemIds = new Set(hideItemIds);
	}

	hide(houseItem) {
		this.hideItemIds.add(houseItem.getId());
		localStorage.setItem("hide-item-ids", JSON.stringify(Array.from(this.hideItemIds)))
		console.info("Hided house item", houseItem.getId());
	}

	shouldHide(houseItem) {
		return this.hideItemIds.has(houseItem.getId());
	}

	static load() {
		var hideItemIds = localStorage.getItem("hide-item-ids")
		hideItemIds = hideItemIds ? JSON.parse(hideItemIds) : [];
		return new UserPreference(hideItemIds);
	}
}

window.onload = function() {
	var userPreference = UserPreference.load();
	HouseItem.load(userPreference)
		.map(item => {
			item.addButton(); 
			return item;
		})
		.filter(item => userPreference.shouldHide(item))
		.forEach(item => item.hide());
}
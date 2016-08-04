function toList(arrayLike) {
	return [].slice.apply(arrayLike);
}
function getPokemonsGroupedByType() {
    var pokemonsGroupedByType = {};
    var data = toList(document.querySelectorAll(".pokemon-wrap.card")).map(function(card, index) {
        return {
            CP: card.querySelector(".pokemon-cp").textContent.trim(),
            perfection: parseFloat(card.querySelector(".pokemon-score").textContent.trim()),
            name: card.querySelector(".pokemon-image").style.backgroundImage,
            index: index
        }
    }).map(function(pokemon) {
        var pokemonsOfThisType = pokemonsGroupedByType[pokemon.name];
        if (pokemonsOfThisType === undefined) {
            pokemonsOfThisType = [];
            pokemonsGroupedByType[pokemon.name] = pokemonsOfThisType
        }
        pokemonsOfThisType.push(pokemon);
    })
    return pokemonsGroupedByType;
}

function isUselessPokemon(pokemon) {
    return pokemon.CP <= 500 && pokemon.perfection <= 60
}

function markUselessPokemons() {
    var cards = toList(document.querySelectorAll(".pokemon-wrap.card"));
    cards.forEach(function(card) {
        card.classList.add("hidden");
    })
    var pokemonGroups = getPokemonsGroupedByType();
    for (var i in pokemonGroups) {
        var pokemons = pokemonGroups[i];
        var uselessPokemons = pokemons.filter(isUselessPokemon).sort(function(a, b) {return a.perfection - b.perfection});
        if (pokemons.length === uselessPokemons.length) uselessPokemons.pop();
        uselessPokemons.forEach(function(p) {cards[p.index].classList.remove("hidden")})
    }
}
function addButton() {
	var throwButton = document.createElement("button");
	throwButton.textContent = "throw useless pokemons";
	throwButton.id = "throwUselessPokemon";
	document.querySelector("body").appendChild(throwButton);
	throwButton.addEventListener("click", function() {
		markUselessPokemons()
 	})
}
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        if (document.querySelector("#nav-item-manager").parentNode.classList.contains("active")) {
    		addButton();	
    	}
    }, 1000)
})
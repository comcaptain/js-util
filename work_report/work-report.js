var trs = [].slice.call(document.querySelectorAll("#KnmTbl tr.dtTR"));
trs.filter(tr => {
	return tr.querySelector("select[name=sltKnmKt]").value == "1 1 100420 102139";
}).forEach(tr => {
	tr.querySelector("input[name=txtSTm]").value = "900";
	tr.querySelector("input[name=txtETm]").value = "1800";
})
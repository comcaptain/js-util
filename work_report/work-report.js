var doc = document.querySelector("[name=WM_FUNC]").contentDocument;
var trs = [].slice.call(doc.querySelectorAll("#KnmTbl tr.dtTR"));
trs.filter(tr => {
	return tr.querySelector("select[name=sltKnmKt]").value == "1 1 100420 102139";
}).forEach(tr => {
	tr.querySelector("input[name=txtSTm]").value = "900";
	tr.querySelector("input[name=txtETm]").value = "1800";
})

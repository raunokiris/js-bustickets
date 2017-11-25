document.querySelector("[data-bind$=RemovePassenger]").addEventListener('click', reloadButtons);
document.querySelector("[data-bind$=AddPassenger]").addEventListener('click', reloadButtons);

setTimeout(function(){
	reloadButtons();
}, 1000);

function reloadButtons() {
	setTimeout(function(){
		let tables = document.getElementsByClassName("passenger-info");  // Get all passanger-info tables
		for (let i = 0; i < tables.length; i++) {  // Loop trough all tables and add button.
			removeOldButton(tables[i]);
			
			let button_id = `btn-loadData_${i}`;
			addNewButton(tables[i], button_id);
			linkButtonToLoadData(tables[i], button_id);
		}
	}, 1000);
}

function removeOldButton(table) {
	let loadDataDivs = table.getElementsByClassName('loadData');
	if (loadDataDivs.length !== 0) {
		loadDataDivs[0].parentNode.removeChild(loadDataDivs[0])
	}
}

function addNewButton(table, button_id) {
	table.getElementsByClassName("contacting-options-fields")[0].innerHTML += `
		<div class="col-xs-12 pad-5-i text-right loadData">
			<button class="btn pad-0-30 loadData" id="${button_id}" title="Lae andmed" type="button" style="margin-right: 10px">Lae andmed</button>
		</div>
		`;
}

function linkButtonToLoadData(table, button_id) {
	let button_elem = document.getElementById(button_id);
	button_elem.addEventListener('click', function () {load_data(table)}, false);
}

function load_data(table) {
	chrome.storage.sync.get({
		FirstName: '',
		LastName: '',
		Email: '',
		PhonePrefix: '',
		PhoneNumber: '',
		DeliverEmailAddress: '',
		BonusCardNumber: ''
	}, function (user) {
		try {
			if (user.FirstName === '' && user.LastName === '') {
            	openOptionsPage()
        	} else {
				table.querySelector("[data-bind$=firstName]").value = user.FirstName;
				table.querySelector("[data-bind$=lastName]").value = user.LastName;
				table.querySelector("[data-bind$=BalticMilesNumber]").value = user.BonusCardNumber;
				table.querySelector("[data-bind^=validationElement]").value = user.PhonePrefix;
				table.querySelector("[data-bind$=phonePrefix]").value = user.PhonePrefix;
				table.querySelector("[data-bind$=email]").value = user.Email;
				table.querySelector("[data-bind$=phoneNumber]").value = user.PhoneNumber
			}
		} catch (e) {
			console.log(e);
		}
	});
}

function openOptionsPage() {
    let optionsUrl = chrome.extension.getURL("options/options.html");
    window.open(optionsUrl, "_blank", "width=340,height=340");
}

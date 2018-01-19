const tables = document.getElementsByClassName("passenger-info");  // Get all passanger-info tables

for (let i = 0; i < tables.length; i++) {  // Loop trough all tables and add button.
    if (tables[i].rows.length > 0) {
        let button_id = `btn-loadData_${i}`;
        addNewButton(tables[i], button_id);
        linkButtonToLoadData(tables[i], button_id);
    }
}

function addNewButton(table, button_id) {
    let button_cell = table.rows[0].insertCell(table.rows[0].cells.length);
	button_cell.setAttribute("style", "width: 500px; text-align: right;");
    button_cell.innerHTML = `
        <div id="manageUserData">
            <button class="btn" id="${button_id}" type="button">Lae andmed</button> 
        </div>`;
}

function linkButtonToLoadData(table, button_id) {
    document.getElementById(button_id).addEventListener('click', function () {insertUserDataToTable(table);}, false);
}

function insertUserDataToTable(table) {
	chrome.storage.sync.get({
        FirstName: '',
		LastName: '',
		Email: '',
		PhonePrefix: '',
		PhoneNumber: '',
		DeliverEmailAddress: '',
		BonusCardNumber: '',
        TPiletConditionsAccepted: false,
    }, function(user) {
		try {
            if (user.FirstName === '' && user.LastName === '') {
                openOptionsPage()
            } else {
                table.querySelector("[id$=__FirstName]").value = user.FirstName;
                table.querySelector("[id$=__LastName]").value = user.LastName;
                document.getElementById("DeliverEmailAddress").value = user.DeliverEmailAddress;
                table.querySelector("[id$=__BonusCardNumber]").value = user.BonusCardNumber;
                table.querySelector("[id$=__Email]").value = user.Email;
                table.querySelector("[id$=__PhonePrefix]").value = user.PhonePrefix;
                table.querySelector("[id$=__PhoneNumber]").value = user.PhoneNumber;
                deletePlaceholdersFromTable(table);
                document.getElementById('HasAcceptedLicenseAgreement').checked = user.TPiletConditionsAccepted;
            }
		} catch (e) {
			console.log(e);
		}
    });

}

function deletePlaceholdersFromTable(table) {
    let placeholders = table.getElementsByClassName("placeholder");
    for (let i = 0; i < placeholders.length; i++) {
        placeholders[i].innerHTML = '';
    }
}

function openOptionsPage() {
    let optionsUrl = chrome.extension.getURL("options/options.html");
    window.open(optionsUrl,'_blank', "width=340,height=340");
}

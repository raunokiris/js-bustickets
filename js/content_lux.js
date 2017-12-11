const currentPath = window.location.pathname;

if (currentPath.startsWith("/vali-reisijad/")) {

    document.querySelector("[data-bind$=RemovePassenger]").addEventListener('click', reloadButtons);
    document.querySelector("[data-bind$=AddPassenger]").addEventListener('click', reloadButtons);

    setTimeout(function () {
        reloadButtons();
    }, 1000);

    function reloadButtons() {
        setTimeout(function () {
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
        button_elem.addEventListener('click', function () {
            load_data(table)
        }, false);
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
        }, function (data) {
            insertUserData(table, data);
            confirmPins(table);
            saveTimestamp()
        });
    }

    function insertUserData(table, user) {
        try {
            if (user.FirstName === '' && user.LastName === '') {
                openOptionsPage()
            } else {
                changeElementValue(table.querySelector("[data-bind$=firstName]"), user.FirstName);
                changeElementValue(table.querySelector("[data-bind$=lastName]"), user.LastName);
                changeElementValue(table.querySelector("[data-bind$=BalticMilesNumber]"), user.BonusCardNumber);
                changeElementValue(table.querySelector("[data-bind^=validationElement]"), user.PhonePrefix);
                changeElementValue(table.querySelector("[data-bind$=phonePrefix]"), user.PhonePrefix);
                changeElementValue(table.querySelector("[data-bind$=email]"), user.Email);
                changeElementValue(table.querySelector("[data-bind$=phoneNumber]"), user.PhoneNumber);
            }
        } catch (e) {
            console.log(e);
        }
    }

    function confirmPins(table) {
        table.querySelector("input.confirm_change").click();
    }

    function saveTimestamp() {
        chrome.storage.sync.set({
            LastLoadTimestamp: Math.floor(Date.now() / 1000)
        });
    }

    function openOptionsPage() {
        let optionsUrl = chrome.extension.getURL("options/options.html");
        window.open(optionsUrl, "_blank", "width=340,height=340");
    }
}

else if (currentPath.startsWith("/ostukorv/ulevaade-ja-maksa")) {
    chrome.storage.sync.get({
        LastLoadTimestamp: 0
    }, function (data) {
        let currentTimestamp = Math.floor(Date.now() / 1000);
        if (currentTimestamp - data.LastLoadTimestamp <= 5 * 60) {
            insertEmailAddress();
        }

    });

    function insertEmailAddress() {
        chrome.storage.sync.get({
            FirstName: '',
            LastName: '',
            DeliverEmailAddress: ''
        }, function (user) {
            try {
                if (user.FirstName !== '' && user.LastName !== '') {
                    changeElementValue(document.getElementById("DeliverEmailAddress"), user.DeliverEmailAddress);
                }
            } catch (e) {
                console.log(e);
            }
        });
    }
}

function changeElementValue(el, new_value) {
    el.value = new_value;
    el.dispatchEvent(new KeyboardEvent('change', {'key': 'a'}));
}

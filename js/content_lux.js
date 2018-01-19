const currentPath = window.location.pathname;

// ========== Search results: timetable and prices ==========
if (currentPath.startsWith("/reiside-soiduplaan")) {
    let timetable = document.getElementsByClassName('timetable')[0];
    timetable.addEventListener('mouseup', openTicketView);

    function openTicketView(e) {
        // If the user clicked the text element, user will be forwarded to the ticket's page.
        if (e.target.classList.contains('selected-text')) {
            let buttonOpenTicketView = document.getElementById('js-make-url-and-go-to-checkout');
            buttonOpenTicketView.click();
        }
    }

    // All ticket price cells are appended with text 'Osta'
    for (let chosenElementText of document.getElementsByClassName('selected-text')) {
        chosenElementText.textContent += ' ➜ Osta!';
    }
}

// ========== Pick seats and enter user data ==========
else if (currentPath.startsWith("/vali-reisijad/")) {

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
        let newButtonDiv = document.createElement('div');
        newButtonDiv.setAttribute('class', 'col-xs-12 pad-5-i text-right loadData');
        newButtonDiv.innerHTML += `
		    <button class="btn pad-0-30 loadData" id="${button_id}"
		     title="Lae andmed" type="button" style="margin-right: 10px">Lae andmed</button>
		`;
        table.getElementsByClassName("contacting-options-fields")[0].appendChild(newButtonDiv);
    }

    function linkButtonToLoadData(table, button_id) {
        let button_elem = document.getElementById(button_id);
        button_elem.addEventListener('click', function () {
            loadData(table)
        }, false);
    }

    function loadData(table) {
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
    }

    function confirmPins(table) {
        let confirmPinsButton = table.querySelector("input.confirm_change");
        if (confirmPinsButton) {
            confirmPinsButton.click();
        }
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

// ========== Checkout and pay ==========
else if (currentPath.startsWith("/ostukorv/ulevaade-ja-maksa")) {
    chrome.storage.sync.get({
        LastLoadTimestamp: 0
    }, function (data) {
        let currentTimestamp = Math.floor(Date.now() / 1000);
        if (currentTimestamp - data.LastLoadTimestamp <= 5 * 60) {
            loadUserPerferences();
        }
    });

    function loadUserPerferences() {
        chrome.storage.sync.get({
            FirstName: '',
            LastName: '',
            DeliverEmailAddress: '',
            LuxConditionsAccepted: false,
            AcceptAdvertisements: true,
        }, function (user) {
            try {
                if (user.FirstName !== '' && user.LastName !== '') {
                    changeElementValue(document.getElementById("DeliverEmailAddress"), user.DeliverEmailAddress);
                }
            } catch (e) {
                console.log(e);
            }

            if (user.LuxConditionsAccepted) {
                document.getElementById('HasAcceptedLicenseAgreement').checked = true;
            }

            if (user.AcceptAdvertisements === false) {
                document.getElementById('HasAcceptedEmailAdvertisementBoolean').checked = false;
            }
        });
    }

}

// ========== General functions ==========
function changeElementValue(el, new_value) {
    if (el) {
        el.value = new_value;
        el.dispatchEvent(new KeyboardEvent('change', {'key': 'a'}));
    }
}
const currentPath = window.location.pathname;

// ========== Search results: timetable and prices ==========
if (currentPath.startsWith("/reiside-soiduplaan/")) {
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
            let tables = document.getElementsByClassName("pad-0-0-10");  // Get all ticket-tables
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
            BonusCardNumber: '',
            PreferredSeats: '',
        }, function (data) {
            selectPreferredSeat(table, data.PreferredSeats);
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

    function selectPreferredSeat(table, seatsPreferred) {
        if (seatsPreferred !== '') {
            let seatDivsAll = document.getElementsByClassName("bus-inner")[0]; // dynamic single modal
            let seatDictFree = createSeatsDictionary(seatDivsAll.querySelectorAll("a.seat:not(.disabled)"));

            let seatArrayPreferred = createPreferredSeatsArray(seatsPreferred, seatDivsAll);
            let seatBestDiv = getBestSeatDiv(seatArrayPreferred, seatDictFree);

            if (seatBestDiv !== undefined) {
                changeSelectedSeat(seatBestDiv, table)
            }
        }
    }

    function createSeatsDictionary(seatDivs) {
        let seatsDict = {};
        for (let seatDiv of seatDivs) {
            let seatNr = seatDiv.dataset.seat;
            seatsDict[seatNr] = seatDiv;
        }
        return seatsDict;
    }

    function createSeatsArray(seatDivs) {
        let seatsArray = [];
        for (let seatDiv of seatDivs) {
            let seatNr = seatDiv.dataset.seat;
            seatsArray.push(seatNr);
        }
        return seatsArray;
    }

    function createPreferredSeatsArray(seatsPreferredString, seatDivsAll) {
        let seatNumbersFreeREG = createSeatsArray(seatDivsAll.querySelectorAll("a.seat:not(.vip)"));
        let seatNumbersFreeVIP = createSeatsArray(seatDivsAll.querySelectorAll("a.seat.vip"));
        seatsPreferredString = seatsPreferredString.replace("REG", seatNumbersFreeREG.toString());
        seatsPreferredString = seatsPreferredString.replace("VIP", seatNumbersFreeVIP.toString());

        let seatArrayPreferred = seatsPreferredString.split(",");
        seatArrayPreferred = seatArrayPreferred.map(function(x) {return x.trim()}); // lambda-trim

        return seatArrayPreferred;
    }

    function getBestSeatDiv(seatsPreferred, seatsAvailable) {
        for (let seatPreferred of seatsPreferred) {
            let seatPreferredInt = parseInt(seatPreferred);
            let seatPreferredIsFree = seatsAvailable[seatPreferredInt] !== undefined;
            console.log('seatPreferred:',seatPreferred, 'vaba: ', seatPreferredIsFree);
            if (seatPreferredIsFree) {
                return seatsAvailable[seatPreferredInt];
            }
        }
    }

    function changeSelectedSeat(seatBestDiv, table) {
        let modalWindow = document.getElementsByClassName("modal fade seat-selection")[0];
        // buttonChangeSeat below will also initiate modalWindow 'display: block'. We don't want to show the modal window.
        modalWindow.style.visibility = 'hidden';

        let buttonChangeSeat = table.getElementsByClassName("btn btn-light btn-extra-small gray")[0];
        buttonChangeSeat.click();

        setTimeout(function(){
            seatBestDiv.click();
            let btn = document.querySelector("button.btn.btn-primary.confirm");
            btn.click();
        }, 1000);

        setTimeout(function(){
            modalWindow.style.visibility = 'visible' // Enable the user to make the modal window visible again.
        }, 1500);
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
            DeclineAdvertisements: true,
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

            if (user.DeclineAdvertisements) {
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
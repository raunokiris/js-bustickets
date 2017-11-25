function saveOptions() {
    chrome.storage.sync.set({
        FirstName: document.getElementById('FirstName').value,
        LastName: document.getElementById('LastName').value,
		Email: document.getElementById('Email').value,
		PhonePrefix: document.getElementById('PhonePrefix').value,
		PhoneNumber: document.getElementById('PhoneNumber').value,
		DeliverEmailAddress: document.getElementById('DeliverEmailAddress').value,
		BonusCardNumber: document.getElementById('BonusCardNumber').value
    }, function() {
    // Update status to let user know options were saved.
    let status = document.getElementById('status');
    status.textContent = 'Andmed salvestatud';
    setTimeout(function() {status.innerHTML = '&nbsp;';}, 2000);
    });
}

function restoreOptions() {
    // Read values and set defaults
    chrome.storage.sync.get({
        FirstName: '', 
		LastName: '', 
		Email: '', 
		PhonePrefix: '+372', 
		PhoneNumber: '', 
		DeliverEmailAddress: '', 
		BonusCardNumber: ''
    }, function(user) {
		document.getElementById('FirstName').value = user.FirstName;
		document.getElementById('LastName').value = user.LastName;
		document.getElementById('Email').value = user.Email;
		document.getElementById('PhonePrefix').value = user.PhonePrefix;
		document.getElementById('PhoneNumber').value = user.PhoneNumber;
		document.getElementById('DeliverEmailAddress').value = user.DeliverEmailAddress;
		document.getElementById('BonusCardNumber').value = user.BonusCardNumber;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);  // load defaults
document.getElementById('save').addEventListener('click', saveOptions);  // save options

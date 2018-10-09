function getParameterByName(name) {
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
 	results = regex.exec(window.location.href);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function load(json) {
    document.querySelector('.how').style.display = 'none';
    document.querySelector('.confirm').setAttribute('style', '');

    document.querySelector('#name').innerHTML = json.name;
    document.querySelector('#desc').innerHTML = json.description;
    document.querySelector('#preview').appendChild(APP.genPreview(json));

    document.getElementById('confirm-button').addEventListener('click', function() {
        const index = APP.insertDeck(json);

        select('.link-to-deck', function() {
            this.href = 'deck.html?i=' + index;
        });

        document.querySelector('.confirm').setAttribute('style', 'display: none');
        document.querySelector('.done').setAttribute('style', '');
    });
}

var code = getParameterByName('code');
if (code != null) {
    load(APP.import(code));
}

document.getElementById('encoded-button').addEventListener('click', function() {
    try {
        load(APP.import(decodeURIComponent(document.getElementsByName('encoded')[0].value)));
    } catch {
        alert('Sorry! The text you gave us is corrupt!');
    }
});

document.getElementById('json-button').addEventListener('click', function() {
    try {
        load(APP.import(document.getElementsByName('json')[0].value));
    } catch {
        alert('Sorry! The json you gave us is corrupt!');
    }
});

document.getElementById('quizlet-button').addEventListener('click', function() {
    try {
        load(APP.importAsCSV(document.getElementsByName('quizlet')[0].value, ';', ',', function(row) {
            return APP.createCard(1, row[0], row[1]);
        }));
    } catch {
        alert('Sorry! You must have pasted this wrong!');
    }
});
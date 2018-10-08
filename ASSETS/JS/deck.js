function getParameterByName(name) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const deck = APP.loadAllDecks()[parseInt(getParameterByName('i'))];

document.getElementById('preview-wrapper').appendChild(APP.genPreview(deck));

document.getElementsByName('title')[0].innerText = deck.name;
document.getElementsByName('desc')[0].innerText = deck.description;

document.getElementById('set-test').addEventListener('click', function() {
    document.getElementById('test-params').setAttribute('style', '');

    const number = document.getElementById('amount');
    loadNumber(number);

    const timer = document.getElementById('timer');
    loadCheckbox(timer);

    const reportAnswer = document.getElementById('giveAnswer');
    loadCheckbox(reportAnswer);

    document.getElementById('start-button').addEventListener('click', function() {
        var address = 'qs=' + number.getValue() + '&t=' + timer.getValue() + '&ra=' + reportAnswer.getValue() + '&i=' + deck.id;

        window.open('test.html?' + address, '_self');
    });
});
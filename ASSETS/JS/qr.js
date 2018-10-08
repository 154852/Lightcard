const main = document.getElementById("main");

const qrcode = new QRCode(main, {
	width : 5000,
	height : 5000
});

main.style.width = Math.min(window.innerWidth, window.innerHeight - document.querySelector('header').getBoundingClientRect().height - 100) + 'px';
main.style.height = main.style.width;

const deck = APP.loadAllDecks()[parseInt(getParameterByName('i'))];
qrcode.makeCode('https://' + window.location.host + '/import.html?code=' + APP.genCodeForDeck(deck));
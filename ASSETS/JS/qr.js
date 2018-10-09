const main = document.getElementById("main");

const width = Math.min(window.innerWidth, window.innerHeight - document.querySelector('header').getBoundingClientRect().height - 100) + 'px';

const deck = APP.loadAllDecks()[parseInt(getParameterByName('i'))];
const code = APP.genCodeForDeck(deck);
for (var i = 0; i < code.length; i += 1000) {
	const qrcode = new QRCode(main, {
		width : 5000,
		height : 5000
	});
	
	const address = 'http://' + window.location.host + '/qr-import.html?i=' + (i / 1000) + '&part=' + code.substring(i, i + 1000);
	console.log(address);
	qrcode.makeCode(address);

	main.lastChild.style.width = width;
	main.lastChild.style.height = width;
}

main.title = '';
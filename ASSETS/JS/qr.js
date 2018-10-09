const main = document.getElementById("main");

const width = Math.min(window.innerWidth, window.innerHeight - document.querySelector('header').getBoundingClientRect().height - 100);

const deck = APP.loadAllDecks()[parseInt(getParameterByName('i'))];
const code = decodeURIComponent(APP.genCodeForDeck(deck));
const size = width * 1.5;

for (var i = 0; i < code.length; i += size) {
	const qrcode = new QRCode(main, {
		width : 5000,
		height : 5000
	});
	
	const address = 'http://' + window.location.host + '/qr-import.html?i=' + (i / size) + '&part=' + encodeURIComponent(code.substring(i, i + size));
	console.log(address);
	qrcode.makeCode(address);

	main.lastChild.style.width = width + 'px';
	main.lastChild.style.height = width + 'px';
}

main.title = '';
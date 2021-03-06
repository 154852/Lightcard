const APP = {};

APP.loadAllDecks = function() {
    var decks = [];

    if (localStorage.decks != null) decks = JSON.parse(localStorage.decks);
    
    return decks;
}

APP.loadAllNotNullDecks = function() {
    const decks = APP.loadAllDecks();

    for (var i = 0; i < decks.length; i++) {
        if (decks[i] == null) {
            decks.splice(i, 1);
            i -= 1;
        }
    }

    return decks;
}

APP.loadAllDecksByDate = function() {
    const decks = APP.loadAllNotNullDecks();

    decks.sort(function(a, b) {
        return a.date - b.date;
    });

    return decks;
}

APP.insertDeck = function(data) {
    const array = APP.loadAllDecks();
    data.id = array.length;
    array.push(data);
    localStorage.decks = JSON.stringify(array);

    return array.length - 1;
}

APP.createDeck = function(name, cards, description) {
    return {name: name, cards: cards, description: description, id: APP.loadAllDecks().length, date: new Date().getTime()};
}

APP.createCard = function(type, a, b) {
    return {a: a, b: b, type: type, lastRevised: 0};
}

APP.orderByDate = function(cards) {
    const newArray = cloneArray(cards);
    if (cards[0].lastRevised == null) {
        for (const card of newArray) {
            card.lastRevised = 0;
        }
    } else {
        newArray.sort(function(a, b) {
            return a.lastRevised - b.lastRevised;
        });
    }

    return newArray;
}

APP.genCodeForDeck = function(deck) {
    deck = JSON.parse(JSON.stringify(deck));
    deck.id = undefined;
    deck.date = undefined;

    deck.name = deck.name.replaceAll(',', '');
    deck.description = deck.description.replaceAll(',', '');
    
    const cards = [];
    for (const card of deck.cards) {
        cards.push(card.type);
        cards.push(card.a.replaceAll(',', ''));
        if (card.type != 2) cards.push(card.b.replaceAll(',', ''));
    }

    deck.cards = cards;

    return exportJSON(deck);
}

APP.import = function(code) {
    const parts = code.split(',');

    const deck = APP.createDeck(parts[0], [], parts[parts.length - 1]);
    
    for (var i = 1; i < parts.length - 1; i += 2) {
        const card = APP.createCard(parseInt(parts[i]), parts[i + 1], '');
        if (parts[i] != '2') {
            card.b = parts[i + 2];
            i += 1;
        }
        deck.cards.push(card);
    }

    return deck;
}

APP.importAsCSV = function(string, rowSplit, termSplit, callback) {
    const rows = string.split(rowSplit);
    const deck = APP.createDeck('Quizlet Import', [], 'Quizlet Import');

    for (const row of rows) {
        if (row.trim() == '') continue;
        deck.cards.push(callback(row.split(termSplit)));
    }

    return deck;
}

APP.check = function(json) {
    var keys = Object.getOwnPropertyNames(json);

    if (keys.length != 3) throw new Error('Invalid deck!');
    if (keys.indexOf('name') == -1 || keys.indexOf('cards') == -1 || keys.indexOf('description') == -1) throw new Error('Invalid deck!');
    if (json.name.constructor.name != 'String' || json.cards.constructor.name != 'Array' || json.description.constructor.name != 'String') throw new Error('Invalid deck!');

    for (const card of json.cards) {
        keys = Object.getOwnPropertyNames(card);

        if (keys.length != 3) throw new Error('Invalid deck! - Card');
        if (keys.indexOf('a') == -1 || keys.indexOf('type') == -1 || (keys.types != 2 && keys.indexOf('b') == -1)) throw new Error('Invalid deck! - Card');
        if (card.a.constructor.name != 'String' || (keys.types != 2 && card.b.constructor.name != 'String') || typeof card.type != 'number') throw new Error('Invalid deck! - Card');
    }

    return json;
}

APP.importJSON = function(json) {
    const cards = [];

    for (var i = 0; i < json.cards.length; i += 2) {
        const card = APP.createCard(json.cards[i], json.cards[i + 1], '');
        if (json.cards[i] != 2) {
            card.b = json.cards[i + 2];
            i += 1;
        }
        cards.push(card);
    }

    json.cards = cards;

    return json;
}

APP.genPreview = function(deck) {
    const div = APP.genEditVisual(deck, function(a, b) {});
    div.className = 'preview-table';

    return div;
}

APP.genEditVisual = function(deck, editCallback) {
    const div = document.createElement('div');
    div.classList.add('edit-table');

    for (const card of deck.cards) {
        const cardDiv = document.createElement('div');
        div.appendChild(cardDiv);

        const a = document.createElement('p');
        a.innerText = card.a;
        cardDiv.appendChild(a);

        if (card.type == 2) cardDiv.classList.add('single');
        else {
            const b = document.createElement('p');
            b.innerText = card.b;
            cardDiv.appendChild(b);
        }

        cardDiv.addEventListener('click', function() {
            editCallback(card, cardDiv);
        });
    }

    return div;
}

APP.clear = function() {
    localStorage.decks = '[]';
}

APP.saveDeck = function(deck) {
    const decks = APP.loadAllDecks();
    deck.date = new Date().getTime();
    decks[deck.id] = deck;
    localStorage.decks = JSON.stringify(decks);
}

APP.randomCard = function() {
    return APP.createCard(parseInt(Math.random() * 3), genName(), genName());
}

APP.randomDeck = function() {
    return APP.createDeck(
        genName() + '. Yes. That is the title right now',
        [
            APP.randomCard(),
            APP.randomCard(),
            APP.randomCard(),
            APP.randomCard()
        ],
        'A description regarding the life of a ' + genName()
    );
}

APP.deleteDeck = function(deck) {
    const decks = APP.loadAllDecks();
    decks[deck.id] = null;

    for (const deck of decks) {
        if (deck != null) {
            localStorage.decks = JSON.stringify(decks);
            return;
        }
    }

    APP.clear();
}


function select(string, callback) {
    const selection = document.querySelectorAll(string);

    for (const element of selection) {
        callback.call(element);
    }
}

function loadChoose(element) {
    const children = element.children;

    element.getSelected = function() {
        for (var i = 0; i < children.length; i++) {
            if (children[i].className == 'selected') {
                return {
                    index: i,
                    node: children[i]
                };
            }
        }

        return null;
    };

    if (element.hasAttribute('extra')) {
        var extra = document.querySelector(element.getAttribute('extra'));
        extra.innerHTML = element.getSelected().node.getAttribute('extra');
    }

    for (const child of children) {
        child.addEventListener('click', function() {
            const from = element.getSelected().index;

            for (const child2 of children) {
                child2.className = '';
            }
            child.className = 'selected';

            if (child.hasAttribute('extra')) extra.innerHTML = child.getAttribute('extra');

            if (element.oninput) element.oninput(from, Array.prototype.indexOf.call(element.children, child));
        });
    }
}

function chooseRand(array) {
    return array[parseInt(Math.random() * array.length)];
}

function genName() {
    return chooseRand(['Green', 'Red', 'Fluffy', 'Shiny', 'Orange', 'Crazy', 'Inverse', 'Quantum', 'Random', 'Inexistant', 'Magical']) + chooseRand(['Mouse', 'Ferret', 'Octopus', 'Squirrel', 'Zebra', 'Quaffle', 'Data', 'Quiffle', 'Pretzel', 'Antimatter']);
}

function genExtension() {
    return chooseRand(['++', ' the sequel', ' the second', ' junior', ' returns']);
}

function removeListeners(node) {
    var new_node = node.cloneNode(true);
    node.parentNode.replaceChild(new_node, node);

    return new_node;
}

function loadNumber(element) {
    const add = element.children[3];
    const minus = element.children[1];
    const value = element.children[2];

    const min = element.hasAttribute('min')? parseInt(element.getAttribute('min')):-Infinity;
    const max = element.hasAttribute('max')? parseInt(element.getAttribute('max')):Infinity;

    element.getValue = function() {
        return parseInt(value.innerHTML);
    }

    add.addEventListener('click', function() {
        value.innerHTML = Math.min(element.getValue() + 1, max);
    });

    minus.addEventListener('click', function() {
        value.innerHTML = Math.max(element.getValue() - 1, min);
    })
}

function loadCheckbox(element) {
    const box = element.children[1];

    element.getValue = function() {
        return box.innerHTML == 'X';
    }

    box.addEventListener('click', function() {
        box.innerHTML = element.getValue()? '':'X';
    });
}

function fillData(name, value, element) {
    const items = (element != null? element:document).querySelectorAll('.fill-' + name);

    for (const item of items) {
        item.innerHTML = value;
    }
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getParameterByName(name) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function exportJSON(json) {
    var string = '';
    for (const key in json) {
        if (json[key] != null)
            if (typeof json[key] == 'object') {
                string += exportJSON(json[key]) + ',';
            } else {
                string += encodeURIComponent(json[key]) + ',';
            }
    }

    return string.substring(0, string.length - 1);
}

function cloneArray(start) {
    const array = [];
    for (const card of start) array.push(card);

    return array;
}

String.prototype.isOneWord = function() {
    return this.trim().split(' ').length == 1;
}

String.prototype.replaceAll = function(a, b) {
    return this.split(a).join(b);
}

Number.prototype.twoDigitString = function() {
    const string = this.toString();

    return '0'.repeat(2 - string.length) + string;
}

Number.prototype.mod = function(n) {
	return ((this % n) + n) % n;
};

NodeList.prototype.last = function() {
    return this.item(this.length - 1);
}

Array.prototype.last = function() {
    return this[this.length - 1];
}
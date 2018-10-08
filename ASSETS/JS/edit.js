if (window.deck == null) {
    window.deck = APP.randomDeck();
    APP.saveDeck(deck);
}

const typeSelect = document.getElementById('type');
loadChoose(typeSelect);

const editWrapper = document.getElementById('edit-wrapper');
const editElement = document.getElementById('create-card');

function save(card) {
    card.type = typeSelect.getSelected().index;
    card.a = document.getElementsByName('side1')[0].value;

    if (card.type != 2) card.b = document.getElementsByName('side2')[0].value;    

    APP.saveDeck(deck);
}

function saveDeck() {
    deck.name = document.getElementsByName('title')[0].innerText;
    deck.description = document.getElementsByName('desc')[0].innerText;

    APP.saveDeck(deck);
}

function refreshVisual() {
    editWrapper.innerHTML = '';
    editWrapper.appendChild(APP.genEditVisual(deck, editCallback));

    document.getElementsByName('title')[0].innerText = deck.name;
    document.getElementsByName('desc')[0].innerText = deck.description;
}

const saveButton = editElement.querySelector('#save-button')
const editCallback = function(card) {
    editElement.setAttribute('style', '');

    
    saveButton.onclick = function() {
        save(card);
        editElement.setAttribute('style', 'display: none');

        refreshVisual();
    };

    document.getElementsByName('side1')[0].value = card.a;

    if (card.type == 2) {
        document.querySelector('#second-side').className = 'locked';
        document.getElementsByName('side2')[0].setAttribute('readonly', 'true');
    }
    if (card.b != null) document.getElementsByName('side2')[0].value = card.b;
    else document.getElementsByName('side2')[0].value = '';

    typeSelect.oninput = null;
    typeSelect.oninput = function(from, to) {
        if (to == 2) {
            document.querySelector('#second-side').className = 'locked';
            document.getElementsByName('side2')[0].setAttribute('readonly', 'true');
        } else if (from == 2) {
            document.querySelector('#second-side').className = '';
            document.getElementsByName('side2')[0].removeAttribute('readonly');
        }

        save(card);
    };

    typeSelect.children[card.type].click();

    removeListeners(editElement.querySelector('#delete-button')).addEventListener('click', function() {
        deck.cards.splice(deck.cards.indexOf(card), 1);
        APP.saveDeck(deck);

        editElement.setAttribute('style', 'display: none');
        refreshVisual();
    });

    removeListeners(editElement.querySelector('#clone-button')).addEventListener('click', function() {
        const clone = JSON.parse(JSON.stringify(card));
        clone.a += genExtension();
        clone.b += genExtension();
        deck.cards.push(clone);
        APP.saveDeck(deck);

        editElement.setAttribute('style', 'display: none');
        refreshVisual();
    });
};

document.body.addEventListener('keyup', function() {
    saveDeck();
});

document.getElementById('add-button').addEventListener('click', function() {
    deck.cards.push(APP.randomCard());
    APP.saveDeck(deck);
    refreshVisual();
});

document.getElementById('delete-deck-button').addEventListener('click', function() {
    APP.deleteDeck(deck);
    window.location.replace('index.html');
});

document.getElementById('clone-deck-button').addEventListener('click', function() {
    APP.insertDeck(APP.createDeck(deck.name + genExtension(), JSON.parse(JSON.stringify(deck.cards)), deck.description + genExtension()));
    window.location.replace('index.html');
});

refreshVisual();
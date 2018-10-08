const array = document.querySelector('.deck-array');
const data = APP.loadAllDecksByDate();

if (data.length == 0) {
    array.innerHTML = '<p class="center-text">You don\'t seem to have any decks yet! You can <a href="create.html" style="--color: #85C1E9">create one here</a>.</p>'
}

for (var i = data.length - 1; i >= 0; i--) {
    const deck = data[i];

    const div = document.createElement('div');
    div.className = 'deck';
    
    const inner = document.createElement('div');
    inner.className = 'deck-inner';
    div.appendChild(inner);

    const title = document.createElement('h2');
    title.className = 'deck-title';
    title.innerHTML = deck.name;
    inner.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'deck-desc';
    desc.innerText = deck.description;
    inner.appendChild(desc);

    const size = document.createElement('p');
    size.className = 'deck-size';
    size.innerText = deck.cards.length + ' Card' + (deck.cards.length == 1? '':'s');
    inner.appendChild(size);

    const path = 'deck.html?i=' + deck.id;
    div.addEventListener('click', function() {
        window.open(path, '_self');
    });

    array.appendChild(div);
}
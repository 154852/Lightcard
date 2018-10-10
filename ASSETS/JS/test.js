const deck = APP.loadAllDecks()[parseInt(getParameterByName('i'))];
const testData = {
    questions: parseInt(getParameterByName('qs')),
    timer: getParameterByName('t') == 'true',
    reportAnswer: getParameterByName('ra') == 'true'
};

const questions = [];

function questionType(name, types, genCallback) {
    return {
        name: name,
        types: types,
        generateQuestion: genCallback
    }
}

function copyCards() {
    const array = [];
    for (const card of deck.cards) array.push(card);

    return array;
}

function randomCard(types, exclude) {
    const cardsJumbled = copyCards();
    shuffle(cardsJumbled);

    for (const card of cardsJumbled) {
        if (types.indexOf(card.type) != -1 && exclude.indexOf(card) == -1) return card;
    }
    
    return null;
}

function getNonNoiseWords(text) {
    text = text.replaceAll(/\.|,|\?|!/, '');

    const words = text.split(' ');
    const defaultNoise = ['and', 'if', 'so', 'or', 'this', 'is', 'that', 'are', 'what', 'a', 'its', 'as', 'it', 'to', 'by', 'of', 'there', 'they', 'does', 'an', 'like', 'who', 'which', 'when', 'why', 'for', 'on', 'at', 'in'];

    const end = [];

    for (var i = 0; i < words.length; i++) {
        if (words[i].startsWith('+') && words[i].endsWith('+')) {
            end.push(words[i].substring(1, words[i].length - 1).replaceAll('_', ' '));
        } else if (!((words[i].startsWith('-') && words[i].endsWith('-')) || defaultNoise.indexOf(words[i].toLowerCase()) != -1)) {
            end.push(words[i].replaceAll('_', ' '));
        }
    }

    return end;
}

const questionTypes = [
    questionType('True or False', [0, 1], function(card) {
        var answer = Math.random() >= 0.5;

        var side1, side2;
        switch (card.type) {
            case 0:
                side1 = card.a;
                if (answer)
                    side2 = card.b;
                else {
                    side2 = randomCard([0, 1], [card]).b;
                }
                break;
            case 1:
                const a = Math.random() >= 0.5;
                side1 = a? card.a:card.b;

                var random = randomCard([1], [card]);
                if (answer || random == null) {
                    side2 = a? card.b:card.a;
                    answer = true;
                } else {
                    const card2 = random;
                    side2 = a? card2.b:card2.a;
                }
                break;
        }

        side1 = side1.replaceAll(/\+|-/, '').replaceAll('_', ' ');
        side2 = side2.replaceAll(/\+|-/, '').replaceAll('_', ' ');

        const div = document.createElement('div');
        div.classList.add('q-tf');
        
        const statements = document.createElement('div');
        statements.classList.add('statements');
        statements.innerHTML = '<p>' + side1 + '</p><p>:</p><p>' + side2 + '</p>';
        div.appendChild(statements);

        div.innerHTML += '<div class="answer"><div class="choose"><p class="selected">True</p><p>False</p></div></div>';

        const choose = div.querySelector('.choose');
        loadChoose(choose);

        return question(div, function() {
            return choose.getSelected().index == (answer? 0:1)
        }, function() {
            const actual = choose.children.item(answer? 0:1);

            actual.setAttribute('style', 'color: #00CC33')
        });
    }),
    questionType('Fill in the gap', [0, 1, 2], function(card) {
        var side1, side2;

        switch (card.type) {
            case 0:
            case 1:
                if (card.b.isOneWord()) {
                    if (card.a.isOneWord()) return null;
                    side1 = card.a;
                    side2 = card.b;
                } else if (card.a.isOneWord()) {
                    side1 = card.b;
                    side2 = card.a;
                } else {
                    const random = Math.random() <= 0.5;

                    side1 = random? card.a:card.b;
                    side2 = random? card.b:card.a;
                }
                break;
            case 2:
                if (card.a.isOneWord()) return null;
                side1 = card.a;
                side2 = '';
                break;
        }

        const word = chooseRand(getNonNoiseWords(side1));

        const div = document.createElement('div');
        div.classList.add('q-fb');
        div.innerHTML = side1.replaceAll(/\+|-/, '').replaceAll('_', ' ').replace(word, '<input type="text" class="fb-blank" />') + (card.type != 2? ' : ' + side2.replaceAll(/\+|-/, '').replaceAll('_', ' '):'');
        if (div.children[0] == null) return null;
        div.children[0].setAttribute('style', 'width: ' + (word.length + 1) + 'ch');

        return question(div, function() {
            const fuzzySet = new FuzzySet([word.trim().toLowerCase().replaceAll(/[^a-z^0-9]/, '')]);
            const match = fuzzySet.get(div.children[0].value.toLowerCase().replaceAll(/[^a-z^0-9]/, ''));

            return match != null && match[0][0] >= 0.7;
        }, function() {
            const p = document.createElement('p');
            p.innerHTML = 'Correct Answer: ' + word;
            p.style.color = '#4CAF50';

            div.appendChild(p);
        });
    }),
    questionType('Give the other side', [0, 1], function(card) {
        var side1, side2;

        switch (card.type) {
            case 0:
                side1 = card.a;
                side2 = card.b;
                break;
            case 1:
                const random = Math.random() <= 0.5;

                side1 = random? card.a:card.b;
                side2 = random? card.b:card.a;
                break;
        }

        side2 = side2.replaceAll(/\+|-/, '').replaceAll('_', ' ');

        const div = document.createElement('div');
        div.classList.add('q-a');
        div.innerHTML = '<p>' + side1.replaceAll(/\+|-/, '').replaceAll('_', ' ') + '</p><hr /><input type="text" placeholder="' + side2.charAt(0) + '_'.repeat(side2.length - 1) + '" />';

        return question(div, function() {
            const fuzzySet = new FuzzySet([side2.toLowerCase().replaceAll(/[^a-z^0-9]/, '')]);
            const match = fuzzySet.get(div.children[2].value.toLowerCase().replaceAll(/[^a-z^0-9]/, ''));

            return match != null && match[0][0] >= 0.7;
        }, function() {
            const p = document.createElement('p');
            p.innerHTML = 'Correct Answer: ' + side2;
            p.style.color = '#4CAF50';

            div.appendChild(p);
        });
    })
]

function question(domElement, correctCallback, fixCallback) {
    return {
        domElement: domElement,
        correctCallback: correctCallback,
        fix: fixCallback
    }
}

function genQuestionsForCards(cards) {
    cards = cards.slice();
    shuffle(cards);

    types = questionTypes.slice();

    const questions = [];
    for (const card of cards) {
        shuffle(types);

        for (const type of types) {
            if (type.types.indexOf(card.type) != -1) {
                const question = type.generateQuestion(card);

                question.domElement.classList.add('main');

                const div = document.createElement('div');
                div.classList.add('question');
                div.innerHTML = '<div class="data"><div class="id">' + (i + 1) + '.</div><div class="type">' + type.name + '</div></div></div><div class="button block-button" style="margin-bottom: 0.5em; width: 90%">Check</div>';
                div.insertBefore(question.domElement, div.querySelector('.button'));

                questions.push({dom: div, question: question, card: card});

                break;
            }
        }
    }

    return questions;
}

var buffer = [];
var used = [];
for (var i = 0; i < testData.questions; i++) {
    const type = chooseRand(questionTypes);

    const card = randomCard(type.types, used);
    if (card == null) {
        i -= 1;
        used = [];
        continue;
    }

    const question = type.generateQuestion(card);
    if (question == null) {
        i -= 1;
        continue;
    }

    used.push(card);
    question.domElement.classList.add('main');

    const div = document.createElement('div');
    div.classList.add('question');
    div.innerHTML = '<div class="data"><div class="id">' + (i + 1) + '.</div><div class="type">' + type.name + '</div></div></div><div class="button block-button" style="margin-bottom: 0.5em; width: 90%">Check</div>';
    div.insertBefore(question.domElement, div.querySelector('.button'));

    buffer.push({dom: div, question: question, card: card});
}

fillData('questions', testData.questions);
fillData('timer', testData.timer);
fillData('ra', testData.reportAnswer);

function renderCanvas() {
    const canvas = document.getElementById('stats-canvas');
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 70;

    ctx.strokeStyle = '#E74C3C';

    ctx.beginPath();
    ctx.arc(250, 250, 200, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = '#4CAF50';

    ctx.beginPath();
    ctx.arc(250, 250, 200, 0, (2 * Math.PI) * (correct / current), false);
    ctx.stroke();
}

function finish() {
    shouldUpdate = false;

    document.querySelector('#end').setAttribute('style', '');
}

var current = 0;
var correct = 0;
const main = document.getElementById('main');
function nextQuestion() {
    const next = buffer[current];
    
    main.appendChild(next.dom);
    const input = next.dom.querySelector('input');
    if (input != null) input.focus()
    else document.activeElement.blur();
    
    main.scrollTop = main.scrollHeight;

    const check = next.dom.querySelector('.button');
    check.addEventListener('click', function() {
        current += 1;

        const isCorrect = next.question.correctCallback();

        if (isCorrect) correct += 1;
        check.style.display = 'none';

        if (testData.reportAnswer) {
            if (isCorrect) next.dom.classList.add('correct');
            else {
                next.dom.classList.add('incorrect');

                if (current == 1 || next.card != buffer[current - 2].card)
                    buffer.splice(current, 0, genQuestionsForCards([next.card])[0]);
            }

            next.question.fix();

            renderCanvas();
        }

        const pc = Math.round((correct / current) * 10000) / 100;

        fillData('correct', pc);
        fillData('incorrect', 100 - pc);
        fillData('score', correct);

        fillData('completed', current);
        fillData('completed-percent', Math.round((current / testData.questions) * 10000) / 1000);

        if (current != testData.questions) requestAnimationFrame(nextQuestion);
        else finish();
    });
}

var startTime = 0;
const time = document.getElementById('time');

if (!testData.timer) time.style.display = 'none';
if (!testData.reportAnswer) {
    const ra = document.getElementById('ra');
    ra.parentNode.removeChild(ra);
}

var shouldUpdate = true;
function timeUpdate() {
    const date = new Date(new Date().getTime() - startTime);
    fillData('time', date.getMinutes().twoDigitString() + ':' + date.getSeconds().twoDigitString());

    if (shouldUpdate) requestAnimationFrame(timeUpdate);
}

function start() {
    document.getElementById('start-info').style.display = 'none';    

    startTime = new Date().getTime();
    timeUpdate();    

    nextQuestion();
}

document.addEventListener('keyup', function(event) {
    if (event.keyCode == 13) {
        buffer[current].dom.querySelector('.button').click();
    } else if (event.keyCode == 39) {
        event.preventDefault();

        const choose = buffer[current].dom.querySelector('.choose');
        choose.children.item((choose.getSelected().index + 1) % choose.children.length).click();
    } else if (event.keyCode == 37) {
        event.preventDefault();

        const choose = buffer[current].dom.querySelector('.choose');
        choose.children.item((choose.getSelected().index - 1).mod(choose.children.length)).click();
    }
});
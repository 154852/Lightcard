const deck = APP.loadAllDecks()[parseInt(getParameterByName('i'))];
const sensitivity = parseFloat(getParameterByName('s'));

const testData = {
    questions: parseInt(getParameterByName('qs')),
    timer: getParameterByName('t') == 'true',
    reportAnswer: getParameterByName('ra') == 'true'
};

class QuestionGenerated {
    constructor(domElement, question, card, index) {
        this.domElement = domElement;
        this.question = question;
        this.card = card;
        this.index = index;
    }
}

QuestionGenerated.createQuestion = function(card, questionType, questionIndex) {
    const question = type.generateQuestion(card);
    if (question == null) return;

    domElement.classList.add('main');

    const div = document.createElement('div');
    div.classList.add('question');
    div.innerHTML = '<div class="data"><div class="id">' + questionIndex + '</div><div class="type">' + questionType.getName() + '</div></div></div><div class="button block-button" style="margin-bottom: 0.5em; width: 90%">Check</div>';
    div.insertBefore(question.domElement, div.querySelector('.button'));

    return new QuestionGenerated(div, question, card, index);
}

function getQuestionForCard(card, index) {
    for (const questionType of QuestionType.array) {
        if (questionType.isValidType(card.type)) {
            const question = QuestionGenerated.createQuestion(card, questionType, index);
            if (question == null) continue;

            return question;
        }
    }

    return null;
}
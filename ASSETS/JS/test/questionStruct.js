class QuestionType {
    getName() {
        return '';
    }

    isValidType(type) {
        return false;
    }

    getQuestion(card, cards) {
        return null;
    }
}

QuestionType.randomCard = function(types, exclude, cards) {
    const cardsJumbled = APP.orderByDate(cards);
    for (var i = 0; i < cardsJumbled.length; i++) {
        const card = cardsJumbled[i];
        cardsJumbled.splice(i, 1);
        cardsJumbled.splice(i + parseInt((Math.random() * 4) - 2), 0, card);
    }

    for (const card of cardsJumbled) {
        if (types.indexOf(card.type) != -1 && exclude.indexOf(card) == -1) return card;
    }
    
    return null;
}

QuestionType.array = [];
QuestionType.sensitivity = 0.8;

class Question {
    constructor(domElement, answer, isCorrect, correctError) {
        this.domElement = domElement;
        this.answer = answer;

        this.isCorrectCallback = isCorrect;
        this.correctErrorCallback = correctError;
    }

    isCorrect() {
        return this.isCorrectCallback.call(this);
    }

    correctError() {
        return this.correctErrorCallback.call(this);
    }
}
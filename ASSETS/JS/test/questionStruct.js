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
    const cardsJumbled = cloneArray(cards);
    shuffle(cardsJumbled);

    for (const card of cardsJumbled) {
        if (types.indexOf(card.type) != -1 && exclude.indexOf(card) == -1) return card;
    }
    
    return null;
}

QuestionType.array = [];

class Question {
    constructor(domElement, answer, isCorrect, correctError) {
        this.domElement = domElement;
        this.answer = answer;

        this.isCorrectCallback = isCorrect;
        this.correctErrorCallback = correctError;
    }

    isCorrect() {
        this.isCorrectCallback.call(this);
    }

    correctError() {
        this.correctErrorCallback.call(this);
    }
}
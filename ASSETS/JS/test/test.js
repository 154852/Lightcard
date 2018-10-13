class QuestionGenerated {
    constructor(domElement, question, card, index) {
        this.domElement = domElement;
        this.question = question;
        this.card = card;
        this.index = index;
    }
}

QuestionGenerated.createQuestion = function(card, type, questionIndex, cards) {
    const question = type.getQuestion(card, cards);
    if (question == null) return;

    question.domElement.classList.add('main');

    const div = document.createElement('div');
    div.classList.add('question');
    div.innerHTML = '<div class="data"><div class="id">' + questionIndex + '</div><div class="type">' + type.getName() + '</div></div></div><div class="button block-button" style="margin-bottom: 0.5em; width: 90%">Check</div>';
    div.insertBefore(question.domElement, div.querySelector('.button'));

    return new QuestionGenerated(div, question, card, questionIndex);
}

class TestHandler {
    constructor(cards, timer, reportAnswer, length, saveCallback) {
        this.cards = cards;
        this.timer = timer;
        this.reportAnswer = reportAnswer;
        this.length = length;

        this.usedCards = [];
        this.pastQuestions = [];
        this.correct = [];

        this.mainDomElement = document.getElementById('main');

        this.shouldEnd = false;
        this.startTime = 0;
        this.timerElement = document.getElementById('time');

        this.saveCallback = saveCallback;
    }

    init() {
        fillData('questions', this.length);
        fillData('timer', this.timer);
        fillData('ra', this.reportAnswer);

        if (!this.timer) {
            this.timerElement.style.display = 'none';
        }

        if (!this.reportAnswer) {
            const ra = document.getElementById('ra');
            ra.parentNode.removeChild(ra);
        }

        document.addEventListener('keyup', function(event) {
            if (event.keyCode == 13) {
                document.querySelectorAll('#main .button').last().click();
            } else if (event.keyCode == 39) {
                event.preventDefault();
        
                const choose = document.querySelectorAll('#main .choose').last();
                choose.children.item((choose.getSelected().index + 1) % choose.children.length).click();
            } else if (event.keyCode == 37) {
                event.preventDefault();
        
                const choose = document.querySelectorAll('#main .choose').last();
                choose.children.item((choose.getSelected().index - 1).mod(choose.children.length)).click();
            }
        });
    }

    getQuestionForCard(card, index, cards) {
        const reordered = cloneArray(QuestionType.array);
        shuffle(reordered);

        for (const questionType of reordered) {
            if (questionType.isValidType(card.type)) {
                const question = QuestionGenerated.createQuestion(card, questionType, index, cards);
                if (question == null) continue;

                return question;
            }
        }

        return null;
    }

    renderCanvas() {
        const canvas = document.getElementById('stats-canvas');
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 70;
    
        ctx.strokeStyle = '#E74C3C';
    
        ctx.beginPath();
        ctx.arc(250, 250, 200, 0, 2 * Math.PI);
        ctx.stroke();
    
        ctx.strokeStyle = '#4CAF50';
    
        ctx.beginPath();
        ctx.arc(250, 250, 200, 0, (2 * Math.PI) * (this.correct.length / this.pastQuestions.length), false);
        ctx.stroke();
    }

    fillData() {
        const pc = Math.round((this.correct.length / this.pastQuestions.length) * 10000) / 100;
    
        fillData('correct', pc);
        fillData('incorrect', 100 - pc);
        fillData('score', this.correct.length);

        fillData('completed', this.pastQuestions.length);
        fillData('completed-percent', Math.round((this.pastQuestions.length / this.length) * 10000) / 1000);
    }

    loadNextQuestion(next) {
        if (next == null) {
            next = this.getQuestionForCard(
                QuestionType.randomCard([0, 1, 2], this.usedCards, this.cards),
                this.pastQuestions.length == 0? 1:(Math.floor(this.pastQuestions.last().index) + 1),
                this.cards
            );
            this.usedCards.push(next.card);
            // APP.setRevised(next.card);
        }
        this.pastQuestions.push(next);

        if (this.usedCards.length == this.cards.length) this.usedCards = [];

        this.mainDomElement.appendChild(next.domElement);
        this.mainDomElement.scrollTop = this.mainDomElement.scrollHeight;

        const input = next.domElement.querySelector('input');
        if (input != null) input.focus()
        else document.activeElement.blur();

        const check = next.domElement.querySelectorAll('.button').last();
        const self = this;
        check.addEventListener('click', function() {
            check.style.display = 'none';

            const isCorrect = next.question.isCorrect();
            if (isCorrect) self.correct.push(next);

            if (self.saveCallback != null) {
                next.card.lastRevised = new Date().getTime();
                self.saveCallback();
            }
            
            var toFollow = null;
            if (self.reportAnswer) {
                if (isCorrect) next.domElement.classList.add('correct');
                else {
                    next.domElement.classList.add('incorrect');
    
                    if (this.pastQuestions == 1 || next.index % 1 != 0.5) {
                        toFollow = self.getQuestionForCard(next.card, self.pastQuestions.length + 0.5, self.cards);
                    }
                }
    
                next.question.correctError();

                self.fillData();
    
                self.renderCanvas();
            }
    
            if (self.pastQuestions.length != self.length) setTimeout(function() {
                self.loadNextQuestion(toFollow);
            }, 0);
            else {
                self.shouldEnd = true;
                document.querySelector('#end').setAttribute('style', '');
            }
        });
    }

    timeUpdate(thisElement) {
        var date = new Date(new Date().getTime() - thisElement.startTime);
        fillData('time', date.getMinutes().twoDigitString() + ':' + date.getSeconds().twoDigitString());
    
        if (!thisElement.shouldEnd) {
            date = new Date(Math.ceil(date.getTime() / (thisElement.pastQuestions.length)));
            fillData('avg-time', date.getMinutes().twoDigitString() + ':' + date.getSeconds().twoDigitString());
    
            setTimeout(thisElement.timeUpdate, 50, thisElement);
        }
    }

    start() {
        document.querySelector('#start-info').style.display = 'none';
    
        this.startTime = new Date().getTime();
        setTimeout(this.timeUpdate, 0, this);
    
        this.loadNextQuestion();
    }
}
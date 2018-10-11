QuestionType.array.push(new (class extends QuestionType {
    getName() {
        return 'True Or False';
    }

    isValidType(type) {
        return type == 0 || type == 1;
    }

    getQuestion(card, cards) {
        var answer = Math.random() >= 0.5;

        var side1, side2;
        switch (card.type) {
            case 0:
                side1 = card.a;
                if (answer)
                    side2 = card.b;
                else
                    side2 = randomCard([0, 1], [card], cards).b;

                break;
            case 1:
                const a = Math.random() >= 0.5;
                side1 = a? card.a:card.b;

                var random = randomCard([1], [card], cards);
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

        loadChoose(div.querySelector('.choose'));

        return new Question(div, answer, function() {
            return this.querySelector('.choose').getSelected().index == (this.answer? 0:1)
        }, function() {
            const actual = this.querySelector('.choose').children.item(this.answer? 0:1);

            actual.setAttribute('style', 'color: #00CC33')
        });
    }
}));
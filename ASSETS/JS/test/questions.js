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
                    var temp = QuestionType.randomCard([0, 1], [card], cards);
                    if (temp == null) return null;
                    side2 = temp;
                    side2 = side2.b;
                    

                break;
            case 1:
                const a = Math.random() >= 0.5;
                side1 = a? card.a:card.b;

                var random = QuestionType.randomCard([1], [card], cards);
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
            return this.domElement.querySelector('.choose').getSelected().index == (this.answer? 0:1);
        }, function() {
            const actual = this.domElement.querySelector('.choose').children.item(this.answer? 0:1);

            actual.setAttribute('style', 'color: #00CC33')
        });
    }
}));

QuestionType.array.push(new (class extends QuestionType {
    getName() {
        return 'Fill in the gaps';
    }

    isValidType(type) {
        return true;
    }

    getQuestion(card, cards) {
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

        const word = chooseRand(this.getNonNoiseWords(side1));

        const div = document.createElement('div');
        div.classList.add('q-fb');
        div.innerHTML = side1.replaceAll(/\+|-/, '').replaceAll('_', ' ').replace(word, '<input type="text" class="fb-blank" />') + (card.type != 2? ' : ' + side2.replaceAll(/\+|-/, '').replaceAll('_', ' '):'');
        if (div.children[0] == null) return null;
        div.children[0].setAttribute('style', 'width: ' + (word.length + 1) + 'ch');

        return new Question(div, word.trim(), function() {
            const fuzzySet = new FuzzySet([this.answer.toLowerCase().replaceAll(/[^a-z^0-9]/, '')]);
            const match = fuzzySet.get(this.domElement.children[0].value.toLowerCase().replaceAll(/[^a-z^0-9]/, ''));

            return match != null && match[0][0] >= QuestionType.sensitivity;
        }, function() {
            const p = document.createElement('p');
            p.innerHTML = 'Correct Answer: ' + this.answer;
            p.style.color = '#4CAF50';

            this.domElement.appendChild(p);
        });
    }

    getNonNoiseWords(text) {
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
}));

QuestionType.array.push(new (class extends QuestionType {
    getName() {
        return 'Answer the question';
    }

    isValidType(type) {
        return type == 0;
    }

    getQuestion(card, cards) {
        var side1 = card.a;
        var side2 = card.b;

        side2 = side2.replaceAll(/\+|-/, '').replaceAll('_', ' ');

        const div = document.createElement('div');
        div.classList.add('q-a');
        div.innerHTML = '<p>' + side1.replaceAll(/\+|-/, '').replaceAll('_', ' ') + '</p><hr /><input type="text" placeholder="' + side2.charAt(0) + ' _'.repeat(side2.length - 1) + '" />';

        return new Question(div, side2, function() {
            const fuzzySet = new FuzzySet([this.answer.toLowerCase().replaceAll(/[^a-z^0-9]/, '')]);
            const match = fuzzySet.get(this.domElement.children[2].value.toLowerCase().replaceAll(/[^a-z^0-9]/, ''));

            return match != null && match[0][0] >= QuestionType.sensitivity;
        }, function() {
            const p = document.createElement('p');
            p.innerHTML = 'Correct Answer: ' + this.answer;
            p.style.color = '#4CAF50';

            this.domElement.appendChild(p);
        });
    }
}));

QuestionType.array.push(new (class extends QuestionType {
    getName() {
        return 'Give the other side';
    }

    isValidType(type) {
        return type == 1;
    }

    getQuestion(card, cards) {
        const random = Math.random() <= 0.5;

        var side1 = random? card.a:card.b;
        var side2 = random? card.b:card.a;

        side2 = side2.replaceAll(/\+|-/, '').replaceAll('_', ' ');

        const div = document.createElement('div');
        div.classList.add('q-a');
        div.innerHTML = '<p>' + side1.replaceAll(/\+|-/, '').replaceAll('_', ' ') + '</p><hr /><input type="text" placeholder="' + side2.charAt(0) + ' _'.repeat(side2.length - 1) + '" />';

        return new Question(div, side2, function() {
            const fuzzySet = new FuzzySet([this.answer.toLowerCase().replaceAll(/[^a-z^0-9]/, '')]);
            const match = fuzzySet.get(this.domElement.children[2].value.toLowerCase().replaceAll(/[^a-z^0-9]/, ''));

            return match != null && match[0][0] >= QuestionType.sensitivity;
        }, function() {
            const p = document.createElement('p');
            p.innerHTML = 'Correct Answer: ' + this.answer;
            p.style.color = '#4CAF50';

            this.domElement.appendChild(p);
        });
    }
}));
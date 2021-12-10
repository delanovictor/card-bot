const deck = [
    'A_spades', '2_spades', '3_spades', '4_spades', '5_spades', '6_spades', '7_spades', '8_spades', '9_spades', '10_spades', 'J_spades', 'Q_spades', 'K_spades',
    'A_hearts', '2_hearts', '3_hearts', '4_hearts', '5_hearts', '6_hearts', '7_hearts', '8_hearts', '9_hearts', '10_hearts', 'J_hearts', 'Q_hearts', 'K_hearts',
    'A_clubs', '2_clubs', '3_clubs', '4_clubs', '5_clubs', '6_clubs', '7_clubs', '8_clubs', '9_clubs', '10_clubs', 'J_clubs', 'Q_clubs', 'K_clubs',
    'A_diamonds', '2_diamonds', '3_diamonds', '4_diamonds', '5_diamonds', '6_diamonds', '7_diamonds', '8_diamonds', '9_diamonds', '10_diamonds', 'J_diamonds', 'Q_diamonds', 'K_diamonds'
]

const startHandSize = 5;

let draws = 0

exports.draw = function(){
    let cardsInHand = []

    for(let i = 0; i < startHandSize;){

        let cardIndex = Math.floor(Math.random() * deck.length )

        if(cardsInHand.indexOf(cardIndex) == -1){
            cardsInHand.push(cardIndex)
            i++
        }

    }

    const result = evaluate(cardsInHand)


    draws++


    return {
        cards: getCards(cardsInHand),
        code: result.code,
        text: result.text,
        tryNumber: draws
    }
}

function evaluate (cardsInHand){
    let result = {
        code: 0,
        text: ''
    }

    if(areInTheSameSuite(cardsInHand)){
        if(areInOrder(cardsInHand)){
            if(hasCard(cardsInHand, 'A', '*')){
                result = {
                    code: 9,
                    text: 'Royal Flush'
                }
            }else{
                result = {
                    code: 8,
                    text: 'Straigth Flush'
                }
            }
        }else{
            result = {
                code: 7,
                text: 'Flush'
            }
        }
    }else{ 
        result = getMatches(cardsInHand)
    }

    return result;
}

function areInTheSameSuite  (cardsInHand){
    let suit = null;

    for(let card of cardsInHand){
        if(suit  == null)
            suit = defineSuite(card);

        if(suit != defineSuite(card))
            return false
    }

    return true
}

function areInOrder (cardsInHand) {
    let highest = 0;
    let inOrder = true;

    if(hasCard(cardsInHand, 'A', '*')){

        //Potencial para straigth flush
        if(hasCard(cardsInHand, '2', '*') || hasCard(cardsInHand, 'K', '*' )){
            for(let i = 0; i < cardsInHand.length; i++){
                if(cardsInHand[i] > highest)
                    highest = cardsInHand[i]
            }

            let offset = 0

            for(let i = 0; i < cardsInHand.length; i++){
                //Se for um A, pula a execução do algoritmo e incrementa o offset, para compensar a execução interrompida
                if(cardsInHand[i] % 13 == 0){
                    offset++;
                    continue;
                }

                if(cardsInHand.indexOf(highest - i + offset) == -1){
                    inOrder = false
                }
            } 

        }else{
            inOrder = false
        }

    }else{
        for(let i = 0; i < cardsInHand.length; i++){
            if(cardsInHand[i] > highest)
                highest = cardsInHand[i]
        }
    
        for(let i = 0; i < cardsInHand.length; i++){
            if(cardsInHand.indexOf(highest - i) == -1){
                inOrder = false
            }
        } 
    }
  

    return inOrder
}
 
function defineSuite (cardIndex) {
    let suit = null

    if(cardIndex < 13){
        suit = 'spades'
    }else{
        if(cardIndex < 26){
            suit = 'hearts'
        }else{
            if(cardIndex < 39){
                suit = 'clubs'
            }else{
                if(cardIndex < 52){
                    suit = 'diamonds'
                }
            }
        }
    }
    return suit
}

function defineCardNumber (cardIndex) {
    return  deck[cardIndex].split('_')[0]
}

function getCards  (cardsInHand) {
    let tempArray = []

    for(let card of cardsInHand){
        tempArray.push(deck[card])
    }

    return tempArray
}

function hasCard (cards, value, suit){
    let subject = ''

    if(suit == '*'){
        subject = value
    }else{
        if(value == '*'){
            subject = suit
        }else{
            subject = value + '_' + suit
        }
    }


    if(suit == value && value == '*')
        return true


    for(let card of cards){
        if(deck[card].indexOf(subject) > -1){
            return true;
        }
    }


    return false
}

function getMatches(cardsInHand){
    let matches = []

    cardsInHand.forEach((card, index) => {
        cardsInHand.forEach((otherCard, index2) =>{
            if(index != index2){
                if(defineCardNumber(card) == defineCardNumber(otherCard)){
                    if(matches.indexOf(card + '&' + otherCard) == -1 && matches.indexOf(otherCard + '&' + card) == -1){
                        matches.push(card + '&' + otherCard)
                    }
                }
            }
        })
    });
    let text = 'Nothing'

    switch(matches.length){
        case 1:
            text = 'One Pair (' + defineCardNumber(matches[0].split('&')[0]) + ')'
        break;
        case 2:
            text = 'Two Pair (' + defineCardNumber(matches[0].split('&')[0]) + ') & (' + defineCardNumber(matches[1].split('&')[0])  + ')'
        break;
        case 3:
            text = 'Three of a Kind (' + defineCardNumber(matches[0].split('&')[0]) + ')'
        break;
        case 4:
            let cardNumberA = defineCardNumber(matches[0].split('&')[0])

            let cardNumberB = ''

            let threeOfAKind = ''
            let pair = ''

            let counter = 0

            matches.forEach(item=>{
                if(defineCardNumber(item.split('&')[0]) != cardNumberA){
                    cardNumberB = defineCardNumber(item.split('&')[0])
                    counter++;
                }else{
                    counter--;
                }
            })

            if(counter > 0){
                threeOfAKind = cardNumberB
                pair = cardNumberA
            }else{
                threeOfAKind = cardNumberA
                pair = cardNumberB
            }

            text = 'Full House (' + threeOfAKind + ') & (' + pair + ')'
        break;
        case 6:
            text = 'Four of a Kind (' + defineCardNumber(matches[0].split('&')[0]) + ')'
        break;

    }

    return {
        code: matches.length,
        text: text
    }
    
}
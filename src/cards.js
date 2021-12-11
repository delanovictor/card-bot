const deck = [
    'A_spades', '2_spades', '3_spades', '4_spades', '5_spades', '6_spades', '7_spades', '8_spades', '9_spades', '10_spades', 'J_spades', 'Q_spades', 'K_spades',
    'A_hearts', '2_hearts', '3_hearts', '4_hearts', '5_hearts', '6_hearts', '7_hearts', '8_hearts', '9_hearts', '10_hearts', 'J_hearts', 'Q_hearts', 'K_hearts',
    'A_clubs', '2_clubs', '3_clubs', '4_clubs', '5_clubs', '6_clubs', '7_clubs', '8_clubs', '9_clubs', '10_clubs', 'J_clubs', 'Q_clubs', 'K_clubs',
    'A_diamonds', '2_diamonds', '3_diamonds', '4_diamonds', '5_diamonds', '6_diamonds', '7_diamonds', '8_diamonds', '9_diamonds', '10_diamonds', 'J_diamonds', 'Q_diamonds', 'K_diamonds'
]

const startHandSize = 5;


//Select 5 random cards, gives a score and returns a array with the cards names
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

    return {
        cards: getCards(cardsInHand),
        code: result.code,
        text: result.text
    }
}

//Gives the cards a score (pair, flush, fullhouse etc)
function evaluate (cardsInHand){
    let result = {
        code: 0,
        text: ''
    }

    const sameSuit = areInTheSameSuit(cardsInHand)
    const inOrder = areInOrder(cardsInHand)

    if(sameSuit && inOrder){
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
    }else if (inOrder){
        result = {
            code: 7,
            text: 'Straigth'
        }
    } else if(sameSuit){
        result = {
            code: 7,
            text: 'Flush'
        }
    }else{ 
        result = searchMatches(cardsInHand)
    }

    return result;
}

//Search for multiple cards of the same value (pair, triple of a kind, four of a kind, fullhouse)
function searchMatches(cardsInHand){
    let matches = []

    cardsInHand.forEach((card, index) => {
        cardsInHand.forEach((otherCard, index2) =>{
            if(index != index2){
                if(getCardNumber(card) == getCardNumber(otherCard)){
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
            text = 'One Pair (' + getCardNumber(matches[0].split('&')[0]) + ')'
        break;
        case 2:
            text = 'Two Pair (' + getCardNumber(matches[0].split('&')[0]) + ') & (' + getCardNumber(matches[1].split('&')[0])  + ')'
        break;
        case 3:
            text = 'Three of a Kind (' + getCardNumber(matches[0].split('&')[0]) + ')'
        break;
        case 4:
            let cardNumberA = getCardNumber(matches[0].split('&')[0])

            let cardNumberB = ''

            let threeOfAKind = ''
            let pair = ''

            let counter = 0

            matches.forEach(item=>{
                if(getCardNumber(item.split('&')[0]) != cardNumberA){
                    cardNumberB = getCardNumber(item.split('&')[0])
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
            text = 'Four of a Kind (' + getCardNumber(matches[0].split('&')[0]) + ')'
        break;
        default:
            text = 'High Card (' +  getHighCard(cardsInHand) + ')'

    }

    return {
        code: matches.length,
        text: text
    }
    
}

//Returns true if all cards are in the same suit
function areInTheSameSuit  (cardsInHand){
    let suit = null;

    for(let card of cardsInHand){
        if(suit  == null)
            suit = getSuit(card);

        if(suit != getSuit(card))
            return false
    }

    return true
}

//Returns true if have their value in order
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

//Get suit of card
function getSuit (cardIndex) {
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

//Get mumber (on the deck array) of the card
function getCardNumber (cardIndex) {
    return  deck[cardIndex].split('_')[0]
}

//Get an array of the name of the cards
function getCards  (cardsInHand) {
    let tempArray = []

    for(let card of cardsInHand){
        tempArray.push(deck[card])
    }

    return tempArray
}

//Get the highest card in the hand 
function getHighCard(cardsInHand){
    let highestCardIndex;
    let highestCardValue = 0

    cardsInHand.forEach((card, index)=>{
        let cardValue = getCardNumber(card)
    
        switch(cardValue){
            case 'A':
                cardValue = 14;
            break;
            case 'K':
                cardValue = 13;
            break;
            case 'Q':
                cardValue = 12;
            break;
            case 'J':
                cardValue = 11;
            break;
        }

        if(cardValue > highestCardValue){
            highestCardValue = cardValue 
            highestCardIndex =  index
        }
    })

    return  getCardNumber(cardsInHand[highestCardIndex])
}

//Returns true if it has a card in the 'cards' array that follow the rules of 'value' and 'suit'
// * stands for any
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


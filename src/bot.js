//Basic
const fs = require('fs').promises;
require('dotenv').config()

//Apis
const twitter = require('./twitter-client');

//Card Logic
const cards = require('./cards')

//Canvas stuff
const sharp = require('sharp');
const {joinImages} = require('join-images');

//Main Process
module.exports.main = async function(event, context) {
    //Draw cards
    const cardData = cards.draw()

    //Generate Image from the Cards
    let image = await generateImage(cardData)
        

    //Tweet the image
    await twitter.tweet(image, cardData.text)

    return {
        statusCode: 200,
        body: JSON.stringify({
            cards: cardData
        })
    }
}


//Generate the image and outputs it to './output.png
async function generateImage(cardData){

   //Get the images of the cards
   let images = []
    
   cardData.cards.forEach(card => {
       images.push('images/' + card + '.png')
   });

   //Join the 5 cards in one image
   return await composeImage(images);
}


//Join the 5 cards in one image
async function composeImage(images){
    const response = await joinImages(images, {'direction':'horizontal','offset': 30, 'margin': '307 30 307 30'})
    
    const image = await response
                        .toFormat('jpg')
                        .toBuffer()

    const resized = await sharp(image)
                    .resize(1340, 670)
                    .toBuffer()


    return resized;
}  

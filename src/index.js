//Basic
const schedule = require('node-schedule')
const fs = require('fs').promises;


//Apis
const mailer = require('./mail-client');
const twitter = require('./twitter-client');


//Card Logic
const cards = require('./cards')


//Canvas stuff
const {registerFont, createCanvas, loadImage} = require('canvas')

const width = 935
const height = 500

const cardWidth = 140
const cardHeigth = 210

const canvas = createCanvas(width, height)
registerFont('fonts/PtMono-Regular.ttf', { family: 'PT Mono' });

// Schedule that triggers the process from time to time
const trigger = schedule.scheduleJob('*/10 * * * *', job)


let id = 0

//Main Process
async function job() {
    //Draw cards
    const cardData = cards.draw()

    //Generate Image from the Cards
    await generateImage(cardData)
        
    //Send the email with the image
    // await mailer.sendEmail(id)

    //Tweet the image
    await twitter.tweet(id)

    // Delete the image before the next call
    await deleteImage()
}

//Generate the image and outputs it to './output.png
async function generateImage(cardData){

   //Get the images of the cards
   let promises = []
    
   cardData.cards.forEach(card => {
       promises.push(loadImage('images/' + card + '.png'))
   });

   const images = await Promise.all(promises)


   //If the id is equal to 0, that means the server has restarted it
   if(id === 0){
        id = await getNextID()
   }else{
        id++
   }

   //Draw images on the canvas 
   drawToCanvas(images, cardData.text)

   //Generate the image
   const buffer = canvas.toBuffer("image/png");
   await fs.writeFile(`./output/image_${id}.png`, buffer)
}

//Get the id of the last image
async function getNextID(){
   //Ex: image_1234.png
   let file = (await fs.readdir('output')).pop()

   let lastID = file.split('.')
                    .shift()
                    .split('_')
                    .pop()

    //1234
    lastID = parseInt(lastID) 

    return  lastID + 1
}


//Delete the second to last generated image, this way there will always be at least one image in the folder, so that if the server restarts, the count number will not be completely lost
async function deleteImage(){
    const {err, stats} = fs.stat(`./output/image_${id - 1}.png`)
    if(!err){
        await fs.unlink(`./output/image_${id - 1}.png`);
    }else{
        console.log('file do no exists')
    }
}

//Draw the images to the canvas, as well as the score and the id of the execution
function drawToCanvas(images, score){

    //Setup canvas
    const context = canvas.getContext('2d')
    context.fillStyle = '#000'
    context.fillRect(0, 0, width, height)

    //Place the images
    images.forEach((image, index)=>{
        context.drawImage(image, 
                         ((cardWidth + 40) * index) + (width - ((cardWidth + 40) * 5)), 
                         (height - cardHeigth)/1.5 , 
                         cardWidth, 
                         cardHeigth)
     })


    //Write the score and id
    context.textBaseline = 'middle';
    context.textAlign = "center"

    context.font = '40pt PT Mono'
    context.fillStyle = '#fff'
    context.fillText(score, width/2, height/6);

    context.textAlign = "left"

    context.font = '10pt PT Mono'
    context.fillStyle = '#fff'
    context.fillText(id, 20, height - 20);
}




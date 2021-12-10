require('dotenv/config')

const Twitter= require('twitter');
const fs = require('fs').promises

const client = new Twitter({
   consumer_key: process.env.TWITTER_CONSUMER_KEY,
   consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
   access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
   access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

exports.tweet = async function(id){
   try{

      const image =  await fs.readFile(`./output/image_${id}.png`) // Raw response object.

      const mediaData = await uploadImage(image)

      const status = {
         media_ids: mediaData.media_id_string 
      }
   
      const response  = await postTweet(status)
   
   }catch(e){
      console.log(e)
   }
}

function uploadImage(image) {
   return new Promise((resolve, reject)=>{
      client.post('media/upload', {media:image}, function (err, data, response) {
         if (err) {
           reject(err);
         }

         resolve(data);
       })
   })
}

function postTweet(params){
   return new Promise((resolve, reject)=>{
      client.post('statuses/update', params, function (err, data, response) {
         if (err) {
           reject(err);
         }

         resolve(data);
       });
   })
}

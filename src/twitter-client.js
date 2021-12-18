const Twitter= require('twitter');

const client = new Twitter({
   consumer_key: process.env.TWITTER_CONSUMER_KEY,
   consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
   access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
   access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

exports.tweet = async function(image, text){
   try{

      const id = parseInt(await readLastTweet()) + 1;
      
      const mediaData = await uploadImage(image)
 
      const status = {
         media_ids: mediaData.media_id_string,
         status: `#${id} - ${text}`
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

function readLastTweet(){
   return new Promise((resolve, reject)=>{
        client.get('/statuses/user_timeline',{ screen_name: process.env.TWITTER_USER_NAME, count: 1}, 
            function(err, data) {
                if (err) {
                    reject(0);
                }
                
                const text = data[0].text;

                const index = text.indexOf(' ');

                const lastID = text.substr(1, index - 1);

                resolve(lastID);
            }
        );
   })
}

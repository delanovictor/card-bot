require('dotenv/config')

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    }
});


//Send the email
exports.sendEmail = async function (id){
    await _sendEmail(id)
}

//Promisified
function _sendEmail(id){
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: process.env.MAIL_TARGET,
        subject: 'Cards',
        attachments: [{
            filename: 'image1',
            path: `./output/image_${id}.png`,
            cid: 'image1'
        }],
        html: '<!DOCTYPE html><html lang="en"><head></head><body> <img src="cid:image1"/> </body></html>'
    };

    return new Promise((resolve, reject) =>{
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              reject(error)
            } else {
              resolve(info)
            }
        });
    })
}
import { Resend } from 'resend';
import dotenv from 'dotenv'
dotenv.config()

if(!process.env.RESEND_API){
    console.log("Provide Resend_API in .env")
}

const resend = new Resend(process.env.RESEND_API);

const sendEmail = async({sendTo,subject,html})=>{
    try{    
        const { data, error } = await resend.emails.send({
            from: 'Zempto <onboarding@resend.dev>',
            to: sendTo,
            subject: subject,
            html: html,
  });
        if (error) {
    return console.error({ error });
  }
  return data
    }catch(e){
        console.log(e)
    }
}

export default sendEmail
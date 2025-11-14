const verifyEmailTemplate = ({name,url})=>{
    return `
        <p>Dear ${name}</p>
        <br/>
        <p>Thank you for registering with Zempto </p>
        <br/>
            <br/>
            <br/>
        <a href=${url} style="color : white ; background :rgb(73, 31, 140) ; margin-top : 15px ; padding :20px ">
        Verify Email 
        </a>
    `
}

export default verifyEmailTemplate
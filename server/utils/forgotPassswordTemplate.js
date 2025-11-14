const forgotPasswordTemplate = ({name,otp}) =>{
    return`
        <div>
            <p>Dear, ${name}</p
            <br/>
            <br/>
            <br/>

            <p>Please Use the following OTP code to reset your password.</p>
                <div style = "background:yellow ; font-size:20px ; padding:20px;text-align:center ; font-weight:800">
                    ${otp}
                </div>
                <p>This OTP is only valid for 1 hour.</p>
        </div>
    `
}

export default forgotPasswordTemplate
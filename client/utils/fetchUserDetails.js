import Axios from "./Axios"
import SummaryApi from "../src/config/summaryApi"


const fetchUserDetails = async()=>{
    try{
        const response = await Axios({
            ...SummaryApi.userDetails
        })
        return response.data
    }catch(error){
        console.log('Error fetching user details:', error)
        return undefined // Return undefined instead of nothing
    }
}

export default fetchUserDetails
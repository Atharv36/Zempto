export const validURLConverter = (name)=>{
    const url = name .toString().replaceAll(" ","-").replaceAll(",","-").replaceAll("&","-")
    return url
}
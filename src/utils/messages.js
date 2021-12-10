const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

//Takes in ur l& user and sends it back as an object
const generateLocationMsg = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()

    }
}
module.exports = {
    generateMessage,
    generateLocationMsg

}
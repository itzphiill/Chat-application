const socket = io()

//Elements
const msg = document.querySelector('#message-form')
const messageFormInput = msg.querySelector('input')
const messageFormButton = msg.querySelector('button')
const sidebarTemp = document.querySelector('#sidebar-template').innerHTML
const sendLocationButton = document.querySelector('#send-location')

//Templates
const messages = document.querySelector("#messages")
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#locationMessage-template').innerHTML

const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

// Scroll to see latest msg
const scrollAuto = () => {

    //new message element
    const newMsg = messages.lastElementChild

    // Height of the new message
    const newMsgStyle = getComputedStyle(newMsg)
    const newMsgMargin = parseInt(newMsgStyle.marginBottom)
    const newMsgHeight = newMsg.offsetHeight + newMsgMargin

    //visible Height
    const visibleHeight = messages.offsetHeight
    const contentHeight = messages.scrollHeight
    const scrollOffset = messages.scrollTop + visibleHeight


    //Content- new msg to figure out if we are scrolling to the bottom
    //making sure that we are the bottom before last message is added, we are either gonna auto scroll or not
    if (contentHeight - newMsgHeight <= scrollOffset) {
        // how far down
        messages.scrollTop = messages.scrollHeight
    }
}

//ref to index.js 
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        //will come from the value
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    messages.insertAdjacentHTML('beforeend', html)
    scrollAuto()
})

socket.on('roomData', ({
    room,
    users
}) => {
    const html = Mustache.render(sidebarTemp, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html

})

// Render location  mustache, we get a url instead
// get value from username, url
socket.on('locationMessages', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    messages.insertAdjacentHTML('beforeend', html)
    scrollAuto()
})

//Refers to html form input
msg.addEventListener('submit', (e) => {
    //Prevents browser to update
    e.preventDefault()

    messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.msg.value
    socket.emit('sendMsg', message, (error) => {
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus()
        //Enable after event acknowledged

        if (error) {
            return console.log(error)
        }
    })
})

sendLocationButton.addEventListener('click', () => {
    //If broswer does not support geolocation
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    //Disable button after clicking on it
    sendLocationButton.setAttribute('disabled', 'disabled')
    //Otherwise 
    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendlocation', {

            latitude: position.coords.latitude,
            longitude: position.coords.longitude

        }, () => {
            //Remove the disable aatribute after emiting and getting response back
            sendLocationButton.removeAttribute('disabled')
        })
    })
})

//emit username and room we want to  join
//emit event server is gonna listen for
socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
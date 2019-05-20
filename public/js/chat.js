const socket = io()

// elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $message = document.querySelector('#message')
const $sidebar = document.querySelector('#sidebar')

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#locationmessage-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// options
const { username , room} = Qs.parse(location.search,{ ignoreQueryPrefix : true})

const autoscroll = () => {
    const $newMessage = $message.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHegiht = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $message.offsetHeight

    const containerHeight = $message.scrollHeight
    const scrollOffset = $message.scrollTop + visibleHeight

    if(containerHeight - newMessageHegiht <= scrollOffset){
        $message.scrollTop = $message.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message : message.text,
        createAt : moment(message.createAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(url)=>{
    console.log(url.url)
    const html = Mustache.render(locationMessageTemplate,{
        username : url.username,
        url : url.url,
        createAt : moment(url.createAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)
    autoscroll()
    
})

socket.on('roomData',({room,users}) =>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    $sidebar.innerHTML = html
})

socket.emit('join',{username, room} , (error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
})


$messageForm.addEventListener('submit',(e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        
        if(error){
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click',() => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }

    navigator.geolocation.getCurrentPosition((position) =>{

        socket.emit('sendLocation',{
            'latitude' : position.coords.latitude,
            'longitude' : position.coords.longitude
        }, () =>{
            console.log('Location is shared!')
        })
    })

})


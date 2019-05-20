const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $message = document.querySelector('#message')

const messageTemplate = document.querySelector('#message-template').innerHTML

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        message : message
    })
    $message.insertAdjacentHTML('beforeend',html)
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

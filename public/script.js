const socket= io('/')

const videoGrid= document.getElementById('video-grid');
const myVideo= document.createElement('video');
myVideo.muted=true;
let myVideoStream 

const peers={}

var peer = new Peer(undefined, {
    path:'/peerjs',
    host : '/',
    port: '443'
});

if (ROOM_ID)
{
    var person = prompt("Please Enter Your Name");
    var x = document.getElementById("snackbar");
    x.className = "show";
    x.textContent=person+" Joined the meeting";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

const muteUnmute= ()=>{
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled){
        myVideoStream.getAudioTracks()[0].enabled=false;
        setUnmuteButton();
    }
    else{
        myVideoStream.getAudioTracks()[0].enabled=true;
        setMuteButton();
    }
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }


navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream =>{
    myVideoStream=stream;
    addvideoStream(myVideo,stream)

    peer.on('call',call=>{
        call.answer(stream)
        const video=document.createElement('video')
        call.on('stream',userRemoteStream=>{
            addvideoStream(video,userRemoteStream);
        })
    })
    socket.on('user-connected',(userId)=>{
        conneToNewUser(userId,stream)
    })
    
    socket.on('createMessage',message=>{
        var node = document.createElement("li")
        var text= document.createTextNode(message);
        var list = document.getElementsByClassName("messages")[0]
        console.log(message)
        node.append(text);
        list.appendChild(node)
    })
    
})


peer.on('open',id=>{
    socket.emit('join-room',ROOM_ID,id);    
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})


const conneToNewUser=(userId,stream)=>{
    var call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', function(userRemoteStream) {
        addvideoStream(video,userRemoteStream)
    });

    call.on('close', () => {
        video.remove()
    })
    
    peers[userId] = call
}

const addvideoStream= (video,stream)=>{
    video.srcObject= stream;
    video.addEventListener('loadedmetadata',()=>{
        video.play();
    })
    videoGrid.append(video);   
}


function messageSend(){
    var e= window.event;
    var message= document.getElementById("chat_message");
    if (e.keyCode==13 && message.value.length!==0){
        socket.emit('message',message.value)
        message.value=''
    }
}


const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main_mute_button').innerHTML = html;
  }
  
const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main_mute_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main_video_button').innerHTML = html;
  }
  
const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main_video_button').innerHTML = html;
}


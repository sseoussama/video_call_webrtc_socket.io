

var isChannelReady = false; // to indicate if the channel is ready or not
var isInitiator = false; //to indicate the user is the one who created the room
var isStarted = false; // true whem the connection is started
var localStream; // to save the local the stream
var peerConnection;
var remoteStream; // to save the local the stream

var you = document.querySelector('#you');
var other = document.querySelector('#other');



// get the room name 
window.room = prompt("Create or Join a room");


var socket = io.connect();

if (room !== '') socket.emit('create or join', room);  //create or join a room

//if the user is the one who created the room
socket.on('created', function(room,id) 
{
  you.innerHTML=id
  isInitiator = true;
});

// if the romm is full max=2 
socket.on('full', function(room)
 {
 
  alert('The Room is full');
 
});

socket.on('join', function (room)
{
  isChannelReady = true; // make the channel ready
});

//if this user joinded the room (not the one who created it )
socket.on('joined', function(room,id,clientsInRoom) 
{
   you.innerHTML=id
   other.innerHTML=clientsInRoom[0]
   isChannelReady = true;
});




function sendMessage(message)
 {
 
  socket.emit('message', message);
}


// handle when the client received a message based on his type
 socket.on('message', function(message) 
{
   
   switch (message.type) 
   {
     case 'got user media':
       start();
       break;
       case 'offer':
         if (!isInitiator && !isStarted) start();
         peerConnection.setRemoteDescription(new RTCSessionDescription(message));
         answer();
         break;
         case 'answer':
           if (isStarted) peerConnection.setRemoteDescription(new RTCSessionDescription(message));
          break;
          case 'candidate':
           
         if (isStarted) 
           {
             var candidate = new RTCIceCandidate({
               sdpMLineIndex: message.label,
               candidate: message.candidate
             });
            peerConnection.addIceCandidate(candidate);
           }
          break;
          case 'close':
           if (isStarted) remoteHangup();
          break;
     default:
       break;
   }
 
});



var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true
})
.then(stream)
.catch(function(e) 
{
  alert('getUserMedia() error: ' + e.name);
});

function stream(stream) 
{
  
  localStream = stream;
  localVideo.srcObject = stream;
  sendMessage({type: 'got user media'});
  if (isInitiator)  start(); 
   

}




function start()
 {
  
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) 
  {
    
    createPeerConnection();
    peerConnection.addStream(localStream);
    isStarted = true;
   
    if (isInitiator) call();
  }
}

window.onbeforeunload = function() 
{
  sendMessage({type: 'close'});
};



function createPeerConnection()
 {
  try {
    peerConnection = new RTCPeerConnection(null);
    peerConnection.onicecandidate = IceCandidateEvent;
    peerConnection.onaddstream = remoteStreamAddedEvent;
    peerConnection.onremovestream = remoteStreamRemovedEvent;
    
  } catch (e) {
    
    alert('error creating  RTCPeerConnection.');
    return;
  }
}

function IceCandidateEvent(event)
 {
  
  if (event.candidate)
   
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  
  else  console.log('All ICE candidates have been sent');
  
}

function createOfferError(event) 
{
  console.log('createOffer  error: ', event);
}

// sending offer to peer
function call() 
{
  
  peerConnection.createOffer(setLocalAndSendMessage, createOfferError);
}

//sending answer to peer
function answer()
 {
  
  peerConnection.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) 
{
  peerConnection.setLocalDescription(sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) 
{
  trace('Failed to create session descriptio: ' + error.toString());
}


//handle Remote stream added 
function remoteStreamAddedEvent(event)
 {
     remoteStream = event.stream;
  
     remoteVideo.srcObject = remoteStream;
}

function remoteStreamRemovedEvent(event) 
{
  console.log('Remote stream removed. Event:');
}

// the user hangup the call 
function hangup()
 {
  
  isStarted = false;
  peerConnection.close();
  peerConnection = null;
  
  sendMessage({type: 'close'});
}

// the other user hang up the call
function remoteHangup() 
{
  isStarted = false;
  peerConnection.close();
  peerConnection = null;
  isInitiator = false;
}




module.exports = function(io)
{


    io.sockets.on('connection', function(socket) {


        socket.on('message', function(message) {
         
          // broadcast a message
          socket.broadcast.emit('message', message);
        });
      
        socket.on('create or join', function(room) {
              var peers = io.sockets.adapter.rooms[room];
              var peersArray=peers ? Object.keys(peers.sockets):[]
              var numPeers = peers ? Object.keys(peers.sockets).length : 0;
              if (numPeers < 2) 
              {
               socket.join(room);
           
             if(numPeers===0) socket.emit('created', room, socket.id);
            if(numPeers===1) 
         {
            
                io.sockets.in(room).emit('join', room);
                socket.emit('joined', room, socket.id,peersArray);
                 io.sockets.in(room).emit('ready');}
              }
          else  socket.emit('full', room);
        
        });
      
        socket.on('close', function(){
            console.log('Close');
          });
      
     
      
      });
      
      
      

     
    

};
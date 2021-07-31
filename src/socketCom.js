const socket = io('ws://localhost:8080');


var itsLoc={id:"ATES",xLoc:200,yLoc:300};

socket.on('message', socketItsLoc => {

    itsLoc=socketItsLoc;
});

export function getItsLoc() {
    console.log("geliyor");
    return itsLoc;
}



export function sendMyLoc(myLoc){
    socket.emit('message', myLoc)
}
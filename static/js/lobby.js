const user = {
    name: /Hi, ([\S]+)!/.exec(document.querySelector('.header__username').innerHTML)[1],
    room: '',
    team: 0, // 1 for red team and 2 for green team, 0 for not enter a room yet
    isOwner() {
        return this.name === this.room;
    },
    isInRoom(roomName) {
        return this.room === roomName;
    },
    leave(){
        if(this.isOwner()){
            socket.emit('closeRoom', user.name);
        }
        else{
            socket.emit('leaveRoom', user.name, roomStatus.owner);
        }
    }
};

const roomStatus = {
    owner: '',
    start: false,
    playerInfo: {},
}

// Setup socket
const socket = io(window.location.origin);

// Add event listeners
document.querySelector('.main__room--create').addEventListener('click', () => {
    socket.emit('createRoom', user.name, false); // TODO: What is the false for?
});
document.querySelector('.datails__button--cancel').addEventListener('click', user.leave);
document.querySelector('.datails__button--start').addEventListener('click', () => {
    socket.emit('enterGame', roomStatus.owner);
});
window.addEventListener('beforeunload', () => {
    // If I am in some room but the game haven't started,
    // trigger leaving signal when closing page
    if(roomStatus.owner !== '' && !roomStatus.start){
        user.leave();
    }
});

// Emit `enterlobby` signal to get status of lobby
socket.emit('enterLobby');

// When server returned status of lobby
socket.on('enterLobby', data => {
    // Create room cards
    data.rooms.forEach(room => {
        createRoomCard(room.roomName, room.attendance);
    });
});

// When someone created a new room
socket.on('createRoom', data => {
    // create a room card
    createRoomCard(data.roomName, 1); // TODO: Should data contain attendence?

    // If I am the one who create the room, join it
    if(user.name === data.roomName){
        socket.emit('joinRoom', user.name, data.roomName);
    }
});

// When someone entered a room
socket.on('joinRoom', data => {
    // If I am the new joined player, record my user information
    if(data.joinedPlayer === user.name){
        user.room = data.roomName;
        user.team = data.roomStatus.players[user.name].team;
    }

    // If I am in the room
    if(user.isInRoom(data.roomName)){
        // Update room information
        roomStatus.owner = data.roomStatus.owner;
        roomStatus.playerInfo = data.roomStatus.players;

        // If I am the new joined player
        if(data.joinedPlayer === user.name){
            // Fill information to UI
            document.querySelector('.main__datails--roomname').innerHTML = `${ roomStatus.owner }'s Room`;
            Object.keys(data.roomStatus.players).forEach( playerName => {
                document.querySelector(`.datails__team${ roomStatus.playerInfo[playerName].team }--players`)
                    .insertAdjacentHTML(
                        'beforeend',
                        generatePlayerHTML(roomStatus.playerInfo[playerName].team, playerName)
                    );
            });

            // If I am the room owner, make start button visible
            if(user.isOwner()){
                const startButton = document.querySelector('.datails__button--start');
                startButton.style.display = 'block';
                startButton.disabled = true;
            }

            // When everything get done, display room panel
            document.querySelector('.main__details').style.display = 'block';
        }
        // If I am not the new joined player
        else {
            // Just append new player
            document.querySelector(`.datails__team${ roomStatus.playerInfo[data.joinedPlayer].team }--players`)
                .insertAdjacentHTML(
                    'beforeend',
                    generatePlayerHTML(roomStatus.playerInfo[data.joinedPlayer].team, data.joinedPlayer)
                );

            // If I am the room owner, check number of player to decied whether to start game
            // TODO: should this also be checked at backend?
            if(user.isOwner() && Object.keys(playerInfo).length === 6){
                document.querySelector('.datails__button--start').disabled = false;
            }
        }
    }

    // Update attendance on room card
    const attendance = data.roomStatus.redTeamCount + data.roomStatus.greenTeamCount; // TODO: use playerInfo instead
    const roomCard = document.querySelector(`#room_${ data.roomName }`);
    roomCard.querySelector('.room__brief--attendance').innerHTML = `( ${ attendance } / 6 )`;

    // If room has been full, don't let anyone in
    // TODO: this should be checked at backend
    if(attendance === 6){
        roomCard.disabled = true;
    }
});

// When someone leaved a room
socket.on('leaveRoom', (data) => {
    // If I am in the room
    if(user.isInRoom(data.roomName)){
        // If I am the leaved one
        if(data.leavedPlayer === user.name){
            // Reset user information
            user.room = '';
            user.team = 0;

            // Reset room status
            roomStatus.owner = '';
            roomStatus.playerInfo = {};

            // Remove content in room panel
            const players = Array.from(document.querySelectorAll('.datails__team--player'));
            players.forEach(player => {
                player.parentNode.removeChild(player);
            });

            // Close room panel
            document.querySelector('.main__details').style.display = 'none';
        }
        // If I am not the leaved one
        else {
            // Update room status
            roomStatus.playerInfo = data.roomStatus.players;

            // Remove the leaved one's container
            const leavedPlayer = document.querySelector(`#user_${ data.leavedPlayer }`);
            leavedPlayer.parentNode.removeChild(leavedPlayer);

            // If I am the room owner, disable start button
            // TODO: should this also be checked at backend?
            if(user.isOwner() && Object.keys(playerInfo).length < 6){
                document.querySelector('.datails__button--start').disabled = true;
            }
        }
    }

    // Update attendance on room card
    const attendance = data.roomStatus.redTeamCount + data.roomStatus.greenTeamCount; // TODO: use playerInfo instead
    const roomCard = document.querySelector(`#room_${ data.roomName }`);
    roomCard.querySelector('.room__brief--attendance').innerHTML = `( ${ attendance } / 6 )`;

    // If room is locked, unlock it
    if(roomCard.disabled)
        roomCard.disabled = false;
});

// When someone closed a room
socket.on('closeRoom', (data) => {
    // If I am in room
    if(user.isInRoom(data.roomName)){
        // Reset user information
        user.room = '';
        user.team = 0;

        // Reset room status
        roomStatus.owner = '';
        roomStatus.playerInfo = {};

        // Remove content in room panel
        const players = Array.from(document.querySelectorAll('.datails__team--player'));
        players.forEach(player => {
            player.parentNode.removeChild(player);
        });
        document.querySelector('.datails__button--start').style.display = 'none';

        // If I am not the room owner, display message panel
        // { ... }

        // Hide start button and close room panel
        document.querySelector('.main__details').style.display = 'none';
    }

    // Remove room card
    const targetRoom = document.querySelector(`#room_${ data.roomName }`);
    if(targetRoom){
        targetRoom.parentNode.removeChild(targetRoom);
    }
});


// When a room started gaming
socket.on('enterGame', (data) => {
    // If I am in the room
    if(user.isInRoom(data.roomName)){
        // Set room status to started (to prevent trigger leave room signal)
        room.start = true;

        // Redirect to route `/game`
        window.location.href = `/game/${ data.roomName }`;
    }
    // If I am not in the room
    else{
        // Disable the room card and show it's playing
        const roomCard = document.querySelector(`#room_${ data.roomName }`);
        roomCard.querySelector('.room__brief--attendance').innerHTML = `( playing )`;
        roomCard.disabled = true;
    }
})

function createRoomCard(name, attendance){
    document.querySelector('.main__room--create')
        .insertAdjacentHTML('beforebegin', generateRoomHTML(name, attendance));
    document.querySelector(`#room_${ name }`)
        .addEventListener('click', () => {
            socket.emit('joinRoom', user.name, name);
        });
}

function generateRoomHTML(name, attendance){
    return `
    <button class = "main__room main__room--room" id = "room_${ name }">
      <p class = "room__brief room__brief--name">${ name }'s Room</p>
      <p class = "room__brief room__brief--attendance">( ${ attendance } / 6 )</p>
    </button>
    `;
}

function generatePlayerHTML(team, name){
    return `<p class = "datails__team--player datails__team${ team }--player" id = "user_${ name }">${ name }</p>`;
}

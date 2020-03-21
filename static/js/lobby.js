const user = {
    name: /Hi, ([\S]+)!/.exec(document.querySelector('.header__username').innerHTML)[1],
    team: 0, // 1 for red team and 2 for green team
    // ready: false,
};

const room = {
    owner: '',
    start: false,
    playerCount: [ , 0, 0], // for team 1 and team 2
    playerInfo: {},
}

// Page initialization
const socket = io(window.location.origin);
document.querySelector('.main__room--create').addEventListener('click', createRoom);
// document.querySelector('.datails__team1--join').addEventListener('click', () => { joinTeam(1) });
// document.querySelector('.datails__team2--join').addEventListener('click', () => { joinTeam(2) });
// document.querySelector('.datails__button--ready').addEventListener('click', getReady);
document.querySelector('.datails__button--cancel').addEventListener('click', leaveRoom);
document.querySelector('.datails__button--start').addEventListener('click', () => {
    socket.emit('enterGame', room.owner);
});

socket.emit('enterLobby');

socket.on('enterLobby', (data) => {
    // When someone enter lobby
    data.rooms.forEach(room => {
        // Add room card on looby
        document.querySelector('.main__room--create')
            .insertAdjacentHTML('beforebegin', generateRoomHTML(room.roomName, room.attendance));
        document.querySelector(`#room_${ room.roomName }`)
            .addEventListener('click', () => { joinRoom(room.roomName) });
        // If I am the room owner, enter room
        if(isOwner(room.roomName))
            joinRoom(room.roomName);
    });
});

socket.on('createRoom', (data) => {
    // When someone create room, add room card on looby
    document.querySelector('.main__room--create')
        .insertAdjacentHTML('beforebegin', generateRoomHTML(data.roomName, 1));
    document.querySelector(`#room_${ data.roomName }`)
        .addEventListener('click', () => { joinRoom(data.roomName) });
    // If I am the room owner, enter room
    if(isOwner(data.roomName)){
        joinRoom(data.roomName);
    }
});

socket.on('joinRoom', (data) => {
// When someone join some room
    if(isInRoom(data.roomName)){
        // If I am in that room, update room information
        room.owner = data.roomStatus.owner;
        room.playerCount[1] = data.roomStatus.redTeamCount;
        room.playerCount[2] = data.roomStatus.greenTeamCount;
        room.playerInfo = data.roomStatus.players;

        const joinedPlayerName = data.joinedPlayer;
        if(joinedPlayerName === user.name){
            // If I am the new joined player, record my user information too
            user.team = data.roomStatus.players[user.name].team;

            // Fill information to UI
            document.querySelector('.main__datails--roomname').innerHTML = `${ room.owner }'s Room`;
            Object.keys(data.roomStatus.players).forEach( playerName => {
                document.querySelector(`.datails__team${ room.playerInfo[playerName].team }--players`)
                    .insertAdjacentHTML('beforeend', generatePlayerHTML(room.playerInfo[playerName].team, playerName));
            });

            // If I am the room owner, make startButton visible
            if(isOwner(room.owner)){
                const startButton = document.querySelector('.datails__button--start');
                startButton.style.display = 'block';
                startButton.disabled = true;
            }
            // document.querySelector(`.datails__team${ user.team }--join`).style.display = 'none';
        }
        else {
            // If I am not the new joined player, just insert new player container
            document.querySelector(`.datails__team${ room.playerInfo[joinedPlayerName].team }--players`)
                .insertAdjacentHTML('beforeend', generatePlayerHTML(room.playerInfo[joinedPlayerName].team, joinedPlayerName));
            // If I am the room owner, check number of player to decied whether to start game
            if(isOwner(room.owner) && room.playerCount[1] === 3 && room.playerCount[2] === 3){
                document.querySelector('.datails__button--start').disabled = false;
            }
        }
    }
    // Update attendance on room card
    const attendance = data.roomStatus.redTeamCount + data.roomStatus.greenTeamCount;
    const roomCard = document.querySelector(`#room_${ data.roomName }`);
    roomCard.querySelector('.room__brief--attendance')
        .innerHTML = `( ${ attendance } / 2 )`;
    // If room has been full, don't let anyone in
    if(attendance === 2)
        roomCard.disabled = true;
});

socket.on('leaveRoom', (data) => {
    // When someone leave some room

    if(isInRoom(data.roomName)){
        const leavedPlayerName = data.leavedPlayer;
        if(leavedPlayerName === user.name){
            room.owner = '';
            room.playerCount[1] = 0;
            room.playerCount[2] = 0;
            room.playerInfo = {};
            // If I am the leaving player, remove all content in room panel
            const players = Array.from(document.querySelectorAll('.datails__team--player'));
            players.forEach(player => {
                player.parentNode.removeChild(player);
            });
            document.querySelector('.main__details').style.display = 'none';
        }
        else{
            room.playerCount[1] = data.roomStatus.redTeamCount;
            room.playerCount[2] = data.roomStatus.greenTeamCount;
            room.playerInfo = data.roomStatus.players;
            // If I am not the leaving player, just remove the leaving one's container
            const leavedPlayer = document.querySelector(`#user_${ leavedPlayerName }`);
            leavedPlayer.parentNode.removeChild(leavedPlayer);
            if(isOwner(room.owner) && (room.playerCount[1] < 3 || room.playerCount[2] < 3)){
                document.querySelector('.datails__button--start').disabled = true;
            }
        }
    }
    // Update attendance on room card
    const attendance = data.roomStatus.redTeamCount + data.roomStatus.greenTeamCount;
    const roomCard = document.querySelector(`#room_${ data.roomName }`);
    roomCard.querySelector('.room__brief--attendance')
        .innerHTML = `( ${ attendance } / 6 )`;
    // If room is locked, unlock it
    if(roomCard.disabled)
        roomCard.disabled = false;
});

socket.on('closeRoom', (data) => {
    // When some one close a room, remove room card
    const targetRoom = document.querySelector(`#room_${ data.roomName }`);
    if(targetRoom)
        targetRoom.parentNode.removeChild(targetRoom);

    if(isInRoom(data.roomName)){
        // If I am in room, clear room information
        room.owner = '';
        room.playerCount[1] = 0;
        room.playerCount[2] = 0;
        room.playerInfo = {};
        const players = Array.from(document.querySelectorAll('.datails__team--player'));
        players.forEach(player => {
            player.parentNode.removeChild(player);
        });
        // If I am not the room owner, display message panel
        // { ... }

        // If I am the room owner, hide the start button
        document.querySelector('.datails__button--start').style.display = 'none';

        document.querySelector('.main__details').style.display = 'none';
    }
});

socket.on('enterGame', (data) => {
    // When some room start gaming
    if(isInRoom(data.roomName)){
        room.start = true;
        // If I am in the room, redirect to route `/game`
        window.location.href = `/game/${ data.roomName }`;
    }
    else{
        // If I am not in the room, disable the room card and show it's playing
        const roomCard = document.querySelector(`#room_${ data.roomName }`);
        roomCard.querySelector('.room__brief--attendance').innerHTML = `( playing )`;
        roomCard.disabled = true;
    }
})

function createRoom(){
    socket.emit('createRoom', user.name, false);
}

function joinRoom(roomName){
    room.owner = roomName;
    socket.emit('joinRoom', user.name, roomName);
    document.querySelector('.main__details').style.display = 'block';
}

function leaveRoom(){
    if(isOwner(room.owner)){
        socket.emit('closeRoom', room.owner);
    }
    else{
        socket.emit('leaveRoom', user.name);
    }
}

// function joinTeam(teamNumber){
//     const anotherTeamNumber = teamNumber === 1 ? 2 : 1;
//     // Return if user has already in this team or this team has been full
//     if(user.team === teamNumber || room.playerCount[teamNumber] >= 3)
//         return;

//     // Delete user from his/her current team
//     const oldPosition = document.querySelector(`.datails__team${ user.team }--player${ user.position }`);
//     oldPosition.innerHTML = '';
//     oldPosition.style.display = 'none';
//     --room.playerCount[anotherTeamNumber];

//     // Add user to this team
//     user.team = teamNumber;
//     user.position = ++room.playerCount[teamNumber];
//     const newPosition = document.querySelector(`.datails__team${ user.team }--player${ user.position }`);
//     newPosition.innerHTML = user.name;
//     newPosition.style.display = 'block';

//     // Hide this join button and display another
//     document.querySelector(`.datails__team${ teamNumber }--join`).style.display = 'none';
//     document.querySelector(`.datails__team${ anotherTeamNumber }--join`).style.display = 'block';
// }

// function getReady(){
//     // send ready signal to server and broadcast to others
//     user.ready = true;
//     document.querySelector(`.datails__team${ user.team }--player${ user.position }`)
//             .classList.add(`datails__team${ user.team }--player--ready`);
//     Array.from(document.querySelectorAll(`.datails__team--join`)).forEach(x => {
//         x.disabled = true;
//         x.style.display = 'none'
//     });
//     document.querySelector('.datails__button--cancel').disabled = true;
//     document.querySelector('.datails__button--ready').disabled = true;
// }

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

function isOwner(roomOwner){
    return user.name === roomOwner;
}

function isInRoom(roomName){
    return room.owner === roomName;
}

window.addEventListener('beforeunload', () => {
    if(room.owner !== '' && !room.start){
        leaveRoom();
    }
});
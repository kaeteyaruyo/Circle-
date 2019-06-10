const user = {
    name: /Hi, ([\S]+)!/.exec(document.querySelector('.header__username').innerHTML)[1],
    team: 0, // 1 for red team and 2 for green team
    position: 0,
    // ready: false,
};

const room = {
    name: '',
    owner: '',
    playerCount: [ , 0, 0], // for team 1 and team 2
    playerInfo: {},
}

const socket = io(window.location.origin);

document.querySelector('.main__room--create').addEventListener('click', createRoom);
// document.querySelector('.datails__team1--join').addEventListener('click', () => { joinTeam(1) });
// document.querySelector('.datails__team2--join').addEventListener('click', () => { joinTeam(2) });
// document.querySelector('.datails__button--ready').addEventListener('click', getReady);
document.querySelector('.datails__button--cancel').addEventListener('click', leaveRoom);
document.querySelector('.datails__button--start').addEventListener('click', () => {
    socket.emit('enterGame');
});

socket.emit('enterLobby');

socket.on('enterLobby', (data) => {
    data.rooms.forEach(room => {
        document.querySelector('.main__room--create').insertAdjacentHTML('beforebegin', generateRoomHTML(room.roomName, room.attendance));
        document.querySelector(`#room_${ room.roomName }`).addEventListener('click', () => { joinRoom(room.roomName) });
        if(user.name === room.roomName)
            joinRoom(room.roomName);
    });
});

socket.on('createRoom', (data) => {
    document.querySelector('.main__room--create').insertAdjacentHTML('beforebegin', generateRoomHTML(data.roomName, 1));
    document.querySelector(`#room_${ data.roomName }`).addEventListener('click', () => { joinRoom(data.roomName) });
    if(user.name === data.roomName){
        joinRoom(data.roomName);
    }
});

socket.on('joinRoom', (data) => {
    console.log(data);
    if(data.roomName === room.name){
        const joinedPlayer = data.joinedPlayer;
        room.playerCount[1] = data.roomStatus.redTeamCount;
        room.playerCount[2] = data.roomStatus.greenTeamCount;
        room.playerInfo = data.roomStatus.players;
        if(joinedPlayer === user.name){
            // Initialize room information
            room.owner = data.roomStatus.owner;

            // Initialize user information
            user.team = data.roomStatus.players[user.name].team;
            user.position = room.playerCount[user.team];

            // Fill information to UI
            document.querySelector('.main__datails--roomname').innerHTML = `${ room.name }'s Room`;
            if(user.name === room.owner){
                const startButton = document.querySelector('.datails__button--start');
                startButton.style.display = 'block';
                startButton.disabled = true;
            }
            Object.keys(data.roomStatus.players).forEach( playerName => {
                document.querySelector(`.datails__team${ room.playerInfo[playerName].team }--players`).insertAdjacentHTML('beforeend', generatePlayerHTML(room.playerInfo[playerName].team, playerName));
            });
            // document.querySelector(`.datails__team${ user.team }--join`).style.display = 'none';
        }
        else {
            document.querySelector(`.datails__team${ room.playerInfo[joinedPlayer].team }--players`).insertAdjacentHTML('beforeend', generatePlayerHTML(room.playerInfo[joinedPlayer].team, joinedPlayer));
            if(user.name === room.owner && room.playerCount[1] === 3 && room.playerCount[2] === 3){
                const startButton = document.querySelector('.datails__button--start');
                startButton.disabled = false;
            }
        }
    }
    else {
        document.querySelector(`#room_${ data.roomName }`).querySelector('.room__brief--attendance').innerHTML = `( ${ data.roomStatus.redTeamCount + data.roomStatus.greenTeamCount } / 6 )`;
    }
});

socket.on('leaveRoom', (data) => {
    if(data.roomName === room.name){
        const leavedPlayer = data.leavedPlayer;
        room.playerCount[1] = data.roomStatus.redTeamCount;
        room.playerCount[2] = data.roomStatus.greenTeamCount;

        delete room.playerInfo[leavedPlayer];

        const leavedPlayerContainer = document.querySelector(`#user_${ leavedPlayer }`);
        leavedPlayerContainer.parentNode.removeChild(leavedPlayerContainer);
        if(leavedPlayer === user.name){
            const playerContainers = Array.from(document.querySelectorAll('.datails__team--player'));
            playerContainers.forEach(player => {
                player.parentNode.removeChild(player);
            });
            document.querySelector('.main__details').style.display = 'none';
        }
    }
    else {
        document.querySelector(`#room_${ data.roomName }`).querySelector('.room__brief--attendance').innerHTML = `( ${ data.roomStatus.redTeamCount + data.roomStatus.greenTeamCount } / 6 )`;
    }
});

socket.on('closeRoom', (data) => {
    // if owner !== username, display message panel
    const targetRoom = document.querySelector(`#room_${ data.roomName }`);
    targetRoom.parentNode.removeChild(targetRoom);

    if(data.roomName === room.name){
        room.name = '';
        room.owner = '';
        room.playerCount[1] = 0;
        room.playerCount[2] = 0;
        room.playerInfo = {};
        const playerContainers = Array.from(document.querySelectorAll('.datails__team--player'));
        playerContainers.forEach(player => {
            player.parentNode.removeChild(player);
        });
        document.querySelector('.main__details').style.display = 'none';
    }
});

socket.on('enterGame', () => {
    window.location.href = `/game/${ room.name }`;
})

function createRoom(){
    socket.emit('createRoom', user.name);
}

function joinRoom(roomName){
    room.name = roomName;
    socket.emit('joinRoom', user.name, roomName);
    document.querySelector('.main__details').style.display = 'block';
}

function leaveRoom(){
    if(room.owner === user.name){
        console.log('closeRoom')
        socket.emit('closeRoom', room.name);
    }
    else{
        console.log('leaveRoom')
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
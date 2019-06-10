const user = {
    name: /Hi, ([\S]+)!/.exec(document.querySelector('.header__username').innerHTML)[1],
    team: 0,
    position: 0,
    ready: false,
};

const room = {
    number: 0,
    playerCount: [ , 0, 0], // for team 1 and team 2
    owner: '',
}
let roomCount = 0;

document.querySelector('.main__room--create').addEventListener('click', createRoom);

function createRoom(){
    // send username to server
    // get room number from server
    const roomNumber = ++roomCount;
    document.querySelector('.main__room--create').insertAdjacentHTML('beforebegin', generateRoomHTML(roomNumber));
    document.querySelector(`#room${ roomNumber }`).addEventListener('click', () => { enterRoom(roomNumber) });
    enterRoom(roomNumber);
}

function enterRoom(roomNumber){
    // get room information from server
    room.number = roomNumber;
    room.owner = username;

    document.querySelector('.main__details').style.display = 'block';
    if(room.owner === username){
        // if open by creator
        user.team = 1;
        user.position = ++room.playerCount[user.team];
        document.querySelector(`.datails__team${ user.team }--join`).style.display = 'none';
        document.querySelector('.datails__team1--player1').innerHTML = user.name;
        document.querySelector('.datails__team1--player1').style.display = 'block';
    }
    // if open by others
    // send username and room number to server
    // join someteam and display other players information
    document.querySelector('.datails__team1--join').addEventListener('click', () => { joinTeam(1) });
    document.querySelector('.datails__team2--join').addEventListener('click', () => { joinTeam(2) });
    document.querySelector('.datails__button--cancel').addEventListener('click', () => { leaveRoom(roomNumber) });
    document.querySelector('.datails__button--ready').addEventListener('click', getReady);
}

function leaveRoom(index){
    // if master push cancel
    const targetRoom = document.querySelector(`#room${ index }`);
    targetRoom.parentNode.removeChild(targetRoom);
    // else
    const currentPosition = document.querySelector(`.datails__team${ user.team }--player${ user.position }`);
    currentPosition.innerHTML = '';
    currentPosition.style.display = 'block';

    document.querySelector('.datails__team1--join').addEventListener('click', () => { joinTeam(1) });
    document.querySelector('.datails__team2--join').addEventListener('click', () => { joinTeam(2) });
    document.querySelector('.datails__button--cancel').addEventListener('click', () => { leaveRoom(index) });
    document.querySelector('.datails__button--ready').addEventListener('click', getReady);
    document.querySelector('.main__details').style.display = 'none';
}

function joinTeam(teamNumber){
    const anotherTeamNumber = teamNumber === 1 ? 2 : 1;
    // Return if user has already in this team or this team has been full
    if(user.team === teamNumber || room.playerCount[teamNumber] >= 3)
        return;

    // Delete user from his/her current team
    const oldPosition = document.querySelector(`.datails__team${ user.team }--player${ user.position }`);
    oldPosition.innerHTML = '';
    oldPosition.style.display = 'none';
    --room.playerCount[anotherTeamNumber];

    // Add user to this team
    user.team = teamNumber;
    user.position = ++room.playerCount[teamNumber];
    const newPosition = document.querySelector(`.datails__team${ user.team }--player${ user.position }`);
    newPosition.innerHTML = user.name;
    newPosition.style.display = 'block';

    // Hide this join button and display another
    document.querySelector(`.datails__team${ teamNumber }--join`).style.display = 'none';
    document.querySelector(`.datails__team${ anotherTeamNumber }--join`).style.display = 'block';
}

function getReady(){
    // send ready signal to server and broadcast to others
    user.ready = true;
    document.querySelector(`.datails__team${ user.team }--player${ user.position }`)
            .classList.add(`datails__team${ user.team }--player--ready`);
    Array.from(document.querySelectorAll(`.datails__team--join`)).forEach(x => {
        x.disabled = true;
        x.style.display = 'none'
    });
    document.querySelector('.datails__button--cancel').disabled = true;
    document.querySelector('.datails__button--ready').disabled = true;
}

function generateRoomHTML(index){
    // send creator's information to server
    // get room information from server
    return `
    <button class = "main__room main__room--room" id = "room${ index }">
      <p class = "room__brief room__brief--name">Room #${ index }</p>
      <p class = "room__brief room__brief--attendance">( 1 / 6 )</p>
    </button>
    `;
}

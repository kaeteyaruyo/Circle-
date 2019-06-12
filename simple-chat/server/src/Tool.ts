function allUserReady(players){
    let usernames = Object.keys(players);
    let flag = true;
    usernames.forEach(username => {
        if(!players[username]["ready"]){
            flag = false;
        }
    });
    return flag;
}

function objectToArray(object){
    let result = [];
    Object.keys(object).forEach((element)=>{
        let arr = object[element];
        arr.forEach(element2 => {
            let temp = {};
            temp[element] = element2;
            result.push(temp);
        });
    });
    return result;
}

export {allUserReady,objectToArray};
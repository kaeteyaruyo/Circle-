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
    let first = Object.keys(object)[0];
    let keys = Object.keys(object);
    let arr = object[first];
    let temp;
    for(let i=0;i<arr.length;i++){
        temp = {}
        for(let j=0;j<keys.length;j++){
            temp[keys[j]] = object[keys[j]][i]
        }
        result.push(temp);
    }
    return result;
}

function flatten(array){
    let result = [];
    array.forEach(element => {
        element.forEach(element2 => {
            result.push(element2)
        });
    });
    return result;
}

export {allUserReady,objectToArray,flatten};
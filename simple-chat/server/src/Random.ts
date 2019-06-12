function getRangeRandom(min,max){
    return Math.floor(Math.random()*max)+min;
};

function getRandomProblem(problems){
    let keys = problems['keys'];
    let indexOfKeys = getRangeRandom(0,3);
    let problemOfClass = keys[indexOfKeys];
    let problemList = problems[problemOfClass];
    if (problemOfClass === "basic"){
        let index = getRangeRandom(0,problemList.length-1)
        let problem = problemList[index];
        if(problem === "%"){
            let n = getRangeRandom(0,100);
            let m = getRangeRandom(0,n);
            return `x % ${n} = ${m}`;
        }
        else{
            let n = getRangeRandom(0,99);
            return `x ${problem} ${n}`;
        }
    }
    else if(problemOfClass === "function"){
        let index = getRangeRandom(0,problemList.length)
        let problem = problemList[index];
        return problem;
    }
    else if(problemOfClass === "special"){
        let index = getRangeRandom(0,problemList.length)
        let problem = problemList[index];
        if(problem === "x+2x+1"){
            let n = getRangeRandom(1,11);
            return `x+2*x+1 == ${(n+1)*(n+1)}`;
        }
        else if(problem === "x-2x+1"){
            let n = getRangeRandom(1,11);
            return `x-2*x+1 == ${(n-1)*(n+1)}`;
        }
    }
};

function getRandomBoardNumber(){
    let result = [];
    for(let row = 0; row < 7; ++row){
        let maxColumn = (7 - Math.abs(row - 3));
        let temp = [];
        for(let column = 0; column < maxColumn; ++column){
            temp.push(getRangeRandom(0,99));
        }
        result.push(temp);
    }
    return result;
}

function initBoardTeam(){
    return [
        [0,0,0,0],
        [0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0],
        [0,0,0,0],
    ]
}

function initBullet(){
    return [getRangeRandom(0,13),getRangeRandom(0,13),getRangeRandom(0,13),getRangeRandom(0,13),getRangeRandom(0,13)];
}

function updateBullet(Bullet,index){
    let value = getRangeRandom(0,13);
    Bullet[index] = value;
    return value
}

function getAllIndex(){
    let result = [];
    for(let row = 0; row < 7; ++row){
        let maxColumn = (7 - Math.abs(row - 3));
        for(let column = 0; column < maxColumn; ++column){
            result.push([row, column]);
        }
    }
    return result;
}
export {getRangeRandom , getRandomProblem,getRandomBoardNumber,initBoardTeam,getAllIndex,initBullet,updateBullet}
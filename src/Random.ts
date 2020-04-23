function RandomInt(min,max){
    return Math.floor(Math.random()*max)+min;
};

function getRandomProblem(problems){
    let keys = problems['keys'];
    let indexOfKeys = RandomInt(0,2);
    let problemOfClass = keys[indexOfKeys];
    let problemList = problems[problemOfClass];
    if (problemOfClass === "basic"){
        let index = RandomInt(0,problemList.length)
        let problem = problemList[index];
        if(problem === "%"){
            let n = RandomInt(0,100);
            let m = RandomInt(0,n);
            return `x % ${n} == ${m}`;
        }
        else{
            let n = RandomInt(0,99);
            return `x ${problem} ${n}`;
        }
    }
    else if(problemOfClass === "function"){
        let index = RandomInt(0,problemList.length)
        let problem = problemList[index];
        return problem;
    }
    else if(problemOfClass === "special"){
        let index = RandomInt(0,problemList.length)
        let problem = problemList[index];
        if(problem === "x+2x+1"){
            let n = RandomInt(1,11);
            return `x+2*x+1 == ${(n+1)*(n+1)}`;
        }
        else if(problem === "x-2x+1"){
            let n = RandomInt(1,11);
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
            temp.push(RandomInt(1,100));
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
    return [RandomInt(0,13),RandomInt(0,13),RandomInt(0,13),RandomInt(0,13),RandomInt(0,13)];
}

function updateBullet(Bullet,index){
    let value = RandomInt(0,10);
    if(value === 0){
        let temp = RandomInt(0,3);
        value = [10,11,12,13][temp];
    }
    
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
export {RandomInt , getRandomProblem,getRandomBoardNumber,initBoardTeam,getAllIndex,initBullet,updateBullet}
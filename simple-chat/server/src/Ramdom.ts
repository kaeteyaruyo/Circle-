function getRangeRandom(min,max){
    return Math.floor(Math.random()*max)+min;
};

function getRandomProblem(problems : JSON){
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

export {getRangeRandom , getRandomProblem}
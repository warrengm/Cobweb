
var onSubmit = function(){
    var input = document.forms["input"]["f"].value;
    if(input == "") return;
    theFunction = parseInput(shuntingYard(format(input)));
    //parseInput(shuntingYard(input));
    draw();
    //e.preventDefault();
    return false;
}

// At the moment it just inserts astrisks.
var format = function(str){
    var reg = /(\d|x|e|pi\))\s*(x|e|pi|\()/i;
    
    while(reg.test(str)){
        (function(){
            var temp = reg.exec(str);
            console.log("format " + temp);
            var match;
            // Finds the first element in temp that isn't undefined
            for(var i = 1; typeof match == "undefined"; i++){
                match = temp[i];
            }
            var split = temp.index + match.length;
            str = str.slice(0, split) + "*" + str.slice(split);
            console.log(str);
        })();
    }
    
    return str;
}

var formatUnaryMinus = function(input) {
    console.log("before formatting: " + input);
    if(input[0] === "-") {
        input[0] = "~";
    }
    
    var isVal = function(c){
        return !(funcs.hasOwnProperty(c) || ops.hasOwnProperty(c));
    }
    
    var l = input.length - 1;
    console.log("l " + l);
    for(var i = 1; i < l; i++) {
        if(input[i] === "-" && (input[i-1] == "(" || 
                                funcs.hasOwnProperty(input[i-1]) ||
                                ops.hasOwnProperty(input[i-1]))) {
            input[i] = "~";
        }
        console.log("i " + i);
    }
    console.log("formatted unary minus: " + input);
    return input;
}

// Converts the input to an array of strings in reverse Polish notation.
var shuntingYard = function(exp) {
    //exp = formatUnaryMinus(exp);

    //TODO allow scientific notation and commas.
    var regex = /(\d+(\.\d+)?)|(\.\d+)|(\+|\-|\/|\*|\^|~|!|exp|x|e|pi|\)|\()|([a-z]{2,5})/ig
    var input = formatUnaryMinus(exp.match(regex));
    var result = [];
    var operators = [];
    
    
    input.forEach(function(token){
        var num = parseFloat(token);
        //Maybe token != "!"
        if(isNaN(num) && token !== "x" && token !== "e" && token != "pi") {
            if(token === "(") { // Handles parentheses
                operators.push(token);
            } else if(token === ")") {
                //TODO unmatched parentheses
            
                while(operators.length != 0){
                    if(operators[operators.length - 1] === "("){
                        operators.pop();
                        break;
                    } else {
                        result.push(operators.pop());
                    }
                }      
            } else {      
                while(operators.length != 0) {
                    var top = operators[operators.length - 1];
                    if(top != "(" && 
                        ((leftAssoc(token) && prec(token) == prec(top))
                            || prec(token) < prec(top))) {
                        
                        result.push(operators.pop());
                    } else {
                        break;
                    }
                }
                operators.push(token);
            }
        } else {
            result.push(token);
            console.log(token);
        }
        
    });
    
    while(operators.length != 0){
        result.push(operators.pop());
    }
    
    console.log(result);
    return result;
}

var funcs = {
    abs  : Math.abs,
    acos : Math.acos,
    asin : Math.asin,
    atan : Math.atan,
    cbrt : (function(x) { return Math.pow(x, 1/3); }),
    ceil : Math.ceil,
    cos : Math.cos,
    cosh : function(x) { return (Math.exp(x) + Math.exp(-x))/2; },
    exp : Math.exp,
    fact : function(x) { return x <= 1 ? 1 : x * arguments.callee(x - 1); },
    floor : Math.floor,
    ln : Math.log,
    log : Math.log,
    pow : Math.pow,
    round : Math.round,
    sign : function(x) { return x == 0 ? 0 : (x > 0 ? 1 : -1); },
    //signum : this.sign,
    sin : Math.sin,
    sinh : function(x) { return (Math.exp(x) - Math.exp(-x))/2; },
    tan : Math.tan
};
funcs["~"] = function(x) { return -x; };
funcs["!"] = funcs.fact;

var ops = {};
ops["+"] = function(a, b){ return a + b; };
ops["-"] = function(a, b){ return a - b; };
ops["*"] = function(a, b){ return a * b; };
ops["/"] = function(a, b){ return a / b; };
ops["^"] = Math.pow;
ops["%"] = function(a, b){ return a % b; };
ops["mod"] = function(a, b){ return a % b; };

var leftAssoc = function(c) { 
    return c !== "^" && !funcs.hasOwnProperty(c);
}

var prec = function(c) { 
    if(c === "%"){
        return 1;
    }
    if(c === "+" || c === "-") {
        return 2;
    } else if(c === "*" || c === "//" || c == "\\") {
        return 3;
    } else if(c === "^") {
        return 4;
    } else if(c === "~"){
        return 5;
    } else if(c === "!"){
        return 4;
    } else if(funcs.hasOwnProperty(c)){
        return 6;
    } else {
        return 1;
    }
}

var parseInput = function(input) {
    stack = [];
    console.log("input: " + input);
    
    input.forEach(function(token){
        var num = parseFloat(token);
        if(!isNaN(num)){
            stack.push(function(x) { return num; });
        } else if(token == "x"){
            stack.push(function(x) { return x; });
        } else if(token == "e"){
            stack.push(function(x) { return Math.E; });
        } else if(token == "pi"){
            stack.push(function(x) { return Math.PI; });
        // else if(token == "-"){ // Special case, may be unary or binary
        //   if(stack.length % 2 == 1){
        //       console.log("unary " + token);
        //       (function(){
        //           var top = stack.pop();
        //           stack.push(function(x) {
        //               return -top(x);
        //           })
        //       })();
        //   } else {
        //       console.log("binary " + token);
        //       (function(){
        //           var top = stack.pop(), scnd = stack.pop();
        //           stack.push(function(x) {
        //               return scnd(x) - top(x);
        //           });
        //       })();
        //   }
        } else if(funcs.hasOwnProperty(token)){
            (function(){
                var top = stack.pop();
                stack.push(function(x) {
                    return funcs[token](top(x));
                })
            })();
        } else if(ops.hasOwnProperty(token)){
            (function(){
                var top = stack.pop(), scnd = stack.pop();
                stack.push(function(x) {
                    return (ops[token])(scnd(x), top(x));
                });
            })();
        }
        
        console.log(token);
    });
    
    return stack[0];
}
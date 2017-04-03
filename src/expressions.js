var dump = require('../tests/dump');


module.exports = function (expr) {
    var CONSTS = {
        OPERAND: 'OPERAND',
        OPERATOR: 'OPERATOR',
        OPENPAREN: 'OPENPAREN',
        CLOSEPAREN: 'CLOSEPAREN'
    };
    var isDigit = function (ch) {
        return isNaN(parseInt(ch, 10)) === false;
    }
    var isOperator = function (ch) {
        return ch === '+' || ch === '-' || ch === '/' || ch === '*';
    }
    var precedence = function (operator) {
        switch (operator) {
            case "^":
                return 3;
            case "*":
            case "/":
                return 2;
            case "+":
            case "-":
                return 1;
            default:
                return 0;
        }
    }
    var readOperator = function (from, start) {
        var result = {
            success: false
        };
        if (isOperator(from[start])) {
            result.success = true;
            result.type = CONSTS.OPERATOR;
            result.operator = from[start];
            result.start = start;
        } else if (from[start] === '(' || from[start] === ')') {
            result.success = true;
            result.type = from[start] === '(' ? CONSTS.OPENPAREN : CONSTS.CLOSEPAREN;
            result.parenthesis = from[start];
            result.start = start;
        }
        return result;
    }
    var readOperand = function (from, start) {
        var result = {
            success: false
        };
        var x = start;
        while (((start - x) === 0 && from[x] === '-') || (isDigit(from[x]) || from[x] === '.'))++x;
        if (x > start) {
            result.type = CONSTS.OPERAND;
            result.operand = parseFloat(from.substr(start, x - start));
            result.start = x - 1;
            result.success = isNaN(result.operand) === false;
        }
        return result;
    }

    var infixTokens = [];

    if (expr && expr.length > 0) {
        for (var x = 0; x < expr.length; ++x) {
            var operand = readOperand(expr, x);
            var operator = readOperator(expr, x);
            if (operand.success === true) {
                infixTokens.push(operand);
                x = operand.start;
            } else if (operator.success === true) {
                infixTokens.push(operator);
                x = operator.start;
            }
        }
    }


    var convertToPostfix = function (tokens) {
        var ouput = [], stack = [], popedItem = null;;

        for (var x = 0; x < tokens.length; ++x) {
            var token = tokens[x];
            if (token.type === CONSTS.OPERAND) {
                ouput.push(token);
            } else {
                if (token.type === CONSTS.OPENPAREN) {
                    stack.push(token);
                } else if (token === CONSTS.CLOSEPAREN) {
                    popedItem = null;
                    while (stack.length > 0 && (popedItem = stack.pop()).type !== CONSTS.OPENPAREN) {
                        ouput.push(popedItem);
                    }
                } else {
                    popedItem = null;
                    while (stack.length > 0) {
                        popedItem = stack.pop();
                        if (precedence(popedItem.operator) >= precedence(token.operator)) {
                            ouput.push(popedItem);
                        } else {
                            stack.push(popedItem); break;
                        }
                    }
                    stack.push(token);
                }
            }
        }
        while (stack.length > 0) {
            ouput.push(stack.pop());
        }
        return ouput;
    }

    var evaluateRpn = function (tokens) {
        var stack = [], ti = 0;
        do {
            var token = tokens[ti++];
            if (token.type === CONSTS.OPERAND) {
                stack.push(token.operand);
            }
            if (token.type === CONSTS.OPERATOR) {
                var op2 = stack.pop(), op1 = stack.pop();                
                switch (token.operator) {
                    case '+': stack.push(op1 + op2); break;
                    case '-': stack.push((op1 ? op1 : 0) - op2); break;
                    case '/': stack.push(op1 / op2); break;
                    case '*': stack.push(op1 * op2); break;
                }
            }
        } while (ti < tokens.length && stack.length !== 0);
        return stack.pop();
    }

    var solveFragments = function (infix, startIndex, levelCount) {
        var refined = [];
        for (var x = startIndex; x < infix.length; ++x) {
            if (infix[x].type === CONSTS.OPENPAREN) {
                var frag = solveFragments(infix, x + 1, levelCount + 1);
                if (refined.length > 1 && refined[refined.length - 1].operator === '-'
                    && refined[refined.length - 2].type === CONSTS.OPERATOR) {
                    frag.operand = frag.operand * -1;
                    refined.pop();
                }
                refined.push(frag);
                x = frag.skipUntil;
            } else if (infix[x].type === CONSTS.CLOSEPAREN) {
                var pf = convertToPostfix(refined)
                var data = evaluateRpn(pf);
                return { type: CONSTS.OPERAND, operand: data, skipUntil: x };
            } else {
                refined.push(infix[x]);
            }
        }
        return refined;
    }    
    return evaluateRpn(convertToPostfix(solveFragments(infixTokens, 0, 0)));
}
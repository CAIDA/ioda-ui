import has from 'has';

import ConstantExpression from './constant';
import PathExpression from './path';
import FunctionExpression from './function';

class ExpressionFactory {

    static getExpressionClass(type) {
        const clz = {
            constant: ConstantExpression,
            path: PathExpression,
            function: FunctionExpression
        };
        return clz[type];
    }

    static createFromJson(json) {
        if (!json) {
            if (json === null) {
                return null;
            }
            throw new TypeError(`Cannot create expression from '${json}'`);
        }
        if (typeof json !== 'object') {
            // be generous, and try and detect if we've been given serialized JSON
            if (typeof json === 'string' && json.charAt(0) === '{') {
                json = JSON.parse(json);
            } else {
                throw new TypeError(`Invalid expression JSON: '${json}'`);
            }
        }
        if (!has(json, 'type')) {
            throw new TypeError('Invalid expression JSON: missing type field');
        }
        const expClz = ExpressionFactory.getExpressionClass(json.type);
        if (!expClz) {
            throw new TypeError(`Invalid expression JSON: unknown type: '${json.type}'`);
        }
        return expClz.createFromJson(json);
    }

    static createFromCanonicalStr(expStr) {
        expStr = expStr ? expStr.trim() : expStr;

        // null, undefined, ''
        if (!expStr) {
            throw new TypeError(`Invalid expression: Empty expression: '${expStr}'`);
        }

        // make all quotes double-quotes
        expStr = expStr.replace(/'/g, '"');

        function cntChr(haystack, regex) {
            return (haystack.match(regex) || []).length
        }

        // vasco code:
        const chunks = [];
        let carry = '';
        expStr.split(',').forEach(function (t) {
            carry += ((carry.length > 0 ? ',' : '') + t);
            // Remove quoted parts
            const noQuotes = carry.split('"').filter(function (_, i) {
                return i % 2 === 0;
            }).join('');
            if (!carry.trim().length) {
                // note that if we ever want to allow "null" args to be passed
                // then we'll have to change this
                // the problem is that currently would be ignored, instead of
                // being parsed to be e.g., a special null constant
                throw new TypeError('Invalid expression: Empty sub-expression');
            }
            if (cntChr(noQuotes, /\(/g) === cntChr(noQuotes, /\)/g)
                && cntChr(carry, /"/g) % 2 === 0) {
                chunks.push(carry);
                carry = '';
            }
        });

        if (carry.length > 0) {
            throw new TypeError(`Invalid expression: '${carry}'`);
        }

        if (chunks.length > 1) {
            // this is to support recursive function parsing
            // ideally we don't want users passing 'A, B, C'
            return chunks.map(chunk => {
                return ExpressionFactory.createFromCanonicalStr(chunk);
            });
        }

        expStr = chunks[0];

        const firstChr = expStr.charAt(0);
        const lastChr = expStr.charAt(expStr.length - 1);
        let type = 'path';
        if (firstChr === '"' || lastChr === '"' || !isNaN(expStr)) {
            type = 'constant';
        } else if (cntChr(expStr, /\(/g) !== 0 || cntChr(expStr, /\)/g) !== 0) {
            type = 'function';
        } // else: path
        const expClz = ExpressionFactory.getExpressionClass(type);
        return expClz.createFromCanonicalStr(expStr);
    }
}

export default ExpressionFactory;

import has from 'has';

import ExpressionFactory from './factory';
import AbstractExpression from './abstract';

class ExpressionSet {

    constructor() {
        this.expressions = {};
    }

    getSize() {
        return Object.keys(this.expressions).filter(ex => {
            return this.getExpression(ex);
        }).length;
    }

    getExpression(canonicalStr) {
        return this.expressions[canonicalStr];
    }

    getExpressions() {
        return Object.values(this.expressions);
    }

    addExpression(expression) {
        if (!(expression instanceof AbstractExpression)) {
            throw new TypeError('Item is not an AbstractExpression instance');
        }
        const canon = expression.getCanonicalStr();
        if (!has(this.expressions, canon) || !this.expressions[canon]) {
            this.expressions[canon] = expression;
        }
    }

    removeExpression(expression) {
        this.expressions[expression.getCanonicalStr()] = undefined;
    }

    toJsonArray() {
        return this.getExpressions().map(e => {
            return e.getJson();
        });
    }

    toSerialJson() {
        return JSON.stringify(this.toJsonArray());
    }

    equals(that) {
        return (this === that || this.toSerialJson() === that.toSerialJson());
    }

    getAllByType(type) {
        let exps = [];
        this.getExpressions().forEach(e => {
            exps = exps.concat(e.getAllByType(type));
        });
        return exps;
    }

    getCanonicalStr(indent) {
        return this.getExpressions().map(e => {
            return e.getCanonicalStr(0);
        }).join(indent ? ',\n' : ',');
    }

    static createFromCanonicalStr(expStr) {
        const set = new ExpressionSet();
        const exps = ExpressionFactory.createFromCanonicalStr(expStr);
        if (Array.isArray(exps)) {
            exps.forEach(set.addExpression);
        } else {
            set.addExpression(exps);
        }
        return set;
    }

    static createFromJsonArray(jsonArray) {
        const set = new ExpressionSet();
        if (!Array.isArray(jsonArray)) {
            if (!jsonArray) {
                return set;
            } else if (typeof jsonArray === 'string' && jsonArray.charAt(0) === '[') {
                jsonArray = JSON.parse(jsonArray);
            } else {
                throw new TypeError('expression parameter must be an array');
            }
        }
        jsonArray.forEach(j => {
            set.addExpression(ExpressionFactory.createFromJson(j));
        });
        return set;
    }
}

export default ExpressionSet;

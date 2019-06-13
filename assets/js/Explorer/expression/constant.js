import has from 'has';

import AbstractExpression from './abstract';

class ConstantExpression extends AbstractExpression {

    constructor(value) {
        super("constant");
        if (typeof value === 'undefined') {
            throw new TypeError("ConstantExpression requires a value");
        }
        if (typeof value !== 'string' && typeof value !== 'number') {
            throw new TypeError('ConstantExpression value must be string or number');
        }
        this.value = value;
    }

    getValue() {
        return this.value;
    }

    getCanonicalStr(indent) {
        return this._indentedStr(indent,
            (typeof this.value === 'string' ? '"' + this.value + '"' : this.value.toString()));
    }

    getCanonicalHumanized() {
        return this.getCanonicalStr();
    }

    getJson() {
        return {
            type: 'constant',
            value: this.value,
            human_name: this.value
        }
    }

    static createFromJson(json) {
        AbstractExpression.checkJsonType(json, 'constant');
        if (!has(json, 'value')) {
            throw new TypeError("Malformed constant expression: missing value field");
        }
        return new ConstantExpression(json.value);
    }

    static createFromCanonicalStr(expStr) {
        if (typeof expStr !== 'string') {
            throw new TypeError('createFromCanonicalStr requires a string argument');
        }
        expStr = expStr.trim().replace(/'/g, '"');
        const quoteCnt = (expStr.match(/"/g) || []).length;

        if (quoteCnt === 0 && !isNaN(expStr)) {
            // numeric constant
            expStr = +expStr;
        } else if (quoteCnt === 2) {
            // string constant
            if (expStr.charAt(0) !== '"' || expStr.charAt(expStr.length - 1) !== '"') {
                throw new TypeError(`Malformed string constant: '${expStr}'`);
            }
            expStr = expStr.replace(/"/g, '');
        } else {
            // malformed (e.g., one quote character)
            throw new TypeError(`Malformed constant: '${expStr}'`);
        }
        return new ConstantExpression(expStr);
    }

}

export default ConstantExpression;

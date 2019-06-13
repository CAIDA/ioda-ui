import AbstractExpression from './abstract';

class PathExpression extends AbstractExpression {

    constructor(path, humanPath) {
        super("path");
        if (!path || typeof path !== 'string') {
            throw new TypeError(`Missing/invalid path parameter: '${path}'`);
        }
        if (typeof humanPath !== 'undefined'
            && (humanPath && typeof humanPath !== 'string')
            || humanPath === '') {
            throw new TypeError(`Invalid humanPath parameter: '${humanPath}'`);
        }
        this.path = path;
        this.humanPath = humanPath;
    }

    getPath() {
        return this.path;
    }

    getCanonicalStr(indent) {
        return this._indentedStr(indent, this.getPath());
    }

    getCanonicalHumanized() {
        return this.humanPath || this.getPath();
    }

    getJson() {
        return {
            type: this.type,
            path: this.path,
            human_name: this.humanPath
        };
    }

    static createFromJson(json) {
        AbstractExpression.checkJsonType(json, 'path');
        return new PathExpression(json.path, json.human_name);
    }

    static createFromCanonicalStr(expStr) {
        return new PathExpression(expStr);
    }

}

export default PathExpression;

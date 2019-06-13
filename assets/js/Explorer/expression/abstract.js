import has from 'has';

class AbstractExpression {

    constructor(type) {
        /*
        AK comments 2019-02-15 because currently Uglify.js doesn't support this
        if (new.target === AbstractExpression) {
            throw new TypeError("Cannot directly create AbstractExpression objects. Use ExpressionFactory instead");
        }
        */
        this.type = type;
    }

    toString() {
        throw new TypeError('Expression objects cannot be implicitly converted to string.');
    }

    static checkJsonType(json, type) {
        if (!json) {
            throw new TypeError(`Malformed expression JSON`);
        }
        if (!has(json, 'type') || json.type !== type) {
            throw new TypeError(`Malformed expression JSON: expected type of '${type}', got '${json.type}`);
        }
    }

    _indentedStr(indent, str) {
        const INDENT_STR = '  ';
        return (indent >= 0 ? INDENT_STR.repeat(indent) : '') + str;
    }

    getType() {
        return this.type;
    }

    /**
     * Get an array of all of the sub-expressions of the given type
     *
     * If the type of this expression matches the type, it will be included in
     * the set.
     * This method should be overridden called recursively by expressions that
     * have sub expressions, and the results merged
     */
    getAllByType(type) {
        return type === this.type ? [this] : [];
    }

    // ABSTRACT METHODS:
    /**
     * Get the canonical representation of the expression.
     *
     * If indent is given, indent at the given level. An indent of 0 is a valid
     * indent. To explicitly disable indenting (and thus pretty-printing), pass
     * null or undefined.
     * @param indent
     */
    /*
    getCanonicalStr(indent);
    */

    /*
    getCanonicalHumanized();
    */

    /*
    getJson();
    */

    /*
    static createFromJson();
    */

    /*
    static createFromCanonicalStr();
    */

}

export default AbstractExpression;

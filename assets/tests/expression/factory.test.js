import chai from 'chai';

import ExpressionFactory from '../../js/Explorer/expression/factory';
import PathExpression from "../../js/Explorer/expression/path";

// most of the expression factory code is tested from the specific expression
// type checks

describe("ExpressionFactory createFromJson (invalid)", () => {
    it('should fail when given no json', () => {
        chai.expect(() => {
            ExpressionFactory.createFromJson();
        }).to.throw(TypeError);
    });

    it('should fail when given empty json', () => {
        chai.expect(() => {
            ExpressionFactory.createFromJson({});
        }).to.throw(TypeError);
    });

    it('should fail when given a non-JSON-serialized string', () => {
        chai.expect(() => {
            ExpressionFactory.createFromJson('this is a test');
        }).to.throw(TypeError);
    });

    it('should fail when given an integer', () => {
        chai.expect(() => {
            ExpressionFactory.createFromJson(12345);
        }).to.throw(TypeError);
    });

    it('should fail when given an invalid type', () => {
        chai.expect(() => {
            ExpressionFactory.createFromJson({
                type: 'ERROR'
            });
        }).to.throw(TypeError);
    });
});

describe("ExpressionFactory createFromCanonical (invalid)", () => {
    it('should fail when given no expression string', () => {
        chai.expect(() => {
            ExpressionFactory.createFromCanonicalStr();
        }).to.throw(TypeError);
    });

    it('should fail when given an empty expression string', () => {
        chai.expect(() => {
            ExpressionFactory.createFromCanonicalStr('');
        }).to.throw(TypeError);
    });

    it('should fail when given a malformed expression', () => {
        chai.expect(() => {
            ExpressionFactory.createFromCanonicalStr('testFu)nc(');
        }).to.throw(TypeError);
    });

    it('should fail when given a malformed expression', () => {
        chai.expect(() => {
            ExpressionFactory.createFromCanonicalStr('testFu)nc(');
        }).to.throw(TypeError);
    });

    it('should fail when given a malformed argument expression', () => {
        chai.expect(() => {
            ExpressionFactory.createFromCanonicalStr('testFunc(a, b, "xyz)');
        }).to.throw(TypeError);
    });
});

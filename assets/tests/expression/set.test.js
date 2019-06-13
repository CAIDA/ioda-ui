import chai from 'chai';

import ExpressionSet from "../../js/Explorer/expression/set";
import PathExpression from "../../js/Explorer/expression/path";
import ConstantExpression from "../../js/Explorer/expression/constant";

describe('ExpressionSet simple usage', () => {

    it('should contain no expressions when created', () => {
        const set = new ExpressionSet();
        chai.expect(set.getSize()).to.equal(0);
    });

    it('should not allow non-expressions to be added', () => {
        const set = new ExpressionSet();
        chai.expect(() => {
            set.addExpression('ERROR');
        }).to.throw(TypeError);
    });

    it('should de-duplicate added expressions', () => {
        const set = new ExpressionSet();
        set.addExpression(new ConstantExpression(12345));
        set.addExpression(new ConstantExpression(12345));
        set.addExpression(new ConstantExpression(-365));
        chai.expect(set.getSize()).to.equal(2);
    });

    it('should correctly remove expressions', () => {
        const set = new ExpressionSet();
        set.addExpression(new ConstantExpression(12345));
        set.addExpression(new ConstantExpression(-365));
        chai.expect(set.getSize()).to.equal(2);
        set.removeExpression(new ConstantExpression(12345));
        chai.expect(set.getSize()).to.equal(1);
    });

    it('should correctly convert to json', () => {
        const set = new ExpressionSet();
        const ceA = new ConstantExpression(12345);
        const ceB = new ConstantExpression(-365);
        set.addExpression(ceA);
        set.addExpression(ceB);
        chai.expect(set.toJsonArray()).to.eql([ceA.getJson(), ceB.getJson()]);
        chai.expect(set.toSerialJson()).to.eql(JSON.stringify([ceA.getJson(), ceB.getJson()]));
    });
});

describe("ExpressionSet createFromJsonArray", () => {
    it('should correctly build from JSON', () => {
        const ceA = new ConstantExpression(12345);
        const ceB = new ConstantExpression(-365);
        const set = ExpressionSet.createFromJsonArray([ceA.getJson(), ceB.getJson()]);
        chai.expect(set.toJsonArray()).to.eql([ceA.getJson(), ceB.getJson()]);
    });

    it('should transparently handle serialized JSON', () => {
        const ceA = new ConstantExpression(12345);
        const ceB = new ConstantExpression(-365);
        const json = [ceA.getJson(), ceB.getJson()];
        const set = ExpressionSet.createFromJsonArray(JSON.stringify(json));
        chai.expect(set.toJsonArray()).to.eql(json);
    });
});

describe("ExpressionSet createFromJsonArray (invalid)", () => {
    it('should fail when given something other than an array', () => {
        chai.expect(() => {
            ExpressionSet.createFromJsonArray(new PathExpression('a.test.path'));
        }).to.throw(TypeError);
    });
});


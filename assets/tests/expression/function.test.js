import chai from 'chai';

import FunctionExpression from '../../js/Explorer/expression/function';
import PathExpression from "../../js/Explorer/expression/path";
import ConstantExpression from "../../js/Explorer/expression/constant";
import ExpressionFactory from "../../js/Explorer/expression/factory";
import ExpressionSet from "../../js/Explorer/expression/set";

const type = 'function';

function testFunction(e, func, canonical, canonicalPretty, canonicalHuman, argJson) {
    it(`should have a type of '${type}'`, () => {
        chai.expect(e.getType()).to.equal(type);
    });

    it(`should have a func matching ${func}`, () => {
        chai.expect(e.getFunc()).to.equal(func);
    });

    it(`should have a canonical format matching ${canonical}`, () => {
        chai.expect(e.getCanonicalStr()).to.equal(canonical);
    });

    it("should correctly indent the canonical format string", () => {
        chai.expect(e.getCanonicalStr(0)).to.equal(canonicalPretty);
    });

    it("should have a canonical humanized format matching the value", () => {
        chai.expect(e.getCanonicalHumanized()).to.equal(canonicalHuman);
    });

    it("should give correct JSON", () => {
        chai.expect(e.getJson()).to.deep.include({
            type,
            func,
            args: argJson
        });
    });

    it("should fail when implicitly converted to string", () => {
        chai.expect(() => {
            return '' + e;
        }).to.throw();
    });

    it(`should return at least itself to getAllByType('${type}')`, () => {
        chai.expect(e.getAllByType(type)).to.include(e);
    });
}

const testFunc = 'sumSeries';

describe("FunctionExpression direct constructor (no args)", () => {
    const canon = `${testFunc}()`;
    const fe = new FunctionExpression(testFunc);
    testFunction(fe, testFunc, canon, canon, canon, []);

    it('should return no children of type "constant"', () => {
        chai.expect(fe.getAllByType('constant')).to.eql([]);
    });
});

const testPathA = 'a.test.path';
const testPathHumanA = 'A > Human > Path';
const peA = new PathExpression(testPathA, testPathHumanA);

const testPathB = 'another.test.path';
const testPathHumanB = 'Another > Humanized > Path';
const peB = new PathExpression(testPathB, testPathHumanB);

describe("FunctionExpression direct constructor (single path arg)", () => {
    // sumSeries(a.test.path)
    const canon = `${testFunc}(${testPathA})`;
    const canonPretty = `${testFunc}(\n  ${testPathA}\n)`;
    const canonHuman = `${testFunc}(${testPathHumanA})`;
    const fe = new FunctionExpression(testFunc, [peA]);
    testFunction(fe, testFunc, canon, canonPretty, canonHuman, [peA.getJson()]);
    it('should return one path expression to getAllByType("path")', () => {
        chai.expect(fe.getAllByType('path')).to.eql([peA]);
    });
});

describe("FunctionExpression direct constructor (two path args)", () => {
    // sumSeries(a.test.path, another.test.path)
    const canon = `${testFunc}(${testPathA}, ${testPathB})`;
    const canonPretty = `${testFunc}(\n  ${testPathA},\n  ${testPathB}\n)`;
    const canonHuman = `${testFunc}(${testPathHumanA}, ${testPathHumanB})`;
    const fe = new FunctionExpression(testFunc, [peA, peB]);
    testFunction(fe, testFunc, canon, canonPretty, canonHuman,
        [peA.getJson(), peB.getJson()]);
    it('should return two path expressions to getAllByType("path")', () => {
        chai.expect(fe.getAllByType('path')).to.eql([peA, peB]);
    });
});

const testStrA = 'A Test String';
const testStrB = 'Another Arg';
const ceA = new ConstantExpression(testStrA);
const ceB = new ConstantExpression(testStrB);

describe("FunctionExpression direct constructor (constant string args)", () => {
    // sumSeries("A Test String, "Another Arg")
    const canon = `${testFunc}("${testStrA}", "${testStrB}")`;
    const canonPretty = `${testFunc}(\n  "${testStrA}",\n  "${testStrB}"\n)`;
    const canonHuman = `${testFunc}("${testStrA}", "${testStrB}")`;
    const fe = new FunctionExpression(testFunc, [ceA, ceB]);
    testFunction(fe, testFunc, canon, canonPretty, canonHuman,
        [ceA.getJson(), ceB.getJson()]);
    it('should return two constant expressions to getAllByType("constant")', () => {
        chai.expect(fe.getAllByType('constant')).to.eql([ceA, ceB]);
    });
    it('should return an empty array to getAllByType("path")', () => {
        chai.expect(fe.getAllByType('path')).to.eql([]);
    });
});

const testValA = 12345;
const testValB = -365;
const ceC = new ConstantExpression(testValA);
const ceD = new ConstantExpression(testValB);

describe("FunctionExpression direct constructor (constant value args)", () => {
    // sumSeries(12345, -365)
    const canon = `${testFunc}(${testValA}, ${testValB})`;
    const canonPretty = `${testFunc}(\n  ${testValA},\n  ${testValB}\n)`;
    const canonHuman = `${testFunc}(${testValA}, ${testValB})`;
    const fe = new FunctionExpression(testFunc, [ceC, ceD]);
    testFunction(fe, testFunc, canon, canonPretty, canonHuman,
        [ceC.getJson(), ceD.getJson()]);
    it('should return two constant expressions to getAllByType("constant")', () => {
        chai.expect(fe.getAllByType('constant')).to.eql([ceC, ceD]);
    });
    it('should return an empty array to getAllByType("path")', () => {
        chai.expect(fe.getAllByType('path')).to.eql([]);
    });
});

const nestedFunc = 'group';

describe("FunctionExpression direct constructor (nested function, no args)", () => {
    // sumSeries(group())
    const canon = `${testFunc}(${nestedFunc}())`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}()\n)`;
    const canonHuman = `${testFunc}(${nestedFunc}())`;
    const nf = new FunctionExpression(nestedFunc);
    const fe = new FunctionExpression(testFunc, [nf]);
    testFunction(fe, testFunc, canon, canonPretty, canonHuman,
        [nf.getJson()]);
    it('should return two function expressions to getAllByType("function")', () => {
        chai.expect(fe.getAllByType('function')).to.eql([fe, nf]);
    });
    it('should return an empty array to getAllByType("path")', () => {
        chai.expect(fe.getAllByType('path')).to.eql([]);
    });
});

describe("FunctionExpression direct constructor (nested function, single arg)", () => {
    // sumSeries(group(a.test.series))
    const canon = `${testFunc}(${nestedFunc}(${testPathA}))`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}(\n    ${testPathA}\n  )\n)`;
    const canonHuman = `${testFunc}(${nestedFunc}(${testPathHumanA}))`;
    const nf = new FunctionExpression(nestedFunc, [peA]);
    const fe = new FunctionExpression(testFunc, [nf]);
    testFunction(fe, testFunc, canon, canonPretty, canonHuman,
        [nf.getJson()]);
    it('should return two function expressions to getAllByType("function")', () => {
        chai.expect(fe.getAllByType('function')).to.eql([fe, nf]);
    });
    it('should return one path to getAllByType("path")', () => {
        chai.expect(fe.getAllByType('path')).to.eql([peA]);
    });
    it('should return an empty array to getAllByType("constant")', () => {
        chai.expect(fe.getAllByType('constant')).to.eql([]);
    });
});

describe("FunctionExpression direct constructor (single nested function, two args)", () => {
    // sumSeries(group(a.test.series, another.test.series))
    const canon = `${testFunc}(${nestedFunc}(${testPathA}, ${testPathB}))`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}(\n    ${testPathA},\n    ${testPathB}\n  )\n)`;
    const canonHuman = `${testFunc}(${nestedFunc}(${testPathHumanA}, ${testPathHumanB}))`;
    const nf = new FunctionExpression(nestedFunc, [peA, peB]);
    const fe = new FunctionExpression(testFunc, [nf]);
    testFunction(fe, testFunc, canon, canonPretty, canonHuman,
        [nf.getJson()]);
    it('should return two function expressions to getAllByType("function")', () => {
        chai.expect(fe.getAllByType('function')).to.eql([fe, nf]);
    });
    it('should return two paths to getAllByType("path")', () => {
        chai.expect(fe.getAllByType('path')).to.eql([peA, peB]);
    });
    it('should return an empty array to getAllByType("constant")', () => {
        chai.expect(fe.getAllByType('constant')).to.eql([]);
    });
});

describe("FunctionExpression direct constructor (nested function with two args, and constant string)", () => {
    // sumSeries(group(a.test.series, another.test.series), "A Test String")
    const canon = `${testFunc}(${nestedFunc}(${testPathA}, ${testPathB}), "${testStrA}")`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}(\n    ${testPathA},\n    ${testPathB}\n  ),\n  "${testStrA}"\n)`;
    const canonHuman = `${testFunc}(${nestedFunc}(${testPathHumanA}, ${testPathHumanB}), "${testStrA}")`;
    const nf = new FunctionExpression(nestedFunc, [peA, peB]);
    const fe = new FunctionExpression(testFunc, [nf, ceA]);
    testFunction(fe, testFunc, canon, canonPretty, canonHuman,
        [nf.getJson(), ceA.getJson()]);
    it('should return two function expressions to getAllByType("function")', () => {
        chai.expect(fe.getAllByType('function')).to.eql([fe, nf]);
    });
    it('should return two paths to getAllByType("path")', () => {
        chai.expect(fe.getAllByType('path')).to.eql([peA, peB]);
    });
    it('should return one constant to getAllByType("constant")', () => {
        chai.expect(fe.getAllByType('constant')).to.eql([ceA]);
    });
});

describe("FunctionExpression direct constructor (nested function with two args, and constant value)", () => {
    // sumSeries(group(a.test.series, another.test.series), -365)
    const canon = `${testFunc}(${nestedFunc}(${testPathA}, ${testPathB}), ${testValB})`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}(\n    ${testPathA},\n    ${testPathB}\n  ),\n  ${testValB}\n)`;
    const canonHuman = `${testFunc}(${nestedFunc}(${testPathHumanA}, ${testPathHumanB}), ${testValB})`;
    const nf = new FunctionExpression(nestedFunc, [peA, peB]);
    const fe = new FunctionExpression(testFunc, [nf, ceD]);
    testFunction(fe, testFunc, canon, canonPretty, canonHuman,
        [nf.getJson(), ceD.getJson()]);
    it('should return two function expressions to getAllByType("function")', () => {
        chai.expect(fe.getAllByType('function')).to.eql([fe, nf]);
    });
    it('should return two paths to getAllByType("path")', () => {
        chai.expect(fe.getAllByType('path')).to.eql([peA, peB]);
    });
    it('should return one constant to getAllByType("constant")', () => {
        chai.expect(fe.getAllByType('constant')).to.eql([ceD]);
    });
});

const nestedFuncB = 'alias';

describe("FunctionExpression direct constructor (two nested functions)", () => {
    // sumSeries(group(a.test.series, another.test.series), alias(a.test.series, "A Test String"))
    const canon = `${testFunc}(${nestedFunc}(${testPathA}, ${testPathB}), ${nestedFuncB}(${testPathA}, "${testStrA}"))`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}(\n    ${testPathA},\n    ${testPathB}\n  ),\n  ${nestedFuncB}(\n    ${testPathA},\n    "${testStrA}"\n  )\n)`;
    const canonHuman = `${testFunc}(${nestedFunc}(${testPathHumanA}, ${testPathHumanB}), ${nestedFuncB}(${testPathHumanA}, "${testStrA}"))`;
    const nfA = new FunctionExpression(nestedFunc, [peA, peB]);
    const nfB = new FunctionExpression(nestedFuncB, [peA, ceA]);
    const fe = new FunctionExpression(testFunc, [nfA, nfB]);
    testFunction(fe, testFunc, canon, canonPretty, canonHuman,
        [nfA.getJson(), nfB.getJson()]);
    it('should return three function expressions to getAllByType("function")', () => {
        chai.expect(fe.getAllByType('function')).to.eql([fe, nfA, nfB]);
    });
    it('should return three paths to getAllByType("path")', () => {
        chai.expect(fe.getAllByType('path')).to.eql([peA, peB, peA]);
    });
    it('should return one constant to getAllByType("constant")', () => {
        chai.expect(fe.getAllByType('constant')).to.eql([ceA]);
    });
});

describe("FunctionExpression createFromCanonical (non-pretty, no arg)", () => {
    const canon = `${testFunc}()`;

    const feFromCanon = FunctionExpression.createFromCanonicalStr(canon);

    testFunction(feFromCanon, testFunc, canon, canon, canon, []);

    it('should return no children of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant')).to.eql([]);
    });
});

describe("FunctionExpression createFromCanonical (non-pretty, single path arg)", () => {
    const canon = `${testFunc}(${testPathA})`;
    const canonPretty = `${testFunc}(\n  ${testPathA}\n)`;
    const pathExp = new PathExpression(testPathA);

    const feFromCanon = FunctionExpression.createFromCanonicalStr(canon);

    testFunction(feFromCanon, testFunc, canon, canonPretty, canon, [pathExp.getJson()]);

    it('should return no children of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant')).to.eql([]);
    });

    it('should return one child of type "path"', () => {
        const children = feFromCanon.getAllByType('path');
        chai.expect(children.length).to.eql(1);
        chai.expect(children[0].getCanonicalStr()).to.equal(testPathA);
    });
});

describe("FunctionExpression createFromCanonical (non-pretty, single nested func, no args)", () => {
    const canon = `${testFunc}(${nestedFunc}())`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}()\n)`;
    const nf = new FunctionExpression(nestedFunc);

    const feFromCanon = FunctionExpression.createFromCanonicalStr(canon);

    testFunction(feFromCanon, testFunc, canon, canonPretty, canon, [nf.getJson()]);

    it('should return no children of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant')).to.eql([]);
    });

    it('should return two children of type "function"', () => {
        const children = feFromCanon.getAllByType('function');
        chai.expect(children.length).to.equal(2);
    });
});

describe("FunctionExpression createFromCanonical (non-pretty, single nested func, path arg)", () => {
    const canon = `${testFunc}(${nestedFunc}(${testPathA}))`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}(\n    ${testPathA}\n  )\n)`;

    const pathExp = new PathExpression(testPathA);
    const nf = new FunctionExpression(nestedFunc, [pathExp]);

    const feFromCanon = FunctionExpression.createFromCanonicalStr(canon);

    testFunction(feFromCanon, testFunc, canon, canonPretty, canon, [nf.getJson()]);

    it('should return no children of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant')).to.eql([]);
    });

    it('should return two children of type "function"', () => {
        const children = feFromCanon.getAllByType('function');
        chai.expect(children.length).to.equal(2);
        // could do a deeper comparison here...
    });
});

describe("FunctionExpression createFromCanonical (non-pretty, complex)", () => {
    const canon = `${testFunc}(${nestedFunc}(${testPathA}, ${testPathB}), ${nestedFuncB}(${testPathA}, "${testStrA}"))`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}(\n    ${testPathA},\n    ${testPathB}\n  ),\n  ${nestedFuncB}(\n    ${testPathA},\n    "${testStrA}"\n  )\n)`;
    const canonHuman = `${testFunc}(${nestedFunc}(${testPathA}, ${testPathB}), ${nestedFuncB}(${testPathA}, "${testStrA}"))`;

    // can't use previously created ones as we need non-humanized
    const pathExpA = new PathExpression(testPathA);
    const pathExpB = new PathExpression(testPathB);
    const nfA = new FunctionExpression(nestedFunc, [pathExpA, pathExpB]);
    const nfB = new FunctionExpression(nestedFuncB, [pathExpA, ceA]);

    const feFromCanon = FunctionExpression.createFromCanonicalStr(canon);

    testFunction(feFromCanon, testFunc, canon, canonPretty, canonHuman,
        [nfA.getJson(), nfB.getJson()]);

    it('should return three children of type "function"', () => {
        chai.expect(feFromCanon.getAllByType('function').map(c => {
            return c.getJson()
        })).to.eql([feFromCanon.getJson(), nfA.getJson(), nfB.getJson()]);
    });

    it('should return three children of type "path"', () => {
        chai.expect(feFromCanon.getAllByType('path').map(c => {
            return c.getJson()
        })).to.eql([pathExpA.getJson(), pathExpB.getJson(), pathExpA.getJson()]);
    });

    it('should return one child of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant').map(c => {
            return c.getJson()
        })).to.eql([ceA.getJson()]);
    });
});

describe("FunctionExpression createFromCanonical (pretty, single path arg)", () => {
    const canon = `${testFunc}(${testPathA})`;
    const canonPretty = `${testFunc}(\n  ${testPathA}\n)`;
    const pathExp = new PathExpression(testPathA);

    const feFromCanon = FunctionExpression.createFromCanonicalStr(canonPretty);

    testFunction(feFromCanon, testFunc, canon, canonPretty, canon, [pathExp.getJson()]);

    it('should return no children of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant')).to.eql([]);
    });

    it('should return one child of type "path"', () => {
        const children = feFromCanon.getAllByType('path');
        chai.expect(children.length).to.eql(1);
        chai.expect(children[0].getCanonicalStr()).to.equal(testPathA);
    });
});

describe("FunctionExpression createFromCanonical (pretty, single nested func, no args)", () => {
    const canon = `${testFunc}(${nestedFunc}())`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}()\n)`;
    const nf = new FunctionExpression(nestedFunc);

    const feFromCanon = FunctionExpression.createFromCanonicalStr(canonPretty);

    testFunction(feFromCanon, testFunc, canon, canonPretty, canon, [nf.getJson()]);

    it('should return no children of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant')).to.eql([]);
    });

    it('should return two children of type "function"', () => {
        const children = feFromCanon.getAllByType('function');
        chai.expect(children.length).to.equal(2);
    });
});

describe("FunctionExpression createFromCanonical (pretty, single nested func, path arg)", () => {
    const canon = `${testFunc}(${nestedFunc}(${testPathA}))`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}(\n    ${testPathA}\n  )\n)`;

    const pathExp = new PathExpression(testPathA);
    const nf = new FunctionExpression(nestedFunc, [pathExp]);

    const feFromCanon = FunctionExpression.createFromCanonicalStr(canonPretty);

    testFunction(feFromCanon, testFunc, canon, canonPretty, canon, [nf.getJson()]);

    it('should return no children of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant')).to.eql([]);
    });

    it('should return two children of type "function"', () => {
        const children = feFromCanon.getAllByType('function');
        chai.expect(children.length).to.equal(2);
        // could do a deeper comparison here...
    });
});

describe("FunctionExpression createFromCanonical (pretty, complex)", () => {
    const canon = `${testFunc}(${nestedFunc}(${testPathA}, ${testPathB}), ${nestedFuncB}(${testPathA}, "${testStrA}"))`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}(\n    ${testPathA},\n    ${testPathB}\n  ),\n  ${nestedFuncB}(\n    ${testPathA},\n    "${testStrA}"\n  )\n)`;
    const canonHuman = `${testFunc}(${nestedFunc}(${testPathA}, ${testPathB}), ${nestedFuncB}(${testPathA}, "${testStrA}"))`;

    // can't use previously created ones as we need non-humanized
    const pathExpA = new PathExpression(testPathA);
    const pathExpB = new PathExpression(testPathB);
    const nfA = new FunctionExpression(nestedFunc, [pathExpA, pathExpB]);
    const nfB = new FunctionExpression(nestedFuncB, [pathExpA, ceA]);

    const feFromCanon = FunctionExpression.createFromCanonicalStr(canonPretty);

    testFunction(feFromCanon, testFunc, canon, canonPretty, canonHuman,
        [nfA.getJson(), nfB.getJson()]);

    it('should return three children of type "function"', () => {
        chai.expect(feFromCanon.getAllByType('function').map(c => {
            return c.getJson()
        })).to.eql([feFromCanon.getJson(), nfA.getJson(), nfB.getJson()]);
    });

    it('should return three children of type "path"', () => {
        chai.expect(feFromCanon.getAllByType('path').map(c => {
            return c.getJson()
        })).to.eql([pathExpA.getJson(), pathExpB.getJson(), pathExpA.getJson()]);
    });

    it('should return one child of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant').map(c => {
            return c.getJson()
        })).to.eql([ceA.getJson()]);
    });
});

describe("FunctionExpression createFromCanonical (invalid)", () => {
    it('should fail when given no expression string', () => {
        chai.expect(() => {
            FunctionExpression.createFromCanonicalStr();
        }).to.throw(TypeError);
    });

    it('should fail when given an empty expression string', () => {
        chai.expect(() => {
            FunctionExpression.createFromCanonicalStr('');
        }).to.throw(TypeError);
    });

    it('should fail when given a non-string argument', () => {
        chai.expect(() => {
            FunctionExpression.createFromCanonicalStr(12345);
        }).to.throw(TypeError);
        chai.expect(() => {
            FunctionExpression.createFromCanonicalStr({});
        }).to.throw(TypeError);
    });

    it('should fail when given a malformed expression', () => {
        chai.expect(() => {
            FunctionExpression.createFromCanonicalStr('testFunc(');
        }).to.throw(TypeError);
        chai.expect(() => {
            FunctionExpression.createFromCanonicalStr('testFunc)');
        }).to.throw(TypeError);
        chai.expect(() => {
            FunctionExpression.createFromCanonicalStr('(testFunc)');
        }).to.throw(TypeError);
        chai.expect(() => {
            FunctionExpression.createFromCanonicalStr('()testFunc');
        }).to.throw(TypeError);
        chai.expect(() => {
            FunctionExpression.createFromCanonicalStr('()');
        }).to.throw(TypeError);
    });

    it('should fail when given malformed function args', () => {
        chai.expect(() => {
            FunctionExpression.createFromCanonicalStr('testFunc(,path)');
        }).to.throw(TypeError);
        chai.expect(() => {
            FunctionExpression.createFromCanonicalStr('testFunc(path,)');
        }).to.throw(TypeError);
        chai.expect(() => {
            FunctionExpression.createFromCanonicalStr('testFunc(path,,)');
        }).to.throw(TypeError);
        chai.expect(() => {
            FunctionExpression.createFromCanonicalStr('testFunc(path,,path)');
        }).to.throw(TypeError);
    });
});

describe("FunctionExpression createFromJson (no args)", () => {
    const json = {
        type,
        func: testFunc,
        args: []
    };
    const canon = `${testFunc}()`;

    const feFromCanon = FunctionExpression.createFromJson(json);

    testFunction(feFromCanon, testFunc, canon, canon, canon, []);

    it('should return no children of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant')).to.eql([]);
    });
});

describe("FunctionExpression createFromJson (single path arg)", () => {
    const canon = `${testFunc}(${testPathA})`;
    const canonPretty = `${testFunc}(\n  ${testPathA}\n)`;
    const canonHuman = `${testFunc}(${testPathHumanA})`;
    const json = {
        type,
        func: testFunc,
        args: [peA.getJson()]
    };

    const feFromCanon = FunctionExpression.createFromJson(json);

    testFunction(feFromCanon, testFunc, canon, canonPretty, canonHuman, [peA.getJson()]);

    it('should return no children of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant')).to.eql([]);
    });

    it('should return one child of type "path"', () => {
        const children = feFromCanon.getAllByType('path');
        chai.expect(children.length).to.eql(1);
        chai.expect(children[0].getCanonicalStr()).to.equal(testPathA);
    });
});

describe("FunctionExpression createFromJson (single nested func, no args)", () => {
    const canon = `${testFunc}(${nestedFunc}())`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}()\n)`;
    const nf = new FunctionExpression(nestedFunc);
    const json = {
        type,
        func: testFunc,
        args: [nf.getJson()]
    };

    const feFromCanon = FunctionExpression.createFromJson(json);

    testFunction(feFromCanon, testFunc, canon, canonPretty, canon, [nf.getJson()]);

    it('should return no children of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant')).to.eql([]);
    });

    it('should return two children of type "function"', () => {
        const children = feFromCanon.getAllByType('function');
        chai.expect(children.length).to.equal(2);
    });
});

describe("FunctionExpression createFromJson (single nested func, path arg)", () => {
    const canon = `${testFunc}(${nestedFunc}(${testPathA}))`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}(\n    ${testPathA}\n  )\n)`;
    const canonHuman = `${testFunc}(${nestedFunc}(${testPathHumanA}))`;
    const nf = new FunctionExpression(nestedFunc, [peA]);
    const json = {
        type,
        func: testFunc,
        args: [nf.getJson()]
    };

    const feFromCanon = FunctionExpression.createFromJson(json);

    testFunction(feFromCanon, testFunc, canon, canonPretty, canonHuman, [nf.getJson()]);

    it('should return no children of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant')).to.eql([]);
    });

    it('should return two children of type "function"', () => {
        const children = feFromCanon.getAllByType('function');
        chai.expect(children.length).to.equal(2);
        // could do a deeper comparison here...
    });
});

describe("FunctionExpression createFromJson (complex)", () => {
    const canon = `${testFunc}(${nestedFunc}(${testPathA}, ${testPathB}), ${nestedFuncB}(${testPathA}, "${testStrA}"))`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}(\n    ${testPathA},\n    ${testPathB}\n  ),\n  ${nestedFuncB}(\n    ${testPathA},\n    "${testStrA}"\n  )\n)`;
    const canonHuman = `${testFunc}(${nestedFunc}(${testPathHumanA}, ${testPathHumanB}), ${nestedFuncB}(${testPathHumanA}, "${testStrA}"))`;
    const nfA = new FunctionExpression(nestedFunc, [peA, peB]);
    const nfB = new FunctionExpression(nestedFuncB, [peA, ceA]);
    const json = {
        type,
        func: testFunc,
        args: [
            nfA.getJson(),
            nfB.getJson()
        ]
    };

    const feFromCanon = FunctionExpression.createFromJson(json);

    testFunction(feFromCanon, testFunc, canon, canonPretty, canonHuman,
        [nfA.getJson(), nfB.getJson()]);

    it('should return three children of type "function"', () => {
        chai.expect(feFromCanon.getAllByType('function').map(c => {
            return c.getJson()
        })).to.eql([feFromCanon.getJson(), nfA.getJson(), nfB.getJson()]);
    });

    it('should return three children of type "path"', () => {
        chai.expect(feFromCanon.getAllByType('path').map(c => {
            return c.getJson()
        })).to.eql([peA.getJson(), peB.getJson(), peA.getJson()]);
    });

    it('should return one child of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant').map(c => {
            return c.getJson()
        })).to.eql([ceA.getJson()]);
    });
});

describe("ExpressionFactory createFromJson (complex, serialized)", () => {
    const canon = `${testFunc}(${nestedFunc}(${testPathA}, ${testPathB}), ${nestedFuncB}(${testPathA}, "${testStrA}"))`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}(\n    ${testPathA},\n    ${testPathB}\n  ),\n  ${nestedFuncB}(\n    ${testPathA},\n    "${testStrA}"\n  )\n)`;
    const canonHuman = `${testFunc}(${nestedFunc}(${testPathHumanA}, ${testPathHumanB}), ${nestedFuncB}(${testPathHumanA}, "${testStrA}"))`;
    const nfA = new FunctionExpression(nestedFunc, [peA, peB]);
    const nfB = new FunctionExpression(nestedFuncB, [peA, ceA]);
    const json = {
        type,
        func: testFunc,
        args: [
            nfA.getJson(),
            nfB.getJson()
        ]
    };

    // NOTE: uses ExpressionFactory to parse the serialized JSON
    const feFromCanon = ExpressionFactory.createFromJson(JSON.stringify(json));

    testFunction(feFromCanon, testFunc, canon, canonPretty, canonHuman,
        [nfA.getJson(), nfB.getJson()]);

    it('should return three children of type "function"', () => {
        chai.expect(feFromCanon.getAllByType('function').map(c => {
            return c.getJson()
        })).to.eql([feFromCanon.getJson(), nfA.getJson(), nfB.getJson()]);
    });

    it('should return three children of type "path"', () => {
        chai.expect(feFromCanon.getAllByType('path').map(c => {
            return c.getJson()
        })).to.eql([peA.getJson(), peB.getJson(), peA.getJson()]);
    });

    it('should return one child of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant').map(c => {
            return c.getJson()
        })).to.eql([ceA.getJson()]);
    });
});

describe("ExpressionFactory createFromJson (complex, array)", () => {
    const canon = `${testFunc}(${nestedFunc}(${testPathA}, ${testPathB}), ${nestedFuncB}(${testPathA}, "${testStrA}"))`;
    const canonPretty = `${testFunc}(\n  ${nestedFunc}(\n    ${testPathA},\n    ${testPathB}\n  ),\n  ${nestedFuncB}(\n    ${testPathA},\n    "${testStrA}"\n  )\n)`;
    const canonHuman = `${testFunc}(${nestedFunc}(${testPathHumanA}, ${testPathHumanB}), ${nestedFuncB}(${testPathHumanA}, "${testStrA}"))`;
    const nfA = new FunctionExpression(nestedFunc, [peA, peB]);
    const nfB = new FunctionExpression(nestedFuncB, [peA, ceA]);
    const json = {
        type,
        func: testFunc,
        args: [
            nfA.getJson(),
            nfB.getJson()
        ]
    };

    // NOTE: uses ExpressionFactory to parse the serialized JSON
    const expSet = ExpressionSet.createFromJsonArray([json, json]);

    it('should create a set with one expression', () => {
        chai.expect(expSet.getSize()).to.equal(1);
    });

    const feFromCanon = expSet.getExpression(canon);
    testFunction(feFromCanon, testFunc, canon, canonPretty, canonHuman,
        [nfA.getJson(), nfB.getJson()]);

    it('should return three children of type "function"', () => {
        chai.expect(feFromCanon.getAllByType('function').map(c => {
            return c.getJson()
        })).to.eql([feFromCanon.getJson(), nfA.getJson(), nfB.getJson()]);
    });

    it('should return three children of type "path"', () => {
        chai.expect(feFromCanon.getAllByType('path').map(c => {
            return c.getJson()
        })).to.eql([peA.getJson(), peB.getJson(), peA.getJson()]);
    });

    it('should return one child of type "constant"', () => {
        chai.expect(feFromCanon.getAllByType('constant').map(c => {
            return c.getJson()
        })).to.eql([ceA.getJson()]);
    });

    it('should convert back to an array of one JSON object', () => {
        chai.expect(expSet.toJsonArray(expSet)).to.eql([json]);
    });
});

describe("FunctionExpression createFromJson (invalid)", () => {
    it('should fail when given no type', () => {
        chai.expect(() => {
            return FunctionExpression.createFromJson({
                func: testFunc,
                args: []
            });
        }).to.throw(TypeError);
    });

    it('should fail when given an incorrect type', () => {
        chai.expect(() => {
            return FunctionExpression.createFromJson({
                type: 'constant',
                func: testFunc,
                args: []
            });
        }).to.throw(TypeError);
    });

    it('should fail when given no function name', () => {
        chai.expect(() => {
            return FunctionExpression.createFromJson({
                type,
                args: []
            });
        }).to.throw(TypeError);
    });

    it('should fail when given an empty function name', () => {
        chai.expect(() => {
            return FunctionExpression.createFromJson({
                type,
                func: '',
                args: []
            });
        }).to.throw(TypeError);
    });

    it('should fail when given a null function name', () => {
        chai.expect(() => {
            return FunctionExpression.createFromJson({
                type,
                func: null,
                args: []
            });
        }).to.throw(TypeError);
    });

    it('should fail when given an integer function name', () => {
        chai.expect(() => {
            return FunctionExpression.createFromJson({
                type,
                func: 12345,
                args: []
            });
        }).to.throw(TypeError);
    });

    it('should fail when given an object function name', () => {
        chai.expect(() => {
            return FunctionExpression.createFromJson({
                type,
                func: {},
                args: []
            });
        }).to.throw(TypeError);
    });

    it('should fail when given no args', () => {
        chai.expect(() => {
            return FunctionExpression.createFromJson({
                type,
                func: testFunc
            });
        }).to.throw(TypeError);
    });

    it('should not fail when given empty arg list', () => {
        chai.expect(() => {
            return FunctionExpression.createFromJson({
                type,
                func: testFunc,
                args: []
            });
        }).not.to.throw(TypeError);
    });

    it('should fail when given a non-array args parameter', () => {
        chai.expect(() => {
            return FunctionExpression.createFromJson({
                type,
                func: testFunc,
                args: {}
            });
        }).to.throw(TypeError);
        chai.expect(() => {
            return FunctionExpression.createFromJson({
                type,
                func: testFunc,
                args: 'ERROR'
            });
        }).to.throw(TypeError);
    });
});

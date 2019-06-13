import chai from 'chai';

import ConstantExpression from '../../js/Explorer/expression/constant';

const type = 'constant';

function testConstant(e, value, strValue) {
    it("should have a type of 'constant'", () => {
        chai.expect(e.getType()).to.equal(type);
    });

    it(`should have a value matching ${value}`, () => {
        chai.expect(e.getValue()).to.equal(value);
    });

    it(`should have a canonical format matching ${strValue}`, () => {
        chai.expect(e.getCanonicalStr()).to.equal(strValue);
    });

    it("should correctly indent the canonical format string", () => {
        chai.expect(e.getCanonicalStr(2)).to.equal('    ' + strValue);
    });

    it("should have a canonical humanized format matching the value", () => {
        chai.expect(e.getCanonicalHumanized()).to.equal(strValue);
    });

    it("should give correct JSON", () => {
        chai.expect(e.getJson()).to.deep.include({
            type,
            value
        });
    });

    it("should fail when implicitly converted to string", () => {
        chai.expect(() => {
            return '' + e;
        }).to.throw();
    });

    it("should return itself to getAllByType('constant') ", () => {
        chai.expect(e.getAllByType(type)).to.eql([e]);
    });

    it("should return an empty array to getAllByType('path')", () => {
        chai.expect(e.getAllByType('path')).to.eql([]);
    });
}

describe("ConstantExpression direct constructor (numeric constant)", () => {
    testConstant(new ConstantExpression(12345), 12345, "12345");
    testConstant(new ConstantExpression(0), 0, "0");
});

describe("ConstantExpression direct constructor (string constant)", () => {
    const str = 'Test String';
    testConstant(new ConstantExpression(str), str, `"${str}"`);
    // empty string should be valid!
    testConstant(new ConstantExpression(''), '', '""');
});

describe("ConstantExpression direct constructor (invalid constants)", () => {
    it("should fail when given no value", () => {
        chai.expect(() => {
            return new ConstantExpression()
        }).to.throw();
    });

    it("should fail when given an object value", () => {
        chai.expect(() => {
            return new ConstantExpression({})
        }).to.throw();
    });
});

describe("ConstantExpression.createFromJson (numeric value)", () => {
    testConstant(ConstantExpression.createFromJson({
        type,
        value: 12345
    }), 12345, "12345");

    testConstant(ConstantExpression.createFromJson({
        type,
        value: 0
    }), 0, "0");
});

describe("ConstantExpression.createFromJson (string value)", () => {
    const str = 'Test String';
    testConstant(ConstantExpression.createFromJson({
        type,
        value: str
    }), str, `"${str}"`);

    testConstant(ConstantExpression.createFromJson({
        type,
        value: ""
    }), '', '""');
});

describe("ConstantExpression.createFromJson (invalid parameters)", () => {
    it("should fail when given no json object", () => {
        chai.expect(() => {
            return ConstantExpression.createFromJson()
        }).to.throw(TypeError);
    });

    it("should fail when given an empty json object", () => {
        chai.expect(() => {
            return ConstantExpression.createFromJson({})
        }).to.throw(TypeError);
    });

    it("should fail when given a missing type parameter", () => {
        chai.expect(() => {
            return ConstantExpression.createFromJson({
                value: 12345
            })
        }).to.throw(TypeError);
    });

    it("should fail when given an incorrect type parameter", () => {
        chai.expect(() => {
            return ConstantExpression.createFromJson({
                type: 'path',
                value: 12345
            })
        }).to.throw(TypeError);
    });

    it("should fail when missing the value parameter", () => {
        chai.expect(() => {
            return ConstantExpression.createFromJson({
                type: 'constant'
            })
        }).to.throw(TypeError);
    });

    it("should fail when given an invalid value parameter", () => {
        chai.expect(() => {
            return ConstantExpression.createFromJson({
                type: 'constant',
                value: {}
            })
        }).to.throw(TypeError);
    });
});

describe("PathExpression.createFromCanonical (numeric constant)", () => {
    testConstant(ConstantExpression.createFromCanonicalStr('12345'), 12345, '12345');
    testConstant(ConstantExpression.createFromCanonicalStr('0'), 0, '0');
});

describe("PathExpression.createFromCanonical (string constant)", () => {
    const str = 'Test String';
    testConstant(ConstantExpression.createFromCanonicalStr(`"${str}"`), str, `"${str}"`);
    testConstant(ConstantExpression.createFromCanonicalStr('""'), '', '""');

    // allow single-quotes, but they will be converted to doubles
    testConstant(ConstantExpression.createFromCanonicalStr(`'${str}'`), str, `"${str}"`);
    testConstant(ConstantExpression.createFromCanonicalStr('\'\''), '', '""');

    // allow whitespace around the value
    testConstant(ConstantExpression.createFromCanonicalStr(`   "${str}"   `), str, `"${str}"`);
    testConstant(ConstantExpression.createFromCanonicalStr('   ""   '), '', '""');
});

describe("PathExpression.createFromCanonical (invalid)", () => {
    it("should fail when given a non-string parameter", () => {
        chai.expect(() => {
            return ConstantExpression.createFromCanonicalStr(12345)
        }).to.throw(TypeError);
    });

    it("should fail when given an incorrectly quoted string", () => {
        chai.expect(() => {
            return ConstantExpression.createFromCanonicalStr('\"Test')
        }).to.throw(TypeError);
        chai.expect(() => {
            return ConstantExpression.createFromCanonicalStr('Test\"')
        }).to.throw(TypeError);
        chai.expect(() => {
            return ConstantExpression.createFromCanonicalStr('Te\"st')
        }).to.throw(TypeError);
        chai.expect(() => {
            return ConstantExpression.createFromCanonicalStr('T\"es\"t')
        }).to.throw(TypeError);
    });

    it("should fail when given an invalid number", () => {
        chai.expect(() => {
            return ConstantExpression.createFromCanonicalStr('1234 567')
        }).to.throw(TypeError);
    });
});


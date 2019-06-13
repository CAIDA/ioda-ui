import chai from 'chai';

import PathExpression from '../../js/Explorer/expression/path';

const path = "a.test.path";
const humanPath = "A > Test > Path";
const pathJson = {
    type: "path",
    path: path,
    human_name: humanPath
};

function testPath(pe, humanValid) {
    it("should have a type of 'path'", () => {
        chai.expect(pe.getType()).to.equal('path');
    });

    it("should have a canonical format matching the path", () => {
        chai.expect(pe.getCanonicalStr()).to.equal(path);
    });

    it("should correctly indent the canonical format string", () => {
        chai.expect(pe.getCanonicalStr(2)).to.equal('    ' + path);
    });

    it("should have a canonical humanized format matching the given " + (humanValid ? "human path" : "path"), () => {
        chai.expect(pe.getCanonicalHumanized()).to.equal(humanValid ? humanPath : path);
    });

    it("should give correct JSON", () => {
        chai.expect(pe.getJson()).to.deep.include(humanValid ? pathJson : {
            type: 'path',
            path
        });
    });

    it("should fail when implicitly converted to string", () => {
        chai.expect(() => {
            return '' + pe;
        }).to.throw(TypeError);
    });

    it("should return itself to getAllByType('path') ", () => {
        chai.expect(pe.getAllByType('path')).to.eql([pe]);
    });

    it("should return an empty array to getAllByType('constant')", () => {
        chai.expect(pe.getAllByType('constant')).to.eql([]);
    });
}

describe("PathExpression direct constructor", () => {
    const pe = new PathExpression(path, humanPath);
    testPath(pe, true);

    // test invalid path data
    it("should fail when given a null path", () => {
        chai.expect(() => {
            return new PathExpression()
        }).to.throw(TypeError);
    });

    it("should fail when given an empty path", () => {
        chai.expect(() => {
            return new PathExpression("")
        }).to.throw(TypeError);
    });

    it("should fail when given a non-string path", () => {
        chai.expect(() => {
            return new PathExpression(12345)
        }).to.throw(TypeError);
    });

    it("should not fail when given a null humanPath", () => {
        chai.expect(() => {
            return new PathExpression(path, null)
        }).not.to.throw(TypeError);
    });

    it("should fail when given an empty humanPath", () => {
        chai.expect(() => {
            return new PathExpression(path, '')
        }).to.throw(TypeError);
    });

    it("should fail when given a non-string humanPath", () => {
        chai.expect(() => {
            return new PathExpression(path, 12345)
        }).to.throw(TypeError);
    });
});

describe("PathExpression.createFromJson", () => {
    const pe = PathExpression.createFromJson(pathJson);
    testPath(pe, true);

    // test invalid json data
    it("should fail when given no json object", () => {
        chai.expect(() => {
            return PathExpression.createFromJson()
        }).to.throw(TypeError);
    });

    it("should fail when given an empty json object", () => {
        chai.expect(() => {
            return PathExpression.createFromJson({})
        }).to.throw(TypeError);
    });

    it("should fail when given a missing type parameter", () => {
        chai.expect(() => {
            return PathExpression.createFromJson({
                path,
                human_name: humanPath
            })
        }).to.throw(TypeError);
    });

    it("should fail when given an incorrect type parameter", () => {
        chai.expect(() => {
            return PathExpression.createFromJson({
                type: 'constant',
                human_name: humanPath,
                path
            })
        }).to.throw(TypeError);
    });

    it("should fail when missing the path parameter", () => {
        chai.expect(() => {
            return PathExpression.createFromJson({
                type: 'path',
                human_name: humanPath
            })
        }).to.throw(TypeError);
    });

    it("should fail when given an empty human_name parameter", () => {
        chai.expect(() => {
            return PathExpression.createFromJson({
                type: 'path',
                human_name: '',
                path
            })
        }).to.throw(TypeError);
    });

    it("should not fail when missing the human_name parameter", () => {
        chai.expect(() => {
            return PathExpression.createFromJson({
                type: 'path',
                path
            })
        }).not.to.throw(TypeError);
    });

});

describe("PathExpression.createFromCanonical", () => {
    const pe = PathExpression.createFromCanonicalStr(path);
    testPath(pe, false);

    // no need to test invalid since this just runs the constructor
});

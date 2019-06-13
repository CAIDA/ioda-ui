import chai from 'chai';

import AbstractExpression from '../../js/Explorer/expression/abstract';

describe("AbstractExpression", () => {

    it("should fail when constructed directly", () => {
        chai.expect(() => {
            return new AbstractExpression()
        }).to.throw(TypeError);
    });

});

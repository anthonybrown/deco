'use strict';

const Code = require('code');
const Deco = require('..');
const Decorator1 = require('./decorators/d1');
const Decorator2 = require('./decorators/d2');
const Lab = module.exports.lab = require('lab').script();
const Path = require('path');

const describe = Lab.describe;
const expect = Code.expect;
const it = Lab.it;
const meaningOfLife = 42;
const pathToDecorators = Path.join(__dirname, '/decorators');
const testModuleCount = 6;

describe('Deco', () => {
  it('concatenates a series of decorators', (done) => {
    const Factory = Deco(Decorator1, Decorator2);
    const o = Factory();

    expect(o).to.exist();
    expect(o.flavor).to.equal('bitter');
    expect(o.type).to.equal('liqueur');

    done();
  });

  it('concatenates from a directory of decorator files', (done) => {
    const Factory = Deco.loadFrom(pathToDecorators);
    const o = Factory();

    expect(o).to.exist();
    expect(o.flavor).to.equal('bitter');
    expect(o.type).to.equal('liqueur');

    done();
  });

  it('requires from a directory of decorator files', (done) => {
    expect(Deco.require()).to.have.length(testModuleCount);
    done();
  });

  it('concatenates from a list of string file names', (done) => {
    const Factory = Deco.load('decorators/d1');
    const o = Factory();

    expect(o).to.exist();
    expect(o.flavor).not.to.exist();
    expect(o.type).to.equal('liqueur');

    done();
  });

  it('allows concatenating a Deco decorator', (done) => {
    const Factory1 = Deco({
      constructor () { done() }
    });
    const Factory2 = Deco(Factory1);
    Factory2();
  });

  it('allows concatenating 2 Deco decorators', (done) => {
    const Factory1 = Deco({
      constructor () { done() }
    });
    const Factory2 = Deco({ ƒ () {} });
    const Factory3 = Deco(Factory1, Factory2);
    Factory3();
  });

  it('allows concatenating a class', (done) => {
    const GarbageDay = class {
      constructor () { this.test = true }
      ƒ () { return meaningOfLife }
    };
    const Factory = Deco({ g () { return 'yo' } }, GarbageDay);

    const o = Factory();
    expect(o.ƒ()).to.equal(meaningOfLife);
    expect(o.g()).to.equal('yo');
    expect(o.isDeco).not.to.exist();
    expect(o.test).to.equal(true);
    expect(o).not.to.be.an.instanceof(Deco);
    expect(o).not.to.be.an.instanceof(Factory);
    expect(o).not.to.be.an.instanceof(Function);
    expect(o).to.be.an.instanceof(GarbageDay);
    expect(o).to.be.an.instanceof(Object);

    done();
  });

  it('allows concatenating a factory function', (done) => {
    const C = function C () { done() };
    const Factory = Deco(C);
    Factory();
  });

  it('allows concatenating a factory arrow function', (done) => {
    const C = () => done();
    const Factory = Deco(C);
    Factory();
  });

  it('concatenates properties with private data', (done) => {
    const hidden = Deco.hidden();

    const Factory = Deco({
      get masonic () { return hidden(this).masonic },
      set masonic (a) {
        hidden(this).masonic = a;
        return this.masonic;
      }
    });
    const o1 = Factory();
    const o2 = Factory();

    expect(o1.masonic).to.equal(undefined);
    expect(o2.masonic).to.equal(undefined);

    o1.masonic = 'yo';
    expect(o1.masonic).to.equal('yo');
    expect(o2.masonic).to.equal(undefined);

    o1.masonic = undefined;
    o2.masonic = 'hullo';
    expect(o1.masonic).to.equal(undefined);
    expect(o2.masonic).to.equal('hullo');

    done();
  });

  it("doesn't try to overwrite properties that cannot be replaced", (done) => {
    /* eslint-disable prefer-arrow-callback */
    const Factory1 = Deco(function abc () {});
    const Factory2 = Deco(Factory1, function xyz () {});
    /* eslint-enable prefer-arrow-callback */
    Factory2();
    done();
  });
});

'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const loadSafeBlueprint = require('../../src/load-safe-blueprint');

describe(loadSafeBlueprint, function() {
  it('works', async function() {
    let blueprint = loadSafeBlueprint({
      foo: 'bar'
    });

    expect(blueprint).to.deep.equal({
      foo: 'bar',
      options: []
    });
  });
});

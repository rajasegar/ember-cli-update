'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const checkForBlueprintUpdates = require('../../src/check-for-blueprint-updates');
const { initBlueprint } = require('../helpers/blueprint');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');
const { promisify } = require('util');
const tmpDir = promisify(require('tmp').dir);

describe(checkForBlueprintUpdates, function() {
  this.timeout(60 * 1000);

  let tmpPath;

  beforeEach(async function() {
    tmpPath = await tmpDir();
  });

  it('works', async function() {
    // out of date test
    let localBlueprint = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/local/my-app')).blueprints[1];
    let urlBlueprint = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/remote-app/local/my-app')).blueprints[0];

    // up to date test
    let npmBlueprint = (await loadSafeBlueprintFile('test/fixtures/blueprint/app/npm-app/merge/my-app')).blueprints[0];

    await initBlueprint({
      fixturesPath: 'test/fixtures/blueprint/app/local',
      resolvedFrom: tmpPath,
      relativeDir: localBlueprint.location
    });

    let blueprintUpdates = await checkForBlueprintUpdates({
      cwd: tmpPath,
      blueprints: [
        localBlueprint,
        urlBlueprint,
        npmBlueprint
      ]
    });

    expect(blueprintUpdates).to.deep.equal([
      {
        packageName: localBlueprint.packageName,
        name: localBlueprint.name,
        currentVersion: localBlueprint.version,
        latestVersion: (await loadSafeBlueprintFile('test/fixtures/blueprint/app/local-app/merge/my-app')).blueprints[1].version,
        isUpToDate: false
      },
      {
        packageName: urlBlueprint.packageName,
        name: urlBlueprint.name,
        currentVersion: urlBlueprint.version,
        latestVersion: (await loadSafeBlueprintFile('test/fixtures/blueprint/app/remote-app/merge/my-app')).blueprints[0].version,
        isUpToDate: false
      },
      {
        packageName: npmBlueprint.packageName,
        name: npmBlueprint.name,
        currentVersion: npmBlueprint.version,
        latestVersion: npmBlueprint.version,
        isUpToDate: true
      }
    ]);
  });
});

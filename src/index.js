'use strict';

const co = require('co');
const fs = require('fs-extra');
const utils = require('./utils');
const run = require('./run');
const getProjectOptions = require('./get-project-options');
const getPackageName = require('./get-package-name');
const getPackageVersion = require('./get-package-version');
const getProjectVersion = require('./get-project-version');
const _getTagVersion = require('./get-tag-version');
const getRemoteUrl = require('./get-remote-url');
const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const inquirer = require('inquirer');

module.exports = co.wrap(function* emberCliUpdate({
  from,
  to,
  resolveConflicts,
  runCodemods,
  reset,
  compareOnly,
  statsOnly,
  listCodemods,
  createCustomDiff,
  wasRunAsExecutable
}) {
  let emberCliUpdateJson;
  try {
    emberCliUpdateJson = yield fs.readJson('ember-cli-update.json');
  } catch (err) {
    // do nothing
  }

  let ignoredFiles = [];

  let blueprints;
  if (emberCliUpdateJson) {
    ignoredFiles.push('ember-cli-update.json');

    blueprints = emberCliUpdateJson.blueprints;
  } else {
    blueprints = [];
  }

  let defaultBlueprint = {
    name: 'default-blueprint'
  };

  let completeBlueprints = blueprints.filter(blueprint => !blueprint.isPartial);
  if (!completeBlueprints.length) {
    blueprints.splice(0, 0, defaultBlueprint);
  }

  let blueprint;
  if (blueprints.length > 1) {
    let answers = yield inquirer.prompt([{
      type: 'list',
      message: 'Multiple blueprint updates have been found. Which would you like to update?',
      name: 'blueprint',
      choices: blueprints.map(blueprint => blueprint.name)
    }]);

    blueprint = blueprints.find(blueprint => blueprint.name === answers.blueprint);
  } else {
    blueprint = blueprints[0];
  }

  if (blueprint !== defaultBlueprint) {
    createCustomDiff = true;
  }

  let endVersion;

  let result = yield (yield boilerplateUpdate({
    projectOptions: ({ packageJson }) => getProjectOptions(packageJson, blueprint),
    mergeOptions: co.wrap(function* mergeOptions({
      packageJson,
      projectOptions
    }) {
      let packageName;
      let packageVersion;
      let versions;
      let blueprintLocation;

      if (blueprint !== defaultBlueprint) {
        packageName = blueprint.name;
        blueprintLocation = blueprint.location;
        packageVersion = blueprint.version;
      } else {
        packageName = getPackageName(projectOptions);
        packageVersion = getPackageVersion(packageJson, packageName);
      }

      if (!blueprintLocation) {
        versions = yield utils.getVersions(packageName);
      }

      let getTagVersion = _getTagVersion(versions, packageName, blueprintLocation);

      let startVersion;
      if (from) {
        startVersion = yield getTagVersion(from);
      } else if (blueprint !== defaultBlueprint) {
        startVersion = packageVersion;
      } else {
        startVersion = getProjectVersion(packageVersion, versions, projectOptions);
      }

      endVersion = yield getTagVersion(to);

      let customDiffOptions;
      if (createCustomDiff) {
        customDiffOptions = getStartAndEndCommands({
          packageJson,
          projectOptions,
          startVersion,
          endVersion,
          blueprint
        });
      }

      return {
        startVersion,
        endVersion,
        customDiffOptions
      };
    }),
    remoteUrl: ({ projectOptions }) => getRemoteUrl(projectOptions),
    compareOnly,
    resolveConflicts,
    reset,
    statsOnly,
    listCodemods,
    runCodemods,
    codemodsUrl: 'https://raw.githubusercontent.com/ember-cli/ember-cli-update-codemods-manifest/v3/manifest.json',
    createCustomDiff,
    ignoredFiles,
    wasRunAsExecutable
  })).promise;

  if (blueprint !== defaultBlueprint) {
    emberCliUpdateJson = yield fs.readJson('ember-cli-update.json');
    blueprints = emberCliUpdateJson.blueprints;
    blueprint = blueprints.find(b => b.name === blueprint.name);

    if (blueprint.version !== endVersion) {
      blueprint.version = endVersion;
      yield fs.writeJSON('ember-cli-update.json', emberCliUpdateJson, {
        spaces: 2,
        EOL: require('os').EOL
      });
      run('git add ember-cli-update.json');
    }
  }

  return result;
});

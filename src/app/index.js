const Jimple = require('jimple');
const appPackage = require('../../package.json');

const {
  environmentUtils,
  errorHandler,
  appLogger,
  packageInfo,
  pathUtils,
} = require('wootils/node/providers');

const {
  cliWithName,
  cliSHRunCommand,
  cliSHValidateCommand,
} = require('../services/cli');

const {
  runnerFile,
  runner,
  targets,
} = require('../services/runner');

const { asPlugin } = require('../services/utils');

class WoopackRunner extends Jimple {
  constructor() {
    super();

    this.set('info', () => appPackage);

    this.register(environmentUtils);
    this.register(errorHandler);
    this.register(appLogger);
    this.register(packageInfo);
    this.register(pathUtils);

    this.register(cliWithName(appPackage.cliName));
    this.register(cliSHRunCommand);
    this.register(cliSHValidateCommand);

    this.register(runnerFile);
    this.register(runner);
    this.register(targets);

    this.register(asPlugin);
  }

  plugin(woopack) {
    const events = woopack.get('events');
    events.once('build-target-commands-list', (commands, target) => {
      const projectConfiguration = woopack.get('projectConfiguration').getConfig();
      const versionUtils = woopack.get('versionUtils');

      const {
        version: {
          revisionFilename,
        },
        paths: {
          build,
        },
      } = projectConfiguration;
      const version = versionUtils.getVersion(revisionFilename);

      this.get('runnerFile').update(target, version, build);
      return commands;
    });
  }

  cli() {
    this.get('cli').start([
      this.get('cliSHRunCommand'),
      this.get('cliSHValidateCommand'),
    ]);
  }
}

module.exports = { WoopackRunner };
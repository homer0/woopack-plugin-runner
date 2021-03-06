const path = require('path');
const extend = require('extend');
const fs = require('fs-extra');
const { provider } = require('jimple');
/**
 * This service is in charge of creating, validating and updating the runner file this plugin
 * uses to store the information about the builded targets and how to execute them.
 */
class RunnerFile {
  /**
   * Class constructor.
   * @param {Object}    info      The plugin `package.json` information, to use the plugin version
   *                              on the file.
   * @param {PathUtils} pathUtils To build the paths to the file.
   */
  constructor(info, pathUtils) {
    /**
     * The name of the runner file.
     * @type {string}
     */
    this.filename = 'projextrunner.json';
    /**
     * The path to the runner file.
     * @type {string}
     */
    this.filepath = pathUtils.join(this.filename);
    /**
     * The file default template.
     * @type {RunnerFileContents}
     */
    this.fileTemplate = {
      runnerVersion: info.version,
      version: 'development',
      directory: '',
      targets: {},
    };
  }
  /**
   * Set the name of the runner file.
   * @param {string} newName The new name.
   * @todo Update the `filepath`
   */
  setFilename(newName) {
    this.filename = newName;
  }
  /**
   * Get the name of the runner file.
   * @return {string}
   */
  getFilename() {
    return this.filename;
  }
  /**
   * Checks whether the file exists or not.
   * @return {boolean}
   */
  exists() {
    return fs.pathExistsSync(this.filepath);
  }
  /**
   * Updates the runner file with a new build information.
   * @param {Target} target    The target information.
   * @param {string} version   The project version.
   * @param {string} directory The project distribution directory.
   * @return {?Target} If the target type was `node`, it will return the information saved on the
   *                   file, otherwise, it will return `null`.
   */
  update(target, version, directory) {
    let result = null;
    if (target.is.node) {
      const file = this.read();
      file.version = version;
      file.directory = directory;

      let targetPath = '';
      const { build } = target.folders;
      if (build === directory) {
        targetPath = './';
      } else {
        // +1 to replace the leading `/`
        targetPath = build.substr(directory.length + 1);
      }

      const targetExec = target.bundle ?
        target.output.production.js :
        target.entry.production;
      const targetExecPath = path.join(targetPath, targetExec);

      result = {
        name: target.name,
        path: targetExecPath,
        options: target.runnerOptions || {},
      };

      file.targets[target.name] = result;

      fs.writeJsonSync(this.filepath, file);
    }

    return result;
  }
  /**
   * Updates the runner file with a new version of the project.
   * @param {string} version The project version.
   */
  updateVersion(version) {
    const file = this.read();
    file.version = version;
    return fs.writeJsonSync(this.filepath, file);
  }
  /**
   * Read the contents of the runner file. If the file doesn't exist, it will create it with
   * the default template (`this.fileTemplate`).
   * @return {RunnerFileContents}
   */
  read() {
    let result;
    if (this.exists()) {
      result = fs.readJsonSync(this.filepath);
    } else {
      result = extend(true, {}, this.fileTemplate);
    }

    return result;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `RunnerFile` as the `runnerFile` service.
 * @example
 * // Register it on the container
 * container.register(runnerFile);
 * // Getting access to the service instance
 * const runnerFile = container.get('runnerFile');
 * @type {Provider}
 */
const runnerFile = provider((app) => {
  app.set('runnerFile', () => new RunnerFile(
    app.get('info'),
    app.get('pathUtils')
  ));
});

module.exports = {
  RunnerFile,
  runnerFile,
};

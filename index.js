const _ = require('lodash');
const dwell = require('dwell');
const path = require('path');

class Ioc {
  /**
   *
   * @param config
   */
  constructor (config = {}) {
    this.appPath = config.appPath;

    this.classes = new Map();
    this.objects = new Map();
    this.aliases = new Map();

    _.map(config.aliases, (className, aliasName) => {
      this.aliases.set(aliasName, className);
    });
    _.map(config.classes, (classInstance, classKey) => {
      this.classes.set(classKey, classInstance);
    });
    _.map(config.objects, (objectInstance, objectKey) => {
      this.objects.set(objectKey, objectInstance);
    });
  }

  /**
   * Only for registered classes works like factory
   * You can define own factory and dependencies
   * All dependencies should go to object trough constructor
   *
   * @param libName
   * @param dependencies
   * @param injector
   * @returns {*}
   */
  make (libName, dependencies = [], injector = false) {
    if (!this.classes.has(libName)) {
      throw new Error(`Class ${libName} is not registered`);
    }

    let newLib = this.classes.get(libName);

    if (!_.isEmpty(dependencies) && injector === false) {
      return this.injector(newLib, dependencies);
    }

    if (!_.isEmpty(dependencies) && _.isFunction(injector)) {
      return injector(dependencies);
    }

    return this._makeNewLib(newLib);
  }

  /**
   * Return lib if not exist, create and register to reuse it
   *
   * @param libName
   * @returns {Object}
   */
  get (libName) {
    if (this.objects.has(libName)) {
      return this.objects.get(libName);
    }

    let NewLib = this._autoload(libName);

    let dependencies = _.map(dwell.inspect(NewLib), (injection) => this.get(injection));

    return new NewLib(...dependencies);
  }

  /**
   *
   * @param libName
   * @param fn
   * @returns {Ioc}
   */
  register (libName, fn) {
    // If function or class - set to classes
    if (_.isFunction(fn)) {
      this.classes.set(libName, fn);
      return this;
    }

    // If object/string/array - set to objects
    this.objects.set(libName, fn);
    return this;
  }

  /**
   *
   * @param NewLib
   * @param dependencies
   * @returns {*}
   */
  static injector (NewLib, dependencies) {
    return new NewLib(...dependencies);
  }

  /**
   * Always returns new lib without registration in the container
   * All dependencies are registered in the container and reused
   *
   * @param newLib
   * @returns {*}
   * @private
   */
  _makeNewLib (newLib) {
    let dependencies = _.map(dwell.inspect(newLib), (injection) => this.get(injection));

    return this.injector(newLib, dependencies);
  };

  /**
   * All classes are registered in the container to reuse
   *
   * @param libName
   * @returns {Function}
   * @private
   */
  _autoload (libName) {
    libName = this._filterLibName(libName);

    try {
      // Try load registered library or core library
      if (this.classes.has(libName)) {
        return this.classes.get(libName);
      }

      this.classes.set(libName, require(libName));
    } catch (e) {
      // Try load app library
      this.classes.set(libName, this._autoloadAppLibrary(libName));
    }

    return this.classes.get(libName);
  }

  /**
   *
   * @param libName
   * @returns {any|*}
   * @private
   */
  _autoloadAppLibrary (libName) {
    libName = this._filterLibName(libName);

    let libPath = path.resolve(this.appPath, libName.replace(/([a-zA-Z])(?=[A-Z])/g, '$1/'));
    try {
      return require(libPath);
    } catch (e) {
      throw new Error(`${libName} could not be loaded from ${libPath}`);
    }
  };

  /**
   *
   * @param libName
   * @returns {string}
   * @private
   */
  _filterLibName (libName) {
    return (this.aliases.has(libName)) ? this.aliases.get(libName) : libName;
  }
}

module.exports = Ioc;

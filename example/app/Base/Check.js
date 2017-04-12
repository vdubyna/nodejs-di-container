/**
 * @class BaseCheck
 */
class BaseCheck {

  constructor (BaseTest, _, bt) {
    this.baseTest = BaseTest;
    this.bt = bt;
    _.map(this, console.log);

    return this;
  }

  allCorrect () {
    return 'hello';
  }
}

module.exports = BaseCheck;

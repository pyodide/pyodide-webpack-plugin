const shared = require("./shared");
const _ = require("lodash");

module.exports = _.merge({}, shared.config, {
  plugins: [new shared.PyodidePlugin()],
});

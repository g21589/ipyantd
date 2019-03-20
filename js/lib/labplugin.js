var ipyantd = require('./index');
var base = require('@jupyter-widgets/base');

module.exports = {
  id: 'ipyantd',
  requires: [base.IJupyterWidgetRegistry],
  activate: function(app, widgets) {
      widgets.registerWidget({
          name: 'ipyantd',
          version: ipyantd.version,
          exports: ipyantd
      });
  },
  autoStart: true
};


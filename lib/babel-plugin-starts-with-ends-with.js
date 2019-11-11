"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      CallExpression: function CallExpression(path) {

        var callee = path.node.callee;

        if (t.isMemberExpression(callee, { computed: false }) && t.isIdentifier(callee.property, { name: "startsWith" })) {

          callee.property.name = 'indexOf';

          path.replaceWith(t.binaryExpression("===", path.node, t.numericLiteral(0)));
        }

        if (t.isMemberExpression(callee, { computed: false }) && t.isIdentifier(callee.property, { name: "endsWith" })) {
          var args = path.node.arguments;

          callee.property.name = 'slice';

          path.replaceWith(t.binaryExpression("===", path.node, args[0]));

          args[0] = t.unaryExpression("-", t.memberExpression(args[0], t.identifier('length')));
        }
      }
    }
  };
};
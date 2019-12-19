"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.includes");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.join");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.number.constructor");

require("core-js/modules/es.number.is-nan");

require("core-js/modules/es.number.parse-float");

require("core-js/modules/es.object.entries");

require("core-js/modules/es.object.keys");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.object.values");

require("core-js/modules/es.regexp.constructor");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.set");

require("core-js/modules/es.string.ends-with");

require("core-js/modules/es.string.includes");

require("core-js/modules/es.string.iterator");

require("core-js/modules/es.string.match");

require("core-js/modules/es.string.replace");

require("core-js/modules/es.string.split");

require("core-js/modules/es.string.starts-with");

require("core-js/modules/es.string.trim");

require("core-js/modules/esnext.set.add-all");

require("core-js/modules/esnext.set.delete-all");

require("core-js/modules/esnext.set.difference");

require("core-js/modules/esnext.set.every");

require("core-js/modules/esnext.set.filter");

require("core-js/modules/esnext.set.find");

require("core-js/modules/esnext.set.intersection");

require("core-js/modules/esnext.set.is-disjoint-from");

require("core-js/modules/esnext.set.is-subset-of");

require("core-js/modules/esnext.set.is-superset-of");

require("core-js/modules/esnext.set.join");

require("core-js/modules/esnext.set.map");

require("core-js/modules/esnext.set.reduce");

require("core-js/modules/esnext.set.some");

require("core-js/modules/esnext.set.symmetric-difference");

require("core-js/modules/esnext.set.union");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var toUniversal = function toUniversal(v) {
  if (v === null || v === undefined || v === 0) return '';
  if (typeof v === 'number') return v.toString();
  if ((0, _typeof2.default)(v) === 'object') return JSON.stringify(v);
  return v;
};

var compTypes = {
  '=': function _(a, b) {
    return a === b;
  },
  '!=': function _(a, b) {
    return a !== b;
  },
  '>': function _(a, b) {
    return a > b;
  },
  '<': function _(a, b) {
    return a < b;
  },
  '>=': function _(a, b) {
    return a >= b;
  },
  '<=': function _(a, b) {
    return a <= b;
  },
  '~': function _(a, b) {
    return toUniversal(a) === toUniversal(b);
  },
  'E': function E(a, b) {
    return b ? b.includes(a) : false;
  },
  'C': function C(a, b) {
    return b ? b.test(a) : false;
  },
  '!E': function E(a, b) {
    return b ? !b.includes(a) : true;
  },
  '!C': function C(a, b) {
    return b ? !b.test(a) : true;
  }
};

var getStringOrRxValue = function getStringOrRxValue(_p, s) {
  if (_p.startsWith("'") && _p.endsWith("'")) return s ? s[_p].toString() : _p.slice(1, -1);
  if (_p.startsWith("/") && _p.endsWith("/")) return new RegExp(s ? s[_p].toString() : _p.slice(1, -1));
  return false;
};

var condTypes = {
  1: function _(m, _ref) {
    var _ref2 = (0, _slicedToArray2.default)(_ref, 1),
        _a = _ref2[0];

    return _a.startsWith('!') ? !m[_a.slice(1)] : m[_a];
  },
  2: function _(m, _ref3, s) {
    var _ref4 = (0, _slicedToArray2.default)(_ref3, 2),
        _a = _ref4[0],
        _b = _ref4[1];

    return condTypes[3](m, [_a, null, _b], s);
  },
  //blind operation
  3: function _(m, _ref5, s) {
    var _ref6 = (0, _slicedToArray2.default)(_ref5, 3),
        _a = _ref6[0],
        b = _ref6[1],
        _c = _ref6[2];

    var a = getStringOrRxValue(_a, s),
        c = getStringOrRxValue(_c, s);
    var aStr = false,
        cStr = false;

    if (!m) {
      return true;
    }

    if (a === false) {
      var pf = Number.parseFloat(_a);
      if (!Number.isNaN(pf)) a = pf;else a = m[_a];
    } else aStr = "'".concat(a, "'");

    if (c === false) {
      var _pf = Number.parseFloat(_c);

      if (!Number.isNaN(_pf)) c = _pf;else c = m[_c];
    } else cStr = "'".concat(c, "'");

    if (!b) {
      if (c instanceof RegExp && typeof a === 'string') b = 'C';else if (Array.isArray(c)) b = 'E';else b = '=';
    }

    var operator = compTypes[b];
    if (operator) return operator(a, c);else throw "Unknown operator \"".concat(b, "\" in condition \"").concat(aStr !== false ? aStr : _a, " ").concat(b, " ").concat(cStr !== false ? cStr : _c, "\"");
  }
};

var getStringOrRx = function getStringOrRx(cond) {
  var stringsAndRxs = {};
  var condStrings = cond.split("'");
  cond = [];

  for (var i = 0; i < condStrings.length; i++) {
    if (i % 2) {
      cond.push(i);
      stringsAndRxs["'".concat(i, "'")] = condStrings[i];
    } else cond.push(condStrings[i]);
  }

  var condRegExps = cond.join("'").split("/");
  cond = [];

  for (var _i = 0; _i < condRegExps.length; _i++) {
    if (_i % 2) {
      cond.push(_i);
      stringsAndRxs["/".concat(_i, "/")] = condRegExps[_i];
    } else cond.push(condRegExps[_i]);
  }

  return [cond.join("/"), stringsAndRxs];
};

var parseLogicalExp = function parseLogicalExp(cond, model) {
  if (!model) return true;
  cond = cond.trim();
  var total = false;
  var condStrings;

  var _getStringOrRx = getStringOrRx(cond);

  var _getStringOrRx2 = (0, _slicedToArray2.default)(_getStringOrRx, 2);

  cond = _getStringOrRx2[0];
  condStrings = _getStringOrRx2[1];
  if (cond.includes('||')) throw "Unknown operator \"||\", maybe you mean \"or\" operator: \"|\" ?";
  if (cond.includes('&&')) throw "Unknown operator \"&&\", maybe you mean \"and\" operator: \"&\" ?";
  var ors = cond.split(' | ');
  ors.forEach(function (or) {
    var local = true;
    var ands = or.split(' & ');
    ands.forEach(function (and) {
      cond = and.replace(/ +/g, ' ').split(' ');
      var method = condTypes[cond.length];
      if (typeof method !== 'function') throw "Unknown condition type \"".concat(cond.join(' '), "\"");
      var result = method(model, cond, condStrings);
      local = local && result;
    });
    total = total || local;
  });
  return total;
};

var getShadowPath = function getShadowPath(shadowPath) {
  for (var _len = arguments.length, itemKeys = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    itemKeys[_key - 1] = arguments[_key];
  }

  return itemKeys.reduce(function (r, itemKey) {
    return r + '/' + itemKey.replace(/\\/g, '\\\\').replace(/\//g, '\\/');
  }, shadowPath);
};

var escape = function escape(key) {
  return key.replace(/\\([\\\[])/g, function (tokens) {
    return tokens[1];
  });
};

var spread = function spread(parsedItem, newNode, shadowPath, shadowIndex) {
  if ((0, _typeof2.default)(parsedItem) !== 'object' || Array.isArray(parsedItem)) return false;

  for (var _i2 = 0, _Object$entries = Object.entries(parsedItem); _i2 < _Object$entries.length; _i2++) {
    var _Object$entries$_i = (0, _slicedToArray2.default)(_Object$entries[_i2], 2),
        key = _Object$entries$_i[0],
        value = _Object$entries$_i[1];

    if (key.endsWith(' [*...]') || key.endsWith(' [~...]') && (0, _typeof2.default)(value) === 'object') {
      var realKey = key.slice(0, -' [*...]'.length);

      if (Array.isArray(value)) {
        if (key.endsWith(' [~...]') && newNode[realKey]) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = value[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var item = _step.value;
              if (!newNode[realKey].includes(item)) newNode[realKey].push(item);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        } else newNode[realKey] = [].concat((0, _toConsumableArray2.default)(newNode[realKey] || []), (0, _toConsumableArray2.default)(value));
      } else {
        for (var _i3 = 0, _Object$keys = Object.keys(value); _i3 < _Object$keys.length; _i3++) {
          var subKey = _Object$keys[_i3];
          var itemShadowPath = getShadowPath(shadowPath, realKey, subKey);
          var shadowItem = shadowIndex[itemShadowPath];
          if (!shadowItem || !shadowItem.important) newNode[realKey][subKey] = value[subKey];
        }
      }
    } else {
      var _itemShadowPath = getShadowPath(shadowPath, key);

      var _shadowItem = shadowIndex[_itemShadowPath];
      if (!_shadowItem || !_shadowItem.important) newNode[key] = value;
    }
  }

  return true;
};

var parseItem = function parseItem(node, model) {
  var shadowPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  var shadowIndex = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  if (!node || (0, _typeof2.default)(node) !== 'object') return node;
  if (Array.isArray(node)) return node.map(function (item) {
    return parseItem(item, model, shadowPath, shadowIndex);
  });
  var newNode = {};
  var keys = Object.keys(node);
  var deferredParsers = [];

  for (var _i4 = 0, _keys = keys; _i4 < _keys.length; _i4++) {
    var key = _keys[_i4];

    if (key.endsWith(']')) {
      var pureIF = key.startsWith('[IF ');
      var spreadIF = key.startsWith('[...IF ');

      if (key.includes(' [IF ') || pureIF || spreadIF) {
        var newKey = key,
            cond = void 0;
        if (pureIF) cond = key.slice('[IF '.length, -1);else if (spreadIF) cond = key.slice('[...IF '.length, -1);else {
          var tmpKey = key.slice(0, -1);
          var pos = tmpKey.lastIndexOf(' [IF ');
          newKey = tmpKey.substring(0, pos);
          cond = tmpKey.substring(pos + ' [IF '.length);
        }
        newKey = newKey.trim();
        var isTrue = parseLogicalExp(cond, model);

        if (isTrue) {
          (function () {
            var parsedItem = parseItem(node[key], model, getShadowPath(shadowPath, newKey), shadowIndex);

            if (spreadIF && (0, _typeof2.default)(parsedItem) === 'object' && !Array.isArray(parsedItem)) {
              deferredParsers.push(function () {
                return spread(parsedItem, newNode, shadowPath, shadowIndex);
              });
            } else newNode[newKey] = parsedItem;
          })();
        }

        continue;
      }

      var arrayBY = key.includes(' [*BY ');
      var spreadBY = key.startsWith('[...BY ');

      if (key.includes(' [BY ') || spreadBY || arrayBY) {
        var _newKey = key,
            caseline = void 0;
        if (spreadBY) caseline = key.slice('[...BY '.length, -1);else if (arrayBY) {
          var _key$slice$split = key.slice(0, -1).split(' [*BY ');

          var _key$slice$split2 = (0, _slicedToArray2.default)(_key$slice$split, 2);

          _newKey = _key$slice$split2[0];
          caseline = _key$slice$split2[1];
        } else {
          var _tmpKey = key.slice(0, -1);

          var _pos = _tmpKey.lastIndexOf(' [BY ');

          _newKey = _tmpKey.substring(0, _pos);
          caseline = _tmpKey.substring(_pos + ' [BY '.length);
        }
        _newKey = _newKey.trim();
        caseline = caseline.trim();
        caseline = caseline.split(', ');
        var selectedCase = node[key];
        var selectedCases = [];

        if (arrayBY) {
          var casevalue = parseLogicalExp(caseline[0].trim(), model);

          if (casevalue instanceof RegExp) {
            for (var _i6 = 0, _Object$entries2 = Object.entries(selectedCase); _i6 < _Object$entries2.length; _i6++) {
              var _Object$entries2$_i = (0, _slicedToArray2.default)(_Object$entries2[_i6], 2),
                  caseKey = _Object$entries2$_i[0],
                  value = _Object$entries2$_i[1];

              if (casevalue.test(caseKey)) selectedCases.push(value);
            }
          } else if (Array.isArray(casevalue)) {
            for (var _i7 = 0, _Object$entries3 = Object.entries(selectedCase); _i7 < _Object$entries3.length; _i7++) {
              var _Object$entries3$_i = (0, _slicedToArray2.default)(_Object$entries3[_i7], 2),
                  _caseKey = _Object$entries3$_i[0],
                  _value = _Object$entries3$_i[1];

              if (casevalue.includes(_caseKey)) selectedCases.push(_value);
            }
          }
        } else {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = caseline[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var casename = _step2.value;

              var _casevalue = parseLogicalExp(casename.trim(), model);

              if (spreadBY && caseline.length === 1) {
                if (_casevalue instanceof RegExp) {
                  for (var _i8 = 0, _Object$entries4 = Object.entries(selectedCase); _i8 < _Object$entries4.length; _i8++) {
                    var _Object$entries4$_i = (0, _slicedToArray2.default)(_Object$entries4[_i8], 2),
                        _caseKey2 = _Object$entries4$_i[0],
                        _value2 = _Object$entries4$_i[1];

                    if (_casevalue.test(_caseKey2)) selectedCases.push(_value2);
                  }
                } else if (Array.isArray(_casevalue)) {
                  for (var _i9 = 0, _Object$entries5 = Object.entries(selectedCase); _i9 < _Object$entries5.length; _i9++) {
                    var _Object$entries5$_i = (0, _slicedToArray2.default)(_Object$entries5[_i9], 2),
                        _caseKey3 = _Object$entries5$_i[0],
                        _value3 = _Object$entries5$_i[1];

                    if (_casevalue.includes(_caseKey3)) selectedCases.push(_value3);
                  }
                }
              }

              if (typeof _casevalue === 'boolean' || _casevalue === null || _casevalue === undefined) {
                _casevalue = _casevalue ? '#TRUE' : '#FALSE';
              }

              if (selectedCase) selectedCase = Object.keys(selectedCase).includes(_casevalue) ? selectedCase[_casevalue] : selectedCase['#DEFAULT'];
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }

        if (spreadBY && selectedCases.length > 0) {
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = selectedCases[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var sc = _step3.value;
              var parsedItem = parseItem(sc, model, getShadowPath(shadowPath, _newKey), shadowIndex);
              if (spreadBY) spread(parsedItem, newNode, shadowPath, shadowIndex);else newNode[_newKey] = parsedItem;
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
        } else {
          if (arrayBY && selectedCases.length > 0) selectedCase = selectedCases;

          if (selectedCase !== undefined) {
            var _parsedItem = parseItem(selectedCase, model, getShadowPath(shadowPath, _newKey), shadowIndex);

            if (spreadBY) spread(_parsedItem, newNode, shadowPath, shadowIndex);else newNode[_newKey] = _parsedItem;
          }
        }

        continue;
      }

      if (key.endsWith(" [AS ARRAY]")) {
        var _newKey2 = key.slice(0, -' [AS ARRAY]'.length);

        var obj = parseItem(node[key], model, getShadowPath(shadowPath, _newKey2), shadowIndex);
        var arr = [];

        for (var _i10 = 0, _Object$entries6 = Object.entries(obj); _i10 < _Object$entries6.length; _i10++) {
          var _Object$entries6$_i = (0, _slicedToArray2.default)(_Object$entries6[_i10], 2),
              _cond = _Object$entries6$_i[0],
              v = _Object$entries6$_i[1];

          if ((_cond.startsWith('[...IF ') || _cond === '[...]') && Array.isArray(v)) arr = [].concat((0, _toConsumableArray2.default)(arr), (0, _toConsumableArray2.default)(v));else arr.push(v);
        }

        newNode[_newKey2] = arr;
        continue;
      }

      if (key.endsWith(' [FROM]')) {
        var _newKey3 = key.slice(0, -' [FROM]'.length).trim();

        newNode[_newKey3] = node[key] === '@' ? model : model[node[key]];
        continue;
      }

      if (key === '[...FROM]') {
        var _ret = function () {
          var obj = node[key] === '@' ? model : model[node[key]];

          if ((0, _typeof2.default)(obj) === 'object' && !Array.isArray(obj)) {
            deferredParsers.push(function () {
              for (var _i11 = 0, _Object$entries7 = Object.entries(obj); _i11 < _Object$entries7.length; _i11++) {
                var _Object$entries7$_i = (0, _slicedToArray2.default)(_Object$entries7[_i11], 2),
                    k = _Object$entries7$_i[0],
                    _v = _Object$entries7$_i[1];

                var itemShadowPath = getShadowPath(shadowPath, k);
                var shadowItem = shadowIndex[itemShadowPath];
                if (!shadowItem || !shadowItem.important) newNode[k] = _v;
              }
            });
          }

          return "continue";
        }();

        if (_ret === "continue") continue;
      }

      if (key.endsWith(' [!]')) {
        var _newKey4 = key.slice(0, -' [!]'.length).trim();

        var itemShadowPath = getShadowPath(shadowPath, _newKey4);
        newNode[_newKey4] = parseItem(node[key], model, itemShadowPath, shadowIndex);
        shadowIndex[itemShadowPath] = {
          important: true
        };
        continue;
      }
    }

    var escapedKey = escape(key);
    newNode[escapedKey] = parseItem(node[key], model, getShadowPath(shadowPath, key), shadowIndex);
  }

  for (var _i5 = 0, _deferredParsers = deferredParsers; _i5 < _deferredParsers.length; _i5++) {
    var prc = _deferredParsers[_i5];
    prc();
  }

  return newNode;
};

var Jsoncode =
/*#__PURE__*/
function () {
  function Jsoncode(src) {
    (0, _classCallCheck2.default)(this, Jsoncode);
    this._source = src;
  }

  (0, _createClass2.default)(Jsoncode, [{
    key: "specify",
    value: function specify(model) {
      return parseItem(this._source, model);
    }
  }, {
    key: "_getAll",
    value: function _getAll(rx, propname) {
      var keys = Jsoncode._selectKeysOfNode(rx, this._source);

      var result = new Set();
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = keys[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var key = _step4.value;

          if (['IF', '...IF'].includes(key.operator)) {
            var _getStringOrRx3 = getStringOrRx(key.condition),
                _getStringOrRx4 = (0, _slicedToArray2.default)(_getStringOrRx3, 2),
                condition = _getStringOrRx4[0],
                strings = _getStringOrRx4[1];

            condition = condition.split(/ \| | & /);
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
              for (var _iterator5 = condition[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var exp = _step5.value;
                if (exp.includes(' ')) Jsoncode._parseBinaryExp(exp, strings, propname).forEach(function (p) {
                  return result.add(p);
                });else if (propname) {
                  if (exp.startsWith('!')) exp = exp.slice(1);

                  if (propname === exp) {
                    result.add(true);
                    result.add(false);
                  }
                } else {
                  result.add(exp.startsWith('!') ? exp.slice(1) : exp);
                }
              }
            } catch (err) {
              _didIteratorError5 = true;
              _iteratorError5 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
                  _iterator5.return();
                }
              } finally {
                if (_didIteratorError5) {
                  throw _iteratorError5;
                }
              }
            }
          } else if (['BY', '*BY', '...BY'].includes(key.operator)) {
            var _getStringOrRx5 = getStringOrRx(key.condition),
                _getStringOrRx6 = (0, _slicedToArray2.default)(_getStringOrRx5, 2),
                _condition = _getStringOrRx6[0],
                _strings = _getStringOrRx6[1];

            var conditions = _condition.split(',').map(function (exp) {
              return exp.trim();
            });

            var targetCondition = null;
            var targetNodes = [key.value];

            while (!targetCondition && conditions.length > 0) {
              var _exp = conditions.shift();

              if (_exp.includes(' ')) {
                var r = Jsoncode._parseBinaryExp(_exp, _strings, propname);

                if (r.length > 0) {
                  if (propname) targetCondition = true;
                  r.forEach(function (p) {
                    return result.add(p);
                  });
                }
              } else if (propname) {
                if (_exp.startsWith('!')) _exp = _exp.slice(1);

                if (_exp === propname) {
                  targetNodes.forEach(function (node) {
                    return Object.keys(node).forEach(function (key) {
                      if (key === '#TRUE') key = true;else if (key === '#FALSE') key = false;
                      if (key !== '#DEFAULT') result.add(key);
                    });
                  });
                  targetCondition = true;
                } else {
                  targetNodes = targetNodes.reduce(function (newNodes, node) {
                    return [].concat((0, _toConsumableArray2.default)(newNodes), (0, _toConsumableArray2.default)(Object.values(node)));
                  }, []);
                }
              } else result.add(_exp.startsWith('!') ? _exp.slice(1) : _exp);
            }
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return Array.from(result);
    }
  }, {
    key: "getParams",
    value: function getParams() {
      return this._getAll(new RegExp(".*\\[(IF|BY|\\*BY|\\.\\.\\.IF|\\.\\.\\.BY) ([^\\]]+)]"));
    }
  }, {
    key: "getValuesOf",
    value: function getValuesOf(propname) {
      if (!propname || typeof propname !== 'string') throw Error('"getValuesOf" : propname is not string!');
      return this._getAll(new RegExp(".*\\[(IF|BY|\\*BY|\\.\\.\\.IF|\\.\\.\\.BY) ([^\\]]*".concat(propname, "[^\\]]*)]")), propname);
    }
  }, {
    key: "source",
    get: function get() {
      return this._source;
    }
  }], [{
    key: "_selectKeysOfNode",
    value: function _selectKeysOfNode(rx, node, keys) {
      keys = keys || [];

      if (Array.isArray(node)) {
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = node[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var value = _step6.value;

            Jsoncode._selectKeysOfNode(rx, value, keys);
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      } else {
        for (var _i12 = 0, _Object$entries8 = Object.entries(node); _i12 < _Object$entries8.length; _i12++) {
          var _Object$entries8$_i = (0, _slicedToArray2.default)(_Object$entries8[_i12], 2),
              key = _Object$entries8$_i[0],
              _value4 = _Object$entries8$_i[1];

          var result = key.match(rx);

          if (result) {
            keys.push({
              operator: result[1],
              condition: result[2].trim(),
              value: _value4
            });
          }

          if (_value4 && (0, _typeof2.default)(_value4) === 'object') Jsoncode._selectKeysOfNode(rx, _value4, keys);
        }
      }

      return keys;
    }
  }, {
    key: "_parseBinaryExp",
    value: function _parseBinaryExp(exp, strings, propname) {
      exp = exp.trim().replace(/ +/g, ' ').split(' ');
      if (exp.length === 3) exp = [exp[0], exp[2]];
      var params = [];
      var values = [];
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = exp[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var token = _step7.value;
          var value = undefined;
          if (token.startsWith("'")) value = strings[token];else if (token.startsWith("/")) value = new RegExp(strings[token]);else {
            var pf = Number.parseFloat(token);
            if (!Number.isNaN(pf)) value = pf;
          }
          if (value) values.push(value);else params.push(token);
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      if (propname) {
        if (params.includes(propname)) return values;else [];
      } else return params;
    }
  }]);
  return Jsoncode;
}();

var jsoncode = function jsoncode(src) {
  var model = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  if (model) return parseItem(src, model);else return new Jsoncode(src);
};

if (typeof JSON !== 'undefined') JSON.specify = jsoncode;
var _default = jsoncode;
exports.default = _default;
module.exports = exports.default;

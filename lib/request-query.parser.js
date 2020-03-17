"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("@nestjsx/util");
var exceptions_1 = require("./exceptions");
var request_query_builder_1 = require("./request-query.builder");
var request_query_validator_1 = require("./request-query.validator");
var RequestQueryParser = (function () {
    function RequestQueryParser() {
        this.fields = [];
        this.paramsFilter = [];
        this.authPersist = undefined;
        this.filter = [];
        this.or = [];
        this.join = [];
        this.sort = [];
    }
    Object.defineProperty(RequestQueryParser.prototype, "_options", {
        get: function () {
            return request_query_builder_1.RequestQueryBuilder.getOptions();
        },
        enumerable: true,
        configurable: true
    });
    RequestQueryParser.create = function () {
        return new RequestQueryParser();
    };
    RequestQueryParser.prototype.getParsed = function () {
        return {
            fields: this.fields,
            paramsFilter: this.paramsFilter,
            authPersist: this.authPersist,
            search: this.search,
            filter: this.filter,
            or: this.or,
            join: this.join,
            sort: this.sort,
            limit: this.limit,
            offset: this.offset,
            page: this.page,
            cache: this.cache,
        };
    };
    RequestQueryParser.prototype.parseQuery = function (query) {
        if (util_1.isObject(query)) {
            var paramNames = util_1.objKeys(query);
            if (util_1.hasLength(paramNames)) {
                this._query = query;
                this._paramNames = paramNames;
                var searchData = this._query[this.getParamNames('search')[0]];
                this.search = this.parseSearchQueryParam(searchData);
                if (util_1.isNil(this.search)) {
                    this.filter = this.parseQueryParam('filter', this.conditionParser.bind(this, 'filter'));
                    this.or = this.parseQueryParam('or', this.conditionParser.bind(this, 'or'));
                }
                this.fields =
                    this.parseQueryParam('fields', this.fieldsParser.bind(this))[0] || [];
                this.join = this.parseQueryParam('join', this.joinParser.bind(this));
                this.sort = this.parseQueryParam('sort', this.sortParser.bind(this));
                this.limit = this.parseQueryParam('limit', this.numericParser.bind(this, 'limit'))[0];
                this.offset = this.parseQueryParam('offset', this.numericParser.bind(this, 'offset'))[0];
                this.page = this.parseQueryParam('page', this.numericParser.bind(this, 'page'))[0];
                this.cache = this.parseQueryParam('cache', this.numericParser.bind(this, 'cache'))[0];
            }
        }
        return this;
    };
    RequestQueryParser.prototype.parseParams = function (params, options) {
        var _this = this;
        if (util_1.isObject(params)) {
            var paramNames = util_1.objKeys(params);
            if (util_1.hasLength(paramNames)) {
                this._params = params;
                this._paramsOptions = options;
                this.paramsFilter = paramNames
                    .map(function (name) { return _this.paramParser(name); })
                    .filter(function (filter) { return filter; });
            }
        }
        return this;
    };
    RequestQueryParser.prototype.setAuthPersist = function (persist) {
        if (persist === void 0) { persist = {}; }
        this.authPersist = persist || {};
    };
    RequestQueryParser.prototype.convertFilterToSearch = function (filter) {
        var _a, _b;
        var isEmptyValue = {
            isnull: true,
            notnull: true,
        };
        return filter
            ? (_a = {},
                _a[filter.field] = (_b = {},
                    _b[filter.operator] = isEmptyValue[filter.operator]
                        ? isEmptyValue[filter.operator]
                        : filter.value,
                    _b),
                _a) : {};
    };
    RequestQueryParser.prototype.getParamNames = function (type) {
        var _this = this;
        return this._paramNames.filter(function (p) {
            var name = _this._options.paramNamesMap[type];
            return util_1.isString(name) ? name === p : name.some(function (m) { return m === p; });
        });
    };
    RequestQueryParser.prototype.getParamValues = function (value, parser) {
        if (util_1.isStringFull(value)) {
            return [parser.call(this, value)];
        }
        if (util_1.isArrayFull(value)) {
            return value.map(function (val) { return parser(val); });
        }
        return [];
    };
    RequestQueryParser.prototype.parseQueryParam = function (type, parser) {
        var _this = this;
        var param = this.getParamNames(type);
        if (util_1.isArrayFull(param)) {
            return param.reduce(function (a, name) { return __spreadArrays(a, _this.getParamValues(_this._query[name], parser)); }, []);
        }
        return [];
    };
    RequestQueryParser.prototype.parseValue = function (val) {
        try {
            var parsed = JSON.parse(val);
            if (!util_1.isDate(parsed) && util_1.isObject(parsed)) {
                return val;
            }
            else if (typeof parsed === 'number' &&
                parsed.toLocaleString('fullwide', { useGrouping: false }) !== val) {
                return val;
            }
            return parsed;
        }
        catch (ignored) {
            if (util_1.isDateString(val)) {
                return new Date(val);
            }
            return val;
        }
    };
    RequestQueryParser.prototype.parseValues = function (vals) {
        var _this = this;
        if (util_1.isArrayFull(vals)) {
            return vals.map(function (v) { return _this.parseValue(v); });
        }
        else {
            return this.parseValue(vals);
        }
    };
    RequestQueryParser.prototype.fieldsParser = function (data) {
        return data.split(this._options.delimStr);
    };
    RequestQueryParser.prototype.parseSearchQueryParam = function (d) {
        try {
            if (util_1.isNil(d)) {
                return undefined;
            }
            var data = JSON.parse(d);
            if (!util_1.isObject(data)) {
                throw new Error();
            }
            return data;
        }
        catch (_) {
            throw new exceptions_1.RequestQueryException('Invalid search param. JSON expected');
        }
    };
    RequestQueryParser.prototype.conditionParser = function (cond, data) {
        var isArrayValue = [
            'in',
            'notin',
            'between',
            '$in',
            '$notin',
            '$between',
            '$inL',
            '$notinL',
        ];
        var isEmptyValue = ['isnull', 'notnull', '$isnull', '$notnull'];
        var param = data.split(this._options.delim);
        var field = param[0];
        var operator = param[1];
        var value = param[2] || '';
        if (isArrayValue.some(function (name) { return name === operator; })) {
            value = value.split(this._options.delimStr);
        }
        value = this.parseValues(value);
        if (!isEmptyValue.some(function (name) { return name === operator; }) && !util_1.hasValue(value)) {
            throw new exceptions_1.RequestQueryException("Invalid " + cond + " value");
        }
        var condition = { field: field, operator: operator, value: value };
        request_query_validator_1.validateCondition(condition, cond);
        return condition;
    };
    RequestQueryParser.prototype.joinParser = function (data) {
        var param = data.split(this._options.delim);
        var join = {
            field: param[0],
            select: util_1.isStringFull(param[1]) ? param[1].split(this._options.delimStr) : undefined,
        };
        request_query_validator_1.validateJoin(join);
        return join;
    };
    RequestQueryParser.prototype.sortParser = function (data) {
        var param = data.split(this._options.delimStr);
        var sort = {
            field: param[0],
            order: param[1],
        };
        request_query_validator_1.validateSort(sort);
        return sort;
    };
    RequestQueryParser.prototype.numericParser = function (num, data) {
        var val = this.parseValue(data);
        request_query_validator_1.validateNumeric(val, num);
        return val;
    };
    RequestQueryParser.prototype.paramParser = function (name) {
        request_query_validator_1.validateParamOption(this._paramsOptions, name);
        var option = this._paramsOptions[name];
        if (option.disabled) {
            return undefined;
        }
        var value = this._params[name];
        switch (option.type) {
            case 'number':
                value = this.parseValue(value);
                request_query_validator_1.validateNumeric(value, "param " + name);
                break;
            case 'uuid':
                request_query_validator_1.validateUUID(value, name);
                break;
            default:
                break;
        }
        return { field: option.field, operator: '$eq', value: value };
    };
    return RequestQueryParser;
}());
exports.RequestQueryParser = RequestQueryParser;
//# sourceMappingURL=request-query.parser.js.map
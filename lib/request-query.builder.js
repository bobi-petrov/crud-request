"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("@nestjsx/util");
var qs_1 = require("qs");
var request_query_validator_1 = require("./request-query.validator");
var RequestQueryBuilder = (function () {
    function RequestQueryBuilder() {
        this.paramNames = {};
        this.queryObject = {};
        this.setParamNames();
    }
    RequestQueryBuilder.setOptions = function (options) {
        RequestQueryBuilder._options = __assign(__assign(__assign({}, RequestQueryBuilder._options), options), { paramNamesMap: __assign(__assign({}, RequestQueryBuilder._options.paramNamesMap), (options.paramNamesMap ? options.paramNamesMap : {})) });
    };
    RequestQueryBuilder.getOptions = function () {
        return RequestQueryBuilder._options;
    };
    RequestQueryBuilder.create = function (params) {
        var qb = new RequestQueryBuilder();
        return util_1.isObject(params) ? qb.createFromParams(params) : qb;
    };
    Object.defineProperty(RequestQueryBuilder.prototype, "options", {
        get: function () {
            return RequestQueryBuilder._options;
        },
        enumerable: true,
        configurable: true
    });
    RequestQueryBuilder.prototype.setParamNames = function () {
        var _this = this;
        Object.keys(RequestQueryBuilder._options.paramNamesMap).forEach(function (key) {
            var name = RequestQueryBuilder._options.paramNamesMap[key];
            _this.paramNames[key] = util_1.isString(name) ? name : name[0];
        });
    };
    RequestQueryBuilder.prototype.query = function (encode) {
        if (encode === void 0) { encode = true; }
        if (this.queryObject[this.paramNames.search]) {
            this.queryObject[this.paramNames.filter] = undefined;
            this.queryObject[this.paramNames.or] = undefined;
        }
        this.queryString = qs_1.stringify(this.queryObject, { encode: encode });
        return this.queryString;
    };
    RequestQueryBuilder.prototype.select = function (fields) {
        if (util_1.isArrayFull(fields)) {
            request_query_validator_1.validateFields(fields);
            this.queryObject[this.paramNames.fields] = fields.join(this.options.delimStr);
        }
        return this;
    };
    RequestQueryBuilder.prototype.search = function (s) {
        if (!util_1.isNil(s) && util_1.isObject(s)) {
            this.queryObject[this.paramNames.search] = JSON.stringify(s);
        }
        return this;
    };
    RequestQueryBuilder.prototype.setFilter = function (f) {
        this.setCondition(f, 'filter');
        return this;
    };
    RequestQueryBuilder.prototype.setOr = function (f) {
        this.setCondition(f, 'or');
        return this;
    };
    RequestQueryBuilder.prototype.setJoin = function (j) {
        var _this = this;
        if (!util_1.isNil(j)) {
            var param = this.checkQueryObjectParam('join', []);
            this.queryObject[param] = __spreadArrays(this.queryObject[param], (Array.isArray(j) && !util_1.isString(j[0])
                ? j.map(function (o) { return _this.addJoin(o); })
                : [this.addJoin(j)]));
        }
        return this;
    };
    RequestQueryBuilder.prototype.sortBy = function (s) {
        var _this = this;
        if (!util_1.isNil(s)) {
            var param = this.checkQueryObjectParam('sort', []);
            this.queryObject[param] = __spreadArrays(this.queryObject[param], (Array.isArray(s) && !util_1.isString(s[0])
                ? s.map(function (o) { return _this.addSortBy(o); })
                : [this.addSortBy(s)]));
        }
        return this;
    };
    RequestQueryBuilder.prototype.setLimit = function (n) {
        this.setNumeric(n, 'limit');
        return this;
    };
    RequestQueryBuilder.prototype.setOffset = function (n) {
        this.setNumeric(n, 'offset');
        return this;
    };
    RequestQueryBuilder.prototype.setPage = function (n) {
        this.setNumeric(n, 'page');
        return this;
    };
    RequestQueryBuilder.prototype.resetCache = function () {
        this.setNumeric(0, 'cache');
        return this;
    };
    RequestQueryBuilder.prototype.cond = function (f, cond) {
        if (cond === void 0) { cond = 'search'; }
        var filter = Array.isArray(f) ? { field: f[0], operator: f[1], value: f[2] } : f;
        request_query_validator_1.validateCondition(filter, cond);
        var d = this.options.delim;
        return (filter.field +
            d +
            filter.operator +
            (util_1.hasValue(filter.value) ? d + filter.value : ''));
    };
    RequestQueryBuilder.prototype.addJoin = function (j) {
        var join = Array.isArray(j) ? { field: j[0], select: j[1] } : j;
        request_query_validator_1.validateJoin(join);
        var d = this.options.delim;
        var ds = this.options.delimStr;
        return join.field + (util_1.isArrayFull(join.select) ? d + join.select.join(ds) : '');
    };
    RequestQueryBuilder.prototype.addSortBy = function (s) {
        var sort = Array.isArray(s) ? { field: s[0], order: s[1] } : s;
        request_query_validator_1.validateSort(sort);
        var ds = this.options.delimStr;
        return sort.field + ds + sort.order;
    };
    RequestQueryBuilder.prototype.createFromParams = function (params) {
        this.select(params.fields);
        this.search(params.search);
        this.setFilter(params.filter);
        this.setOr(params.or);
        this.setJoin(params.join);
        this.setLimit(params.limit);
        this.setOffset(params.offset);
        this.setPage(params.page);
        this.sortBy(params.sort);
        if (params.resetCache) {
            this.resetCache();
        }
        return this;
    };
    RequestQueryBuilder.prototype.checkQueryObjectParam = function (cond, defaults) {
        var param = this.paramNames[cond];
        if (util_1.isNil(this.queryObject[param]) && !util_1.isUndefined(defaults)) {
            this.queryObject[param] = defaults;
        }
        return param;
    };
    RequestQueryBuilder.prototype.setCondition = function (f, cond) {
        var _this = this;
        if (!util_1.isNil(f)) {
            var param = this.checkQueryObjectParam(cond, []);
            this.queryObject[param] = __spreadArrays(this.queryObject[param], (Array.isArray(f) && !util_1.isString(f[0])
                ? f.map(function (o) { return _this.cond(o, cond); })
                : [this.cond(f, cond)]));
        }
    };
    RequestQueryBuilder.prototype.setNumeric = function (n, cond) {
        if (!util_1.isNil(n)) {
            request_query_validator_1.validateNumeric(n, cond);
            this.queryObject[this.paramNames[cond]] = n;
        }
    };
    RequestQueryBuilder._options = {
        delim: '||',
        delimStr: ',',
        paramNamesMap: {
            fields: ['fields', 'select'],
            search: 's',
            filter: 'filter',
            or: 'or',
            join: 'join',
            sort: 'sort',
            limit: ['limit', 'per_page'],
            offset: 'offset',
            page: 'page',
            cache: 'cache',
        },
    };
    return RequestQueryBuilder;
}());
exports.RequestQueryBuilder = RequestQueryBuilder;
//# sourceMappingURL=request-query.builder.js.map
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
var types_1 = require("./types");
exports.deprecatedComparisonOperatorsList = [
    'eq',
    'ne',
    'gt',
    'lt',
    'gte',
    'lte',
    'starts',
    'ends',
    'cont',
    'excl',
    'in',
    'notin',
    'isnull',
    'notnull',
    'between',
];
exports.comparisonOperatorsList = __spreadArrays(exports.deprecatedComparisonOperatorsList, util_1.objKeys(types_1.CondOperator).map(function (n) { return types_1.CondOperator[n]; }));
exports.sortOrdersList = ['ASC', 'DESC'];
var comparisonOperatorsListStr = exports.comparisonOperatorsList.join();
var sortOrdersListStr = exports.sortOrdersList.join();
function validateFields(fields) {
    if (!util_1.isArrayStrings(fields)) {
        throw new exceptions_1.RequestQueryException('Invalid fields. Array of strings expected');
    }
}
exports.validateFields = validateFields;
function validateCondition(val, cond) {
    if (!util_1.isObject(val) || !util_1.isStringFull(val.field)) {
        throw new exceptions_1.RequestQueryException("Invalid field type in " + cond + " condition. String expected");
    }
    validateComparisonOperator(val.operator);
}
exports.validateCondition = validateCondition;
function validateComparisonOperator(operator) {
    if (exports.comparisonOperatorsList.indexOf(operator) === -1) {
        throw new exceptions_1.RequestQueryException("Invalid comparison operator. " + comparisonOperatorsListStr + " expected");
    }
}
exports.validateComparisonOperator = validateComparisonOperator;
function validateJoin(join) {
    if (!util_1.isObject(join) || !util_1.isStringFull(join.field)) {
        throw new exceptions_1.RequestQueryException('Invalid join field. String expected');
    }
    if (!util_1.isUndefined(join.select) && !util_1.isArrayStrings(join.select)) {
        throw new exceptions_1.RequestQueryException('Invalid join select. Array of strings expected');
    }
}
exports.validateJoin = validateJoin;
function validateSort(sort) {
    if (!util_1.isObject(sort) || !util_1.isStringFull(sort.field)) {
        throw new exceptions_1.RequestQueryException('Invalid sort field. String expected');
    }
    if (!util_1.isEqual(sort.order, exports.sortOrdersList[0]) &&
        !util_1.isEqual(sort.order, exports.sortOrdersList[1])) {
        throw new exceptions_1.RequestQueryException("Invalid sort order. " + sortOrdersListStr + " expected");
    }
}
exports.validateSort = validateSort;
function validateNumeric(val, num) {
    if (!util_1.isNumber(val)) {
        throw new exceptions_1.RequestQueryException("Invalid " + num + ". Number expected");
    }
}
exports.validateNumeric = validateNumeric;
function validateParamOption(options, name) {
    if (!util_1.isObject(options)) {
        throw new exceptions_1.RequestQueryException("Invalid param " + name + ". Invalid crud options");
    }
    var option = options[name];
    if (option && option.disabled) {
        return;
    }
    if (!util_1.isObject(option) || util_1.isNil(option.field) || util_1.isNil(option.type)) {
        throw new exceptions_1.RequestQueryException("Invalid param option in Crud");
    }
}
exports.validateParamOption = validateParamOption;
function validateUUID(str, name) {
    var uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    var uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidV4.test(str) && !uuid.test(str)) {
        throw new exceptions_1.RequestQueryException("Invalid param " + name + ". UUID string expected");
    }
}
exports.validateUUID = validateUUID;
//# sourceMappingURL=request-query.validator.js.map
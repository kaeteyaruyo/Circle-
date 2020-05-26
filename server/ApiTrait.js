"use strict";
exports.__esModule = true;
var ApiTrait = (function () {
    function ApiTrait() {
    }
    ApiTrait.prototype.returnError = function (code, message, data) {
        if (code === void 0) { code = 403; }
        if (message === void 0) { message = ""; }
        if (data === void 0) { data = {}; }
        return {
            "status": code,
            "message": message,
            "data": data
        };
    };
    return ApiTrait;
}());
exports.ApiTrait = ApiTrait;

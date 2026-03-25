"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var debug_1 = require("debug");
var formatArgs = function (args) {
    return args.map(function (a) {
        return typeof a === "object" ? JSON.stringify(a, null, 2) : String(a);
    });
};
var logger = function (name) {
    if (name === void 0) { name = "ts-tool"; }
    var prefix = chalk_1.default.bold("[".concat(name, "]"));
    var dbg = (0, debug_1.default)("ts-tool:".concat(name));
    return {
        log: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return console.log(chalk_1.default.gray.apply(chalk_1.default, __spreadArray([prefix], formatArgs(args), false)));
        },
        warning: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return console.warn(chalk_1.default.yellow.apply(chalk_1.default, __spreadArray([prefix], formatArgs(args), false)));
        },
        error: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return console.error(chalk_1.default.red.apply(chalk_1.default, __spreadArray([prefix], formatArgs(args), false)));
        },
        highlight: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return console.log(chalk_1.default.bgCyanBright.apply(chalk_1.default, __spreadArray([prefix], formatArgs(args), false)));
        },
        success: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return console.log(chalk_1.default.green.apply(chalk_1.default, __spreadArray([prefix], formatArgs(args), false)));
        },
        debug: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return dbg(formatArgs(args).join(" "));
        },
    };
};
exports.default = logger;

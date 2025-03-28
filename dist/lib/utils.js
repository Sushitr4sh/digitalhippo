"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPrice = exports.cn = void 0;
var clsx_1 = require("clsx");
var tailwind_merge_1 = require("tailwind-merge");
function cn() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
exports.cn = cn;
function formatPrice(price, options //Default value = empty object
) {
    if (options === void 0) { options = {}; }
    var _a = options.currency, currency = _a === void 0 ? "USD" : _a, _b = options.notation, notation = _b === void 0 ? "compact" : _b;
    var numericPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
        style: "currency", //tells Intl.NumberFormat to format the number as a currency string (e.g., $1,000.00 instead of 1000).
        currency: currency,
        notation: notation,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericPrice);
}
exports.formatPrice = formatPrice;

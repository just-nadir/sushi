"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderType = exports.OrderStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["CUSTOMER"] = "CUSTOMER";
})(Role || (exports.Role = Role = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["NEW"] = "NEW";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["COOKING"] = "COOKING";
    OrderStatus["READY"] = "READY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderType;
(function (OrderType) {
    OrderType["DELIVERY"] = "DELIVERY";
    OrderType["PICKUP"] = "PICKUP";
})(OrderType || (exports.OrderType = OrderType = {}));

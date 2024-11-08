"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatValidationErrors = void 0;
const formatValidationErrors = (errors) => {
    return errors.reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
    }, {});
};
exports.formatValidationErrors = formatValidationErrors;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageGet = void 0;
const HomepageGet = (req, res) => {
    res.render("home", { user: req.user, errors: {} });
};
exports.HomepageGet = HomepageGet;
module.exports = { HomepageGet: exports.HomepageGet };

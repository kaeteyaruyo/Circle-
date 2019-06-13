const config = require('../config.js');
const path = require('path');

// Middleware to set render parameter for all route
function renderSetting(req, res, next) {
    res.locals.basedir = path.join(config.projectRoot, '/static/pug');
    next();
};

// Middleware to check if user is logged-in
function checkLogin(req, res, next) {
    if ( !req.session.username )
        res.redirect('/');
    else
        next();
};

module.exports = {
    renderSetting,
    checkLogin,
};

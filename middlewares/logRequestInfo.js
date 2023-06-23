const logRequestInfo = (req, res, next) => {
    console.log(`METODO: ${req.method} - URL: ${req.url}`);
    next();
}

module.exports = logRequestInfo;
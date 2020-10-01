const jwt = require('jsonwebtoken');
const data = require('../data');

exports.verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        jwt.verify(bearer[1],data.JWT_SECRET, (err, d) => {
            if(!err) {
                req.email = d.email;
                req.name = d.name;
                req._id = d._id;
                req.isManager = d.isManager;
                next();
            }
            else {
                res.sendStatus(403);
            }
        });
    }
    else {
        res.sendStatus(403);
    }
}

exports.isManager = (req,res,next) =>
{
    if(req.isManager)
    {
        next();
    }
    else
    {
        res.sendStatus(401);
    }
};
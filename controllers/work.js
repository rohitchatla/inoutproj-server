const Work = require("../models/work");

/**
 * Fetch profile information
 *
 * @param req
 * @param res
 * @param next
 */
exports.postWork = function (req, res, next) {
    const { userId, name, description, cost, serviceId  } = req.body;
    Work.create({
        userId,
        name,
        description,
        cost,
        serviceId
    }).then(work=>{
        res.send(work);
    })
};

exports.fetchWorks = function (req, res, next) {
    
};





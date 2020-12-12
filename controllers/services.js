const Services = require("../models/services");

/**
 * Fetch profile information
 *
 * @param req
 * @param res
 * @param next
 */
exports.fetchServices = function (req, res, next) {
    
    const services = Services.find();

    if(!services) res.send({error:"No services available"});

    res.send(services);
};





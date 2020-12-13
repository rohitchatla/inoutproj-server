const Services = require("../models/services");

/**
 * Fetch profile information
 *
 * @param req
 * @param res
 * @param next
 */
exports.fetchServices = async function (req, res, next) {
  const services = await Services.find({});

  if (!services) res.send({ error: "No services available" });

  res.send(services);
};

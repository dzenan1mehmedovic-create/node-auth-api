const healthcheck = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
};

module.exports = {
  healthcheck,
};

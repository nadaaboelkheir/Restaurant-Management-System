const routes = (app) => {
  app.use("/api/v1/auth", require("./auth.route"));
};

module.exports = routes;

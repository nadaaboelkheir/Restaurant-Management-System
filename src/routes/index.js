const routes = (app) => {
  app.use("/api/v1/menueItem", require("./menue.route"));
  app.use("/api/v1/auth", require("./auth.route"));
};

module.exports = routes;

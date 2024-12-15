const  responseHandler  = require("../utils/responseHandler");
const ApiError = require("../utils/errorHandler");
const AsyncHandler = require("express-async-handler");

exports.createOne = (Model) =>
  AsyncHandler(async (req, res, next) => {
    const doc = await Model.create(req.body);
    return responseHandler(res, doc, "Document created successfully", 201);
  });

exports.getAll = (Model) =>
  AsyncHandler(async (req, res, next) => {
    const docs = await Model.findAll();
    return responseHandler(res, docs, "Documents fetched successfully", 200);
  });

exports.getOne = (Model) =>
  AsyncHandler(async (req, res, next) => {
    const doc = await Model.findByPk(req.params.id);
    if (!doc) {
     throw ApiError.notFound("No document found with that ID")
    }
    return responseHandler(res, doc, "Document fetched successfully", 200);
  });

exports.updateOne = (Model) =>
  AsyncHandler(async (req, res, next) => {
    const doc = await Model.findByPk(req.params.id);
    if (!doc) {
      throw ApiError.notFound("No document found with that ID")
    }
    await doc.update(req.body);
    return responseHandler(res, doc, "Document updated successfully", 200);
  });

exports.deleteOne = (Model) =>
  AsyncHandler(async (req, res, next) => {
    const doc = await Model.findByPk(req.params.id);
    if (!doc) {
    throw ApiError.notFound("No document found with that ID")
    }
    await doc.destroy();
    return responseHandler(res, null, "Document deleted successfully", 204);
  });

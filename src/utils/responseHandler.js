const responseHandler = (
  res,
  data,
  message = "Request successful",
  statusCode = 200,
  metadata = null
) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (metadata) {
    response.metadata = metadata; // pagination data
  }

 res.status(statusCode).json(response);
};

module.exports = responseHandler;

export const createHttpResponse = (res, statusCode, data, message = null) => {
  const response = {
    success: statusCode >= 200 && statusCode < 300,
    data,
    ...(message && { message })
  };
  
  return res.status(statusCode).json(response);
};

export const createErrorResponse = (res, statusCode, message, details = null) => {
  const response = {
    success: false,
    error: {
      message,
      ...(details && { details })
    }
  };
  
  return res.status(statusCode).json(response);
};

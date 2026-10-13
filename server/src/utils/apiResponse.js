const formatData = (item) => {
  if (!item || typeof item !== 'object') return item;
  if (Array.isArray(item)) return item.map(formatData);

  const plain = item.toJSON ? item.toJSON() : { ...item };
  if (plain.id !== undefined && plain._id === undefined) {
    plain._id = plain.id;
  }
  for (const key of Object.keys(plain)) {
    if (plain[key] && typeof plain[key] === 'object') {
      plain[key] = formatData(plain[key]);
    }
  }
  return plain;
};

export const successResponse = (res, data, statusCode = 200, meta = null) => {
  const payload = {
    success: true,
    data: formatData(data),
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
};

export const errorResponse = (res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  const payload = {
    success: false,
    error: {
      code,
      message,
    },
  };
  if (details) {
    payload.error.details = details;
  }
  return res.status(statusCode).json(payload);
};

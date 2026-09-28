export const success = (res, data = {}, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, data });
};

export const error = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
    const body = { success: false, message };
    if (errors) body.errors = errors;
    return res.status(statusCode).json(body);
};

export const notFound = (res, message = 'Resource not found') => {
    return res.status(404).json({ success: false, message });
};

export const unauthorized = (res, message = 'Unauthorized') => {
    return res.status(401).json({ success: false, message });
};

export const forbidden = (res, message = 'Forbidden') => {
    return res.status(403).json({ success: false, message });
};

export const validationError = (res, errors) => {
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
};

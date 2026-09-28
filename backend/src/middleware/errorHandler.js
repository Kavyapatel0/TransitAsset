export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);

    // MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'Duplicate entry - record already exists' });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ success: false, message: 'Referenced record does not exist' });
    }

    const statusCode = err.status || 500;
    const message = statusCode < 500 ? err.message : 'Internal server error';
    return res.status(statusCode).json({ success: false, message });
};

export const notFoundHandler = (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
};

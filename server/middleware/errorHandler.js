// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // PostgreSQL unique constraint violation
    if (err.code === '23505') {
        return res.status(400).json({
            success: false,
            message: 'Duplicate entry. This record already exists.',
            error: process.env.NODE_ENV === 'development' ? err.detail : undefined
        });
    }

    // PostgreSQL foreign key violation
    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            message: 'Invalid reference. The related record does not exist.',
            error: process.env.NODE_ENV === 'development' ? err.detail : undefined
        });
    }

    // PostgreSQL check constraint violation
    if (err.code === '23514') {
        return res.status(400).json({
            success: false,
            message: 'Invalid value. Check constraint violation.',
            error: process.env.NODE_ENV === 'development' ? err.detail : undefined
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired.'
        });
    }

    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: 'Unexpected file field.'
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

// Not found handler
export const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
};

// Async handler wrapper to avoid try-catch in every controller
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

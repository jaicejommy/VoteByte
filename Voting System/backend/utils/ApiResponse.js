class ApiResponse {
    static success(res, message, data = null, status = 200) {
        return res.status(status).json({
            success: true,
            message,
            data
        });
    }

    static error(res, message = 'Internal server error', status = 500) {
        return res.status(status).json({
            success: false,
            message,
            data: null
        });
    }

    static notFound(res, message = 'Resource not found') {
        return res.status(404).json({
            success: false,
            message,
            data: null
        });
    }

    static badRequest(res, message = 'Bad request') {
        return res.status(400).json({
            success: false,
            message,
            data: null
        });
    }

    static unauthorized(res, message = 'Unauthorized') {
        return res.status(401).json({
            success: false,
            message,
            data: null
        });
    }
}

module.exports = ApiResponse;
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message),
        this.statusCode = statusCode
        this.isOperational = true,
        Error.captureStackTrace(this, this.constructor)
    }

    static badRequest(message = "Bad Request"){
        return new ApiError(400, message)
    }
    
    static unauthorized(message = "Unauthorized"){
        return new ApiError(401, message)
    }
    
    static conflict(message = "Conflict"){
        return new ApiError(409, message)
    }
    
    static forbidden(message = "forbidden"){
        return new ApiError(412, message)
    }
    
    static notFound(message = "Not Found"){
        return new ApiError(414, message)
    }

    static invalid(message = "Invalid"){
        return new ApiError(422, message)
    }
}

export default ApiError;
import ApiError from "../../common/utils/api-error.js";
import { verifyToken as decodeToken } from "../../common/utils/jwt.js";

const validateRegister = (req, res, next) => {
    try{
        const {
        fullName,
        email,
        phone,
        password,
        dateOfBirth
    } = req.body;

    const nameRegex = /^[a-zA-Z][a-zA-Z\s.'-]{1,98}[a-zA-Z]$/;

    if(!fullName || !nameRegex.test(fullName.trim())){
        throw ApiError.invalid("Please provide a valid full name")
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/


    if(!email || !emailRegex.test(email.trim().toLowerCase())){
        throw ApiError.invalid("Please provide a valid Email");
    }

    const phoneRegex = /^[6-9]\d{9}$/;

    if(!phone || !phoneRegex.test(phone.trim())){
        throw ApiError.invalid("Please provide a valid Phone Number");
    }

    if(!password || password.length < 8){
        throw ApiError.invalid("Please Provide a valid password")
    }
    
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateOfBirth || !dobRegex.test(dateOfBirth)) {
        throw ApiError.invalid("Please provide date of birth in YYYY-MM-DD format");
    }
    next();
    }
    catch (error) {
        next(error);
    }
    
}


const validateLogin = (req, res, next) => {
    try {
        const { email, password } = req.body;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!email || !emailRegex.test(email.trim().toLowerCase())) {
            throw ApiError.invalid("Please provide a valid Email");
        }

        if (!password || password.length < 8) {
            throw ApiError.invalid("Please Provide a valid password");
        }

        next();
    } catch (error) {
        next(error);
    }
};

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw ApiError.unauthorized("Access denied. No token provided");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw ApiError.unauthorized("Access denied. No token provided");
        }

        try {
            const decoded = decodeToken(token);
            req.user = {
                ...decoded,
                userId: decoded.userId || decoded.user_id,
                user_id: decoded.userId || decoded.user_id,
                customerId: decoded.customerId || decoded.customer_id,
                customer_id: decoded.customerId || decoded.customer_id
            };
            next();
        } catch (jwtError) {
            if (jwtError.name === "TokenExpiredError") {
                throw ApiError.unauthorized("Token has expired. Please log in again");
            }
            throw ApiError.unauthorized("Invalid token");
        }
    } catch (error) {
        next(error);
    }
};

export default {
    validateRegister,
    validateLogin,
    verifyToken,
    authenticate: verifyToken
};

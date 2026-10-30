import ApiError from "../../common/utils/api-error.js";

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

export default{
    validateRegister
}

import bcrypt from "bcryptjs";
import pool from "../../common/config/db.js";
import authRepository from "./auth.repository.js";
import ApiError from "../../common/utils/api-error.js";
import { generateToken } from "../../common/utils/jwt.js";

const register = async (userData) => {
    const fullName = userData.fullName || userData.full_name;
    const email = userData.email;
    const phone = userData.phone;
    const password = userData.password;
    const address = userData.address || null;
    const dateOfBirth = userData.dateOfBirth || userData.date_of_birth || null;

    // 1. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check if email already exists
    const existingEmail = await authRepository.findUserByEmail(normalizedEmail);
    if (existingEmail) {
        throw ApiError.conflict("Email already exists");
    }

    // 3. Check if phone already exists
    const existingPhone = await authRepository.findUserByPhone(phone.trim());
    if (existingPhone) {
        throw ApiError.conflict("Phone number already exists");
    }

    // 4. Hash password using bcrypt.hash()
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Get connection from pool
    const connection = await pool.getConnection();

    try {
        // 6. Begin transaction
        await connection.beginTransaction();

        // 7. Create customer
        const customerId = await authRepository.createCustomer({
            fullName: fullName.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            address: address ? address.trim() : null,
            dateOfBirth
        }, connection);

        // 8. Create user
        const userId = await authRepository.createUser({
            customerId,
            passwordHash
        }, connection);

        // 9. Commit transaction
        await connection.commit();

        // 10. Generate JWT
        const token = generateToken({
            userId,
            customerId,
            role: "CUSTOMER"
        });

        // 11. Return safe user details and token
        return {
            token,
            user: {
                user_id: userId,
                customer_id: customerId,
                role: "CUSTOMER"
            },
            customer: {
                customer_id: customerId,
                full_name: fullName.trim(),
                email: normalizedEmail,
                phone: phone.trim(),
                address: address ? address.trim() : null,
                date_of_birth: dateOfBirth
            }
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const login = async (userData) => {
    // 1. Extract email and password
    const email = userData.email;
    const password = userData.password;

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Find user using findUserByEmail()
    const user = await authRepository.findUserByEmail(normalizedEmail);

    // 4. If user doesn't exist, throw 401
    if (!user) {
        throw ApiError.unauthorized("Invalid email or password");
    }

    // 5. Compare entered password with password_hash using bcrypt.compare()
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
    );

    // 6. If password doesn't match, throw 401
    if (!isPasswordValid) {
        throw ApiError.unauthorized("Invalid email or password");
    }

    // 7. Generate JWT
    const token = generateToken({
        userId: user.user_id,
        customerId: user.customer_id,
        role: user.role
    });

    // 8. Return safe user details and token matching frontend AuthData
    return {
        token,
        user: {
            user_id: user.user_id,
            customer_id: user.customer_id,
            role: user.role
        },
        customer: {
            customer_id: user.customer_id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            address: user.address || null,
            date_of_birth: user.date_of_birth || null,
            created_at: user.created_at
        }
    };
};

const getMe = async (userId) => {
    const user = await authRepository.findUserById(userId);

    if (!user) {
        throw ApiError.notFound("User not found");
    }

    return {
        user: {
            user_id: user.user_id,
            customer_id: user.customer_id,
            role: user.role
        },
        customer: {
            customer_id: user.customer_id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            address: user.address || null,
            date_of_birth: user.date_of_birth || null,
            created_at: user.created_at
        }
    };
};


export default {
    register,
    login,
    getMe
};

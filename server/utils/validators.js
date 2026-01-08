// Email validation
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Phone validation (flexible format)
export const isValidPhone = (phone) => {
    if (!phone) return true; // Phone is often optional
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Required field validation
export const validateRequired = (fields, data) => {
    const missing = [];

    for (const field of fields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            missing.push(field);
        }
    }

    if (missing.length > 0) {
        const error = new Error(`Missing required fields: ${missing.join(', ')}`);
        error.name = 'ValidationError';
        throw error;
    }
};

// Enum validation
export const validateEnum = (value, allowedValues, fieldName) => {
    if (value && !allowedValues.includes(value)) {
        const error = new Error(
            `Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`
        );
        error.name = 'ValidationError';
        throw error;
    }
};

// Number range validation
export const validateRange = (value, min, max, fieldName) => {
    if (value !== undefined && value !== null) {
        if (min !== undefined && value < min) {
            const error = new Error(`${fieldName} must be at least ${min}`);
            error.name = 'ValidationError';
            throw error;
        }
        if (max !== undefined && value > max) {
            const error = new Error(`${fieldName} must be at most ${max}`);
            error.name = 'ValidationError';
            throw error;
        }
    }
};

// Date validation
export const isValidDate = (dateString) => {
    if (!dateString) return true;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

// Password strength validation
export const isStrongPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};

// Validate user registration data
export const validateUserRegistration = (data) => {
    validateRequired(['email', 'password', 'role'], data);

    if (!isValidEmail(data.email)) {
        const error = new Error('Invalid email format');
        error.name = 'ValidationError';
        throw error;
    }

    if (!isStrongPassword(data.password)) {
        const error = new Error(
            'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number'
        );
        error.name = 'ValidationError';
        throw error;
    }

    validateEnum(data.role, ['admin', 'agent', 'manager'], 'role');
};

// Validate property data
export const validateProperty = (data) => {
    validateRequired(['address', 'city', 'state', 'zip_code', 'property_type', 'listing_type', 'price', 'listing_date'], data);

    validateEnum(data.property_type, ['residential', 'commercial', 'land', 'multi-family'], 'property_type');
    validateEnum(data.listing_type, ['sale', 'rent', 'lease'], 'listing_type');
    validateEnum(data.status, ['available', 'pending', 'under_contract', 'sold', 'off_market'], 'status');

    if (data.price <= 0) {
        const error = new Error('Price must be greater than 0');
        error.name = 'ValidationError';
        throw error;
    }
};

// Validate client data
export const validateClient = (data) => {
    validateRequired(['first_name', 'last_name', 'client_type'], data);

    validateEnum(data.client_type, ['buyer', 'seller', 'renter', 'investor'], 'client_type');
    validateEnum(data.status, ['lead', 'active', 'inactive', 'closed'], 'status');

    if (data.email && !isValidEmail(data.email)) {
        const error = new Error('Invalid email format');
        error.name = 'ValidationError';
        throw error;
    }

    validateRange(data.lead_score, 0, 100, 'lead_score');
};

// Validate deal data
export const validateDeal = (data) => {
    validateRequired(['client_id', 'agent_id', 'deal_type'], data);

    validateEnum(data.deal_type, ['purchase', 'sale', 'rental', 'lease'], 'deal_type');
    validateEnum(data.stage, ['lead', 'viewing', 'offer_made', 'negotiation', 'under_contract', 'closed_won', 'closed_lost'], 'stage');
};

// Validate showing data
export const validateShowing = (data) => {
    validateRequired(['property_id', 'agent_id', 'scheduled_date'], data);

    validateEnum(data.showing_type, ['private', 'open_house'], 'showing_type');
    validateEnum(data.status, ['scheduled', 'completed', 'cancelled', 'no_show'], 'status');
    validateEnum(data.interest_level, ['high', 'medium', 'low', 'none'], 'interest_level');
};

// Validate task data
export const validateTask = (data) => {
    validateRequired(['title'], data);

    validateEnum(data.task_type, ['follow_up', 'showing', 'document', 'closing'], 'task_type');
    validateEnum(data.priority, ['low', 'medium', 'high', 'urgent'], 'priority');
    validateEnum(data.status, ['pending', 'completed', 'cancelled'], 'status');
    validateEnum(data.related_to, ['deal', 'client', 'property'], 'related_to');
};

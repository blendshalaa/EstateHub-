// Pagination helper
export const getPagination = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    return { page, limit, offset };
};

// Build pagination response
export const paginatedResponse = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);

    return {
        success: true,
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

// Sort helper - validates and returns sort clause
export const getSortClause = (query, allowedFields, defaultField = 'created_at', defaultOrder = 'DESC') => {
    const sortField = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
    const sortOrder = query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : defaultOrder;

    return `${sortField} ${sortOrder}`;
};

// Format date for response
export const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toISOString();
};

// Build WHERE clause from filters
export const buildWhereClause = (filters, startIndex = 1) => {
    const conditions = [];
    const values = [];
    let paramIndex = startIndex;

    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                conditions.push(`${key} = ANY($${paramIndex})`);
                values.push(value);
            } else if (typeof value === 'object' && value.min !== undefined) {
                // Range filter
                if (value.min !== undefined && value.min !== '') {
                    conditions.push(`${key} >= $${paramIndex}`);
                    values.push(value.min);
                    paramIndex++;
                }
                if (value.max !== undefined && value.max !== '') {
                    conditions.push(`${key} <= $${paramIndex}`);
                    values.push(value.max);
                    paramIndex++;
                }
                continue;
            } else if (typeof value === 'string' && value.includes('%')) {
                // LIKE query
                conditions.push(`${key} ILIKE $${paramIndex}`);
                values.push(value);
            } else {
                conditions.push(`${key} = $${paramIndex}`);
                values.push(value);
            }
            paramIndex++;
        }
    }

    return {
        clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
        values,
        nextIndex: paramIndex
    };
};

// Clean object - remove undefined/null properties
export const cleanObject = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
    );
};

// Generate a random string
export const generateRandomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Calculate days between dates
export const daysBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

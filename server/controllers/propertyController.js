import { query, getClient } from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPagination, paginatedResponse, daysBetween } from '../utils/helpers.js';
import { validateProperty, validateEnum } from '../utils/validators.js';

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
export const getAllProperties = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const {
        status, property_type, listing_type, city, state,
        min_price, max_price, min_bedrooms, max_bedrooms,
        min_sqft, max_sqft, agent_id, search, sortBy, sortOrder
    } = req.query;

    let queryText = `
    SELECT p.*, 
           a.first_name as agent_first_name, 
           a.last_name as agent_last_name,
           (SELECT url FROM property_photos WHERE property_id = p.id AND is_primary = true LIMIT 1) as primary_photo,
           (SELECT COUNT(*) FROM property_photos WHERE property_id = p.id) as photo_count
    FROM properties p
    LEFT JOIN agents a ON p.agent_id = a.id
    WHERE 1=1
  `;
    const queryParams = [];
    let paramIndex = 1;

    // Build filters
    if (status) {
        queryText += ` AND p.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
    }

    if (property_type) {
        queryText += ` AND p.property_type = $${paramIndex}`;
        queryParams.push(property_type);
        paramIndex++;
    }

    if (listing_type) {
        queryText += ` AND p.listing_type = $${paramIndex}`;
        queryParams.push(listing_type);
        paramIndex++;
    }

    if (city) {
        queryText += ` AND p.city ILIKE $${paramIndex}`;
        queryParams.push(`%${city}%`);
        paramIndex++;
    }

    if (state) {
        queryText += ` AND p.state = $${paramIndex}`;
        queryParams.push(state);
        paramIndex++;
    }

    if (min_price) {
        queryText += ` AND p.price >= $${paramIndex}`;
        queryParams.push(parseFloat(min_price));
        paramIndex++;
    }

    if (max_price) {
        queryText += ` AND p.price <= $${paramIndex}`;
        queryParams.push(parseFloat(max_price));
        paramIndex++;
    }

    if (min_bedrooms) {
        queryText += ` AND p.bedrooms >= $${paramIndex}`;
        queryParams.push(parseInt(min_bedrooms));
        paramIndex++;
    }

    if (max_bedrooms) {
        queryText += ` AND p.bedrooms <= $${paramIndex}`;
        queryParams.push(parseInt(max_bedrooms));
        paramIndex++;
    }

    if (min_sqft) {
        queryText += ` AND p.square_feet >= $${paramIndex}`;
        queryParams.push(parseInt(min_sqft));
        paramIndex++;
    }

    if (max_sqft) {
        queryText += ` AND p.square_feet <= $${paramIndex}`;
        queryParams.push(parseInt(max_sqft));
        paramIndex++;
    }

    if (agent_id) {
        queryText += ` AND p.agent_id = $${paramIndex}`;
        queryParams.push(parseInt(agent_id));
        paramIndex++;
    }

    if (search) {
        queryText += ` AND (p.address ILIKE $${paramIndex} OR p.city ILIKE $${paramIndex} OR p.mls_number ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
    }

    // Get total count
    const countQuery = queryText.replace(
        /SELECT p\.\*.*FROM properties p/s,
        'SELECT COUNT(*) FROM properties p'
    );
    const countResult = await query(countQuery.split('ORDER BY')[0], queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Add sorting
    const allowedSortFields = ['price', 'created_at', 'listing_date', 'bedrooms', 'square_feet', 'days_on_market'];
    const sortField = allowedSortFields.includes(sortBy) ? `p.${sortBy}` : 'p.created_at';
    const order = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    queryText += ` ORDER BY ${sortField} ${order}`;

    // Add pagination
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    res.json(paginatedResponse(result.rows, total, page, limit));
});

// @desc    Get property by ID
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
        `SELECT p.*, 
            a.id as agent_id, a.first_name as agent_first_name, 
            a.last_name as agent_last_name, a.phone as agent_phone,
            a.photo_url as agent_photo, u.email as agent_email
     FROM properties p
     LEFT JOIN agents a ON p.agent_id = a.id
     LEFT JOIN users u ON a.user_id = u.id
     WHERE p.id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    // Get photos
    const photos = await query(
        `SELECT id, url, caption, is_primary, display_order
     FROM property_photos
     WHERE property_id = $1
     ORDER BY display_order, is_primary DESC`,
        [id]
    );

    // Get documents
    const documents = await query(
        `SELECT id, document_type, file_name, file_url, uploaded_at
     FROM property_documents
     WHERE property_id = $1
     ORDER BY uploaded_at DESC`,
        [id]
    );

    // Get recent showings
    const showings = await query(
        `SELECT s.id, s.scheduled_date, s.status, s.feedback, s.interest_level,
            c.first_name as client_first_name, c.last_name as client_last_name
     FROM showings s
     LEFT JOIN clients c ON s.client_id = c.id
     WHERE s.property_id = $1
     ORDER BY s.scheduled_date DESC
     LIMIT 10`,
        [id]
    );

    res.json({
        success: true,
        data: {
            ...result.rows[0],
            photos: photos.rows,
            documents: documents.rows,
            showings: showings.rows
        }
    });
});

// @desc    Create property
// @route   POST /api/properties
// @access  Private
export const createProperty = asyncHandler(async (req, res) => {
    const {
        mls_number, address, city, state, zip_code, country,
        latitude, longitude, property_type, listing_type, status,
        price, bedrooms, bathrooms, square_feet, lot_size, year_built,
        description, features, listing_date, agent_id
    } = req.body;

    validateProperty(req.body);

    // Calculate days on market
    const daysOnMarket = listing_date ? daysBetween(listing_date, new Date()) : 0;

    const result = await query(
        `INSERT INTO properties (
      mls_number, address, city, state, zip_code, country,
      latitude, longitude, property_type, listing_type, status,
      price, bedrooms, bathrooms, square_feet, lot_size, year_built,
      description, features, listing_date, days_on_market, agent_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    RETURNING *`,
        [
            mls_number || null, address, city, state, zip_code, country || 'USA',
            latitude || null, longitude || null, property_type, listing_type, status || 'available',
            price, bedrooms || null, bathrooms || null, square_feet || null, lot_size || null, year_built || null,
            description || null, features ? JSON.stringify(features) : null, listing_date, daysOnMarket, agent_id || null
        ]
    );

    res.status(201).json({
        success: true,
        message: 'Property created successfully',
        data: result.rows[0]
    });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
export const updateProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        mls_number, address, city, state, zip_code, country,
        latitude, longitude, property_type, listing_type, status,
        price, bedrooms, bathrooms, square_feet, lot_size, year_built,
        description, features, listing_date, sold_date, agent_id
    } = req.body;

    // Check if property exists
    const existingProperty = await query('SELECT id, listing_date FROM properties WHERE id = $1', [id]);

    if (existingProperty.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    // Validate enums if provided
    if (property_type) validateEnum(property_type, ['residential', 'commercial', 'land', 'multi-family'], 'property_type');
    if (listing_type) validateEnum(listing_type, ['sale', 'rent', 'lease'], 'listing_type');
    if (status) validateEnum(status, ['available', 'pending', 'under_contract', 'sold', 'off_market'], 'status');

    // Recalculate days on market
    const listingDateToUse = listing_date || existingProperty.rows[0].listing_date;
    const daysOnMarket = daysBetween(listingDateToUse, new Date());

    const result = await query(
        `UPDATE properties SET
      mls_number = COALESCE($1, mls_number),
      address = COALESCE($2, address),
      city = COALESCE($3, city),
      state = COALESCE($4, state),
      zip_code = COALESCE($5, zip_code),
      country = COALESCE($6, country),
      latitude = COALESCE($7, latitude),
      longitude = COALESCE($8, longitude),
      property_type = COALESCE($9, property_type),
      listing_type = COALESCE($10, listing_type),
      status = COALESCE($11, status),
      price = COALESCE($12, price),
      bedrooms = COALESCE($13, bedrooms),
      bathrooms = COALESCE($14, bathrooms),
      square_feet = COALESCE($15, square_feet),
      lot_size = COALESCE($16, lot_size),
      year_built = COALESCE($17, year_built),
      description = COALESCE($18, description),
      features = COALESCE($19, features),
      listing_date = COALESCE($20, listing_date),
      sold_date = $21,
      days_on_market = $22,
      agent_id = COALESCE($23, agent_id),
      last_modified_date = CURRENT_DATE
    WHERE id = $24
    RETURNING *`,
        [
            mls_number, address, city, state, zip_code, country,
            latitude, longitude, property_type, listing_type, status,
            price, bedrooms, bathrooms, square_feet, lot_size, year_built,
            description, features ? JSON.stringify(features) : null, listing_date, sold_date || null,
            daysOnMarket, agent_id, id
        ]
    );

    res.json({
        success: true,
        message: 'Property updated successfully',
        data: result.rows[0]
    });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
export const deleteProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
        'DELETE FROM properties WHERE id = $1 RETURNING id',
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    res.json({
        success: true,
        message: 'Property deleted successfully'
    });
});

// @desc    Add property photo
// @route   POST /api/properties/:id/photos
// @access  Private
export const addPropertyPhoto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { url, caption, is_primary, display_order } = req.body;

    // Check if property exists
    const propertyResult = await query('SELECT id FROM properties WHERE id = $1', [id]);

    if (propertyResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    if (!url) {
        return res.status(400).json({
            success: false,
            message: 'Photo URL is required'
        });
    }

    // If this is primary, unset other primary photos
    if (is_primary) {
        await query(
            'UPDATE property_photos SET is_primary = false WHERE property_id = $1',
            [id]
        );
    }

    const result = await query(
        `INSERT INTO property_photos (property_id, url, caption, is_primary, display_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
        [id, url, caption || null, is_primary || false, display_order || 0]
    );

    res.status(201).json({
        success: true,
        message: 'Photo added successfully',
        data: result.rows[0]
    });
});

// @desc    Delete property photo
// @route   DELETE /api/properties/:id/photos/:photoId
// @access  Private
export const deletePropertyPhoto = asyncHandler(async (req, res) => {
    const { id, photoId } = req.params;

    const result = await query(
        'DELETE FROM property_photos WHERE id = $1 AND property_id = $2 RETURNING id',
        [photoId, id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Photo not found'
        });
    }

    res.json({
        success: true,
        message: 'Photo deleted successfully'
    });
});

// @desc    Add property document
// @route   POST /api/properties/:id/documents
// @access  Private
export const addPropertyDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { document_type, file_name, file_url } = req.body;

    // Check if property exists
    const propertyResult = await query('SELECT id FROM properties WHERE id = $1', [id]);

    if (propertyResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    if (!file_name || !file_url) {
        return res.status(400).json({
            success: false,
            message: 'File name and URL are required'
        });
    }

    if (document_type) {
        validateEnum(document_type, ['deed', 'inspection', 'disclosure', 'contract'], 'document_type');
    }

    const result = await query(
        `INSERT INTO property_documents (property_id, document_type, file_name, file_url, uploaded_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
        [id, document_type || null, file_name, file_url, req.user?.id || null]
    );

    res.status(201).json({
        success: true,
        message: 'Document added successfully',
        data: result.rows[0]
    });
});

// @desc    Delete property document
// @route   DELETE /api/properties/:id/documents/:docId
// @access  Private
export const deletePropertyDocument = asyncHandler(async (req, res) => {
    const { id, docId } = req.params;

    const result = await query(
        'DELETE FROM property_documents WHERE id = $1 AND property_id = $2 RETURNING id',
        [docId, id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Document not found'
        });
    }

    res.json({
        success: true,
        message: 'Document deleted successfully'
    });
});

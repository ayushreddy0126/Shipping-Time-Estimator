// Database connection configuration
import pool from "./db.js";

// INSERT new shipping record
async function addShippingRecord(data) {
	const {
		sender_name,
		recipient_name,
		zip_from,
		zip_to,
		distance,
		zone,
		occasion,
		ordered_date,
		delivery_date,
		shipping_method,
	} = data;

	const query = `
    INSERT INTO shipping_records
    (sender_name, recipient_name, zip_from, zip_to, distance, zone, occasion, ordered_date, delivery_date, shipping_method)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

	const values = [
		sender_name,
		recipient_name,
		zip_from,
		zip_to,
		distance,
		zone,
		occasion,
		ordered_date,
		delivery_date,
		shipping_method,
	];
	const result = await pool.query(query, values);
	return result.rows[0]; // return the inserted row
}

// GET all shipping records
async function getAllShippingRecords() {
	const result = await pool.query(
		"SELECT * FROM shipping_records ORDER BY id DESC;",
	);
	return result.rows;
}

// GET a shipping record by ID
async function getShippingRecordById(id) {
	const result = await pool.query(
		"SELECT * FROM shipping_records WHERE id = $1;",
		[id],
	);
	return result.rows[0];
}

// DELETE a shipping record by ID
async function deleteShippingRecordById(id) {
	await pool.query("DELETE FROM shipping_records WHERE id = $1;", [id]);
	return { message: `Shipping record with ID ${id} deleted.` };
}

// UPDATE a shipping record
async function updateShippingRecord(id, updatedData) {
	const {
		sender_name,
		recipient_name,
		zip_from,
		zip_to,
		distance,
		zone,
		occasion,
		ordered_date,
		delivery_date,
		shipping_method,
	} = updatedData;

	const query = `
    UPDATE shipping_records
    SET sender_name = $1,
        recipient_name = $2,
        zip_from = $3,
        zip_to = $4,
        distance = $5,
        zone = $6,
        occasion = $7,
        ordered_date = $8,
        delivery_date = $9,
        shipping_method = $10
    WHERE id = $11
    RETURNING *;
  `;

	const values = [
		sender_name,
		recipient_name,
		zip_from,
		zip_to,
		distance,
		zone,
		occasion,
		ordered_date,
		delivery_date,
		shipping_method,
		id,
	];
	const result = await pool.query(query, values);
	return result.rows[0];
}

async function getShippingMethods() {
	return ["Standard", "Priority", "Express"];
}

// Export all functions to be used in API routes
export {
	addShippingRecord,
	getAllShippingRecords,
	getShippingRecordById,
	deleteShippingRecordById,
	updateShippingRecord,
	getShippingMethods,
};

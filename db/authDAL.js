// db/authDAL.js

import db from "./db.js";

async function createUser(email, hashedPassword) {
	const result = await db.query(
		"INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *",
		[email, hashedPassword],
	);
	return result.rows[0];
}

async function createAdminUser(email, hashedPassword) {
	const result = await db.query(
		"INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin') RETURNING *",
		[email, hashedPassword],
	);
	return result.rows[0];
}

async function findUserByEmail(email) {
	const result = await db.query("SELECT * FROM users WHERE email = $1", [
		email,
	]);
	return result.rows[0];
}

async function getAllUsers() {
	const result = await db.query(
		"SELECT id, email, role FROM users ORDER BY id ASC",
	);
	return result.rows;
}

async function updateUserRole(email, role) {
	const result = await db.query(
		"UPDATE users SET role = $1 WHERE email = $2 RETURNING *",
		[role, email],
	);
	return result.rows[0];
}

async function deleteUserByEmail(email) {
	await db.query("DELETE FROM users WHERE email = $1", [email]);
}

export {
	createUser,
	findUserByEmail,
	getAllUsers,
	updateUserRole,
	createAdminUser,
	deleteUserByEmail,
};

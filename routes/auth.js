import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { saveAddress, getSavedAddresses } from "../db/addressDAL.js";
import { createUser, findUserByEmail, getAllUsers } from "../db/authDAL.js";

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || "dev-secret";

// Save an address
router.post("/addresses", verifyToken, async (req, res) => {
	const { address } = req.body;
	if (!address) {
		return res.status(400).json({ error: "Address are required" });
	}

	try {
		const saved = await saveAddress(req.user.id, label, address);
		res.json({ message: "Address saved", address: saved });
	} catch (err) {
		console.error("Save address error:", err);
		res.status(500).json({ error: "Failed to save address" });
	}
});

// Get saved addresses
router.get("/addresses", verifyToken, async (req, res) => {
	try {
		const addresses = await getSavedAddresses(req.user.id);
		res.json(addresses);
	} catch (err) {
		console.error("Get addresses error:", err);
		res.status(500).json({ error: "Failed to fetch addresses" });
	}
});

// Middleware to verify JWT
function verifyToken(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) return res.status(401).json({ error: "Missing token" });

	try {
		const decoded = jwt.verify(token, jwtSecret);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(403).json({ error: "Invalid or expired token" });
	}
}

//middleware to admin
function requireAdmin(req, res, next) {
	if (req.user.role !== "admin") {
		return res.status(403).json({ error: "Access denied. Admins only." });
	}
	next();
}

// list Users
router.get("/list", verifyToken, requireAdmin, async (req, res) => {
	try {
		const users = await getAllUsers();
		res.json(users);
	} catch (err) {
		console.error("List error:", err);
		res.status(500).send("Error fetching users");
	}
});

// Register
router.post("/register", async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required." });
	}

	try {
		const existing = await findUserByEmail(email);
		if (existing) {
			return res.status(400).json({ error: "Email already registered." });
		}

		const hashed = await bcrypt.hash(password, 10);
		const user = await createUser(email, hashed);
		res.status(201).json({
			message: "User registered successfully",
			user: { id: user.id, email: user.email },
		});
	} catch (err) {
		console.error("Registration error:", err);
		res.status(500).json({ error: "Internal registration error" });
	}
});

// login
router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await findUserByEmail(email);
		if (!user || !(await bcrypt.compare(password, user.password_hash))) {
			return res.status(401).json({ error: "Incorrect email or password." });
		}
		const token = jwt.sign(
			{ id: user.id, email: user.email, role: user.role },
			jwtSecret,
			{ expiresIn: "1h" },
		);

		res.json({ token });
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).json({ error: "Login error" });
	}
});

// Logout
router.post("/logout", verifyToken, (req, res) => {
	res.json({ message: "Successfully logged out on client." });
});

export { router, verifyToken };

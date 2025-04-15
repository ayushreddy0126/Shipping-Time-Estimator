import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
	user: "zhangyongzhen99",
	host: "localhost",
	database: "shipping_db",
	password: "CS5610",
	port: 5432,
});

export default pool;

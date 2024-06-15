// Globale Variable, die den Verbindungs-Pool für die MariaDB-Verbindungen speichert
let pool = null;

// Funktion zur Initialisierung der MariaDB-Verbindung
const initializeMariaDB = () => {
  // Importieren des mariadb-Moduls
  const mariadb = require("mariadb");

  // Erstellen eines Verbindungs-Pools mit den Konfigurationsparametern
  pool = mariadb.createPool({
    database: process.env.DB_NAME || "mychat",
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "mychat",
    password: process.env.DB_PASSWORD || "mychatpassword",
    connectionLimit: 5,
    allowPublicKeyRetrieval: true,
  });
};

// Funktion zur Ausführung von SQL-Abfragen
const executeSQL = async (query) => {
  let conn;
  try {
    // Abrufen einer Verbindung aus dem Pool
    conn = await pool.getConnection();
    // Ausführen der SQL-Abfrage
    const res = await conn.query(query);
    // Zurückgeben des Ergebnisses der Abfrage
    return res;
  } catch (err) {
    // Fehlerbehandlung bei der Ausführung der Abfrage
    console.log(err);
  } finally {
    // Freigeben der Verbindung zurück in den Pool
    if (conn) conn.release();
  }
};

// Funktion zur Initialisierung des Datenbankschemas
const initializeDBSchema = async () => {
  const userTableQuery = `CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
  );`;
  await executeSQL(userTableQuery);

  const messageTableQuery = `CREATE TABLE IF NOT EXISTS messages (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    timestamp VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );`;
  await executeSQL(messageTableQuery);

  const tokensTableQuery = `CREATE TABLE IF NOT EXISTS tokens (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );`;
  await executeSQL(tokensTableQuery);
};

// Exportieren der Funktionen zur Nutzung in anderen Modulen
module.exports = { executeSQL, initializeMariaDB, initializeDBSchema };
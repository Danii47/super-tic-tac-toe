const {
  PORT = 3000,
  SERVER_URL = `http://localhost:${PORT}`,
} = process.env;

module.exports = { PORT, SERVER_URL }
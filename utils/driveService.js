const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
  keyFile: "./aws-cognito-363816-976d98468f1c.json",
  scopes: SCOPES,
});

module.exports = google.drive({ version: "v3", auth: auth });

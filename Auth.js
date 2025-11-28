import express from "express";
import 'dotenv/config';
import axios from "axios";
import qs from "querystring";
import crypto from "crypto";
import fs from "fs";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  const authUrl = `${process.env.AUTH_URL}?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&state=${state}`;
  console.log("🔗 Redirecionando para:", authUrl);
  res.redirect(authUrl);
});  


app.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send("Erro: código de autorização não recebido.");
  }
  console.log("✅ Código recebido do Mercado Livre:", code);

  try {
    const authHeader = Buffer
      .from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`)
      .toString("base64");

    const data = qs.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.REDIRECT_URI
    });

    const response = await axios.post(
      process.env.TOKEN_URL,
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${authHeader}`
        }
      }
    );

    const tokenData = response.data;
    console.log("🔐 Token recebido:", tokenData);

    res.json({ message: "Autenticação bem-sucedida!",
      tokens: tokenData
    });

    fs.writeFileSync("tokens.json", JSON.stringify(tokenData, null, 2), "utf-8");

    console.log("💾 Tokens salvos em tokens.json");
  } catch (error) {
    console.error("❌ Erro ao obter o token:", error.response ? error.response.data : error.message);
    res.status(500).send("Erro ao obter o token de acesso.");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
} );
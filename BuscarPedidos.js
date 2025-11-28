import express from 'express';
import fs from 'fs';
import axios from 'axios';
import 'dotenv/config';
import { configDotenv } from 'dotenv';

configDotenv();



function readTokens() {
 try {
   const data = fs.readFileSync('tokens.json', 'utf-8');
   return JSON.parse(data);
 } catch (error) {
   console.error("Erro ao ler tokens.json:", error);
   return null;
 }
}

const router = express.Router();

router.get ("/buscarpedidos", async (req, res) => {
try {
    const { dataInicial, dataFinal } = req.query;

if (!dataInicial || !dataFinal) {
    return res.status(400).json({ error: "Parâmetros dataInicial e dataFinal são obrigatórios." });
}


    const tokens = readTokens();
    if (!tokens || !tokens.access_token) {
        return res.status(500).json({ error: "Acess token não encontrado. Autentique-se primeiro." });
    }

    const url = `https://api.mercadolibre.com/orders/search?seller=${tokens.user_id}&order.date_created.from=${encodeURIComponent(dataInicial)}&order.date_created.to=${encodeURIComponent(dataFinal)};`;
const response = await axios.get(url, {
    headers: {
        "Authorization": `Bearer ${tokens.access_token}`,
        Accept  : "application/json"
    },
    timeout: 15000
});

    return res.json({
            message: "Produtos Listados com Sucesso!",
            data: response.data
        });
    } catch (error) {
        console.error("❌ Erro ao buscar os produtos:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }
        const details = error.response?.data || error.message;
        const statusCode = error.response?.status || 500;
        return res.status(statusCode).json({
            error: "Erro ao consultar saldo do produto",
            details
        });
    }
});

export default router;
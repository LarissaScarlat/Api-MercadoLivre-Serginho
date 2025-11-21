import express from "express"; // Express seria facilitar a criaçao de rotas - Instalação dele e feita atraves do node express
import 'dotenv/config'; // Importa variaveis de ambiente do arquivo .env - como codigos de chave de acesso secreta da API para não ficar conectada no front 
import axios from "axios"; // Biblioteca para fazer requisições HTTP - Instalação via npm axios
import qs from "querystring"; // Para montar o corpo x-www-form-urlencoded - usado quando voce envia via POST para apis que não aceitam JSON
import crypto from "crypto";  // Para gerar o parâmetro 'state' aleatório - usado para segurança na autenticação OAuth. Gerar dados seguros e numeros aleatórios de segurança
import fs from "fs";


//_____ROTA DE AUTORIZAÇÃO__COMEÇO DA ROTA//
//Json JSON significa JavaScript Object Notation.
//  É um formato de texto usado pra trocar dados entre sistemas (como cliente ↔ servidor, ou entre APIs).
// Em outras palavras:

//JSON é uma forma padronizada de representar dados de forma leve, legível e fácil de processar por qualquer linguagem.
 import cors from "cors";

const app = express(); // Cria uma instância do aplicativo Express assignando-a à constante app
const PORT = process.env.PORT || 3000; // Define a porta do servidor a partir da variável de ambiente ou usa a porta 3000 como padrão


app.use(cors());  
app.use(express.json());

// app = é o servidor express que criamos que seria const app = express(); - OBS: PRECISO ENTENDER MELHOR ESSE CODIGO APP *********
//ATENÇÃO NA INFORMAÇÃO ABAIXO SOBRE O app.get

// get → define que essa rota responde a requisições do tipo GET (ou seja, quando o navegador acessa a URL).
//"/authorition" → é o caminho da rota. Quem coloca esse caminho é você, e ele pode ser qualquer coisa que faça sentido para sua aplicação.
//(req, res) → são os objetos de requisição (req) e resposta (res) do Express. req contém informações sobre a requisição feita pelo cliente, e res é usado para enviar a resposta de volta ao cliente.
// => { ... } → é a função que será executada quando essa rota for acessada. Dentro dessa função, você pode colocar o código que define o que deve acontecer quando alguém acessa essa rota.
//state = é um parâmetro de segurança usado no OAuth2 para prevenir ataques CSRF (Cross-Site Request Forgery). Ele é um valor aleatório que você gera antes de iniciar o fluxo de autenticação e envia junto com a requisição de autorização. Quando o provedor de autenticação redireciona o usuário de volta para sua aplicação, ele inclui esse mesmo valor de state na resposta. Sua aplicação deve então verificar se o valor recebido corresponde ao valor que foi enviado inicialmente. Se os valores não coincidirem, isso indica que a requisição pode ter sido adulterada, e sua aplicação deve rejeitar a resposta.
app.get("/", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");

  const authUrl = `${process.env.TOKEN_URL}?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&state=${state}`;



  console.log("🔗 Redirecionando para:", authUrl);
  res.redirect(authUrl);
});
//Informações sobre o codgio acima
// o que seria AUTHURL - ATENÇÃO ESTUDAR SOBRE ISSO

//Declara uma constante chamada authUrl - Armazena dentro dela um valor (no caso, uma URL)
//Você está criando uma variável com nome authUrl Essa variável não pode ser reatribuída (por causa do const) O valor que ficará armazenado dentro dela representa uma URL de autenticação (auth + url → authUrl)
// LINHA N° 27 DO CODIGO SIGNIFICA  Essa linha monta a URL de autorização da API do Bling (ou outro serviço OAuth2).

//Vamos quebrar ela:

//process.env.TOKEN_URL → vem do arquivo .env, onde você guarda variáveis de ambiente (seguras e privadas).
//Exemplo:


//response_type=code → informa ao servidor do Bling que você quer um authorization code (código temporário usado para obter o token de acesso).

//client_id=${process.env.CLIENT_ID} → identifica seu aplicativo registrado no Bling.

//state=${state} → é o token aleatório de segurança gerado acima.

//Em resumo:
//Essa linha monta a URL completa para redirecionar o usuário ao Bling, passando todos os parâmetros necessários.


//_____ROTA DE AUTORIZAÇÃO__FIM DA ROTA//

//_____ROTA DE CALLBACK__COMEÇO DA ROTA//
// Rota de callback para onde o Bling redireciona após a autorização

// EXPLICAÇÃO DO CÓDIGO ABAIXO
// app.get → define uma rota que responde a requisições GET.
// "/callback" → é o caminho da rota de callback. Esse caminho deve corresponder ao que você registrou no Bling como redirect_uri.
// get é um método do Express usado para definir rotas que respondem a requisições HTTP do tipo GET. Ou seja, quando alguém acessa uma URL específica no seu servidor, o método get define o que deve acontecer.
// (req, res) → são os objetos de requisição (req) e resposta (res) do Express. req contém informações sobre a requisição feita pelo cliente, e res é usado para enviar a resposta de volta ao cliente.
// => { ... } → é a função que será executada quando essa rota for acessada. Dentro dessa função, você pode colocar o código que define o que deve acontecer quando alguém acessa essa rota.
// code : o código temporário de autorização retornado pelo provedor OAuth.
// state : o parâmetro de estado enviado na requisição inicial, usado para verificar a integridade da requisição.
// if (!code) { ... } → verifica se o código de autorização não foi recebido. Se não foi, retorna um erro 400 (Bad Request) com uma mensagem.
// return res.status(400).send("Erro: código de autorização não recebido."); → envia uma resposta de erro ao cliente se o código de autorização não foi recebido.
// console.log("✅ Código recebido do Bling:", code); → exibe no console o código de autorização recebido para fins de depuração.
// try { ... } catch (error) { ... } → bloco para tentar executar o código dentro do try e capturar qualquer erro que ocorra, lidando com ele no catch.
// const { code, state } = req.query; → extrai os parâmetros code e state da query string da requisição.
// async (req, res) → indica que a função é assíncrona, permitindo o uso de await dentro dela para operações assíncronas, como chamadas HTTP.


app.get("/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send("Erro: código de autorização não recebido.");
  }

    console.log("✅ Código recebido do Bling:", code);

// criação de credenciais em base64 Essa parte constrói um valor chamado credentials, usado normalmente no cabeçalho HTTP: Authorization: Basic <credenciais codificadas>
//Buffer é uma classe do Node.js usada para manipular dados binários.
//Buffer.from(string) cria um buffer contendo o texto que você passou.
//${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET} Isso cria uma string no formato:
//process.env acessa variáveis de ambiente do sistema operacional. que geralmente são usadas para armazenar informações sensíveis, como IDs de cliente e segredos e ficam dentro do .env
//CLIENT_ID e CLIENT_SECRET são variáveis de ambiente que você definiu no arquivo .env. Elas armazenam o ID do cliente e o segredo do cliente, respectivamente.
//A concatenação com : cria uma string no formato esperado para autenticação básica (Basic Auth).
//.toString("base64") converte o buffer em uma string codificada em base64, que é o formato necessário para o cabeçalho de autorização HTTP.
//ATENÇÃO APRENDER MAIS SOBRE BINARIOS E STRING//----------------------------------------------
//.toString("base64") transforma o conteúdo do buffer em uma string codificada em Base64. Essa é a forma padrão de enviar credenciais no OAuth2 no modo Basic Auth.

  try {
    

    //INICIO DO CODIGO E EXPLICAÇÃO----------------------------------------------
// Nesse caso esse trecho do codigo seria preparar os dados para enviar a requisição de troca do código de autorização pelo token de acesso
   const data = qs.stringify({
  grant_type: "authorization_code",
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  code,
  redirect_uri: process.env.REDIRECT_URI
});

// const data Armazenar o corpo da requisição POST	✔Enviar os parâmetros necessários para trocar o code por token	✔Garantir que o formato esteja correto (“application/x-www-form-urlencoded”)	✔Ser usado pelo axios/fetch na chamada ao endpoint /token
// qs é o módulo querystring que você importou no início do arquivo. Ele é usado para converter um objeto JavaScript em uma string no formato x-www-form-urlencoded, que é o formato esperado pela maioria dos servidores ao receber dados via POST.
// qs.stringify({ ... }) pega o objeto que você passou e o converte em uma string formatada corretamente para ser enviada em uma requisição HTTP.
// grant_type: "authorization_code" indica que você está usando o fluxo de autorização com código (authorization code flow) para obter o token de acesso.
// code: code passa o código de autorização que você recebeu do Bling na etapa anterior.
// O resultado final é uma string que pode ser enviada no corpo da requisição HTTP para trocar o código de autorização pelo token de acesso.
    //FIM DO CODIGO E EXPLICAÇÃO----------------------------------------------

    //INICIO DO CODIGO E EXPLICAÇÃO----------------------------------------------
// Nesse caso esse trecho do codigo seria fazer a requisição POST para o endpoint de token do Bling
const response = await axios.post(
      process.env.TOKEN_URL,
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept":"application/json"
        }
      }
    );

    // response Armazena a resposta da requisição POST ✔ Contém o token de acesso retornado pelo Bling ✔ Usado para acessar recursos protegidos da API
    // axios.post(...) faz uma requisição HTTP POST para o endpoint de token do Bling.
    // process.env.TOKEN_URL vem do arquivo .env, onde você definiu a URL do endpoint de token.
    // data é o corpo da requisição que você preparou anteriormente, contendo os parâmetros necessários. 
    // Os headers definem o tipo de conteúdo, o formato aceito na resposta e a autorização usando as credenciais codificadas em base64.
    // A resposta da requisição é armazenada na variável response.
    //FIM DO CODIGO E EXPLICAÇÃO----------------------------------------------

    //INICIO DO CODIGO E EXPLICAÇÃO----------------------------------------------
// Nesse caso esse trecho do codigo seria extrair os tokens da resposta e enviar uma resposta ao cliente
// response.data contém os dados retornados pelo Bling, que incluem os tokens de acesso.
// console.log exibe os tokens no console para depuração.
// res.json envia uma resposta JSON ao cliente com os tokens recebidos.
//
const tokenData = response.data;

    console.log("🎟️ Tokens recebidos do Bling:");
    console.log(tokenData);

    res.json({
      message: "Autorização concluída com sucesso!",
      tokens: tokenData
    });
    //FIM DO CODIGO E EXPLICAÇÃO----------------------------------------------

    //INICIO DO CODIGO E EXPLICAÇÃO----------------------------------------------   
    // Importa o módulo fs (file system) do Node.js para manipulação de arquivos
    // fs.writeFileSync é um método síncrono que escreve dados em um arquivo
    // "tokens.json" é o nome do arquivo onde os tokens serão salvos
    // JSON.stringify converte o objeto tokenData em uma string JSON formatada
    // null, 2 são parâmetros para formatar a saída JSON com indentação de 2 espaços para melhor legibilidade

    // Salva no arquivo tokens.json
  fs.writeFileSync("tokens.json", JSON.stringify(tokenData, null, 2), "utf-8");

  console.log("💾 Tokens salvos com sucesso no arquivo tokens.json!");

  } catch (error) {
    console.error("❌ Erro ao obter tokens:", error.response?.data || error.message);
    res.status(500).send("Erro ao obter tokens de acesso.");
  }
});
//_____ROTA DE CALLBACK__FIM DA ROTA//


app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em https://api-bling-baratao.onrender.com/callback`);
}); // Inicia o servidor na porta definida e exibe uma mensagem no console indicando que o servidor está rodando


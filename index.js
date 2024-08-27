const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware CORS para permitir todas as origens
app.use(cors({
    origin: '*', // Permite todas as origens
}));

// Middleware para servir arquivos estáticos
app.use(express.static('public'));

// Caminho para o arquivo Nba.json
const nbaJsonPath = path.join(__dirname, 'Nba.json');

// Função para ler e atualizar o número de cliques por domínio que está se conectando à API
function updateClickCount(domain) {
    console.log(`Ocorreu um clique do domínio: ${domain}`);

    let clickData = {};

    // Verifica se o arquivo existe, senão, cria um novo
    if (fs.existsSync(nbaJsonPath)) {
        let data = fs.readFileSync(nbaJsonPath, 'utf-8');
        clickData = JSON.parse(data);
    }

    // Inicializa a contagem para o domínio se ainda não existir
    if (!clickData[domain]) {
        clickData[domain] = 0;
    }

    // Incrementa a contagem para o domínio
    clickData[domain] += 1;

    // Salva os dados atualizados
    fs.writeFileSync(nbaJsonPath, JSON.stringify(clickData, null, 2), 'utf-8');

    return clickData[domain];
}

// Endpoint para obter o número de cliques e o URL do YouTube
app.get('/get-url', (req, res) => {
    try {
        // Captura o domínio de onde a requisição foi feita usando o cabeçalho Referer ou Origin
        const referer = req.headers.referer || req.headers.origin;

        if (!referer) {
            return res.status(400).json({ error: 'Referer or Origin header is missing' });
        }

        // Extraindo o domínio do referer
        const domain = new URL(referer).hostname;

        const clickCount = updateClickCount(domain);
        const youtubeUrl = "https://www.youtube.com/";

        res.json({ 
            domain: domain,
            clicks: clickCount,
            youtubeUrl: youtubeUrl 
        });
    } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Inicia o servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

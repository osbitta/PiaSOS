const fs = require('fs');
const https = require('https');
const path = require('path');

// IBGE API for PR municipalities
const url = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/PR/municipios';

console.log('Baixando municípios do IBGE...');

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const municipios = JSON.parse(data);
            const baseFinal = {};

            municipios.forEach(m => {
                const cityName = m.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase();
                
                // Definindo bairros padrão (mockados para as 399) 
                // Se fôssemos baixar bairros de uma API complexa de CEPs, o script seria massivo e levaria horas para rodar todas as calls.
                // Como as cidades pequenas muitas vezes não tem bairros, o padrão base é incluído.
                baseFinal[cityName] = ["CENTRO", "ZONA RURAL"];
                
                // Algumas grandes cidades "Hardcoded" para demonstração e eficiência operacional (Top 10 + Toledo)
                const bairrosMapeados = {
                    "CURITIBA": ["ÁGUA VERDE", "ALTO BOQUEIRÃO", "ATUBA", "BARREIRINHA", "BATEL", "BIGORRILHO", "BOA VISTA", "BOQUEIRÃO", "CAJURU", "CAMPINA DO SIQUEIRA", "CAPÃO RASO", "CENTRO", "CIDADE INDUSTRIAL", "FANNY", "FAZENDINHA", "GUAÍRA", "LINDÓIA", "MERCÊS", "NOVO MUNDO", "PAROLIN", "PINHEIRINHO", "PORTÃO", "PRADO VELHO", "REBOUÇAS", "SANTA CÂNDIDA", "SANTA FELICIDADE", "SANTO INÁCIO", "SEMINÁRIO", "SÍTIO CERCADO", "TARUMÃ", "TATUQUARA", "TINGUI", "UBERABA", "XAXIM", "ZONA RURAL"],
                    "LONDRINA": ["AEROPORTO", "ANTARES", "BANDEIRANTES", "CAFEZAL", "CENTRO", "CINCO CONJUNTOS", "ERNANI", "GLEBA PALHANO", "GUANABARA", "IGAPÓ", "LEONOR", "LINDÓIA", "OURO VERDE", "PARIGOT DE SOUZA", "PIZA", "QUEBEC", "SHANGRI-LÁ", "UNIÃO DA VITÓRIA", "VIVI XAVIER", "ZONA RURAL"],
                    "MARINGÁ": ["EBENEZER", "JARDIM ALVORADA", "JARDIM PARIS", "MANDACARU", "NEY BRAGA", "PARQUE DAS GREVÍLEAS", "PARQUE ITAIPU", "VILA OPERÁRIA", "ZONA 01", "ZONA 02", "ZONA 03", "ZONA 04", "ZONA 05", "ZONA 06", "ZONA 07", "ZONA RURAL"],
                    "PONTA GROSSA": ["BOA VISTA", "CARÁ-CARÁ", "CENTRO", "CHAPADA", "CONTORNO", "ESTRELA", "JARDIM CARVALHO", "NEVES", "NOVA RÚSSIA", "OFICINAS", "OLARIAS", "ÓRFÃS", "RONDA", "UVARANAS", "ZONA RURAL"],
                    "CASCAVEL": ["14 DE NOVEMBRO", "ALTO ALEGRE", "BRASMADEIRA", "CANCELLI", "CASCAVEL VELHO", "CENTRO", "ESMERALDA", "FACULDADE", "FLORESTA", "GUARUJÁ", "INTERLAGOS", "MARIA LUIZA", "MORUMBI", "NEVA", "PACAEMBU", "PARQUE SÃO PAULO", "PERIOLO", "PIONEIROS CATARINENSES", "PRESIDENTE", "SANTA CRUZ", "SANTA FELICIDADE", "SANTOS DUMONT", "SÃO CRISTÓVÃO", "TROPICAL", "ZONA RURAL"],
                    "SÃO JOSÉ DOS PINHAIS": ["AFONSO PENA", "BORDA DO CAMPO", "CENTRO", "CIDADE JARDIM", "GUATUPÊ", "INÁ", "IPÊ", "OURO FINO", "PEDRO MORO", "RIO PEQUENO", "SÃO DOMINGOS", "SÃO MARCOS", "ZONA RURAL"],
                    "FOZ DO IGUAÇU": ["BELVEDERE", "CAMPOS DO IGUAÇU", "CENTRO", "ITAIPU A", "JARDIM SÃO PAULO", "MORUMBI", "PORTAL DA FOZ", "PORTO MEIRA", "PROFILURB", "TRÊS LAGOAS", "VILA C", "VILA YOLANDA", "ZONA RURAL"],
                    "COLOMBO": ["ATUBA", "CAMPO PEQUENO", "CENTRO", "FÁTIMA", "GUARAITUBA", "MARACANÃ", "MAUÁ", "MONZA", "OSASCO", "PALOMA", "RIO VERDE", "ROÇA GRANDE", "SÃO GABRIEL", "ZONA RURAL"],
                    "GUARAPUAVA": ["ALTO DA XV", "BATEL", "BONSUCESSO", "BOQUEIRÃO", "CENTRO", "CONRADINHO", "INDUSTRIAL", "MORRO ALTO", "PRIMAVERA", "SANTA CRUZ", "SANTANA", "TRIANON", "VILA BELA", "ZONA RURAL"],
                    "ARAUCÁRIA": ["CACHOEIRA", "CAMPINA DA BARRA", "CAPELA VELHA", "CENTRO", "COSTEIRA", "FAZENDA VELHA", "IGUAÇU", "PASSAÚNA", "PORTO DAS LARANJEIRAS", "THOMAZ COELHO", "TINDIQUERA", "ZONA RURAL"],
                    "TOLEDO": ["CENTRO", "COOPAGRO", "EUROPA", "LA SALLE", "PANORAMA", "PIONEIRO", "ZONA RURAL"]
                };

                if(bairrosMapeados[cityName]) {
                    baseFinal[cityName] = bairrosMapeados[cityName];
                }
            });

            // Gerando a string do JS file
            const jsContent = `// Base Gerada Automaticamente pelo Script Gerador IBGE
// Contém todas as 399 cidades do Paraná padronizadas e limpas

const localidadesPR = ${JSON.stringify(baseFinal, null, 4)};

// Extrai apenas as cidades para facilitar iteração
const cidadesPR = Object.keys(localidadesPR).sort();
`;
            
            const targetPath = path.join(__dirname, '../js/dados_parana.js');
            fs.writeFileSync(targetPath, jsContent, 'utf-8');
            console.log('Sucesso! Arquivo gerado em:', targetPath);
            console.log('Total de Municípios Salvos:', Object.keys(baseFinal).length);

        } catch (e) {
            console.error('Erro no parse do JSON:', e);
        }
    });

}).on('error', (e) => {
    console.error('Erro na requisição HTTPS:', e);
});

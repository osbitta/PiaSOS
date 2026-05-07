const fs = require('fs');
const https = require('https');
const path = require('path');

// IBGE API for SP municipalities
const url = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios';

console.log('Baixando municípios de SP do IBGE...');

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
                
                // Todas as cidades recebem base mínima
                baseFinal[cityName] = ["CENTRO", "ZONA RURAL"];
                
                // ============================================================
                // BAIRROS DETALHADOS DO ESTADO DE SÃO PAULO
                // Foco: Capital (Minucioso), Região Metropolitana completa e Litoral completo.
                // ============================================================
                const bairrosMapeados = {
                    // ================= CAPITAL =================
                    "SAO PAULO": [
                        // ZONA CENTRAL
                        "BELA VISTA", "BOM RETIRO", "BRAS", "CAMBUCI", "CENTRO HISTORICO", "CONSOLACAO", "LIBERDADE", "REPUBLICA", "SANTA CECILIA", "SE",
                        // ZONA LESTE
                        "AGUA RASA", "ARICANDUVA", "ARTUR ALVIM", "BELENZINHO", "CANGAIBA", "CARRAO", "CIDADE LIDER", "CIDADE TIRADENTES", "ERMELINO MATARAZZO", "GUAIANASES", "IGUATEMI", "ITAIM PAULISTA", "ITAQUERA", "JARDIM HELENA", "JOSE BONIFACIO", "LAJEADO", "MOOCA", "PENHA", "PONTE RASA", "SAO LUCAS", "SAO MATEUS", "SAO MIGUEL PAULISTA", "SAPOPEMBA", "TATUAPE", "VILA CURUCA", "VILA FORMOSA", "VILA JACUI", "VILA MATILDE", "VILA PRUDENTE",
                        // ZONA NORTE
                        "ANHANGUERA", "BRASILANDIA", "CACHOEIRINHA", "CASA VERDE", "FREGUESIA DO O", "JACANA", "JARAGUA", "MANDAQUI", "PERUS", "PIRITUBA", "SANTANA", "SAO DOMINGOS", "TREMEMBE", "TUCURUVI", "VILA GUILHERME", "VILA MARIA", "VILA MEDEIROS",
                        // ZONA OESTE
                        "ALTO DE PINHEIROS", "BARRA FUNDA", "BUTANTA", "JAGUARA", "JAGUARE", "JARDIM PAULISTA", "LAPA", "MORUMBI", "PERDIZES", "PINHEIROS", "RAPOSO TAVARES", "RIO PEQUENO", "VILA LEOPOLDINA", "VILA SONIA",
                        // ZONA SUL
                        "CAMPO BELO", "CAMPO GRANDE", "CAMPO LIMPO", "CAPAO REDONDO", "CIDADE ADEMAR", "CIDADE DUTRA", "CURSINO", "GRAJAU", "IPIRANGA", "ITAIM BIBI", "JABAQUARA", "JARDIM ANGELA", "JARDIM SAO LUIS", "MARSILAC", "MOEMA", "PARELHEIROS", "PEDREIRA", "SACOMA", "SANTO AMARO", "SAO DOMINGOS", "SOCORRO", "SAUDE", "VILA ANDRADE", "VILA MARIANA",
                        // SUB-BAIRROS COMUNS / IMPORTANTES
                        "ALPHAVILLE", "BROOKLIN", "CERQUEIRA CESAR", "HIGIENOPOLIS", "INTERLAGOS", "VILA MADALENA", "VILA OLIMPIA", "VILA CLEMENTINO", "ZONA RURAL"
                    ],

                    // ================= REGIÃO METROPOLITANA DE SÃO PAULO (RMSP) =================
                    "GUARULHOS": ["AGUA CHATA", "BONSUCESSO", "CABUCU", "CENTRO", "CUMBICA", "GOPOUVA", "ITAIM", "LAVRAS", "MACEDO", "MAIA", "MATO DENTRO", "MORROS", "PARIS", "PIMENTAS", "PONTE GRANDE", "PORTO DA IGREJA", "PRESIDENTE DUTRA", "SADOKIM", "SAO JOAO", "TABOAO", "TREMEMBE", "VILA BARROS", "VILA GALVAO", "VILA RIO", "ZONA RURAL"],
                    "SAO BERNARDO DO CAMPO": ["ALVARENGA", "ASSUNCAO", "BAETA NEVES", "BALNEARIO", "BATISTINI", "BOTUJURO", "CENTRO", "COOPERATIVA", "DEMARCHI", "DOS CASAS", "INDEPENDENCIA", "JORDANOPOLIS", "MONTANHAO", "NOVA PETROPOLIS", "PAULICEIA", "PLANALTO", "RIQHUO", "RUDGE RAMOS", "SANTA TEREZINHA", "TABOAO", "ZONA RURAL"],
                    "SANTO ANDRE": ["BANGU", "CAMPESTRE", "CENTRO", "CIDADE SAO JORGE", "PARANAPIACABA", "PARQUE DAS NACOES", "PARQUE ERASMO ASSUNCAO", "PARQUE MARAJOARA", "SANTA TERESINHA", "SILVEIRA", "UTINGA", "VILA ALZIRA", "VILA ASSUNCAO", "VILA BASTOS", "VILA CAMILOPOLIS", "VILA CURUCA", "VILA HELENA", "VILA LUZITA", "VILA PIRES", "VILA VALPARAISO", "ZONA RURAL"],
                    "OSASCO": ["ALIANCA", "AYROSA", "BANDEIRAS", "BARONESA", "BELA VISTA", "BONFIM", "BUSSOCABA", "CASTELO BRANCO", "CENTRO", "CIDADE DAS FLORES", "CONCEICAO", "CONTINENTAL", "HELENA MARIA", "INDUSTRIAL AUTONOMISTAS", "JAGUARIBE", "KM 18", "MUTINGA", "NOVA OSASCO", "NOVO OSASCO", "PADROEIRA", "PAIVA RAMOS", "PESTANA", "PIRATININGA", "PRESIDENTE ALTINO", "QUITAUNA", "RAPOSO TAVARES", "ROCHDALE", "SANTA MARIA", "SANTO ANTONIO", "SAO PEDRO", "TRÊS MONTHANHAS", "UMUARAMA", "VELOSO", "VILA CAMPESINA", "VILA YOLANDA", "ZONA RURAL"],
                    "SAO CAETANO DO SUL": ["BARCELONA", "BOA VISTA", "CENTRO", "CERAMICA", "FUNDACAO", "MAUA", "NOVA GERTY", "OLIMPICO", "OSWALDO CRUZ", "PROSPERIDADE", "SANTA MARIA", "SANTA PAULA", "SANTO ANTONIO", "SAO JOSE", "ZONA RURAL"],
                    "DIADEMA": ["CAMPANARIO", "CASA GRANDE", "CENTRO", "CONCEICAO", "ELDORADO", "INAMAR", "PIRAPORINHA", "SERRARIA", "TABOAO", "VILA NOGUEIRA", "ZONA RURAL"],
                    "MAUA": ["BOCAINA", "CAPUAVA", "CENTRO", "CERQUEIRA LEITE", "GUARACIABA", "ITAPARK", "MAGINI", "MATRIZ", "NOVA MAUA", "PARQUE SAO VICENTE", "SONIA MARIA", "VILA ASSIS BRASIL", "VILA VITORIA", "ZAE", "ZONA RURAL"],
                    "MOGI DAS CRUZES": ["ALTO IPIRANGA", "BRAZ CUBAS", "CENTRO", "CEZAR DE SOUZA", "JUNDIAPEBA", "MOGI MODERNO", "PONTE GRANDE", "SABAUNA", "SOCOCORRO", "TAIACApeba", "VILA OLIVEIRA", "ZONA RURAL"],
                    "CARAPICUIBA": ["ALDEIA", "ARISTON", "CENTRO", "COHAB", "FASSINA", "ROSEIRA", "SANTA TEREZINHA", "VILA DIRCE", "ZONA RURAL"],
                    "ITAQUAQUECETUBA": ["CAIACEMA", "CENTRO", "CORUMBA", "LOUREZANO", "MANDI", "MARAGOGIPE", "MORRO BRANCO", "PINHEIRINHO", "PIRATININGA", "TUNA", "VILA SAO CARLOS", "ZONA RURAL"],
                    "BARUERI": ["ALPHAVILLE", "ALDEIA DA SERRA", "BELVAL", "BOA VISTA", "CENTRO", "CRUZ PRETA", "ENGENHO NOVO", "FAZENDINHA", "JUBRAN", "MULINGA", "TAMBORE", "VILA BOA VISTA", "ZONA RURAL"],
                    "SUZANO": ["BOA VISTA", "CENTRO", "COLORADO", "DONA BENTA", "PALMEIRAS", "RAFFO", "SUZANOPOLIS", "VILA AMORIM", "VILA URUPES", "ZONA RURAL"],
                    "TABOAO DA SERRA": ["ARRAIAL PAULISTA", "CENTRO", "CIDADE INTERCAP", "JARDIM KUHN", "JARDIM MARIA ROSA", "PARQUE PINHEIROS", "PIRAJUSSARA", "VILA IASI", "ZONA RURAL"],
                    "COTIA": ["CAUCAIA DO ALTO", "CENTRO", "GRANJA VIANA", "JARDIM NOMURA", "MORRO GRANDE", "PARQUE SAO GEORGE", "PORTAO", "ZONA RURAL"],
                    "ITAPEVI": ["AMADOR BUENO", "CENTRO", "COHAB", "JARDIM PAULISTA", "VILA NOVA ITAPEVI", "ZONA RURAL"],
                    "EMBU DAS ARTES": ["CENTRO", "CERCADO GRANDE", "ENGENHO VELHO", "ITATUBA", "PINHEIRINHO", "SANTO EDUARDO", "ZONA RURAL"],
                    "FRANCO DA ROCHA": ["CENTRO", "COMPANHIA FAZENDA BELEM", "LAGO AZUL", "PARQUE PAULISTA", "VILA BAZU", "ZONA RURAL"],
                    "FERRAZ DE VASCONCELOS": ["CENTRO", "CIDADE KEMEL", "PARQUE SAO FRANCISCO", "VILA CORREA", "VILA MARGARIDA", "ZONA RURAL"],
                    "CAIEIRAS": ["CENTRO", "LARANJEIRAS", "MORRO GRANDE", "SERPA", "VILA ROSINA", "ZONA RURAL"],
                    "ITAPECERICA DA SERRA": ["CENTRO", "CRISPIM", "JACIRA", "MOMBAÇA", "VALO VELHO", "ZONA RURAL"],
                    "JANDIRA": ["ALVORADA", "CENTRO", "JARDIM BROOKLIN", "SAGRADO CORACAO", "VALE DO SOL", "ZONA RURAL"],
                    "RIBEIRAO PIRES": ["ALIANCA", "CENTRO", "OURO FINO PAULISTA", "PONTE SECA", "SANTA LUZIA", "ZONA RURAL"],
                    "FRANCISCO MORATO": ["AGUA VERMELHA", "BELÉM", "CENTRO", "PARQUE PAULISTA", "ZONA RURAL"],
                    "SANTANA DE PARNAIBA": ["ALPHAVILLE", "CENTRO", "FAZENDINHA", "PARQUE NOVO ORATORIO", "POLVILHO", "TAMBORE", "ZONA RURAL"],
                    "POA": ["CALMON VIANA", "CENTRO", "CIDADE KEMEL", "VILA JULIA", "VILA VARELA", "ZONA RURAL"],
                    "CAJAMAR": ["CAJAMAR CENTRO", "JORDANESIA", "POLVILHO", "PONCIANO", "ZONA RURAL"],
                    "ARUJA": ["BARRETO", "CENTRO", "JORDANOPOLIS", "PARQUE RODRIGO BARRETO", "ZONA RURAL"],
                    "MAIRIPORA": ["CENTRO", "MATO DENTRO", "RIO ACIMA", "TERRA PRETA", "ZONA RURAL"],
                    "EMBU-GUACU": ["CENTRO", "CIPO GUACU", "FILIPINHO", "ZONA RURAL"],
                    "SANTA ISABEL": ["BROTAS", "CENTRO", "CRUZEIRO", "OURO FINO", "ZONA RURAL"],
                    "RIO GRANDE DA SERRA": ["CENTRO", "PARQUE AMERICA", "SANTA TEREZA", "ZONA RURAL"],
                    "SAO LOURENCO DA SERRA": ["CENTRO", "FAZENDA", "ZONA RURAL"],
                    "JUQUITIBA": ["BARNABES", "CENTRO", "SENHORINHA", "ZONA RURAL"],
                    "VARGEM GRANDE PAULISTA": ["AGRESTE", "CENTRO", "TIJUCO PRETO", "ZONA RURAL"],
                    "GUARAREMA": ["CENTRO", "FREGUESIA DA ESCADA", "LAMBARI", "ZONA RURAL"],
                    "SALESOPOLIS": ["CENTRO", "NASCENTES", "ZONA RURAL"],
                    "BIRITIBA-MIRIM": ["CENTRO", "CRUZES", "ZONA RURAL"],

                    // ================= LITORAL (BAIXADA SANTISTA / LITORAL NORTE / SUL) =================
                    "SANTOS": ["APARECIDA", "AREIA BRANCA", "BOQUEIRAO", "CAMPO GRANDE", "CASTELO", "CENTRO", "CHICO DE PAULA", "EMBARE", "ENCRUZILHADA", "ESTUARIO", "GONZAGA", "JABUQUARA", "JOSE MENINO", "MACUCO", "MARAPE", "NOVA CINTRA", "PAQUETA", "POMPEIA", "PONTA DA PRAIA", "RADIO CLUBE", "SABOO", "SANTA MARIA", "SÃO MANOEL", "VALONGO", "VILA BELMIRO", "VILA MATHIAS", "VILA NOVA", "ZONA NOROESTE", "ZONA RURAL"],
                    "SAO VICENTE": ["BIPARTICAO", "BOA VISTA", "CACAO", "CATIAPOA", "CENTRO", "CIDADE NAUTICA", "ESPLANADA DOS BARREIROS", "ITARARE", "JAPUI", "JOCKEY CLUB", "PARQUE DAS BANDEIRAS", "PARQUE SAO VICENTE", "VILA MARGARIDA", "VILA VALENCA", "ZONA RURAL"],
                    "GUARUJA": ["ASTURIAS", "CACHOEIRA", "CENTRO", "ENSEADA", "ITAPEMA", "MORRINHOS", "PAECARA", "PEREQUE", "PITANGUEIRAS", "SANTA CRUZ DOS NAVEGANTES", "SANTA ROSA", "TOMBO", "VICENTE DE CARVALHO", "VILA ZILDA", "ZONA RURAL"],
                    "PRAIA GRANDE": ["ANHANGUERA", "ANTARTICA", "AVIAÇÃO", "BOQUEIRAO", "CAICARA", "CANTO DO FORTE", "CENTRO", "CIDADE OCIAN", "ESMERALDA", "FLORIDA", "GUILHERMINA", "MARACANA", "MELVI", "MIRIM", "NOVA MIRIM", "PRINCESA", "QUIANDUBA", "RIBEIROPOLIS", "SAMAMBAIA", "SITIO DO CAMPO", "SOLEMAR", "TUPI", "VILA SÔNIA", "ZONA RURAL"],
                    "CUBATAO": ["CENTRO", "COTA 200", "FABRICA", "JARDIM CASQUEIRO", "NOVA REPUBLICA", "VALE VERDE", "VILA NATAL", "VILA NOVA", "ZONA RURAL"],
                    "BERTIOGA": ["BORACEIA", "CENTRO", "CHACARAS", "INDAIA", "RIVIERA DE SAO LOURENCO", "SAO LOURENCO", "VISTA LINDA", "ZONA RURAL"],
                    "MONGAGUA": ["AGENOR DE CAMPOS", "CENTRO", "FLORIDA MIRIM", "ITAPOAN", "VERA CRUZ", "ZONA RURAL"],
                    "ITANHAEM": ["BELAS ARTES", "BOPIRANGA", "CENTRO", "CORUMBA", "GAIVOTA", "SAVOY", "SION", "SUARAO", "ZONA RURAL"],
                    "PERUIBE": ["ARPOADOR", "CENTRO", "CARAGUAVA", "GUARAUC", "PARQUE TURISTICO", "RUINAS", "ZONA RURAL"],
                    "SAO SEBASTIAO": ["BAREQUECABA", "BOIÇUCANGA", "CAMBURI", "CENTRO", "JUQUEHY", "MARESIAS", "PAUBA", "PONTA DAS CANAS", "SAO FRANCISCO", "TOPAQUE", "ZONA RURAL"],
                    "CARAGUATATUBA": ["BARRANCO ALTO", "CANTAGALO", "CENTRO", "ESTRELA D'ALVA", "INDAIA", "MASSAGUACU", "PORTO NOVO", "TINGA", "ZONA RURAL"],
                    "ILHABELA": ["AGUA BRANCA", "BARRA VELHA", "CABEÇUDA", "CENTRO", "ITAGUACU", "PEREQUE", "ZONA RURAL"],
                    "UBATUBA": ["CENTRO", "ESTUFA I", "ESTUFA II", "ITAGUA", "LAZARO", "MARANDUBA", "PEREQUE-ACU", "PRAIA GRANDE", "TENORIO", "TONINHAS", "ZONA RURAL"],
                    "ITARIRI": ["ANA DIAS", "CENTRO", "IGUAPE", "RAPOSO", "ZONA RURAL"],
                    "PEDRO DE TOLEDO": ["CENTRO", "TRES BARRAS", "VILA PREVIDENCIA", "ZONA RURAL"],
                    "IGUAPE": ["CENTRO", "ICAPARA", "JUREIA", "ROCIO", "ZONA RURAL"],
                    "ILHA COMPRIDA": ["BALNEARIO BRITANIA", "BOQUEIRAO SUL", "CENTRO", "MEARIM", "ZONA RURAL"],
                    "CANANEIA": ["CENTRO", "CARIJO", "PORTO CUBATAO", "RETIRO", "ZONA RURAL"]
                };

                if(bairrosMapeados[cityName]) {
                    baseFinal[cityName] = bairrosMapeados[cityName];
                }
            });

            // Gerando a string do JS file
            const jsContent = `// Base Gerada Automaticamente pelo Script Gerador IBGE
// Contém todas as 645 cidades de SP padronizadas e limpas
// Cobertura detalhada: Capital Minuciosa, Região Metropolitana e Litoral.

const localidadesSP = ${JSON.stringify(baseFinal, null, 4)};

// Extrai apenas as cidades para facilitar iteração
const cidadesSP = Object.keys(localidadesSP).sort();
`;
            
            const targetPath = path.join(__dirname, '../js/dados_saopaulo.js');
            fs.writeFileSync(targetPath, jsContent, 'utf-8');
            console.log('Sucesso! Arquivo gerado em:', targetPath);
            console.log('Total de Municípios Salvos:', Object.keys(baseFinal).length);

            // Contabilizar cidades com bairros detalhados
            const detalhadas = Object.entries(baseFinal).filter(([k, v]) => v.length > 2).length;
            console.log('Cidades com bairros detalhados:', detalhadas);

        } catch (e) {
            console.error('Erro no parse do JSON:', e);
        }
    });

}).on('error', (e) => {
    console.error('Erro na requisição HTTPS:', e);
});

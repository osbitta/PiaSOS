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
                
                // Todas as cidades recebem base mínima
                baseFinal[cityName] = ["CENTRO", "ZONA RURAL"];
                
                // ============================================================
                // BAIRROS DETALHADOS
                // Cobertura: Top 30 populosas + RMC completa + Litoral completo
                // IMPORTANTE: As chaves DEVEM estar SEM acentos (normalizadas)
                // para coincidir com os nomes gerados pelo IBGE.
                // ============================================================
                const bairrosMapeados = {

                    // ==================== TOP 10 (já existiam) ====================
                    "CURITIBA": ["ABRANCHES", "AGUA VERDE", "AHU", "ALTO BOQUEIRAO", "ALTO DA GLORIA", "ALTO DA RUA XV", "ATUBA", "AUGUSTA", "BACACHERI", "BARREIRINHA", "BATEL", "BIGORRILHO", "BOA VISTA", "BOQUEIRAO", "BUTIATUVINHA", "CABRAL", "CACHOEIRA", "CAJURU", "CAMPINA DO SIQUEIRA", "CAMPO COMPRIDO", "CAMPO DE SANTANA", "CAPAO DA IMBUIA", "CAPAO RASO", "CASCATINHA", "CENTRO", "CENTRO CIVICO", "CIDADE INDUSTRIAL", "CRISTO REI", "FANNY", "FAZENDINHA", "GUABIROTUBA", "GUAIRA", "HAUER", "HUGO LANGE", "JARDIM BOTANICO", "JARDIM DAS AMERICAS", "JARDIM SOCIAL", "JUVEVE", "LAMENHA PEQUENA", "LINDOIA", "MERCES", "MOSSUNGUE", "NOVO MUNDO", "ORLEANS", "PAROLIN", "PILARZINHO", "PINHEIRINHO", "PORTAO", "PRADO VELHO", "REBOUCAS", "RIVIERA", "SANTA CANDIDA", "SANTA FELICIDADE", "SANTA QUITERIA", "SANTO INACIO", "SAO BRAZ", "SAO FRANCISCO", "SAO JOAO", "SAO LOURENCO", "SAO MIGUEL", "SAO PEDRO", "SEMINARIO", "SITIO CERCADO", "TABOAO", "TARUMA", "TATUQUARA", "TINGUI", "UBERABA", "UMBARA", "VILA IZABEL", "VISTA ALEGRE", "XAXIM", "ZONA RURAL"],
                    "LONDRINA": ["AEROPORTO", "ANTARES", "BANDEIRANTES", "BOM RETIRO", "CAFEZAL", "CATUAI", "CENTRO", "CINCO CONJUNTOS", "COLISEU", "ERNANI", "GLEBA PALHANO", "GUANABARA", "HIGIENOPOLIS", "IGAPO", "JAMAICA", "JARDIM LEONOR", "LINDOIA", "OURO BRANCO", "OURO VERDE", "PARIGOT DE SOUZA", "PEROBAL", "PIZA", "QUEBEC", "SABARA", "SANTA MONICA", "SHANGRI-LA", "UNIAO DA VITORIA", "VIVENDAS DO ARVOREDO", "VIVI XAVIER", "ZONA RURAL"],
                    "MARINGA": ["CENTRO", "JARDIM ALVORADA", "JARDIM PARIS", "JARDIM REAL", "MANDACARU", "NEY BRAGA", "NOVO CENTRO", "PARQUE DAS GREVILEAS", "PARQUE ITAIPU", "PARQUE RESIDENCIAL PATRICIA", "SANTA FELICIDADE", "SUMARE", "VILA MORANGUEIRA", "VILA OPERARIA", "ZONA 01", "ZONA 02", "ZONA 03", "ZONA 04", "ZONA 05", "ZONA 06", "ZONA 07", "ZONA RURAL"],
                    "PONTA GROSSA": ["BOA VISTA", "CARA-CARA", "CENTRO", "CHAPADA", "COLONIA DONA LUIZA", "CONTORNO", "ESTRELA", "JARDIM CARVALHO", "NEVES", "NOVA RUSSIA", "OFICINAS", "OLARIAS", "ORFAS", "RONDA", "UVARANAS", "ZONA RURAL"],
                    "CASCAVEL": ["14 DE NOVEMBRO", "ALTO ALEGRE", "BRASMADEIRA", "CANCELLI", "CASCAVEL VELHO", "CENTRO", "ESMERALDA", "FACULDADE", "FLORESTA", "GUARUJA", "INTERLAGOS", "MARIA LUIZA", "MORUMBI", "NEVA", "PACAEMBU", "PARQUE SAO PAULO", "PERIOLO", "PIONEIROS CATARINENSES", "PRESIDENTE", "SANTA CRUZ", "SANTA FELICIDADE", "SANTOS DUMONT", "SAO CRISTOVAO", "TROPICAL", "ZONA RURAL"],
                    "SAO JOSE DOS PINHAIS": ["AFONSO PENA", "ARISTOCRATA", "BORDA DO CAMPO", "CENTRO", "CIDADE JARDIM", "COLONIA RIO GRANDE", "COSTEIRA", "CRUZEIRO", "GUATUPE", "INA", "IPE", "OURO FINO", "PEDRO MORO", "RIO PEQUENO", "SAO DOMINGOS", "SAO MARCOS", "ZONA RURAL"],
                    "FOZ DO IGUACU": ["BELVEDERE", "CAMPOS DO IGUACU", "CENTRO", "ITAIPU A", "ITAIPU B", "ITAIPU C", "JARDIM SAO PAULO", "MORUMBI", "PARQUE PRESIDENTE", "PONTE SEGUI", "PORTAL DA FOZ", "PORTO MEIRA", "PROFILURB", "TRES LAGOAS", "VILA A", "VILA B", "VILA C", "VILA YOLANDA", "ZONA RURAL"],
                    "COLOMBO": ["ATUBA", "CAMPO PEQUENO", "CENTRO", "FATIMA", "GUARAITUBA", "MARACANA", "MAUA", "MONTE CASTELO", "MONZA", "OSASCO", "PALOMA", "RIO VERDE", "ROCA GRANDE", "SAO GABRIEL", "ZONA RURAL"],
                    "GUARAPUAVA": ["ALTO DA XV", "BATEL", "BONSUCESSO", "BOQUEIRAO", "CENTRO", "CONRADINHO", "DOS ESTADOS", "INDUSTRIAL", "JARDIM DAS AMERICAS", "MORRO ALTO", "PRIMAVERA", "SANTA CRUZ", "SANTANA", "TRIANON", "VILA BELA", "ZONA RURAL"],

                    // ==================== TOP 11-30 ====================
                    "FAZENDA RIO GRANDE": ["BOSQUE SANTO ANTONIO", "CENTRO", "ESTADOS", "EUCALIPTOS", "GRALHA AZUL", "IGUACU", "NACOES", "PIONEIROS", "SANTA TEREZINHA", "SAO SEBASTIAO", "VENEZA", "ZONA RURAL"],
                    "ARAUCARIA": ["CACHOEIRA", "CAMPINA DA BARRA", "CAPELA VELHA", "CENTRO", "CHAPADA", "COSTEIRA", "FAZENDA VELHA", "IGUACU", "PASSAUNA", "PORTO DAS LARANJEIRAS", "THOMAZ COELHO", "TINDIQUERA", "ZONA RURAL"],
                    "TOLEDO": ["CENTRO", "COOPAGRO", "DOIS IRMAOS", "EUROPA", "JARDIM BRESSAN", "JARDIM COOPAGRO", "JARDIM GISELA", "LA SALLE", "PANORAMA", "PIONEIRO", "SANTA CLARA", "SAO FRANCISCO", "VILA INDUSTRIAL", "ZONA RURAL"],
                    "PARANAGUA": ["29 DE JULHO", "CAMPO GRANDE", "CENTRO HISTORICO", "COSTEIRA", "ELDORADO", "EMBOGUACU", "ESTRADINHA", "INDUSTRIAL", "JARDIM AMERICA", "JARDIM GUARAITUBA", "JARDIM IGUACU", "JARDIM PARANA", "LEBLON", "OCEANIA", "PALMITAL", "PARQUE AGARI", "PORTO DOS PADRES", "ROCIO", "TUIUTI", "VILA CRUZEIRO", "VILA GUARANI", "ZONA RURAL"],
                    "CAMPO LARGO": ["BATEIAS", "CENTRO", "CRISTO REI", "FERRARIA", "ITAQUI", "JARDIM DAS ACACIAS", "JARDIM SANTO ANTONIO", "SANTO ANTONIO", "SAO SILVESTRE", "TRES CORREGOS", "ZONA RURAL"],
                    "APUCARANA": ["CENTRO", "JARDIM AEROPORTO", "JARDIM AMERICA", "JARDIM DIAMANTINA", "JARDIM ELDORADO", "JARDIM EUROPA", "JARDIM FLAMINGOS", "JARDIM MARISSOL", "NUCLEO HABITACIONAL ADRIANO CORREIA", "NUCLEO HABITACIONAL PAPA JOAO XXIII", "VILA OPERARIA", "VILA SAO CARLOS", "ZONA RURAL"],
                    "SARANDI": ["CENTRO", "CONJUNTO VALE AZUL", "JARDIM AMERICA", "JARDIM INDEPENDENCIA", "JARDIM PANORAMA", "JARDIM UNIVERSAL", "NOVA ALIANCA", "PARQUE INDUSTRIAL", "ZONA RURAL"],
                    "PINHAIS": ["ALPHAVILLE GRACIOSA", "ALTO ATUBA", "ATUBA", "CENTRO", "EMILIANO PERNETA", "ESTANCIA PINHAIS", "JARDIM AMELIA", "JARDIM CLAUDIA", "JARDIM PEDRO DEMETERCO", "PALMITAL", "PINEVILLE", "VARGEM GRANDE", "WEISSOPOLIS", "ZONA RURAL"],
                    "ALMIRANTE TAMANDARE": ["AREIAS", "CACHOEIRA", "CAMPO PEQUENO", "CENTRO", "JARDIM ALVORADA", "JARDIM COLONIAL", "JARDIM MONTE SANTO", "JARDIM PARAISO", "SAO VENANCIO", "TRANQUEIRA", "VILA SANTA TEREZINHA", "VILA SAO PEDRO", "ZONA RURAL"],
                    "PIRAQUARA": ["AGUAS CLARAS", "BORDA DO CAMPO", "CENTRO", "GUARITUBA", "JARDIM ALTEROSA", "JARDIM BELA VISTA", "JARDIM PRIMAVERA", "JARDIM SANTA HELENA", "PLANTA DEODORO", "PLANTA SANTA LUZIA", "SAO ROQUE", "VILA FRANCA", "VILA MACEDO", "ZONA RURAL"],
                    "ARAPONGAS": ["CENTRO", "CONJUNTO FLAMINGOS", "CONJUNTO PALMARES", "JARDIM AEROPORTO", "JARDIM BANDEIRANTES", "JARDIM CARAVELLE", "JARDIM IGUACU", "JARDIM PRIMAVERA", "JARDIM SAO CRISTOVAO", "JARDIM SAO FRANCISCO", "VILA INDUSTRIAL", "ZONA RURAL"],
                    "UMUARAMA": ["CENTRO", "JARDIM DAS PALMEIRAS", "JARDIM PARIS", "JARDIM PETROPOLIS", "PARQUE DANIELLE", "PARQUE JABOTICABEIRAS", "PARQUE SAN MARINO", "ZONA 7", "ZONA I", "ZONA II", "ZONA III", "ZONA VI", "ZONA RURAL"],
                    "CAMBE": ["CENTRO", "CONJUNTO HABITACIONAL ANA ROSA", "JARDIM ALVORADA", "JARDIM ANA ROSA", "JARDIM MONTECATINI", "JARDIM NOVO BANDEIRANTES", "JARDIM SANTO AMARO", "MONTE CARLO", "PARQUE RESIDENCIAL BELA VISTA", "SAN FERNANDO", "ZONA RURAL"],
                    "CAMPO MOURAO": ["CENTRO", "CIDADE NOVA", "COHAPAR", "CONJUNTO PARIGOT DE SOUZA", "JARDIM AMERICA", "JARDIM CURITIBA", "JARDIM TROPICAL", "LAR PARANA", "PARQUE INDUSTRIAL", "ZONA RURAL"],
                    "FRANCISCO BELTRAO": ["AGUA BRANCA", "ALVORADA", "CENTRO", "CRISTO REI", "INDUSTRIAL", "JARDIM FLORESTA", "JARDIM ITARARE", "JARDIM SEMINARIO", "LUTHER KING", "PINHEIRINHO", "SAO CRISTOVAO", "SAO MIGUEL", "VILA NOVA", "ZONA RURAL"],
                    "PATO BRANCO": ["BORTOT", "CENTRO", "FRARON", "INDUSTRIAL", "JARDIM PRIMAVERA", "LA SALLE", "MENINO DEUS", "MORUMBI", "PAGNONCELLI", "PARZIANELLO", "PLANALTO", "SAO CRISTOVAO", "SAO FRANCISCO", "SAO JOAO", "SUDOESTE", "VENEZA", "ZONA RURAL"],
                    "CIANORTE": ["CENTRO", "CONJUNTO MORADIAS MARSELHA", "JARDIM AMERICA", "JARDIM PARIS", "JARDIM UNIVERSAL", "PARQUE INDUSTRIAL", "VILA OPERARIA", "ZONA 01", "ZONA 02", "ZONA 03", "ZONA 05", "ZONA 06", "ZONA RURAL"],
                    "TELEMACO BORBA": ["ALTO DAS OLIVEIRAS", "BOA VISTA", "CENTRO", "INDUSTRIAL", "JARDIM AEROPORTO", "JARDIM BELA VISTA", "MONTE ALEGRE", "SANTA RITA", "SAO CRISTOVAO", "VILA MATILDE", "ZONA RURAL"],
                    "UNIAO DA VITORIA": ["CENTRO", "CIDADE JARDIM", "NAVEGANTES", "ROCIO", "SAO BASILIO MAGNO", "SAO BRAZ", "SAO CRISTOVAO", "SAO GABRIEL", "ZONA RURAL"],
                    "ROLANDIA": ["CARAVELLE", "CENTRO", "CENTRO INDUSTRIAL", "JARDIM BANDEIRANTES", "JARDIM JACARANDA", "JARDIM NOVO HORIZONTE", "JARDIM SAN FERNANDO", "VILA OLIVEIRA", "ZONA RURAL"],
                    "CASTRO": ["AREA RURAL", "CARAMBEIZINHO", "CENTRO", "JARDIM DAS ACACIAS", "JARDIM MONSENHOR MUCCIOLO", "LAGOA", "LIMEIRA", "LAGOINHA", "ZONA RURAL"],

                    // ================ RMC (cidades menores) ================
                    "CAMPO MAGRO": ["AGUA BOA", "BOA VISTA", "CENTRO", "JARDIM BOM PASTOR", "JARDIM NOVOS HORIZONTES", "JARDIM VENEZA", "JURUQUI", "LAGOA DA PEDRA", "PASSAUNA", "PIONEIRO", "ZONA RURAL"],
                    "CAMPINA GRANDE DO SUL": ["CENTRO", "DISTRITO INDUSTRIAL", "JARDIM ARAGATUBA", "JARDIM GRACIOSA", "JARDIM PAULISTA", "RECANTO VERDE", "ZONA RURAL"],
                    "QUATRO BARRAS": ["BOM JESUS", "CENTRO", "JARDIM MENINA", "SAO PEDRO", "ZONA RURAL"],
                    "LAPA": ["AGUA AZUL", "CAMPINA", "CENTRO", "COLONIA MUNICIPAL", "COLONIA RESTINGA", "CONTESTADO", "NUCLEO LEITEIRO", "SANTO AMARO", "ZONA RURAL"],
                    "RIO NEGRO": ["BOM JESUS", "CENTRO", "LAGEADINHO", "SEMINARIO", "VILA GUILHERME", "VILA NOVA", "ZONA RURAL"],
                    "RIO BRANCO DO SUL": ["CENTRO", "MEDIANEIRA", "VILA BARRO BRANCO", "ZONA RURAL"],
                    "ITAPERUCU": ["CENTRO", "JARDIM DAIANA", "ZONA RURAL"],
                    "MANDIRITUBA": ["CENTRO", "AREIA BRANCA DOS ASSIS", "ZONA RURAL"],
                    "CONTENDA": ["CENTRO", "ZONA RURAL"],
                    "BALSA NOVA": ["CENTRO", "ZONA RURAL"],
                    "ADRIANOPOLIS": ["CENTRO", "ZONA RURAL"],
                    "AGUDOS DO SUL": ["CENTRO", "ZONA RURAL"],
                    "BOCAIUVA DO SUL": ["CENTRO", "ZONA RURAL"],
                    "CAMPO DO TENENTE": ["CENTRO", "ZONA RURAL"],
                    "CERRO AZUL": ["CENTRO", "ZONA RURAL"],
                    "DOUTOR ULYSSES": ["CENTRO", "ZONA RURAL"],
                    "PIEN": ["CENTRO", "ZONA RURAL"],
                    "QUITANDINHA": ["CENTRO", "ZONA RURAL"],
                    "TIJUCAS DO SUL": ["CENTRO", "ZONA RURAL"],
                    "TUNAS DO PARANA": ["CENTRO", "ZONA RURAL"],

                    // ================ LITORAL ================
                    "GUARATUBA": ["BOA VISTA", "BREJATUBA", "CAIEIRAS", "CENTRO", "COHAPAR", "COROADOS", "MEREDAS", "NEREIDAS", "PICARRAS", "ZONA RURAL"],
                    "MATINHOS": ["ALBATROZ", "BELA VISTA", "BETARAS", "BOM RETIRO", "CAIOBA", "CENTRO", "GAIVOTAS", "PRAIA GRANDE", "PRAIA MANSA", "RIO DA ONCA", "RIVIERA", "SERTAOZINHO", "TABULEIRO", "ZONA RURAL"],
                    "PONTAL DO PARANA": ["CENTRO", "COLONIA PEREIRA", "GUARAGUACU", "IPANEMA", "PONTAL DO SUL", "PRAIA DO LESTE", "SHANGRI-LA", "ZONA RURAL"],
                    "ANTONINA": ["CENTRO", "PORTINHO", "PONTA DA PITA", "ZONA RURAL"],
                    "MORRETES": ["CENTRO", "PORTO DE CIMA", "ZONA RURAL"],
                    "GUARAQUECABA": ["CENTRO", "ZONA RURAL"]
                };

                if(bairrosMapeados[cityName]) {
                    baseFinal[cityName] = bairrosMapeados[cityName];
                }
            });

            // Gerando a string do JS file
            const jsContent = `// Base Gerada Automaticamente pelo Script Gerador IBGE
// Contém todas as 399 cidades do Paraná padronizadas e limpas
// Cobertura detalhada: Top 30 + RMC completa + Litoral completo

const localidadesPR = ${JSON.stringify(baseFinal, null, 4)};

// Extrai apenas as cidades para facilitar iteração
const cidadesPR = Object.keys(localidadesPR).sort();
`;
            
            const targetPath = path.join(__dirname, '../js/dados_parana.js');
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

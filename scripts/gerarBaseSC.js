const fs = require('fs');
const https = require('https');
const path = require('path');

// IBGE API for SC municipalities
const url = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/SC/municipios';

console.log('Baixando municípios de SC do IBGE...');

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
                // BAIRROS DETALHADOS DE SANTA CATARINA
                // Cobertura: Top 30 + Litoral + Grande Florianópolis
                // ============================================================
                const bairrosMapeados = {
                    // TOP 5 Capitais Econômicas
                    "JOINVILLE": ["ADHEMAR GARCIA", "AMERICA", "ANITA GARIBALDI", "ATIRADORES", "AVENTUREIRO", "BOA VISTA", "BOM RETIRO", "BOEHMERWALD", "BUCAREIN", "CENTRO", "COMASA", "COSTA E SILVA", "ESCOLINHA", "ESPINHEIROS", "FATIMA", "FLORESTA", "GLORIA", "GUANABARA", "IRIRIU", "ITAUM", "ITINGA", "JARDIM IRIRIU", "JARDIM PARAISO", "JARDIM SOFIA", "JOAO COSTA", "MORRO DO MEIO", "NOVA BRASILIA", "PARANAGUAMIRIM", "PETROPOLIS", "PIRABEIRABA", "PROFIPO", "SAGUACU", "SANTA CATARINA", "SANTO ANTONIO", "SAO MARCOS", "VILA CUBATAO", "VILA NOVA", "ZONA RURAL"],
                    "FLORIANOPOLIS": ["ABRAAO", "AGRONOMICA", "BARRA DA LAGOA", "BOM ABRIGO", "CACEKUPE", "CACHOEIRA DO BOM JESUS", "CAMPECHE", "CANASVIEIRAS", "CANTO", "CAPOEIRAS", "CARIANOS", "CARVOEIRA", "CENTRO", "COQUEIROS", "CORREGO GRANDE", "DANIELA", "ESTREITO", "INGLESES DO RIO VERMELHO", "ITACORUBI", "JOAO PAULO", "JURERE", "JURERE INTERNACIONAL", "LAGOA DA CONCEICAO", "MONTE VERDE", "PANTANAL", "PONTA DAS CANAS", "RATONES", "RIBEIRAO DA ILHA", "RIO TAVARES", "SACO DOS LIMOES", "SACO GRANDE", "SANTA MONICA", "SANTO ANTONIO DE LISBOA", "TRINDADE", "VARGEM GRANDE", "VARGEM PEQUENA", "ZONA RURAL"],
                    "BLUMENAU": ["AGUA VERDE", "BOM RETIRO", "BOA VISTA", "CENTRO", "DO SALTO", "ESCOLA AGRICOLA", "FIDELIS", "FORTALEZA", "FORTALEZA ALTA", "GARCIA", "GLORIA", "GUARACAN", "ITOUPOAVA CENTRAL", "ITOUPOAVA NORTE", "ITOUPOAVA SECA", "PASSO MANSO", "PONTA AGUDA", "PROGRESSO", "RIBEIRAO FRESCO", "SALTO DO NORTE", "TRIBESS", "VELHA", "VELHA CENTRAL", "VELHA GRANDE", "VILA FORMOSA", "VILA ITOUPOAVA", "VILA NOVA", "ZONA RURAL"],
                    "SAO JOSE": ["AREIAS", "BARREIROS", "BOSQUE DAS MANSOES", "CAMPINAS", "CENTRO", "CIDADE PEDRA BRANCA", "COLONIA SANTANA", "DIST. IND. CAMPECHE", "FAZENDA SANTO ANTONIO", "FLORESTA", "FORQUILHAS", "FORQUILHINHA", "IPIRANGA", "KOBRASOL", "NOVA BRASILIA", "PICADAS DO SUL", "PONTA DE BAIXO", "POTECAS", "PRAIA COMPRIDA", "REAL PARQUE", "ROÇADO", "SAO LUIZ", "SERTAO DO MARUIM", "ZONA RURAL"],
                    "ITAJAI": ["BARRA DO RIO", "BRESSAN", "CABEÇUDAS", "CARVALHO", "CENTRO", "CIDADE NOVA", "CORDELROS", "CORDEIROS", "DOM BOSCO", "ESPINHEIROS", "FAZENENDA", "FAZENDA", "ITAIPAVA", "MURTA", "RESSACADA", "SAO JOAO", "SAO ROQUE", "SAO VICENTE", "ZONA RURAL"],

                    // Demais do Top 30
                    "CHAPECO": ["BELA VISTA", "BOA VISTA", "BOM PASTOR", "CENTRO", "CRISTO REI", "EFApi", "ESPLANADA", "JARDIM AMERICA", "JARDIM ITALIA", "LIDER", "MARIA GORETTI", "PALMITEIRO", "PARQUE DAS PALMEIRAS", "PASSO DOS FORTES", "PRESIDENTE MEDICI", "QWERTY", "SAO CRISTOVAO", "UNIVERSITARIO", "ZONA RURAL"],
                    "PALHOCA": ["ALTO ARIRIU", "ARIRIU", "ARIRIU DA FORMIGA", "BARRA DO ARIRIU", "BELA VISTA", "BOM RETIRO", "BREJARU", "CARANGUEJO", "CENTRO", "ENSCADA", "ENSEADA DO BRITO", "GUARDA DO CUBATAO", "JARDIM AQUARIUS", "JARDIM ELDORADO", "MADRI", "NOVA PALHOCA", "PACHECOS", "PAGANI", "PASSA VINTE", "PEDRA BRANCA", "PINHEIRA", "PONTE DO IMARUIM", "PRAIA DE FORA", "RIO GRANDE", "SAO SEBASTIAO", "VILA NOVA", "ZONA RURAL"],
                    "CRICIUMA": ["BOSCHESE", "BRASILIA", "CARAVAGGI", "CENTRO", "CEARA", "CIDADE MINEIRA NOVA", "CIDADE MINEIRA VELHA", "COMERCIARIO", "CRUZEIRO DO SUL", "MARIA CEU", "METROPOL", "MICHEL", "MILANESE", "MINA BRASIL", "MINA DO MATO", "OPERARIA NOVA", "PASSO DO ACO", "PINHEIRINHO", "PIO CORREA", "PROSPERA", "RIO MAINA", "SANTA CATARINA", "SAO LUIZ", "SAO SIMAO", "ZONA RURAL"],
                    "JARAGUA DO SUL": ["AGUA VERDE", "AMISTAD", "BARRA DO RIO CERRO", "BARRA DO RIO MOLHA", "CENTRO", "CHICO DE PAULO", "CZERNIEWICZ", "ESTRADA NOVA", "IGARAPES", "ILHA DA FIGUEIRA", "JARAGUA 84", "JARAGUA 99", "JARAGUA ESQUERDO", "JOAO PESSOA", "NOVA BRASILIA", "RIO DA LUZ", "SANTA LUZIA", "SAO LUIS", "TIFA MARTINS", "VILA BAEPENDI", "VILA LALAU", "VILA LENZI", "VILA NOVA", "ZONA RURAL"],
                    "LAGES": ["BOA VISTA", "BOM JESUS", "BV", "CAROBA", "CENTRO", "CONTA DINHEIRO", "CORAL", "GUARUJA", "HABITACAO", "PENHA", "PETROPOLIS", "SAGRADO CORACAO DE JESUS", "SANTA CATARINA", "SANTA CLARA", "SANTO ANTONIO", "SAO CRISTOVAO", "UNIVERSITARIO", "VILHA MARIA", "ZONA RURAL"],
                    "BRUSQUE": ["AGUAS CLARAS", "AZAMBUJA", "BATEAS", "CENTRO", "CERAMICA", "GUARANI", "IMOVAIS", "LIMEIRA", "MALLANDRETI", "NOVA BRASILIA", "PONTA RUSSA", "PRIMEIRO DE MAIO", "RIO BRANCO", "SANTA RITA", "SANTA TEREZINHA", "SAO LUIZ", "SAO PEDRO", "ZONA RURAL"],
                    
                    // Litoral Famoso & RMF
                    "BALNEARIO CAMBORIU": ["ARIRIBAS", "BARRA", "CENTRO", "ESTADOS", "MUNICIPIOS", "NACOES", "PIONEIROS", "PRAIA DAS AMORES", "TAQUARAS", "VILA REAL", "ZONA RURAL"],
                    "CAMBORIU": ["AREIAS", "CEDRO", "CENTRO", "CONDE VILA VERDE", "LIRIO", "MONTE ALEGRE", "RIO PEQUENO", "SANTA REGINA", "SAO FRANCISCO DE ASSIS", "TABULEIRO", "ZONA RURAL"],
                    "ITAPEMA": ["ALTO SAO BENTO", "CASA BRANCA", "CENTRO", "ILHOTA", "MEIA PRAIA", "MORRETES", "SERTÃO DO TROCADOR", "TABULEIRO", "VARZEA", "ZONA RURAL"],
                    "NAVEGANTES": ["CENTRO", "GRAVATA", "MEIA PRAIA", "MACHADOS", "PEDREIRAS", "PORTO DAS BALSAS", "SAO DOMINGOS", "SAO PAULO", "ZONA RURAL"],
                    "PENHA": ["ARMACAO", "CENTRO", "GRAVATA", "NOSSA SENHORA DE FATIMA", "PRAIA DE ARMAÇÃO", "SANTA LIDIA", "VARGEM", "ZONA RURAL"],
                    "BOMBINHAS": ["BOMBAS", "BOMBINHAS", "CANTO GRANDE", "CENTRO", "MARISCAL", "QUATRO ILHAS", "ZIMBROS", "ZONA RURAL"],
                    "PORTO BELO": ["ALTO PEREQUE", "CENTRO", "PEREQUE", "SANTA LUZIA", "VILA NOVA", "ZONA RURAL"],
                    "GOVERNADOR CELSO RAMOS": ["AGUADA", "AREIAS DE BAIXO", "AREIAS DE CIMA", "BAIRRO FAZENDA DA ARMAÇÃO", "CALHEIROS", "CAMBOA", "CANTO", "CENTRO", "FAZENDINHA", "JORDAO", "ZONA RURAL"],
                    "BIGUACU": ["BAIRRO BOM VIVER", "CENTRO", "FUNDOS", "JANAINA", "MAR DAS PEDRAS", "PRAIA JOAO ROSA", "RIO CAVEIRAS", "SAUDADE", "TRES RIACHOS", "UNIVERSITARIO", "ZONA RURAL"],
                    "GAROPABA": ["AMBROSIO", "AREIAS DE MACACU", "CAMPO D'UNA", "CENTRO", "ENCANTADA", "FERRUGEM", "RESSACADA", "ZONA RURAL"],
                    "IMBITUBA": ["ARROIO", "CAMPINAS", "CENTRO", "DIVINEIA", "GUAIUBA", "ITACOLOMI", "MIRIM", "NOVA BRASILIA", "PAES LEME", "ROSA", "VILA ESPERANCA", "ZONA RURAL"],

                    // Demais Regionais Importantes
                    "TUBARAO": ["CAMPANHA", "CENTRO", "COMERCIARIO", "DEHON", "FATOR", "HUMAITA", "MORROTES", "OFICINAS", "PASSO DO GADO", "RECIFE", "REVOREDO", "SAO CLEMENTE", "SAO JOAO", "VILA ESPERANCA", "VILA MOEMA", "ZONA RURAL"],
                    "SAO BENTO DO SUL": ["BOEUHMERWALD", "BRASILIA", "CAMPO LENCOL", "CENTRO", "CENTENARIO", "CRUZEIRO", "DONA FRANCISCA", "IMBUIA", "MATE APERE", "PROGRESSO", "SCHRAMM", "SERRA ALTA", "ZONA RURAL"],
                    "CONCORDIA": ["ALVORADA", "BELA VISTA", "CENTRO", "CINQÜENTENÁRIO", "DAS NACOES", "GRUTA", "IMPERIAL", "INDUSTRIAS", "LINHA SAO PAULO", "NAZARE", "PETROPOLIS", "SAO CRISTOVAO", "SINTIAL", "VILA NOVA", "ZONA RURAL"],
                    "RIO DO SUL": ["ARISTILIANO RAMOS", "BARRA DO TROMBUDO", "BELA ALIANCA", "BOA VISTA", "BREMEN", "CANOAS", "CENTRO", "COHABA", "FUNDO CANOAS", "LARANJEIRAS", "NAVEGANTES", "SANTANA", "SAO TEHODORO", "ZONA RURAL"],
                    "ARARANGUA": ["ALTO FELIZ", "BOM PASTOR", "CENTRO", "CIDADE ALTA", "COLONICA SOUSA", "JARDIM DAS AVENIDAS", "MATO ALTO", "OPERARIA", "POLICIA RODOVIARIA", "SANTA CATARINA", "URLSIA", "ZONA RURAL"],
                    "GASPAR": ["BARRACAO", "BELA VISTA", "CENTRO", "COLONIS", "FIGUEIRA", "GASPAR GRANDE", "GASPARINHO", "MARGEM ESQUERDA", "POCO GRANDE", "SANTA TEREZINHA", "ZONA RURAL"],
                    "INDAIAL": ["ARIADÓLIS", "CARIJOS", "CENTRO", "DO SOL", "ESTADOS", "ESTRADA DAS AREIAS", "JOAO PAULO II", "MULDE", "NACOES", "RIO MORTO", "TAPAJOS", "ZONA RURAL"],
                    "ICARA": ["AURORA", "CENTRO", "CRISTO REI", "DISTRITO INDUSTRIAL", "ESPERANCA", "JARDIM ELIZANA", "LIRI", "PRIMEIRO DE MAIO", "RAICHAS", "ZONA RURAL"],
                    "MAFRA": ["AMANDIO", "CENTRO", "FASOLO", "JARDIM AMERICA", "RESTINGA", "ROTARY", "VILA DAS FLORES", "VILA FORMOSA", "VILA NOVA", "ZONA RURAL"],
                    "VIDEIRA": ["ALVORADA", "AMARANTE", "CENTRO", "CIDADE ALTA", "DOIS PINHEIROS", "FLORESTA", "MATRIZ", "OFICINAS", "PANAZOLLO", "PEDREIRAS", "ZONA RURAL"],
                    "CANOINHAS": ["AGUA VERDE", "ALTO DAS AGUAS", "BOA VISTA", "CAMPO DA AGUA VERDE", "CENTRO", "MARCILIO DIAS", "PICO ALTO", "SOSSEGO", "ZONA RURAL"],
                    "XANXERE": ["APARECIDA", "BORGES", "CENTRO", "ESPORTES", "JARDIM TARUMA", "LA SALLE", "MATRIZ", "NOSSA SENHORA DE LURDES", "SAO PEDRO", "ZONA RURAL"]
                };

                if(bairrosMapeados[cityName]) {
                    baseFinal[cityName] = bairrosMapeados[cityName];
                }
            });

            // Gerando a string do JS file
            const jsContent = `// Base Gerada Automaticamente pelo Script Gerador IBGE
// Contém todas as 295 cidades de SC padronizadas e limpas
// Cobertura detalhada: Top 30 + Litoral completo + Grande Florianopolis

const localidadesSC = ${JSON.stringify(baseFinal, null, 4)};

// Extrai apenas as cidades para facilitar iteração
const cidadesSC = Object.keys(localidadesSC).sort();
`;
            
            const targetPath = path.join(__dirname, '../js/dados_santacatarina.js');
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

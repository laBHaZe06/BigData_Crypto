const KafkaProducer = require('../config/redpanda/producer');
const { getFluxCoinTelegraph, getFluxBenzinga,getFluxCoinJournal } = require('../services/api/httpFlux');
const WebSocketService = require('../services/ws/WebSocketService');
const webSocketService = new WebSocketService();


async function FindNewsCryptoBenzinGa(req, res,cryptoSymbol) {
    // const { cryptoSymbol } = req.params;
    
    try {
        const resp = await getFluxBenzinga(cryptoSymbol);
        if (resp.status === 403) {
            console.error('Erreur 403: Accès refusé');
          } else if (resp.status === 404) {
            console.error('Erreur 404: Ressource non trouvée');
          } else if (resp.status === 200) {
            KafkaProducer.sendCryptoDataNewsToKafka(cryptoSymbol, resp);
            webSocketService.sendToWebSocketClients({
                source: 'news :'+ cryptoSymbol,
                data: resp, 
            });
            return resp;
          } else {
            // Autres cas non gérés
            console.error(`Erreur inattendue: ${resp.status}`);
          }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

async function FindNewsCryptoCoinTelegraph(req, res,cryptoSymbol) {
    // const { cryptoSymbol } = req.params;

    try {
        const resp = await getFluxCoinTelegraph(cryptoSymbol);
        console.log('Send to Kafka Producer');
        if (resp.status === 403) {
            console.error('Erreur 403: Accès refusé');
          } else if (resp.status === 404) {
            console.error('Erreur 404: Ressource non trouvée');
          } else if (resp.status === 200) {
            KafkaProducer.sendCryptoDataNewsToKafka(cryptoSymbol, resp); 
            webSocketService.sendToWebSocketClients({
                source: 'news :'+ cryptoSymbol,
                data: resp, 
            });
            return resp;
          } else {
            console.error(`Erreur inattendue: ${resp.status}`);
          }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }

}

async function FindNewsCryptoPanic(req, res,cryptoSymbol) {
    // const { cryptoSymbol } = req.params;
    try{
        const resp = await getFluxCryptoPanic(cryptoSymbol);
        if (resp.status === 403) {
            console.error('Erreur 403: Accès refusé');
          } else if (resp.status === 404) {
            console.error('Erreur 404: Ressource non trouvée');
          } else if (resp.status === 200) {
            KafkaProducer.sendCryptoDataNewsToKafka(cryptoSymbol, resp);
            webSocketService.sendToWebSocketClients({
                source: 'news :'+ cryptoSymbol,
                data: resp, 
            });
            return resp;
          } else {
            console.error(`Erreur inattendue: ${resp.status}`);
          }
        
    }  catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }

}


async function FindNewsCoinJournal(req, res, targetCryptos) {
    try {
        const resp = await getFluxCoinJournal(targetCryptos);
        if (resp.status === 403) {
            console.error('Erreur 403: Accès refusé');
          } else if (resp.status === 404) {
            console.error('Erreur 404: Ressource non trouvée');
          } else if (resp.status === 200) {
              const result = await Promise.all(resp.map(async (item) => {
                  console.log('cryptoSymbol', targetCryptos);
                  KafkaProducer.sendCryptoDataNewsToKafka(targetCryptos, item);
                  webSocketService.sendToWebSocketClients({
                      source: 'news :' + targetCryptos,
                      data: item.data,
                  });
                  return item.data;
              }));
              return result;
          } else {
            console.error(`Erreur inattendue: ${resp.status}`);
          }

    } catch (error) {
        console.error(error);
        if (res && res.status) {
            res.status(500).send({ error: 'Internal Server Error' });
        }
    }

}



module.exports = {
    FindNewsCryptoBenzinGa,
    FindNewsCryptoCoinTelegraph,
    FindNewsCryptoPanic,
    FindNewsCoinJournal,
};
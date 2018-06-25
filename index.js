const express = require('express');
const jsonld = require('jsonld');
const sepajs = require('@arces-wot/sepa-js').client;
const bodyParser = require('body-parser');
const app = express();
const WebSocket = require('ws');
const toNQuads = require('./sparqlResults').toNQuads;

const base = 'http://wot.arces.unibo.it/thing/';
const deleteQuery =`drop graph `;

app.use(bodyParser.json());


app.post('/thing/:thingId', function(req, res) {
    if (!req.params.thingId && !req['@id']) {
        res.status(400).send('Bad request: No thing id found');
        return;
    }

   req.body['@id'] = req.body['@id'] ? req.body['@id'] : req.params.thingId;
   
    jsonld.toRDF(req.body, {base: base, format: 'application/n-quads'}, (err, nquads) => {
        let sparql = 'INSERT { GRAPH <' + base+ req.body['@id'] +'>{' + nquads + '}}WHERE{}';

        sepajs.update(sparql, {host: 'localhost'})
            .then((result) => {
                res.status(result.status).send(result.statusText);
            }).catch((err) => {
                res.status(400).send(err);
            });
    });
});

app.delete('/thing/:thingId', function(req, res) {
    if (!req.params.thingId) {
        res.status(400).send('Bad request: No thing id found');
        return;
    }

    let sparql = deleteQuery + '<'+base + req.params.thingId+'>';

    sepajs.update(sparql, {host: 'localhost'})
        .then((result) => {
            res.status(result.status).send(result.statusText);
        }).catch((err) => {
            res.status(400).send(JSON.stringify(err));
        });
});

const wss = new WebSocket.Server({port: 3001});

wss.on('connection', function connection(ws) {
    console.log('connected');
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);

        sepajs.subscribe('select ?thing where {graph ?thing {?thing rdf:type <http://www.w3.org/ns/td#Thing>}}', {
            next(data) {
                console.log('Data received:' + data);
                if (data.notification.addedResults.results.bindings.length > 0) {
                    console.log('Things added');
                    notify(sepajs, ws, data.notification.addedResults.results.bindings);
                }

                if (data.notification.removedResults.results.bindings.length > 0) {
                    console.log('Things removed');
                    notify(sepajs, ws, data.notification.removedResults.results.bindings);
                }
            },
            error(err) {
                console.log('Received an error: ' + err);
            },
            complete() {
                console.log('Server closed connection ');
            },
        });
    });
});

app.get('/', function(req, res) {
    res.sendfile('./web/index.html');
});

app.get('/web/thingdir.svg', function(req, res) {
    res.sendfile('./web/thingdir.svg');
});

app.listen(3000, function() {
    console.log('Thing Directory interface listening on port 3000!!');
});


function notify(sepaclient, ws, things) {
    things.forEach((binding) => {
        sepaclient.query("construct{?a ?b ?c} where{graph <" +binding.thing.value+">{?a ?b ?c}}", { host: 'localhost' })
        .then((result) => {
            ws.send(toNQuads(result))
            jsonld.fromRDF(toNQuads(result), { format: 'application/n-quads' }).then((result) => {
                ws.send(JSON.stringify(result));
            })
            
        }).catch((e) => {
           console.log(e)
        })
    });
}

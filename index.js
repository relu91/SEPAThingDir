const express = require('express');
const jsonld = require('jsonld');
const sepajs = require('@arces-wot/sepa-js').client;
const bodyParser = require('body-parser');
const app = express();
const WebSocket = require('ws');
const fs = require('fs');

const base = 'http://wot.arces.unibo.it/thing/';
const deleteQuery =`drop silent graph `;

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
                fs.writeFile('./thing/'+req.body['@id'], JSON.stringify(req.body), function(err) {
                    if (err) {
                        res.status(500).send(''+err);
                    } else {
                        res.send(200, 'Thing inserted');
                    }
                });
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
            // Ignore errors
            fs.unlink('./thing/' + req.params.thingId, ()=>{});
            res.status(result.status).send(result.statusText);
        }).catch((err) => {
            res.status(400).send(err.message);
        });
});

app.get('/thing/:thingId', function(req, res) {
    res.type('application/json');
    res.sendFile(__dirname + '/thing/' + req.params.thingId,{ headers: {
        'Content-type': 'application/json'
    }});
});

app.use('/', express.static('./web'));
app.use('/web', express.static('./web'));

app.listen(3000, function() {
    console.log('Thing Directory interface listening on port 3000!!');
});

const wss = new WebSocket.Server({port: 3001});
let typeQuery = 'select ?thing where {graph ?thing {?thing rdf:type <http://www.w3.org/ns/td#Thing>. ?thing rdf:type ';
let allQuery = 'select ?thing where {graph ?thing {?thing rdf:type <http://www.w3.org/ns/td#Thing>}}';

wss.on('connection', function connection(ws) {
    console.log('connected');
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        message = JSON.parse(message);
        let query = message.type ? typeQuery + '<'+message.type +'>. }}' : allQuery;

        let sub = sepajs.subscribe(query, {
            next(data) {
                console.log('Data received:' + data);
                if (data.notification.addedResults.results.bindings.length > 0) {
                    console.log('Things added');
                    notify(sub, ws, data.notification.addedResults.results.bindings);
                }

                if (data.notification.removedResults.results.bindings.length > 0) {
                    data.notification.removedResults.results.bindings.forEach((binding) => {
                        let id = ('' + binding.thing.value).split(base)[1];
                        try {
                            ws.send(JSON.stringify({removed: id}));
                        } catch (error) {
                            sub.unsubscribe();
                        }
                    });
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


/** Send changes back to the client
 *  @param {sub} sub - Sepa client.
 *  @param {WebSocket} ws - WebSocket connectio
 *  @param {Array}  things - added things.
 */
function notify(sub, ws, things) {
    things.forEach((binding) => {
        let id = (''+binding.thing.value).split(base)[1];
        fs.readFile('./thing/'+id, function(err, data) {
            if (!err) {
                let td = JSON.parse(data);
                try {
                    ws.send(JSON.stringify({added: td}));
                } catch (error) {
                    console.log('socket closed');
                    sub.unsubscribe();
                }
            }
        });
    });
}

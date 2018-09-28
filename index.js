const express = require('express');

const sepajs = require('@arces-wot/sepa-js').client;
const bodyParser = require('body-parser');
const app = express();
const WebSocket = require('ws');
const fs = require('fs');
const coap = require('coap');
const thingRouter = require('./routers/thing');
const thingCoapRouter = require('./routers/coapThingRouter');


app.use(bodyParser.json());

app.use('/', express.static('./web'));
app.use('/web', express.static('./web'));
app.use('/thing', thingRouter);

app.listen(3000, function() {
    console.log('Thing Directory HTTP interface listening on port 3000!\n');
});

server = coap.createServer();

server.on('request', thingCoapRouter);

server.listen(function() {
    console.log('Thing Directory Coap interface listening on port 5683\n');
});
const wss = new WebSocket.Server({port: 3001});
let typeQuery = 'select ?thing where {graph ?thing {?thing rdf:type <http://www.w3.org/ns/td#Thing>. ?thing rdf:type ';
let allQuery = 'select ?thing where {graph ?thing {?thing rdf:type <http://www.w3.org/ns/td#Thing>}}';

wss.on('connection', function connection(ws) {
    console.log('connected');
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        try {
            message = JSON.parse(message);
            let query = message.type ? typeQuery + '<' + message.type + '>. }}' : allQuery;

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
        } catch (error) {
            try {
                ws.send(JSON.stringify({error: error.message}));
            } catch (error) {
                sub.unsubscribe();
            }
            return;
        }
    });
});

const base = 'http://wot.arces.unibo.it/thing/';

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

const jsonld = require('jsonld');
const sepajs = require('@arces-wot/sepa-js').client;
const fs = require('fs');
const path = require('path');

const base = 'http://wot.arces.unibo.it/thing/';
const deleteQuery = `drop silent graph `;


exports.publish_thing = function(req, res) {
    if (!req.params.thingId && !req['@id']) {
        res.status(400).send('Bad request: No thing id found');
        return;
    }
    if (!req.body['@type'].includes('Thing')) {
        res.status(400).send('Bad request: Json-LD entity should be a Thing. Missing @type Thing in the message');
        return;
    }

    req.body['@id'] = req.body['@id'] ? req.body['@id'] : req.params.thingId;

    delete req.body.id;

    jsonld.toRDF(req.body, {base: base, format: 'application/n-quads'}, (err, nquads) => {
        if (err) {
            res.status(400).send(err.message);
            return;
        }

        let sparql = 'INSERT { GRAPH <' + base + req.body['@id'] + '>{' + nquads + '}}WHERE{}';
        sepajs.update(sparql, {host: 'localhost'})
            .then((result) => {
                fs.writeFile('./thing/' + req.body['@id'], JSON.stringify(req.body), function(err) {
                    if (err) {
                        res.status(500).send('' + err);
                    } else {
                        res.send(200, 'Thing inserted');
                    }
                });
            }).catch((err) => {
                res.status(400).send(err.message);
            });
    });
};

exports.delete_thing = function(req, res) {
    if (!req.params.thingId) {
        res.status(400).send('Bad request: No thing id found');
        return;
    }

    let sparql = deleteQuery + '<' + base + req.params.thingId + '>';

    sepajs.update(sparql, {host: 'localhost'})
        .then((result) => {
            // Ignore errors
            fs.unlink(path.resolve('thing/' + req.params.thingId), () => { });
            res.status(result.status).send(result.statusText);
        }).catch((err) => {
            res.status(400).send(err.message);
        });
};

exports.read_thing = function(req, res) {
    res.type('application/json');

    res.sendFile(path.resolve('thing/' + req.params.thingId), {
        headers: {
            'Content-type': 'application/json',
        },
    });
};

const controller = require('../controllers/thingDirController');
const fs = require('fs');

module.exports = function(req, res) {
    let path = req.url.split('/');
    

    if (path[1] !== 'thing') {
        res.end(404);
        return;
    }

    res['type'] = typePatch.bind(res);
    res['status'] = statusPatch.bind(res);
    res['sendFile'] = sendFilePatch.bind(res);
    res['send'] = sendPatch.bind(res);

    req['params']= {thingId: path[2]};

    switch (req.method) {
        case 'GET':
            controller.read_thing(req, res);
            break;
        case 'DELETE':
            controller.delete_thing(req, res);
            break;
        case 'POST':
            try {
                let json = JSON.parse(req.payload.toString('utf8'));
                req.body = json;
                controller.publish_thing(req, res);
            } catch (error) {
                res.end(500);
            }
            break;
        default:
            res.end(404);
            break;
    }
};
/**
 * Patch function to emulate type express function
 * @param {string} type
 * @return {Response} itself for chaining
 */
function typePatch(type) {
    this.setOption('Content-Format', type);
    return this;
}
/**
 * Patch function to emulate status express function
 * @param {int} status
 * @return {Response} itself for chaining
 */
function statusPatch(status) {
    const codes = {
        400: 4.00,
        500: 5.00,
        200: 2.00,
    };
    this.code = codes[status];
    return this;
}

/**
 * Patch function to emulate sendFile express function
 * @param {int} status
 * @return {Response} itself for chaining
 */
function sendFilePatch(file) {
    let res = this;
    fs.readFile(file, function(err, data) {
        if (err) {
            res.code = 4.04;
        }
        res.end(data);
    });
    return this;
}

/**
 * Patch function to emulate send express function
 * @param {string} data
 * @return {Response} itself for chaining
 */
function sendPatch(data) {
    this.end(data);
    return this;
}


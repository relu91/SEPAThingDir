const router = require('express').Router();
const controller = require('../controllers/thingDirController');

router.post('/:thingId', controller.publish_thing);

router.delete('/:thingId', controller.delete_thing);

router.get('/:thingId', controller.read_thing);

module.exports = router;

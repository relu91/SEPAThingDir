# Thing Directory REST doc

Simple rest api to interct with things stored inside TD.
The test implementation is running on http://mml.arces.unibo.it:3000.

## REST interface

Manage things

* [Create](thing/post.md) : `POST /thing/{thingId}`
* [Delete](thing/delete.md) : `DELETE /thing/{thingId}`
* [Read Thing Descriptor](thing/get.md) : `GET /thing/{thingId}`

## RealTime API

SEPA Thing Directory offers realtime api to get notifications about new things added
or thing removed. 

It listens on port 3001 for websocket connections.

### Request 

```json
    {
        "type" : "https://www.w3.org/ns/sosa/Actuator"
    }
``` 
**Note**: An empty string in the type field is cosidered as valid type. To subscribe for all type of things simply remove the type attribute: `{}`
### Notify
Notification about new thing descriptor added:
```json
    {
        "added" : {
            "@id"  : "http://mml.arces.unibo.it/thing1",
            "name" : "thing1",
            ...
        }
    }
``` 

Notification about old thing descriptor removed:
```json
    {
        "removed" : "http://mml.arces.unibo.it/thing1"
    }
```
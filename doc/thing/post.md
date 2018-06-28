# Create

Used to publish a new thing inside thing directory.
**thingId** parameter is optional if it is defined in the posted TD. 

**URL** : `/thing/{thingId}`

**Method** : `POST`

**Auth required** : NO

**Data constraints**

--

**Data example**

```json
{
  "@context":["https://w3c.github.io/wot/w3c-wot-td-context.jsonld"],
  "@type":["Thing","actuator"],
  "name":"Node1",
  "security":[
    {"description":"node-wot development Servient, no security"}
  ],"interaction":[
    {"name":"vref",
     "@type":["Property"],
     "schema":{"type":"number"},
     "writable":false,
     "observable":true,
     "form":[
       {"href":"http://10.200.5.109:8080/Node1/properties/vref",
        "mediaType":"application/json"
       },{"href":"http://2001:0:5ef5:79fd:387b:aa2:7633:69eb:8080/Node1/properties/vref",
          "mediaType":"application/json"
         }
     ]
    }
  ]
}
```
If no specific context is defined inside the _@type_ array the **http://wot.arces.unibo.it/thing/** URL is used as the root of the type. In the example the real type stored inside the semantic graph will be **http://wot.arces.unibo.it/thing/actuator**

## Success Response

**Code** : `200 OK`

**Content example**

```json
Thing added
```

## Errors

**Code** : `400 Bad Request`

**Content example**

```json
Thing id is missing
```

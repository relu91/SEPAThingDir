# Read Thing Descriptor

Read the thing descriptor of **thingId** thing.

**URL** : `/thing/{thingId}`

**Method** : `GET`

**Auth required** : NO

**Data constraints**

--

## Success Response

**Code** : `200 OK`

**Content example**

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

## Errors

**Code** : `404 Not Found`

**Content example**

```json
No thing found
```

curl -X PUT   -H "Content-Type: application/json"   --data-binary @rent.json http://localhost:4242/items
curl -X PUT   -H "Content-Type: application/json"   --data-binary @testList.json http://localhost:4242/items/load

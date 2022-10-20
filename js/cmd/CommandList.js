/*
type
    list_id
        ссылается на список значений
        list - имя списка с названиями
    int
    float
        min - наим число (def значение)
        max - наиб число
*/

var commandsList = {
    "execute": [
        {
            "text": "addItem",
            "values": [
                { "type": "item_id", "list": "itemsList" },
                { "type": "int", "min": 1 }
            ]
        },
        {
            "text": "removeItem",
            "values": [
                { "type": "item_id", "list": "itemsList" },
                { "type": "int", "min": 1 }
            ]
        }
    ],
    "check": [
        {
            "text": "ifHaveItem",
            "values": [
                { "type": "item_id", "list": "itemsList" },
                { "type": "int", "min": 1 }
            ]
        }
    ]
}
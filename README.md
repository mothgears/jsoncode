# JSONCode
JSON with conditional statements and switches

## Example
"petShop.json"
```json
{
    "Animals": {
        "cat [IF type = 'mammal' & carnival]": {
            "size": "middle",
            "canFly": false,
            "worth [BY target]": {
                "sellOne": 100,
                "sellInBulk" : 80,
                "buy": 70
            }
        },
        "pony [IF type = 'mammal' & !carnival]": {
            "size": "big",
            "canFly": false,
            "worth [BY target]": {
                "sellOne": 1700,
                "sellInBulk" : 1500,
                "buy": 1300
            }
        },
        "beetle [IF type = 'insect' & carnival]": {
            "size": "little",
            "canFly": true,
            "worth [BY target]": {
                "sellOne": 50,
                "sellInBulk" : 40,
                "buy": 35
            }
        },
        "dog [IF type = 'mammal' & carnival]": {
            "size": "middle",
            "canFly": false,
            "worth [BY target]": {
                "sellOne": 130,
                "sellInBulk" : 110,
                "buy": 90
            }
        }
    },
    
    "Animals food": { 
        "In stock [BY city, type, carnival]": {
            "Washington" : {
                "mammal" : {
                    "#TRUE": "100 kg",
                    "#FALSE": "65 kg"
                },
                "insect" : {
                    "#TRUE": "20 kg",
                    "#FALSE": "5 kg"
                }
            },
            "New York" : {
                "mammal" : {
                    "#TRUE": "90 kg",
                    "#FALSE": "50 kg"
                },
                "insect" : {
                    "#TRUE": "15 kg",
                    "#FALSE": "3 kg"
                }
            }
        }
    }
}
```

"petShop.js"
```js
    const jsoncode = require('jsoncode');
    const petShop  = require('./petShop.json');
    
    const priceList = jsoncode(petShop['Animals'], {
        type: "mammal",
        carnival: true,
        target: "sellOne"
    });
    
    //Alternate using by JSON
    const animalsFood = JSON.specify(petShop['Animals food'], {
        city: "New York",
        type: "mammal",
        carnival: true,
    });
    
    console.log(priceList, animalsFood);
```

# JSONCode
JSON with conditional statements and switches

## Example
"petShop.json"
```json
{
    "Animals": {
        "cat [IF type = 'mammal' & carnivours]": {
            "size": "middle",
            "canFly": false,
            "worth [BY target]": {
                "sellOne": 100,
                "sellInBulk" : 80,
                "buy": 70
            }
        },
        "pony [IF type = 'mammal' & !carnivours]": {
            "size": "big",
            "canFly": false,
            "worth [BY target]": {
                "sellOne": 1700,
                "sellInBulk" : 1500,
                "buy": 1300
            }
        },
        "beetle [IF type = 'insect' & carnivours]": {
            "size": "little",
            "canFly": true,
            "worth [BY target]": {
                "sellOne": 50,
                "sellInBulk" : 40,
                "buy": 35
            }
        },
        "dog [IF type = 'mammal' & carnivours]": {
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
        "In stock [BY city, type, carnivours]": {
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
        carnivours: true,
        target: "sellOne"
    });
    
    //Alternate using by JSON
    const animalsFood = JSON.specify(petShop['Animals food'], {
        city: "New York",
        type: "mammal",
        carnivours: true,
    });
    
    const animalTypes = Object.keys(priceList);
    for (let animalType of animalTypes) console.log(animalType, priceList[animalType]);
    
    console.log('Animals food', animalsFood);
```

####Result:
```
    cat { size: 'middle', canFly: false, worth: 100 }
    dog { size: 'middle', canFly: false, worth: 130 }
    Animals food { 'In stock': '90 kg' }
```

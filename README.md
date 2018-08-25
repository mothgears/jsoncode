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
 
//Output
const animalTypes = Object.keys(priceList);
for (let animalType of animalTypes) console.log(animalType, priceList[animalType]);
 
console.log('Animals food', animalsFood);
```

#### Result:
```
cat { size: 'middle', canFly: false, worth: 100 }
dog { size: 'middle', canFly: false, worth: 130 }
Animals food { 'In stock': '90 kg' }
```

## Manual
#### Existence operator "IF"
If condition is false, item removes from tree
```js
const myJsonObject = {
    "Element 1 [IF myVariable > 0]" : "some content 1", 
    "Element 2 [IF myVariable > 5]" : "some content 2", 
    "Element 3 [IF myVariable > 10]" : "some content 3" 
};
 
console.log(jsoncode(myJsonObject, {myVariable: 7}));
 
//{"Element 1": "some content 1", "Element 2": "some content 2"}
```

#### Switch operator "BY"
It selects value of node by user selector
```js
const myJsonObject = {
    "Selected value [BY mySelector]" : {
        "item 1" : "some content 1",
        "item 2" : "some content 2"
    }, 
};
 
console.log(jsoncode(myJsonObject, {mySelector: 'item 2'}));
 
//{"Selected value": "some content 2"}
```

Default case
```js
const myJsonObject = {
    "Selected value [BY mySelector]" : {
        "item 1" : "some content 1",
        "item 2" : "some content 2",
        "#DEFAULT" : "some content 3"
    }, 
};
 
console.log(jsoncode(myJsonObject, {mySelector: 'item 5'}));
 
//{"Selected value": "some content 3"}
```

Boolean value
```js
const myJsonObject = {
    "Selected value [BY mySelector]" : {
        "#TRUE"  : "some content 1",
        "#FALSE" : "some content 2"
    }, 
};
 
console.log(jsoncode(myJsonObject, {mySelector: true}));
 
//{"Selected value": "some content 1"}
```

Several levels
```js
const myJsonObject = {
    "Selected value [BY mySelector, mySubSelector]" : {
        "item 1" : {
            "subItem A": "some content 1 A",
            "subItem B": "some content 1 B"
        },
        "item 2" : {
            "subItem A": "some content 2 A",
            "subItem B": "some content 2 B"
        }
    }, 
};
 
console.log(jsoncode(myJsonObject, {mySelector: 'item 2', mySubSelector: 'subItem A'}));
 
//{"Selected value" : "some content 2 A"}
```

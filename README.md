# JSONCode
JSON with conditional statements, switches, spread/combine and other operators.

**[ ! ]** For "ES5" compatibility this package needs **`Symbol`** and **`Set`**, use polyfills (e.g. core-js, babel with babel-polyfill).

## Example
"petShop.json"
```json
{
    "Animals": {
        "cat [IF size = 'little' & carnivorous]": {
            "type": "mammal",
            "worth [BY target]": {
                "sellOne": 100,
                "sellInBulk" : 80
            }
        },
        "dog [IF size = 'middle' & carnivorous]": {
            "type": "mammal",
            "worth [BY target]": {
                "sellOne": 130,
                "sellInBulk" : 110
            }
        },
        "chinchilla [IF size = 'little' & !carnivorous]": {
            "type": "mammal",
            "worth [BY target]": {
                "sellOne": 50,
                "sellInBulk" : 45
            }
        }
    },
    
    "Animals food": { 
        "In stock [BY city, type, carnivorous]": {
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
    size: "little",
    carnivorous: true,
    target: "sellOne"
});
 
//Alternate using by JSON
const animalsFood = JSON.specify(petShop['Animals food'], {
    city: "New York",
    type: "mammal",
    carnivorous: true
});
 
//Output
const animalTypes = Object.keys(priceList);
for (let animalType of animalTypes) console.log(animalType, priceList[animalType]);
 
console.log('Animals food', animalsFood);
```

**Result**:
```
cat { type: 'mammal', worth: 100 }
Animals food { 'In stock': '90 kg' }
```

## Manual

| operator | meaning |
| ---------|---------|
| `&` | And |
| <code>&#124;</code> | Or |
| `=` | Strictly equal to |
| `~` | Equal to |
| `!=` | Not equal to |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal to |
| `<=` | Less than or equal to |
| `E` | Is an element of (array) |
| `C` | Is match regEx |

#### Existence operator `[IF ]`
If condition is false, item will be removed from tree
```js
const myJsonObject = {
    "Element 1 [IF myVariable > 0]" : "some content 1", 
    "Element 2 [IF myVariable > 5]" : "some content 2", 
    "Element 3 [IF myVariable > 10]" : "some content 3" 
};

const result = jsoncode(myJsonObject, {myVariable: 7});
console.log(result);

//{"Element 1": "some content 1", "Element 2": "some content 2"}
```

#### Switch operator `[BY ]`
This operator selects value of node by string.
```js
const myJsonObject = {
    "Selected value [BY mySelector]" : {
        "item 1" : "some content 1",
        "item 2" : "some content 2"
    }, 
};

const result = jsoncode(myJsonObject, {mySelector: 'item 2'});
console.log(result);
 
//{"Selected value": "some content 2"}
```

**Default case**
```js
const myJsonObject = {
    "Selected value [BY mySelector]" : {
        "item 1" : "some content 1",
        "item 2" : "some content 2",
        "#DEFAULT" : "some content 3"
    }, 
};

const result = jsoncode(myJsonObject, {mySelector: 'item 5'});
console.log(result);
 
//{"Selected value": "some content 3"}
```

**Boolean value**
```js
const myJsonObject = {
    "Selected value [BY mySelector]" : {
        "#TRUE"  : "some content 1",
        "#FALSE" : "some content 2"
    }, 
};

const result = jsoncode(myJsonObject, {mySelector: true});
console.log(result);
 
//{"Selected value": "some content 1"}
```

**Several levels**
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

const result = jsoncode(myJsonObject, {mySelector: 'item 2', mySubSelector: 'subItem A'});
console.log(result);
 
//{"Selected value" : "some content 2 A"}
```

#### Filter operator `[*BY ]`
This operator filters values of node by string, regEx or array.
```js
const myJsonObject = {
    "Selected values [*BY mySelector]" : {
        "item 1" : "some content 1",
        "item 2" : "some content 2",
        "item 3" : "some content 3"
    }, 
};

const result1 = jsoncode(myJsonObject, {mySelector: /^(item 1|item 2)$/});
console.log(result1);

//{"Selected values": ["some content 1", "some content 2"]}

const result2 = jsoncode(myJsonObject, {mySelector: ['item 2', 'item 3']});
console.log(result2);

//{"Selected values": ["some content 2", "some content 3"]}
```

#### Object to array operator `[AS ARRAY]`
This operator convert object with conditions to result array.
```js
const myJsonObject = {
    "Its Array [AS ARRAY]" : {  
        "[ * ]"                : "some content 0",
        "[IF myVariable >  0]" : "some content 1", 
        "[IF myVariable >  5]" : "some content 2", 
        "[IF myVariable > 10]" : "some content 3" 
    }
};

const result = jsoncode(myJsonObject, {myVariable: 7});
console.log(result);

//{"Its Array": ["some content 0", "some content 1", "some content 2"]}
```

#### Spread and combine operators
#### `[...IF ]`, `[...]`, `[*...]`
If condition is false, item will be removed from tree, else added into parent object.
```js
const myJsonObject = {
    "Its Object" : {
        "item1" : "some content 1", 
        "item2" : { "subItem1": "some content 1", "subItem2": "some content 2" }, 
        "item3" : { "subItem1": "some content 1", "subItem2": "some content 2" }, 
        "[...IF myVariable > 5]" : {
            "item2"        : { "subItem2": "some content 2b", "subItem3": "some content 3b" }, 
            "item3 [*...]" : { "subItem2": "some content 2b", "subItem3": "some content 3b" }, //Combine operator
        }
    },
    "Its Array [AS ARRAY]" : {
        "[...]"                  : ["some content 0a", "some content 0b"], 
        "[IF    myVariable > 0]" : "some content 1", 
        "[...IF myVariable > 5]" : ["some content 2", "some content 3"], 
        "[IF    myVariable > 6]" : ["some content 6", "some content 7"] 
    }
};

const result = jsoncode(myJsonObject, {myVariable: 7});
console.log(result);

/*
{
    "Its Object": {
        "item1" : "some content 1",
        "item2" : { 
            "subItem2": "some content 2b", 
            "subItem3": "some content 3b" 
        },
        "item3" : { 
            "subItem1": "some content 1", 
            "subItem2": "some content 2b", 
            "subItem3": "some content 3b"
        }
    }
    "Its Array": [
        "some content 0a", "some content 0b", "some content 1", "some content 2", 
        "some content 3", ["some content 6", "some content 7"]
    ],
}
*/
```

#### `[...BY ]`
This operator filters values of node by string, regEx or array and puts selected items into parent object.
```js
const myJsonObject = {
    "item1" : "some content 1", 
    "item2" : { "subItem1": "some content 1", "subItem2": "some content 2" }, 
    "item3" : { "subItem1": "some content 1", "subItem2": "some content 2" }, 
    "[...BY myVariable]" : {
        "variantA" : {
            "item2"        : { "subItem2": "some content 2b", "subItem3": "some content 3b" }, 
            "item3 [*...]" : { "subItem2": "some content 2b", "subItem3": "some content 3b" },
        },
        "variantB" : {
            "item2"        : { "subItem2": "some content 2c", "subItem3": "some content 3c" }, 
            "item3 [*...]" : { "subItem2": "some content 2c", "subItem3": "some content 3c" },
        }
    }
};

const result = jsoncode(myJsonObject, {myVariable: 'variantA'});
console.log(result);

/*
{
    "item1" : "some content 1",
    "item2" : { 
        "subItem2": "some content 2b", 
        "subItem3": "some content 3b" 
    },
    "item3" : { 
        "subItem1": "some content 1", 
        "subItem2": "some content 2b", 
        "subItem3": "some content 3b"
    }
}
*/
```
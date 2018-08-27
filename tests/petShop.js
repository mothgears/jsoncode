if (process.env.NODE_ENV === 'development') require('../jsoncode.js'); else require('../jsoncode.min.js');
const petShop = require('./petShop.json');

test('JSONCode: Pet shop / price list', () => {
	const priceList = JSON.specify(petShop['Animals'], {
		type: "mammal",
		carnivours: true,
		target: "sellOne"
	});

	expect(priceList).toEqual({
		"cat": {
			"size"   : "middle",
			"canFly" : false,
			"worth"  : 100
		},
		"dog": {
			"size"   : "middle",
			"canFly" : false,
			"worth"  : 130
		}
	});
});

test('JSONCode: Pet shop / animals food', () => {
	const animalsFood = JSON.specify(petShop['Animals food'], {
		city: "New York",
		type: "mammal",
		carnivours: true,
	});

	expect(animalsFood).toEqual({
		"In stock": "90 kg"
	});
});
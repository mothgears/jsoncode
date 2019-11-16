const jsoncode = process.env.NODE_ENV === 'development' ? require('../jsoncode.mjs').default : require('../jsoncode.pkg.js');

const tests = require('./base.json');

const resultTree = jsoncode(tests, {
	boolTrue    : true,
	boolFalse   : false,
	stringAlpha : "alpha",
	stringBeta  : "beta",
	int10       : 10,
	stringAlpha2: "alpha & itsString = @",
});

test('JSONCode: TEST 1', () => {
	expect(resultTree["TEST 1"]).toEqual({
		"item1":"1a",
		"item4":"2b",
		"item6":"3b"
	});
});

test('JSONCode: TEST 1B', () => {
	expect(resultTree["TEST 1B"]).toEqual({
		"item7":"4a",
		"item7b":"4aa",
		"item8c":"4cb"
	});
});

test('JSONCode: TEST 1BX', () => {
	expect(resultTree["TEST 1BX"]).toEqual({
		"item7X":"4a",
		"item7bX":"4aa",
		"item8cX":"4cb"
	});
});

test('JSONCode: TEST 1C', () => {
	expect(resultTree["TEST 1C"]).toEqual({
		"item10":"5b",
		"item10b":"5bb",
		"item12":"6a",
		"item17":"7c",
		"item18":"8a",
		"item19":"8b",
		"item22":"9b",
		"item23":"9c"
	});
});

test('JSONCode: TEST 1X', () => {
	expect(resultTree["TEST 1X"]).toEqual({
		"item0": ["1a", "4a", "5b", "6a"]
	});
});

test('JSONCode: TEST 2', () => {
	expect(resultTree["TEST 2"]).toEqual({
		"item1":"1a",
		"item2":"2b",
		"item3":"3c",
		"item4":"4b"
	});
});

test('JSONCode: TEST 3', () => {
	expect(resultTree["TEST 3"]).toEqual({
		"item1":"1a",
		"item2":"2b"
	});
});

test('JSONCode: TEST 4', () => {
	expect(resultTree["TEST 4"]).toEqual({
		"item1":{
			"item11":"11a",
			"item13":"13a"
		},
	});
});

test('JSONCode: TEST 5', () => {
	expect(resultTree["TEST 5"]).toEqual({
		"item1":"1b"
	});
});

test('JSONCode: TEST 6', () => {
	expect(resultTree["TEST 6"]).toEqual({
		"item2":"1b",
		"item3":"2a",
		"item5":"3a"
	});
});

test('JSONCode: TEST 7', () => {
	expect(resultTree["TEST 7"]).toEqual({
		"item1":"1a",
		"item3":"1c",
		"item5":"1e",
		"item7":"2b"
	});
});

test('JSONCode: TEST 8', () => {
	expect(resultTree["TEST 8"]).toEqual({
		"item1":["1a","1b","1c"]
	});
});

test('JSONCode: TEST 9', () => {
	expect(resultTree["TEST 9"]).toEqual({
		"item1":[
			{"item11":"1a"},
			{"item22":"2b","item23":"3b"}
		]
	});
});

test('JSONCode: TEST Spread', () => {
	expect(resultTree["TEST Spread"]).toEqual({
		objectItem: {
			simpleItem: "simpleItem value",
			simpleItemReplaced: "simpleItemReplaced newValue",
			objectItem: {
				localSimpleItem1: "localSimpleItem1 value",
				localSimpleItem2: "localSimpleItem2 value"
			},
			objectItemReplaced: {
				"newLocalSimpleItem1": "newLocalSimpleItem1 value",
				"newLocalSimpleItem2": "newLocalSimpleItem2 value"
			},
			objectItemCombined: {
				localSimpleItem1: "localSimpleItem1 value",
				localSimpleItemReplaced: "localSimpleItemReplaced newValue",
				localSimpleItem3: "localSimpleItem3 value"
			},
			arrayItemReplaced: [
				"newLocalSimpleItem1",
				"newLocalSimpleItem2"
			],
			arrayItemCombined: [
				"localSimpleItem1",
				"dublicatedlocalSimpleItem2",
				"dublicatedlocalSimpleItem2",
				"localSimpleItem3"
			],
			arrayItemCombinedUnique: [
				"localSimpleItem1",
				"uniquelocalSimpleItem2",
				"localSimpleItem3"
			]
		}
	});
});

test('JSONCode: TEST As Array', () => {
	expect(resultTree["TEST As Array"]).toEqual({
		asArrayItem: [
			"value1", "value2", "value3",
			"value4", ["value6", "value7"],
			"value10", "value11"
		]
	});
});
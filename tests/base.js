const jsoncode = process.env.NODE_ENV === 'development' ? require('../jsoncode.mjs').default : require('../jsoncode.pkg.js');

const tests = require('./base.json');

const resultTree = jsoncode(tests, {
	boolTrue    : true,
	boolFalse   : false,
	stringAlpha : "alpha",
	stringBeta  : "beta",
	int10       : 10,
	string10    : '10',
	stringAlpha2: "alpha & itsString = @",
	rxItemBItemC: /^(itemB|itemC)$/,
	arrayBetaGamma: ['beta', 'gamma']
});

const jcTree = jsoncode(tests['TEST selector']);

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

test('JSONCode: TEST Equals', () => {
	expect(resultTree["TEST Equals"]).toEqual({
		"item1":"value 1",
		"item7":"value 7",
		"item9":"value 9",
		"item11":"value 11",
		"item13":"value 13",
		"item15":"value 15",
	});
});

test('JSONCode: TEST 1BX', () => {
	expect(resultTree["TEST 1BX"]).toEqual({
		"item7X":"4a",
		"item7bX":"4aa",
		"item8cX":"4cb"
	});
});

test('JSONCode: TEST 1RX', () => {
	expect(resultTree["TEST 1RX"]).toEqual({
		"item2":"value 2",
		"item3":"value 3",
		"item5":"value 5",
		"item6":"value 6"
	});
});

test('JSONCode: TEST 1RXS', () => {
	expect(resultTree["TEST 1RXS"]).toEqual({
		"item1":"value 1",
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
		"item3":"3a",
		"item4":"4b",
		"item5":"5b",
		"item6":"6b"
	});
});

test('JSONCode: TEST 3', () => {
	expect(resultTree["TEST 3"]).toEqual({
		"item1":"1a",
		"item2":"2b"
	});
});

test('JSONCode: TEST 3B', () => {
	expect(resultTree["TEST 3B"]).toEqual({
		"item1": ["1b", "1c"],
	});
});

test('JSONCode: TEST 3C', () => {
	expect(resultTree["TEST 3C"]).toEqual({
		"item1": ["1b", "1c"],
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

test('JSONCode: TEST By Spread', () => {
	expect(resultTree["TEST [...BY ]"]).toEqual({
		"objectItem" : {
			"item1" : "value1",
			"item2" : "value2a",
			"item3" : ["value3a", "value4a"],
			"item4" : ["value5", "value6", "value5a", "value6a"],
			"item5" : { "item5.2" : "value9", "item5.2a" : "value10" },
			"item6" : { "item6.1" : "value9", "item6.2" : "value11", "item6.2a" : "value12" }
		}
	});
});

test('JSONCode: TEST By regExp', () => {
	expect(resultTree["TEST [...BY ] regExp"]).toEqual({
		"item1" : "value 1",
		"item3" : "value 3",
		"item4" : "value 4"
	});
});

test('JSONCode: TEST By array', () => {
	expect(resultTree["TEST [...BY ] array"]).toEqual({
		"item1" : "value 1",
		"item3" : "value 3",
		"item4" : "value 4"
	});
});

test('JSONCode: TEST E', () => {
	expect(resultTree["TEST E"]).toEqual({
		"item2" : "value 2",
		"item3" : "value 3",
		"item5" : "value 5",
		"item6" : "value 6"
	});
});

test('JSONCode: TEST paramsSelector', () => {
	expect(jcTree.getParams().sort()).toEqual([
		'prop0','prop1','prop10','prop10_1','prop11','prop12',
		'prop2','prop3','prop4','prop5','prop6','prop7','prop8','prop9'
	]);
});

test('JSONCode: TEST valuesSelector', () => {
	expect(jcTree.getValuesOf('prop1')).toEqual(['valStr1a', 'valStr1c']);
	expect(jcTree.getValuesOf('prop2')).toEqual(['valStr2a', 'valStr2c']);
	expect(jcTree.getValuesOf('prop3')).toEqual(['valStr3a', 'valStr3c']);
	expect(jcTree.getValuesOf('prop4')).toEqual(['valStr4a', 'valStr4c']);
	expect(jcTree.getValuesOf('prop5')).toEqual(['valStr5a', 'valStr5b', 'valStr5c', 'valStr5c_1a', 'valStr5c_1b']);
	expect(jcTree.getValuesOf('prop6')).toEqual(['valStr6a', 'valStr6b', 'valStr6c', 'valStr6c_1a', 'valStr6c_1b']);
	expect(jcTree.getValuesOf('prop7')).toEqual(['valStr7a', 'valStr7b', 'valStr7c', 'valStr7c_1a', 'valStr7c_1b']);
	expect(jcTree.getValuesOf('prop8')).toEqual(['valStr8a', 'valStr8b', 'valStr8c', 'valStr8d', 'valStr8e']);
	expect(jcTree.getValuesOf('prop9')).toEqual([17, 20]);
	expect(jcTree.getValuesOf('prop10')).toEqual([true, false]);
	expect(jcTree.getValuesOf('prop11')).toEqual([true, false]);
	expect(jcTree.getValuesOf('prop12')).toEqual([true, false]);
});
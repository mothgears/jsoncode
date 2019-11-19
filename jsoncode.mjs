const toUniversal = v => {
	if (v === null || v === undefined || v === 0) return '';
	if (typeof v === 'number') return v.toString();
	if (typeof v === 'object') return JSON.stringify(v);
	return v;
};

const compTypes = {
	'='  : (a,b) => a === b,
	'!=' : (a,b) => a !== b,
	'>'  : (a,b) => a > b,
	'<'  : (a,b) => a < b,
	'>=' : (a,b) => a >= b,
	'<=' : (a,b) => a <= b,
	'~'  : (a,b) => toUniversal(a) === toUniversal(b),
	'E'  : (a,b) => b.includes(a),
	'C'  : (a,b) => b.test(a)
};

const getStringValue = (_p, s) => {
	if (_p.startsWith(`'`) && _p.endsWith(`'`)) return s ? s[Number(_p.slice(1, -1))].toString() : _p.slice(1, -1);
	return false;
};

const condTypes = {
	1: (m, [_a])=>_a.startsWith('!')?!m[_a.slice(1)]:m[_a],
	2: (m, [_a, _b], s)=>condTypes[3](m, [_a, null, _b], s), //blind operation
	3: (m, [_a, b, _c], s)=>{
		let a = getStringValue(_a, s),
			c = getStringValue(_c, s);

		let aStr = false,
			cStr = false;

		if (!m) {
			return true;
		}

		if (a === false) {
			if (!Number.isNaN(Number.parseFloat(_a))) a = Number(_a);
			else a = m[_a];
		} else aStr = `'${a}'`;
		if (c === false) {
			if (!Number.isNaN(Number.parseFloat(_c))) c = Number(_c);
			else c = m[_c];
		} else cStr = `'${c}'`;

		if (!b) {
			if (c instanceof RegExp && typeof a === 'string') b = 'C';
			else if (Array.isArray(c)) b = 'E';
			else b = '=';
		}
		const operator = compTypes[b];
		if (operator) return operator(a, c);
		else throw `Unknown operator "${b}" in condition "${aStr!==false?aStr:_a} ${b} ${cStr!==false?cStr:_c}"`;
	}
};

const getStrings = (cond) => {
	let condStrings = cond.split(`'`);
	cond = [];
	for (let i = 0; i < condStrings.length; i++) {
		if (i % 2) cond.push(i);
		else cond.push(condStrings[i]);
	}
	return [
		cond.join(`'`),
		condStrings
	];
};

const parseLogicalExp = (cond, model) => {
	if (!model) return true;

	cond = cond.trim();

	let total = false;

	let condStrings;
	[cond, condStrings] = getStrings(cond);

	if (cond.includes('||')) throw `Unknown operator "||", maybe you mean "or" operator: "|" ?`;
	if (cond.includes('&&')) throw `Unknown operator "&&", maybe you mean "and" operator: "&" ?`;
	const ors = cond.split(' | ');
	ors.forEach(or=>{
		let local = true;
		const ands = or.split(' & ');
		ands.forEach(and=>{
			cond = and.replace(/ +/g, ' ').split(' ');
			const method = condTypes[cond.length];
			if (typeof method !== 'function') throw `Unknown condition type "${cond.join(' ')}"`;
			const result = method(model, cond, condStrings);
			local = local && result;
		});
		total = total || local;
	});

	return total;
};

const spread = (parsedItem, newNode) => {
	if (typeof parsedItem !== 'object' || Array.isArray(parsedItem)) return false;

	for (let [key, value] of Object.entries(parsedItem)) {
		if (key.endsWith(' [*...]') || key.endsWith(' [!...]') && typeof value === 'object') {
			let realKey = key.slice(0, -' [*...]'.length);
			if (Array.isArray(value)) {
				if (key.endsWith(' [!...]') && newNode[realKey]) for (let item of value) {
					if (!newNode[realKey].includes(item)) newNode[realKey].push(item);
				}
				else newNode[realKey] = [...(newNode[realKey]||[]), ...value];
			} else {
				newNode[realKey] = {...(newNode[realKey]||{}), ...value};
			}
		} else newNode[key] = value;
	}
	return true;
};

const parseItem = (node, model) => {
	if (typeof node !== 'object') return node;
	if (Array.isArray(node))      return node.map(item=>parseItem(item, model));

	const newNode = {};
	const keys = Object.keys(node);
	for (const key of keys) {
		if (key.endsWith(']')) {
			const pureIF = key.startsWith('[IF ');
			const spreadIF = key.startsWith('[...IF ');
			if (key.includes(' [IF ') || pureIF || spreadIF) {
				let
					newKey = key,
					cond;

				if (pureIF)        cond = key.slice('[IF '.length, -1);
				else if (spreadIF) cond = key.slice('[...IF '.length, -1);
				else               [newKey, cond] = key.slice(0, -1).split(' [IF ');

				newKey = newKey.trim();

				const isTrue = parseLogicalExp(cond, model);

				if (isTrue) {
					const parsedItem = parseItem(node[key], model);
					if (!spreadIF || !spread(parsedItem, newNode)) newNode[newKey] = parsedItem;
				}

				continue;
			}

			const arrayBY  = key.includes(' [*BY ');
			const spreadBY = key.startsWith('[...BY ');
			if (key.includes(' [BY ') || spreadBY || arrayBY) {
				let newKey = key, caseline;

				if (spreadBY)     caseline           = key.slice('[...BY '.length, -1);
				else if (arrayBY) [newKey, caseline] = key.slice(0, -1).split(' [*BY ');
				else              [newKey, caseline] = key.slice(0, -1).split(' [BY ');

				newKey = newKey.trim();
				caseline = caseline.trim();

				caseline = caseline.split(', ');
				let selectedCase = node[key];
				const selectedCases = [];

				if (arrayBY) {
					let casevalue = parseLogicalExp(caseline[0].trim(), model);
					if (casevalue instanceof RegExp) {
						for (let [caseKey,value] of Object.entries(selectedCase)) {
							if (casevalue.test(caseKey)) selectedCases.push(value);
						}
					} else if (Array.isArray(casevalue)) {
						for (let [caseKey, value] of Object.entries(selectedCase)) {
							if (casevalue.includes(caseKey)) selectedCases.push(value);
						}
					}
				} else for (let casename of caseline) {
					let casevalue = parseLogicalExp(casename.trim(), model);
					if (spreadBY && caseline.length === 1) {
						if (casevalue instanceof RegExp) {
							for (let [caseKey, value] of Object.entries(selectedCase)) {
								if (casevalue.test(caseKey)) selectedCases.push(value);
							}
						} else if (Array.isArray(casevalue)) {
							for (let [caseKey, value] of Object.entries(selectedCase)) {
								if (casevalue.includes(caseKey)) selectedCases.push(value);
							}
						}
					}
					if (typeof casevalue === 'boolean') {
						casevalue = casevalue ? '#TRUE' : '#FALSE';
					}
					selectedCase = selectedCase[casevalue] || selectedCase['#DEFAULT'];
				}

				if (spreadBY && selectedCases.length > 0) for (let sc of selectedCases) {
					const parsedItem = parseItem(sc, model);
					if (spreadBY) spread(parsedItem, newNode);
					else newNode[newKey] = parsedItem;
				}
				else {
					if (arrayBY && selectedCases.length > 0) selectedCase = selectedCases;
					if (selectedCase !== undefined) {
						const parsedItem = parseItem(selectedCase, model);
						if (spreadBY) spread(parsedItem, newNode);
						else newNode[newKey] = parsedItem;
					}
				}

				continue;
			}

			if (key.endsWith(` [AS ARRAY]`)) {
				let newKey = key.slice(0, -' [AS ARRAY]'.length);
				const obj = parseItem(node[key], model);
				let arr = [];
				for (let [cond, v] of Object.entries(obj)) {
					if ((cond.startsWith('[...IF ') || cond === '[...]') && Array.isArray(v)) arr = [...arr, ...v];
					else arr.push(v);
				}
				newNode[newKey] = arr;
				continue;
			}
		}
		newNode[key] = parseItem(node[key], model)
	}
	return newNode;
};

class Jsoncode {
	constructor(src) { this._source = src; }

	static _selectKeysOfNode (rx, node, keys) {
		keys = keys || [];
		if (Array.isArray(node)) {
			for (let value of node) Jsoncode._selectKeysOfNode(rx, value, keys);
		} else {
			for (let [key, value] of Object.entries(node)) {
				const result = key.match(rx);
				if (result) {
					keys.push({
						operator: result[1],
						condition: result[2].trim(),
						value: value
					});
				}
				if (typeof value === 'object') Jsoncode._selectKeysOfNode(rx, value, keys);
			}
		}
		return keys;
	}

	static _parseBinaryExp (exp, propname, strings) {
		exp = exp.trim().replace(/ +/g, ' ').split(' ');
		if (exp.length === 3) exp = [exp[0], exp[2]];
		const index = exp.indexOf(propname);
		if (index >= 0) {
			let value = exp[1-index];
			if (value.startsWith(`'`)) value = strings[value.slice(1,-1)];
			return value;
		}
		return undefined;
	}

	get source () { return this._source; }

	selectValues (propname) {
		const rx     = new RegExp(`.*\\[(IF|BY|\\*BY|\\.\\.\\.IF|\\.\\.\\.BY) ([^\\]]*${propname}[^\\]]*)]`);
		const keys   = Jsoncode._selectKeysOfNode(rx, this._source);
		const values = [];

		for (let key of keys) {
			if (['IF', '...IF'].includes(key.operator)) {
				let [condition, strings] = getStrings(key.condition);
				condition = condition.split(/ \| | & /);
				for (let exp of condition) {
					const value = Jsoncode._parseBinaryExp(exp, propname, strings);
					if (value !== undefined) values.push(value);
				}
			}
			if (['BY', '*BY', '...BY'].includes(key.operator)) {
				let [condition, strings] = getStrings(key.condition);
				let conditions = condition.split(',').map(exp=>exp.trim());
				let targetCondition = null;
				let targetNodes = [key.value];
				while (!targetCondition && conditions.length > 0) {
					const exp = conditions.shift();
					if (exp.includes(' ')) {
						const value = Jsoncode._parseBinaryExp(exp, propname, strings);
						if (value !== undefined) {
							targetCondition = true;
							values.push(value);
						}
					} else {
						if (exp === propname) {
							targetNodes.forEach(
								node => Object.keys(node).forEach(key=>values.push(key))
							);
							targetCondition = true;
						} else {
							targetNodes = targetNodes.reduce(
								(newNodes, node)=>[ ...newNodes, ...Object.values(node) ],
								[]
							);
						}
					}
				}
			}
		}

		return values;
	}
}

const _jcCache = {};

const jsoncode = (src, model = null)=> {
	if (model) return parseItem(src, model);
	else {
		if (_jcCache[src]) return _jcCache[src];
		else return _jcCache[src] = new Jsoncode(src);
	}
};
if (typeof JSON !== 'undefined') JSON.specify = jsoncode;
export default jsoncode;
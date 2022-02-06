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
	'E'  : (a,b) => b?b.includes(a):false,
	'C'  : (a,b) => b?b.test(a):false,
	'!E' : (a,b) => b?!b.includes(a):true,
	'!C' : (a,b) => b?!b.test(a):true
};

const getStringOrRxValue = (_p, s) => {
	if (_p.startsWith(`'`) && _p.endsWith(`'`)) return s ? s[_p].toString() : _p.slice(1, -1);
	if (_p.startsWith(`/`) && _p.endsWith(`/`)) return new RegExp(s ? s[_p].toString() : _p.slice(1, -1));
	return false;
};

const condTypes = {
	1: (m, [_a])=>_a.startsWith('!')?!m[_a.slice(1)]:m[_a],
	2: (m, [_a, _b], s)=>condTypes[3](m, [_a, null, _b], s), //blind operation
	3: (m, [_a, b, _c], s)=>{
		let a = getStringOrRxValue(_a, s),
			c = getStringOrRxValue(_c, s);

		let aStr = false,
			cStr = false;

		if (!m) {
			return true;
		}

		if (a === false) {
			const pf = Number.parseFloat(_a);
			if (!Number.isNaN(pf)) a = pf;
			else a = m[_a];
		} else aStr = `'${a}'`;
		if (c === false) {
			const pf = Number.parseFloat(_c);
			if (!Number.isNaN(pf)) c = pf;
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

const getStringOrRx = (cond) => {
	const stringsAndRxs = {};

	let condStrings = cond.split(`'`);
	cond = [];
	for (let i = 0; i < condStrings.length; i++) {
		if (i % 2) {
			cond.push(i);
			stringsAndRxs[`'${i}'`] = condStrings[i];
		}
		else cond.push(condStrings[i]);
	}
	let condRegExps = cond.join(`'`).split(`/`);
	cond = [];
	for (let i = 0; i < condRegExps.length; i++) {
		if (i % 2) {
			cond.push(i);
			stringsAndRxs[`/${i}/`] = condRegExps[i];
		}
		else cond.push(condRegExps[i]);
	}
	return [
		cond.join(`/`),
		stringsAndRxs
	];
};

const parseLogicalExp = (cond, model) => {
	if (!model) return true;

	cond = cond.trim();

	let total = false;

	let condStrings;
	[cond, condStrings] = getStringOrRx(cond);

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

const getShadowPath = (shadowPath, ...itemKeys) => itemKeys.reduce(
	(r, itemKey)=>r + '/' +itemKey.replace(/\\/g, '\\\\').replace(/\//g, '\\/'),
	shadowPath
);

const escape = (key) => key.replace(/\\([\\\[])/g, tokens=>tokens[1]);

const spread = (parsedItem, newNode, shadowPath, shadowIndex) => {
	if (typeof parsedItem !== 'object' || Array.isArray(parsedItem)) return false;

	for (let [key, value] of Object.entries(parsedItem)) {
		if (key.endsWith(' [*...]') || key.endsWith(' [~...]') && typeof value === 'object') {
			let realKey = key.slice(0, -' [*...]'.length);
			if (Array.isArray(value)) {
				if (key.endsWith(' [~...]') && newNode[realKey]) for (let item of value) {
					if (!newNode[realKey].includes(item)) newNode[realKey].push(item);
				}
				else newNode[realKey] = [...(newNode[realKey]||[]), ...value];
			} else for (let subKey of Object.keys(value)) {
				const itemShadowPath = getShadowPath(shadowPath, realKey, subKey);
				const shadowItem = shadowIndex[itemShadowPath];
				if (!shadowItem || !shadowItem.important) {
					if (!newNode[realKey]) newNode[realKey] = {};
					newNode[realKey][subKey] = value[subKey];
				}
			}
		} else {
			const itemShadowPath = getShadowPath(shadowPath, key);
			const shadowItem = shadowIndex[itemShadowPath];
			if (!shadowItem || !shadowItem.important) newNode[key] = value;
		}
	}
	return true;
};

const parseItem = (node, model, shadowPath = '', shadowIndex = {}) => {
	if (!node || typeof node !== 'object') return node;
	if (Array.isArray(node))               return node.map(item=>parseItem(item, model, shadowPath, shadowIndex));

	const newNode = {};
	const keys = Object.keys(node);
	const deferredParsers = [];
	for (let key of keys) {
		if (key.startsWith('[KEY-BY')) {
			let [condition, ...keyVariants] = key.slice('[KEY-BY'.length).split(']');
			let strAndRx;
			[keyVariants, strAndRx] = getStringOrRx(keyVariants.join(']'));
			keyVariants = keyVariants.split('|');

			const isTrue = parseLogicalExp(condition, model);
			let newKey = keyVariants[+!isTrue].trim();
			if (newKey.startsWith(`'`)) newKey = strAndRx[newKey];

			newNode[newKey] = parseItem(node[key], model, getShadowPath(shadowPath, newKey), shadowIndex);
			continue;

		} else if (key.endsWith(']')) {
			const pureIF = key.startsWith('[IF ');
			const spreadIF = key.startsWith('[...IF ');
			if (key.includes(' [IF ') || pureIF || spreadIF) {
				let
					newKey = key,
					cond;

				if (pureIF)        cond = key.slice('[IF '.length, -1);
				else if (spreadIF) cond = key.slice('[...IF '.length, -1);
				else {
					const tmpKey = key.slice(0, -1);
					const pos = tmpKey.lastIndexOf(' [IF ');
					newKey = tmpKey.substring(0, pos);
					cond = tmpKey.substring(pos + ' [IF '.length);
				}

				newKey = newKey.trim();

				const isTrue = parseLogicalExp(cond, model);

				if (isTrue) {
					const parsedItem = parseItem(node[key], model, getShadowPath(shadowPath, newKey), shadowIndex);
					if (spreadIF && typeof parsedItem === 'object' && !Array.isArray(parsedItem)) {
						deferredParsers.push(()=>spread(parsedItem, newNode, shadowPath, shadowIndex));
					}
					else newNode[newKey] = parsedItem;
				}

				continue;
			}

			const arrayBY  = key.includes(' [*BY ');
			const spreadBY = key.startsWith('[...BY ');
			if (key.includes(' [BY ') || spreadBY || arrayBY) {
				let newKey = key, caseline;

				if (spreadBY)     caseline           = key.slice('[...BY '.length, -1);
				else if (arrayBY) [newKey, caseline] = key.slice(0, -1).split(' [*BY ');
				else {
					const tmpKey = key.slice(0, -1);
					const pos = tmpKey.lastIndexOf(' [BY ');
					newKey = tmpKey.substring(0, pos);
					caseline = tmpKey.substring(pos + ' [BY '.length);
				}

				newKey = newKey.trim();
				caseline = caseline.trim();

				caseline = caseline.split(', ');
				let selectedCase = node[key];
				const selectedCases = [];

				if (arrayBY || spreadBY) caseline.length = 1;

				for (let casename of caseline) {
					if (!selectedCase) break;

					let casevalue = parseLogicalExp(casename.trim(), model);
					if (typeof casevalue === 'boolean' || casevalue === null || casevalue === undefined) {
						casevalue = casevalue ? '#TRUE' : '#FALSE';
					}

					if (casevalue instanceof RegExp) {
						for (let [caseKey, value] of Object.entries(selectedCase)) {
							if (casevalue.test(caseKey)) selectedCases.push(value);
						}
					} else if (Array.isArray(casevalue)) {
						for (let [caseKey, value] of Object.entries(selectedCase)) {
							if (casevalue.includes(caseKey)) selectedCases.push(value);
						}
					} else {
						if (Object.keys(selectedCase).includes(casevalue)) {
							selectedCases.push(selectedCase[casevalue]);
						}
					}

					if (!arrayBY && !spreadBY) {
						if (selectedCases.length > 0) selectedCase = selectedCases[0];
						else selectedCase = selectedCase['#DEFAULT'];
						selectedCases.length = 0;
					}
				}

				if (selectedCases.length > 0) {
					if (spreadBY) for (let sc of selectedCases) {
						const parsedItem = parseItem(sc, model, getShadowPath(shadowPath, newKey), shadowIndex);
						spread(parsedItem, newNode, shadowPath, shadowIndex);
					} else if (arrayBY) selectedCase = selectedCases;
				}
				if ((!spreadBY || selectedCases.length === 0) && selectedCase !== undefined) {
					const parsedItem = parseItem(selectedCase, model, getShadowPath(shadowPath, newKey), shadowIndex);
					if (spreadBY) spread(parsedItem, newNode, shadowPath, shadowIndex);
					else newNode[newKey] = parsedItem;
				}

				continue;
			}

			if (key.endsWith(` [AS ARRAY]`)) {
				let newKey = key.slice(0, -' [AS ARRAY]'.length);
				const obj = parseItem(node[key], model, getShadowPath(shadowPath, newKey), shadowIndex);
				let arr = [];
				for (let [cond, v] of Object.entries(obj)) {
					if ((cond.startsWith('[...IF ') || cond === '[...]') && Array.isArray(v)) arr = [...arr, ...v];
					else arr.push(v);
				}
				newNode[newKey] = arr;
				continue;
			}

			if (key.endsWith(' [FROM]')) {
				let newKey = key.slice(0, -' [FROM]'.length).trim();
				newNode[newKey] = (node[key] === '@') ? model : model[node[key]];
				continue;
			}

			if (key === '[...FROM]') {
				const obj = (node[key] === '@') ? model : model[node[key]];
				if (typeof obj === 'object' && !Array.isArray(obj)) {
					deferredParsers.push(()=>{
						for (let [k,v] of Object.entries(obj)) {
							const itemShadowPath = getShadowPath(shadowPath, k);
							const shadowItem = shadowIndex[itemShadowPath];
							if (!shadowItem || !shadowItem.important) newNode[k] = v;
						}
					});
				}
				continue;
			}

			if (key.endsWith(' [!]')) {
				let newKey = key.slice(0, -' [!]'.length).trim();
				const itemShadowPath = getShadowPath(shadowPath, newKey);
				newNode[newKey] = parseItem(node[key], model, itemShadowPath, shadowIndex);
				shadowIndex[itemShadowPath] = { important: true };
				continue;
			}

		}

		const escapedKey = escape(key);
		newNode[escapedKey] = parseItem(node[key], model, getShadowPath(shadowPath, key), shadowIndex)
	}

	for (let prc of deferredParsers) prc();

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
				if (value && typeof value === 'object') Jsoncode._selectKeysOfNode(rx, value, keys);
			}
		}
		return keys;
	}

	static _parseBinaryExp (exp, strings, propname) {
		exp = exp.trim().replace(/ +/g, ' ').split(' ');
		if (exp.length === 3) exp = [exp[0], exp[2]];

		const params = [];
		const values = [];

		for (let token of exp) {
			let value = undefined;
			if      (token.startsWith(`'`)) value = strings[token];
			else if (token.startsWith(`/`)) value = new RegExp(strings[token]);
			else {
				const pf = Number.parseFloat(token);
				if (!Number.isNaN(pf)) value = pf;
			}
			if (value) values.push(value);
			else       params.push(token);
		}

		if (propname) {
			if (params.includes(propname)) return values;
			else [];
		} else return params;
	}

	get source () { return this._source; }

	specify (model) { return parseItem(this._source, model); }

	_getAll (rx, propname) {
		const keys   = Jsoncode._selectKeysOfNode(rx, this._source);
		const result = new Set;

		for (let key of keys) {
			if (['KEY-BY', 'IF', '...IF'].includes(key.operator)) {
				let [condition, strings] = getStringOrRx(key.condition);
				condition = condition.split(/ \| | & /);
				for (let exp of condition) {
					if (exp.includes(' ')) Jsoncode._parseBinaryExp(exp, strings, propname).forEach(p => result.add(p));
					else if (propname) {
						if (exp.startsWith('!')) exp = exp.slice(1);
						if (propname === exp) {
							result.add(true);
							result.add(false);
						}
					} else {
						result.add(exp.startsWith('!') ? exp.slice(1) : exp);
					}
				}
			} else if (['BY', '*BY', '...BY'].includes(key.operator)) {
				let [condition, strings] = getStringOrRx(key.condition);
				let conditions = condition.split(',').map(exp=>exp.trim());
				let targetCondition = null;
				let targetNodes = [key.value];
				while (!targetCondition && conditions.length > 0) {
					let exp = conditions.shift();
					if (exp.includes(' ')) {
						const r = Jsoncode._parseBinaryExp(exp, strings, propname);
						if (r.length > 0) {
							if (propname) targetCondition = true;
							r.forEach(p=>result.add(p));
						}
					} else if (propname) {
						if (exp.startsWith('!')) exp = exp.slice(1);
						if (exp === propname) {
							targetNodes.forEach(
								node => Object.keys(node).forEach(key=>{
									if      (key === '#TRUE')    key = true;
									else if (key === '#FALSE')   key = false;
									if (key !== '#DEFAULT') result.add(key)
								})
							);
							targetCondition = true;
						} else {
							targetNodes = targetNodes.reduce(
								(newNodes, node)=>[ ...newNodes, ...Object.values(node) ],
								[]
							);
						}
					} else result.add(exp.startsWith('!') ? exp.slice(1) : exp);
				}
			}
		}

		return Array.from(result);
	}

	getParams () {
		return this._getAll(new RegExp(`.*\\[(KEY-BY|IF|BY|\\*BY|\\.\\.\\.IF|\\.\\.\\.BY) ([^\\]]+)].*`))
	}

	getValuesOf (propname) {
		if (!propname || typeof propname !== 'string') throw Error('"getValuesOf" : propname is not string!');
		return this._getAll(new RegExp(`.*\\[(KEY-BY|IF|BY|\\*BY|\\.\\.\\.IF|\\.\\.\\.BY) ([^\\]]*${propname}[^\\]]*)].*`), propname);
	}
}

const jsoncode = (src, model = null)=> {
	if (model) return parseItem(src, model);
	else       return new Jsoncode(src);
};
if (typeof JSON !== 'undefined') JSON.specify = jsoncode;
export default jsoncode;
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
};

const getStringValue = (_p, s) => {
	if (_p.startsWith(`'`) && _p.endsWith(`'`)) return s ? s[Number(_p.slice(1, -1))].toString() : _p.slice(1, -1);
	return false;
};

const condTypes = {
	1: (m, [_a])=>m?(_a.startsWith('!')?!m[_a.slice(1)]:m[_a]):true,
	2: (m, [_a, _b], s)=>condTypes[3](m, [_a, '=', _b], s),
	3: (m, [_a, b, _c], s)=>{
		let a = getStringValue(_a, s),
			c = getStringValue(_c, s);

		if (!m) {
			return true;
		}

		if (a === false) {
			if (!Number.isNaN(Number.parseFloat(_a))) a = Number(_a);
			else a = m[_a];
		}
		if (c === false) {
			if (!Number.isNaN(Number.parseFloat(_c))) c = Number(_c);
			else c = m[_c];
		}

		const operator = compTypes[b];
		if (operator) return operator(a, c);
		else throw `Unknown operator "${b}" in condition "${aName} ${b} ${c}"`;
	}
};

const parseLogicalExp = (cond, model) => {
	if (!model) return true;

	cond = cond.trim();

	let total = false;

	let condStrings = cond.split(`'`);
	cond = [];
	for (let i = 0; i < condStrings.length; i++) {
		if (i % 2) cond.push(i);
		else cond.push(condStrings[i]);
	}
	cond = cond.join(`'`);

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

	//if (simp) return simp;
	return total;
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
					if (spreadIF && typeof parsedItem === 'object' && !Array.isArray(parsedItem)) {
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
					} else newNode[newKey] = parsedItem;
				}

				continue;
			}

			//const pureBY   = key.startsWith('[BY ');
			const spreadBY = key.startsWith('[...BY ');
			if (key.includes(' [BY ') || spreadBY) {
				let newKey = key, caseline;

				if (spreadBY) caseline  = key.slice('[...BY '.length, -1);
				else [newKey, caseline] = key.slice(0, -1).split(' [BY ');

				newKey = newKey.trim();
				caseline = caseline.trim();

				caseline = caseline.split(', ');
				let selectedCase = node[key];

				for (let casename of caseline) {
					let casevalue = model[casename.trim()];
					if (typeof casevalue === 'boolean') {
						casevalue = casevalue ? '#TRUE' : '#FALSE';
					}
					selectedCase = selectedCase[casevalue] || selectedCase['#DEFAULT'];
				}
				if (selectedCase !== undefined) {
					const parsedItem = parseItem(selectedCase, model);
					if (spreadBY && typeof parsedItem === 'object' && !Array.isArray(parsedItem)) {
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
					} else newNode[newKey] = parsedItem;
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

//SELECTRS
const combineRx = (...rxArr) => {
	let delim = rxArr[rxArr.length-1];
	if (typeof delim === 'string') rxArr.pop();
	else delim = '';
	return new RegExp(rxArr.map(rx=>rx.source).join(delim));
};

const expressions = {
	'[...IF' : {rx: /^\[\.\.\.IF/, type: 'IF'},
	'[IF'    : {rx: /\[IF/, type: 'IF'},
	'[BY'    : {rx: /\[BY/, type: 'BY'},
};

const simpleSelect = (node, rx) => {
	if (typeof rx === 'string') {
		let startToken = rx.split(' ')[0];
		let { rx:startRx, type } = expressions[startToken];
		if (type) {
			const rxs = [];
			for (let token of rx.slice(startToken.length, -1).trim().replace(/ +/g, ' ').split(type === 'BY'?',':' ')) {
				token = token.trim();
				if      (token ===  '@') rxs.push(/\s+([A-Za-z_]\S*)/);
				else if (token === '#@') rxs.push(/\s+([0-9]\S*)/);
				else if (token === '*@') rxs.push(/\s+'(.+)'/);
				else rxs.push(new RegExp(`\\s+${token}`));
			}
			rx = combineRx(startRx, combineRx(...rxs, ...type==='BY'?['\\s*,']:[]), /\s*]$/);
		} else return [];
	}

	const selected = [];
	for (let [key, value] of Object.entries(node)) {
		const result = key.match(rx);
		if (result) {
			const r = {key, value};
			if (Array.isArray(result)) r.group = result.slice(1);
			selected.push(r);
		}
	}

	return selected;
};

const select = (node, rxline) => {
	let selected = [{ value: node }];
	while (rxline.length > 0) {
		let rx = rxline.shift();
		let tmpSelected = [];
		for (let selectedNode of selected) {
			tmpSelected = [ ...tmpSelected, ...simpleSelect(selectedNode.value, rx) ];
		}
		selected = tmpSelected;
		if (rxline.length === 0) return selected;
	}
	return [];
};

const jsoncode = (src, model = null)=> {
	if (model) return parseItem(src, model);
	else return {
		select: (...rxline) => select(src, rxline),
	}
};
if (typeof JSON !== 'undefined') JSON.specify = jsoncode;
export default jsoncode;
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

const condTypes = {
	1: (m, [_a])=>_a.startsWith('!')?!m[_a.slice(1)]:m[_a],
	2: (m, [_a, _b], s)=>condTypes[3](m, [_a, '=', _b], s),
	3: (m, [_a, b, _c], s)=>{
		let a, c;
		if (_a.startsWith(`'`)&&_a.endsWith(`'`)) {
			a = s ? s[Number(_a.slice(1, -1))].toString() : _a.slice(1, -1);
			c = m[_c];
		} else if (!isNaN(_a)) {
			a = Number(_a);
			c = m[_c];
		} else {
			if (_c.startsWith(`'`)&&_c.endsWith(`'`)) {
				c = s ? s[Number(_c.slice(1, -1))].toString() : _c.slice(1, -1);
				a = m[_a];
			} else if (!isNaN(_c)) {
				c = Number(_c);
				a = m[_a];
			} else {
				c = m[_c];
				a = m[_c];
			}
		}
		const operator = compTypes[b];
		if (operator) return operator(a, c);
		else throw `Unknown operator "${b}" in condition "${aName} ${b} ${c}"`;
	}
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
						else local = local && method(model, cond, condStrings);

					});
					total = total || local;
				});

				if (total) {
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

			if (key.includes(' [BY ')) {
				let [newKey, caseline] = key.slice(0, -1).split(' [BY ');
				caseline = caseline.split(', ');
				let selectedCase = node[key];
				for (let casename of caseline) {
					casename = model[casename];
					if (typeof casename === 'boolean') {
						casename = casename ? '#TRUE' : '#FALSE';
					}
					selectedCase = selectedCase[casename] || selectedCase['#DEFAULT'];
				}
				if (selectedCase !== undefined) newNode[newKey] = parseItem(selectedCase, model);
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

const jsoncode = (src, model = null)=> model ? parseItem(src, model) : src;
if (typeof JSON !== 'undefined') JSON.specify = jsoncode;
export default jsoncode;
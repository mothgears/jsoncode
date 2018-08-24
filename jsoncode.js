const compTypes = {
	'='  : (a,b) => a === b,
	'>'  : (a,b) => a > b,
	'<'  : (a,b) => a < b,
	'>=' : (a,b) => a >= b,
	'<=' : (a,b) => a <= b
};

const condTypes = {
	1: (m, [a])=>a.startsWith('!')?!m[a.slice(1)]:m[a],
	2: (m, [a,b])=>condTypes[3](m, [a,'=',b]),
	3: (m, [a,b,c])=>{
		a = m[a];
		if (c.startsWith(`'`)&&c.endsWith(`'`)) {
			a = a.toString();
			c = c.slice(1, -1);
		} else if (isNaN(c)) {
			c = m[c];
		} else {
			a = Number(a);
			c = Number(c);
		}
		return compTypes[b](a, c);
	}
};

const parseItem = (node, model) => {
	if (typeof node !== 'object') return node;

	if (Array.isArray(node)) {
		const newArray = [];
		node.forEach(item=>newArray.push(parseItem(item, model)));
		return newArray;
	}

	const newNode = {};
	const keys = Object.keys(node);
	for (const key of keys) {
		if (key.endsWith(']')) {
			if (key.includes(' [IF ')) {
				let [newKey, cond] = key.slice(0, -1).split(' [IF ');

				let total = false;
				const ors  = cond.split(' | ');
				ors.forEach(or=>{
					let local = true;
					const ands = or.split(' & ');
					ands.forEach(and=>{
						cond = and.split(' ');
						if (cond.length === 11) console.log('CND:', cond);
						const method = condTypes[cond.length];
						local = local && method(model, cond)
					});
					total = total || local;
				});

				if (total) newNode[newKey] = parseItem(node[key], model);
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
		}
		newNode[key] = parseItem(node[key], model)
	}
	return newNode;
};

module.exports = JSON.specify = (src, model = null)=> model ? parseItem(src, model) : src;
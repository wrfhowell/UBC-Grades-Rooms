export class Transformations {
	private type = "yes";
	public groupMap: Map<string, string[]>;

	constructor() {
		this.type = "yes";
		this.groupMap = new Map<string, string[]>();
	}

	public ExecuteTransformations(TransformationsClause: any, Dataset: any): any {
		let groupMap = this.ExecuteGroup(TransformationsClause.TRANSFORMATIONS.GROUP, Dataset);
		let result = this.ExecuteApply(TransformationsClause.TRANSFORMATIONS.APPLY, groupMap);
		return this.FlattenMap(result);
	}

	public ExecuteGroup(Group: any, Dataset: string[]): any {
		function formKey(section: any, groupKeys: string[]) {
			let key = "";
			for (let i in groupKeys) {
				key = key + section[groupKeys[i]] + "_";
			}
			return key;
		}
		let groupedMap: Map<string, string[]>;
		groupedMap = new Map<string, string[]>();
		for (let i of Dataset) {
			let currKey = formKey(i, Group);
			let mapValRef = groupedMap.get(currKey);
			if (!mapValRef) {
				let blank = [];
				blank.push(i);
				groupedMap.set(currKey, blank);
			} else if (mapValRef) {
				mapValRef.push(i);
			}
		}
		return groupedMap;
	}

	public ExecuteApply(ApplyRules: any, groupMap: Map<string, any>): any {
		let resultMap = groupMap;
		ApplyRules.forEach((element: any) => {
			resultMap = this.TriageApply(element, resultMap);
		});
		// return this.FlattenMap(resultMap, Groups);
		return resultMap;
	}

	public FlattenMap(resultMap: Map<string, any>) {
		let resultArray = [];
		for (const [key, value] of resultMap.entries()) {
			let dummyObj = Object.assign({}, value[0]);
			resultArray.push(dummyObj);
		}
		return resultArray;
	}

	public TriageApply(ApplyClause: any, groupMap: Map<string, any>): any {
		let applyKey = Object.keys(ApplyClause)[0];
		let applyTokenClause = ApplyClause[applyKey];
		let applyToken = Object.keys(applyTokenClause)[0];
		switch (applyToken) {
			case "MAX" : {
				return this.ApplyMax(applyTokenClause, groupMap, applyKey);
			}
			case "MIN" : {
				return this.ApplyMin(applyTokenClause, groupMap, applyKey);
			}
			case "COUNT" : {
				return this.ApplyCount(applyTokenClause, groupMap, applyKey);
			}
			case "AVG" : {
				return this.ApplyAvg(applyTokenClause, groupMap, applyKey);
			}
			case "SUM" : {
				return this.ApplySum(applyTokenClause, groupMap, applyKey);
			}
			default:
				return [];
		}
		return applyKey;
	}

	public ApplyCount(Clause: any, groupMap: Map<string, any>, ApplyKey: any) {
		let keyToCount = Clause.COUNT;
		for (const [key, value] of groupMap.entries()) {
			let currValue = value.reduce((a: any, b: any) => {
				if (!a.includes(b[keyToCount])) {
					a.push(b[keyToCount]);
				}
				return a;
			}, []).length;
			for (let i in value) {
				value[i][ApplyKey] = currValue;
			}
		}
		return groupMap;
	}

	public ApplyMax(Clause: any, groupMap: Map<string, any>, ApplyKey: any) {
		let keyToMax = Clause.MAX;
		for (const [key, value] of groupMap.entries()) {
			let currValue = value.reduce((a: any, b: any) => {
				if (b[keyToMax] > a) {
					a = b[keyToMax];
				}
				return a;
			}, -Infinity);
			for (let i in value) {
				value[i][ApplyKey] = currValue;
			}
		}
		return groupMap;
	}

	public ApplyMin(Clause: any, groupMap: Map<string, any>, ApplyKey: any) {
		let keyToMin = Clause.MIN;
		for (const [key, value] of groupMap.entries()) {
			let currValue = value.reduce((a: any, b: any) => {
				if (b[keyToMin] < a) {
					a = b[keyToMin];
				}
				return a;
			}, +Infinity);
			for (let i in value) {
				value[i][ApplyKey] = currValue;
			}
		}
		return groupMap;
	}

	public ApplyAvg(Clause: any, groupMap: Map<string, any>, ApplyKey: any) {
		let keyToAvg = Clause.AVG;
		for (const [key, value] of groupMap.entries()) {
			let currValue = value.reduce((a: any, b: any) => {
				a = a + b[keyToAvg];
				return a;
			}, 0);
			currValue = currValue / value.length;
			for (let i in value) {
				value[i][ApplyKey] = currValue;
			}
		}
		return groupMap;
	}

	public ApplySum(Clause: any, groupMap: Map<string, any>, ApplyKey: any) {
		let keyToAvg = Clause.SUM;
		for (const [key, value] of groupMap.entries()) {
			let currValue = value.reduce((a: any, b: any) => {
				a = a + b[keyToAvg];
				return a;
			}, 0);
			for (let i in value) {
				value[i][ApplyKey] = currValue;
			}
		}
		return groupMap;
	}

	public ParseKeyForField(Key: any) {
		let sField = Key.split("_").pop();
		return sField;
	}

	public ReturnJSONifiedObject(Input: any) {
		let stringified = JSON.stringify(Input);
		let JSONifiedObject = JSON.parse(stringified);
		return JSONifiedObject;
	}

	public ReturnCountFilteredArray(Array: any, PropKey: any, Value: any) {
		let filteredArray = Array.filter(function (el: any) {
			return el[`${PropKey}`] === Value;
		});
		return filteredArray.length;
	}
}


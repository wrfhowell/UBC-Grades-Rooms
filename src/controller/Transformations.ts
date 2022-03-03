export class Transformations {
	private type = "yes";
	public groupMap: Map<string, string[]>;

	constructor() {
		this.type = "yes";
		this.groupMap = new Map<string, string[]>();
	}

	public ExecuteTransformations(TransformationsClause: any, Dataset: string[]): any {
		let groupMap = this.ExecuteGroup(TransformationsClause.GROUP, Dataset);
		let result = this.ExecuteApply(TransformationsClause.APPLY, groupMap, TransformationsClause.GROUP);
	}

	public ExecuteGroup(Group: any, Dataset: string[]): any {
		function formKey(section: any, groupKeys: string[]) {
			let key = "";
			for (let i in groupKeys) {
				key = key + section[groupKeys[i]] + "_";
			}
			return key;
		}
		let groupedMap: Map<string, any>;
		groupedMap = new Map<string, any>();
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

	// public ExecuteOneGroup(OneGroup: any, Dataset: string[]): any {
	//
	// }

	public ExecuteApply(ApplyRules: any, groupMap: Map<string, any>, Groups: any): any {
		let resultMap = groupMap;
		for (let i in ApplyRules) {
			resultMap = this.TriageApply(ApplyRules[i], resultMap, Groups);
		}
		return this.FlattenMap(resultMap, Groups);
	}

	public FlattenMap(resultMap: Map<string, any>, Groups: string[]) {
		let resultArray = [];
		for (const [key, value] of resultMap.entries()) {
			let dummyObj: any = {};
			for (let i in Groups) {
				dummyObj[Groups[i]] = value[0][Groups[i]];
			}
			resultArray.push(dummyObj);
		}
		return resultArray;
	}

	public TriageApply(ApplyClause: any, groupMap: Map<string, any>, Groups: any): any {
		let applyKey = Object.keys(ApplyClause)[0];
		let applyTokenClause = ApplyClause[`${applyKey}`];
		let applyToken = Object.keys(applyTokenClause)[0];
		switch (applyToken) {
			case "MAX" : {
				return this.ApplyMax(ApplyClause, groupMap, Groups, applyKey);
			}
			case "MIN" : {
				return this.ApplyMin(ApplyClause, groupMap, Groups, applyKey);
			}
			case "COUNT" : {
				return this.ApplyCount(ApplyClause, groupMap, Groups, applyKey);
			}
			case "AVG" : {
				return this.ApplyAvg(ApplyClause, groupMap, Groups, applyKey);
			}
			case "SUM" : {
				return this.ApplySum(ApplyClause, groupMap, Groups, applyKey);
			}
			default:
				return [];
		}
		return applyKey;
	}

	public ApplyCount(Clause: any, groupMap: Map<string, any>, Groups: string[], ApplyKey: any): string[] {
		return [];
	}

	public ApplyMax(Clause: any, groupMap: Map<string, any>, Groups: string[], ApplyKey: any) {
		let keyToMax = Clause.MAX;
		for (const [key, value] of groupMap.entries()) {
			let currValue = value.reduce((a: any, b: any) => {
				if (b[keyToMax] > a) {
					a = b[keyToMax];
				}
				return a;
			}, 0);
			value[ApplyKey] = currValue;
		}
		return groupMap;
	}

	public ApplyMin(Clause: any, groupMap: Map<string, any>, Groups: string[], ApplyKey: any) {
		let keyToMin = Clause.MIN;
		for (const [key, value] of groupMap.entries()) {
			let currValue = value.reduce((a: any, b: any) => {
				if (b[keyToMin] < a) {
					a = b[keyToMin];
				}
				return a;
			}, 0);
			value[ApplyKey] = currValue;
		}
		return groupMap;
	}

	public ApplyAvg(Clause: any, groupMap: Map<string, any>, Groups: any, ApplyKey: any) {
		let keyToAvg = Clause.AVG;
		for (const [key, value] of groupMap.entries()) {
			let currValue = value.reduce((a: any, b: any) => {
				a = a + b[keyToAvg];
				return a;
			}, 0);
			currValue = currValue / value.length;
			value[ApplyKey] = currValue;
		}
		return groupMap;
	}

	public ApplySum(Clause: any, groupMap: Map<string, any>, Groups: string[], ApplyKey: any) {
		let keyToAvg = Clause.SUM;
		for (const [key, value] of groupMap.entries()) {
			let currValue = value.reduce((a: any, b: any) => {
				a = a + b[keyToAvg];
				return a;
			}, 0);
			currValue = currValue / value.length;
			value[ApplyKey] = currValue;
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


import Section from "./Section";
import Course from "./Course";
import {Validation} from "./Validation";
import {Transformations} from "./Transformations";
import Room from "./Room";

let ValidationObject = new Validation("", "rooms");
let TransformationsObject = new Transformations();

export class RoomExecution {
	private type = "yes";

	constructor() {
		this.type = "yes";
	}

	public ExecuteOnRooms(query: any, dataset: Room[]): string[] {
		let unorderedResults = this.ExecuteWhere(query.WHERE, dataset);
		if (query.TRANSFORMATIONS) {
			unorderedResults = TransformationsObject.ExecuteTransformations(
				query, this.ReturnAllResults(unorderedResults));
		}
		let orderedResults = this.ExecuteOrder(query, unorderedResults);
		let resultsByColumn = this.ReturnResults(this.ReturnColumns(query), orderedResults);
		let concatenatedResults = this.ConcatDatasetIdToKeys(resultsByColumn, this.ReturnDatasetId(query));
		return concatenatedResults;
	}

	public ExecuteOrder(query: any, dataset: Room[]) {
		let order = query.OPTIONS.ORDER;
		let orderedResults = [];
		if (typeof order === "object") {
			orderedResults = this.ReturnOrderedSectionsWithDir(order.keys, order.dir, dataset);
		}
		if (typeof order === "string") {
			orderedResults = this.ReturnOrderedSections(this.ReturnOrder(query), dataset);
		}
		if (orderedResults.length === 0) {
			return dataset;
		} else {
			return orderedResults;
		}
	}

	public ConcatDatasetIdToKeys(dataset: string[], prefix: any): string[] {
		let resultArray = [];
		for (let i in dataset) {
			let curSection: any = dataset[i];
			let tempObj: any = {};
			let keys = Object.keys(dataset[0]);
			for (let j in keys) {
				let curPropKey = keys[j];
				let curValueToAppend = curSection[`${curPropKey}`];
				let tempPropKey = prefix + curPropKey;
				if (!ValidationObject.ValidateField(curPropKey)) {
					tempPropKey = curPropKey;
				}
				tempObj[tempPropKey] = curValueToAppend;
			}
			resultArray.push(tempObj);
		}
		return resultArray;
	}

	public ReturnDatasetId(query: any) {
		let datasetId = query.OPTIONS.COLUMNS[0];
		if (datasetId === undefined) {
			return false;
		}
		return datasetId.substring(0, datasetId.indexOf("_") + 1);
	}

	public ReturnColumns(query: any): string[] {
		let columns = query.OPTIONS.COLUMNS;
		let returnColumns = [];
		for (let i in columns) {
			returnColumns.push(columns[i].split("_").pop());
		}
		return returnColumns;
	}

	public ReturnOrder(query: any) {
		let orderKey = query.OPTIONS.ORDER;
		return orderKey.split("_").pop();
	}

	public ReturnOrderedSections(orderKey: any, sections: any) {
		if (typeof sections[0][orderKey] === "number") {
			return sections.sort((a: any, b: any) => a[orderKey] - b[orderKey]);
		} else if (typeof sections[0][orderKey] === "string") {
			return sections.sort((a: any, b: any) => a[orderKey].localeCompare(b[orderKey]));
		}
	}

	public ReturnKeyType(key: any) {
		let stringTypes = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number",
			"name", "address", "type", "furniture", "href"];
		let numberTypes = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
		if (stringTypes.includes(key)) {
			return "string";
		} else if (numberTypes.includes(key)) {
			return "number";
		}
		return "error";
	}

	public ReturnOrderedSectionsWithDir(orderKeys: any, dir: any, sections: any) {
		let orderKeysNoID: any = [];
		orderKeys.forEach((val: any) => {
			orderKeysNoID.push(val.split("_").pop());
		});
		let direction = 0;
		if (dir === "UP") {
			direction = 1;
		} else {
			direction = -1;
		}
		let res = sections.sort((a: any, b: any) => {
			for (let i of orderKeysNoID) {
				if (typeof a[i] === "number") {
					if (a[i] - b[i] < 0) {
						return -1 * direction;
					} else if (a[i] - b[i] > 0) {
						return 1 * direction;
					}
				} else if (typeof a[i] === "string") {
					if (a[i] < (b[i])) {
						return -1 * direction;
					} else if (a[i] > b[i]) {
						return 1 * direction;
					}
				}
			}
			return 0;
		});
		return res;
	}

	public ExecuteWhere(WhereClause: any, dataset: Room[]): any {
		if (JSON.stringify(WhereClause) === "{}") {
			return dataset;
		}
		return this.ExecuteFilter(WhereClause, dataset);
	}

	public ReturnResults(columns: string[], queriedSections: any) {
		let result = [];
		let curSection: any = {};
		for (let i in queriedSections) {
			for (let n in columns) {
				let dummySection: any = queriedSections[i];
				let curColumnId = columns[n];
				curSection[curColumnId] = (dummySection[curColumnId]);
			}
			result.push(curSection);
			curSection = {};
		}
		return result;
	}

	public ReturnAllResults(queriedSections: any){
		let result: any = [];
		let curSection: any = {};
		queriedSections.forEach((val: any) => {
			let columns = Object.keys(val);
			columns.forEach((key: any) => {
				let keyWithoutUnderscore = key.replace(/_/g, "");
				curSection[keyWithoutUnderscore] = val[keyWithoutUnderscore];
			});
			result.push(curSection);
			curSection = {};
		});
		return result;
	}

	public ExecuteFilter(Filter: any, dataset: Room[]): any {
		let propertyKey = Object.keys(Filter)[0];
		if (ValidationObject.ValidateLogic(propertyKey)) {
			return this.ExecuteLogicComparison(Filter, dataset);
		}
		if (propertyKey === "IS") {
			return this.ExecuteSComparison(Filter, dataset);
		}
		if (ValidationObject.ValidateMComparitor(propertyKey)) {
			return this.ExecuteMComparison(Filter, dataset);
		}
		if (propertyKey === "NOT") {
			return this.ExecuteNegation(Filter, dataset);
		}
		return false;
	}

	public ExecuteLogicComparison(LogicComparison: any, dataset: Room[]): any[] {
		let logicComparator = Object.keys(LogicComparison)[0];
		let logicCompClause = LogicComparison[logicComparator];
		switch (logicComparator) {
			case "AND": {
				let intersectANDCase = [];
				let x = [];
				for (let i in logicCompClause) {
					x = this.ExecuteFilter(logicCompClause[i], dataset);
					intersectANDCase.push(x);
				}
				let intersect = intersectANDCase.reduce((a: any, b: any) => a.filter((y: any) => b.includes(y)));
				return intersect;
			}
			case "OR": {
				let unionORCase = [];
				let x = [];
				for (let i in logicCompClause) {
					x = this.ExecuteFilter(logicCompClause[i], dataset);
					unionORCase.push(x);
				}
				let union = unionORCase.reduce((a: any, b: any) => Array.from(new Set(a.concat(b))));
				return union;
			}
			default:
				return [];
		}
	}

	public ExecuteSComparison(SComparison: any, dataset: Room[]): any[] {
		let sCompClause = SComparison.IS;
		let sKey = Object.keys(sCompClause)[0];
		let sField = sKey.split("_").pop();
		let valueToCompare = sCompClause[`${sKey}`];
		let queriedISCase = dataset.reduce((previousValue: Section[], currentValue: any) => {
			if (currentValue[`${sField}`] === valueToCompare) {
				previousValue.push(currentValue);
			}
			return previousValue;
		}, []);
		return queriedISCase;
	}

	public ExecuteMComparison(MComparison: any, dataset: Room[]): any {
		let MComparator = Object.keys(MComparison)[0];
		let MComparisonClause = MComparison[`${MComparator}`];
		let mKey = Object.keys(MComparisonClause)[0];
		type StringKeys = Extract<keyof Section, string>;
		let mFieldString = mKey.split("_").pop();
		let mField = mFieldString;
		let ValueToCompare = MComparisonClause[`${mKey}`];
		switch (MComparator) {
			case "GT" : {
				let queriedGTCase = dataset.reduce((previousValue: Room[], currentValue: any) => {
					if (currentValue[`${mField}`] > ValueToCompare) {
						previousValue.push(currentValue);
					}
					return previousValue;
				}, []);
				return queriedGTCase;
				break;
			}
			case "LT" : {
				let queriedLTCase = dataset.reduce((previousValue: Room[], currentValue: any) => {
					if (currentValue[`${mField}`] < ValueToCompare) {
						previousValue.push(currentValue);
					}
					return previousValue;
				}, []);
				return queriedLTCase;
				break;
			}
			case "EQ" : {
				let queriedEQCase = dataset.reduce((previousValue: Room[], currentValue: any) => {
					if (currentValue[`${mField}`] === ValueToCompare) {
						previousValue.push(currentValue);
					}
					return previousValue;
				}, []);
				return queriedEQCase;
				break;
			}
			default:
				return [];
		}
	}

	public ExecuteNegation(Negation: any, dataset: Room[]): any {
		let DifferenceNOTCase = [];
		let negationClause = Negation.NOT;
		let x = [];
		let datasetSections = dataset;
		x = this.ExecuteFilter(negationClause, dataset);
		DifferenceNOTCase.push(x);
		let valuesToBeExcluded = DifferenceNOTCase.reduce((a: any, b: any) => Array.from(new Set(a.concat(b))));
		let difference = datasetSections.filter((y: any) => !valuesToBeExcluded.includes(y));
		return difference;
	}
}

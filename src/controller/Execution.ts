import {InsightResult} from "./IInsightFacade";
import Section from "./Section";
import Course from "./Course";
import {Validation} from "./Validation";

let ValidationObject = new Validation();
export class Execution {
	private type = "yes";

	constructor() {
		this.type = "yes";
	}
	public ExecuteOnCourses(query: any, dataset: Course[]): string[] {
		let returnSections = [];
		for (let n in dataset) {
			returnSections.push(this.Execute(query, dataset[n]));
		}
		let unorderedResults = returnSections.flat();
		let orderedResults = this.ReturnOrderedSections(this.ReturnOrder(query), unorderedResults);
		let omg = this.ConcatDatasetIdToKeys(orderedResults, this.ReturnDatasetId(query));
		return omg;
	}
	public ConcatDatasetIdToKeys(dataset: string[], prefix: any): string[] {
		let resultArray = [];
		for (let i in dataset) {
			let curSection: any = dataset[i];
			let tempObj: any = {};
			let keys = Object.keys(dataset[1]);
			for (let j in keys) {
				let curPropKey = keys[j];
				let curValueToAppend = curSection[`${curPropKey}`];
				let tempPropKey = prefix + curPropKey;
				tempObj[tempPropKey] = curValueToAppend;
			}
			resultArray.push(tempObj);
		}
		return resultArray;
	}
	public ReturnDatasetId(query: any) {
		let datasetId = query.OPTIONS.COLUMNS[0];
		return datasetId.substring(0,datasetId.indexOf("_") + 1);
	}

	public Execute(query: any, dataset: Course): string[] {
		let columns = this.ReturnColumns(query);
		let validQueriedSections = this.Query(query, dataset);
		let unorderedResults = this.ReturnResults(columns, validQueriedSections);
		// let orderedResults = this.ReturnOrderedSections(this.ReturnOrder(query), unorderedResults);
		return unorderedResults;
	}
	public ReturnColumns(query: any): string[] {
		let columns = query.OPTIONS.COLUMNS;
		let returnColumns = [];
		for (let i in columns) {
			returnColumns.push(columns[i].split("_").pop());
		}
		return returnColumns;
	}
	public ReturnOrder(query: any): string {
		let orderKey = query.OPTIONS.ORDER;
		let orderKeyParsed = orderKey.split("_").pop();
		return orderKeyParsed;

	}
	public ReturnOrderedSections(orderKey: any, sections: any) {
		return sections.sort((a: any, b: any) => a[`${orderKey}`] - b[`${orderKey}`]);
	}
	public Query(query: any, dataset: Course): any {
		return this.ExecuteWhere(query.WHERE, dataset);
	}
	public ExecuteWhere(WhereClause: any, dataset: Course): any {
		if (JSON.stringify(WhereClause) === "{}") {
			return dataset.sections;
		}
		return this.ExecuteFilter(WhereClause, dataset);
	}
	public ReturnResults(columns: string[], queriedSections: Section[]) {
		let result = [];
		let curSection: any = {};
		for (let i in queriedSections) {
			for (let n in columns) {
				let dummySection: any = queriedSections[i];
				let curColumnId = columns[n];
				curSection[`${curColumnId}`] = (dummySection[`${curColumnId}`]);
			}
			result.push(curSection);
			curSection = {};
		}
		return result;
	}
	public ExecuteFilter(Filter: any, dataset: Course): any {
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

	public ExecuteLogicComparison(LogicComparison: any, dataset: Course): any[] {
		let logicComparator = Object.keys(LogicComparison)[0];
		let logicCompClause = LogicComparison[`${logicComparator}`];
		switch(logicComparator) {
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
			default: return [];
		}
	}

	public ExecuteSComparison(SComparison: any, dataset: Course): any[] {
		let sCompClause = SComparison.IS;
		let sKey = Object.keys(sCompClause)[0];
		let sField = sKey.split("_").pop();
		let valueToCompare = sCompClause[`${sKey}`];
		let queriedISCase = dataset.sections.reduce((previousValue: Section[], currentValue: any) => {
			if (currentValue[`${sField}`] === valueToCompare) {
				previousValue.push(currentValue);
			}
			return previousValue;
		}, []);
		return queriedISCase;
	}

	public ExecuteMComparison(MComparison: any, dataset: Course): Section[] {
		let MComparator = Object.keys(MComparison)[0];
		let MComparisonClause = MComparison[`${MComparator}`];
		let mKey = Object.keys(MComparisonClause)[0];
		type StringKeys = Extract<keyof Section, string>;
		let mFieldString = mKey.split("_").pop();
		let mField = mFieldString;
		let ValueToCompare = MComparisonClause[`${mKey}`];
		switch(MComparator) {
			case "GT" : {
				let queriedGTCase = dataset.sections.reduce((previousValue: Section[], currentValue: any) => {
					if (currentValue[`${mField}`] > ValueToCompare) {
						previousValue.push(currentValue);
					}
					return previousValue;
				}, []);
				return queriedGTCase;
				break;
			}
			case "LT" : {
				let queriedLTCase = dataset.sections.reduce((previousValue: Section[], currentValue: any) => {
					if (currentValue[`${mField}`] < ValueToCompare) {
						previousValue.push(currentValue);
					}
					return previousValue;
				}, []);
				return queriedLTCase;
				break;
			}
			case "EQ" : {
				let queriedEQCase = dataset.sections.reduce((previousValue: Section[], currentValue: any) => {
					if (currentValue[`${mField}`] === ValueToCompare) {
						previousValue.push(currentValue);
					}
					return previousValue;
				}, []);
				return queriedEQCase;
				break;
			}
			default: return [];
		}
	}

	public ExecuteNegation(Negation: any, dataset: Course): any {
		let DifferenceNOTCase = [];
		let negationClause = Negation.NOT;
		let x = [];
		let datasetSections = dataset.sections;
		x = this.ExecuteFilter(negationClause, dataset);
		DifferenceNOTCase.push(x);
		let valuesToBeExcluded = DifferenceNOTCase.reduce((a: any, b: any) => Array.from(new Set(a.concat(b))));
		let difference = datasetSections.filter((y: any) => !valuesToBeExcluded.includes(y));
		return difference;
	}
}

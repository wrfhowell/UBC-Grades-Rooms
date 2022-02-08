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

	public Execute(query: any, dataset: Course): string[] {
		let columns = this.ReturnColumns(query);
		let validQueriedSections = this.Query(query, dataset);
		return this.ReturnResults(columns, validQueriedSections);
	}
	public ReturnColumns(query: any): string[] {
		return query.OPTIONS.COLUMNS;
	}
	public Query(query: any, dataset: Course): any {
		return this.ExecuteWhere(query.WHERE, dataset);
	}
	public ExecuteWhere(WhereClause: any, dataset: Course): any {
		if (JSON.stringify(WhereClause) === "{}") {
			return dataset;
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
					console.log(logicCompClause[i]);
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
		let valueToCompare = sCompClause[`${sField}`];
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
		let mField = mKey.split("_").pop();
		let ValueToCompare = MComparisonClause[`${mField}`];
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
				let queriedLTCase = dataset.sections.reduce((previousValue: Section[], currentValue: any) => {
					if (currentValue[`${mField}`] === ValueToCompare) {
						previousValue.push(currentValue);
					}
					return previousValue;
				}, []);
				return queriedLTCase;
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
		console.log(negationClause);
		let valuesToBeExcluded = DifferenceNOTCase.reduce((a: any, b: any) => Array.from(new Set(a.concat(b))));
		let difference = datasetSections.filter((y: any) => !valuesToBeExcluded.includes(y));
		return difference;
	}
}

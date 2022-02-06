import {InsightError, ResultTooLargeError} from "./IInsightFacade";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

export class Validation {
	private type = "";
	private ColumnsOfCurrentQuery = [];
	constructor () {
		this.type = "yes";
	}
	public Validate (query: any) {
		let queryKeys = Object.keys(query);
		let modelKeys = ["WHERE", "OPTIONS"];
		if (queryKeys.length === 2 && Object.keys(query)[0] === "WHERE" && Object.keys(query)[1] === "OPTIONS") {
			return this.ValidateWhere(query.WHERE) && this.ValidateOptions(query.OPTIONS);
		} else {
			return false;
		}
	}

	public isValidJSONQuery(JsonObject: any) {
		let JsonQuery = JSON.stringify(JsonObject);
		try {
			JSON.parse(JsonQuery);
		} catch (e) {
			return false;
		}
		return true;
	}

	public ParseJsonObject(JsonObject: any): any {
		let query = JsonObject;

		function createAST(key: string, value: string) {
			return key + value;
		}

		function traverse(queryObject: any, func: (key: string, value: string) => void) {
			for (let i in queryObject) {
				func.apply(null, [i, queryObject[i]]);
				if (queryObject[i] !== null && typeof (queryObject[i]) === "object") {
					traverse(queryObject[i], func);
				}
			}
		}
		if (this.isValidJSONQuery(query)) {
			traverse(query, createAST);
		} else {
			return InsightError;
		}
	}
	public ValidateWhere(WhereClause: any): boolean {
		if (JSON.stringify(WhereClause) === "{}") {
			return true;
		} else {
			return this.ValidateFilters(WhereClause);
		}
	}
	public ValidateOptions(Options: any): boolean {
		// if (Object.keys(Options)[0] !== "OPTIONS") {
		// 	return false;
		// }
		let resultOfValidateOrder = true;
		let ColumnObject = Options.COLUMNS;
		let OrderObject = Options.ORDER;
		if (OrderObject !== undefined) {
			resultOfValidateOrder = this.ValidateOrder(OrderObject);
		}
		return resultOfValidateOrder && this.ValidateColumns(ColumnObject) && OrderObject.includes(OrderObject);
	}
	public ValidateOrder(Orders: any): boolean {
		return this.ValidateKey(Orders);
	}
	public ValidateColumns(Columns: any): boolean {
		// if (Object.keys(Columns)[0] !== "COLUMNS") {
		// 	return false;
		// }
		// let ColumnKeys = Columns.COLUMNS;
		for (let key of Columns) {
			if (this.ValidateKey(key) === false) {
				return false;
			}
		}
		return true;
	}
	public ValidateKey(key: any): boolean {
		return this.ValidateMKey(key) || this.ValidateSKey(key);
	}
	public ValidateMKey(Mkey: any): boolean {
		let MField = new RegExp("avg|pass|fail|audit|year");
		const mKey = new RegExp("[^_]+" + "_" + MField.source);
		return mKey.test(Mkey);
	}
	public ValidateSKey(Skey: any): boolean {
		let SField = new RegExp("dept|id|instructor|title|uuid");
		const sKey = new RegExp("[^_]+" + "_" + SField.source);
		return sKey.test(Skey);
	}
	public ValidateInputString(inputString: any): boolean {
		const InputString = new RegExp("[^*]*");
		return InputString.test(inputString);
	}
	public ValidateIdString(idString: any): boolean {
		const IdStringRegEx = new RegExp("[^_]+");
		return IdStringRegEx.test(idString);
	}
	public ValidateFilters(Filter: any): boolean {
		let propertyKey = Object.keys(Filter)[0];
		if (this.ValidateLogic(propertyKey)) {
			return this.ValidateLogicComparison(Filter);
		}
		if (propertyKey === "IS") {
			return this.ValidateSComparison(Filter);
		}
		if (this.ValidateMComparitor(propertyKey)) {
			return this.ValidateMComparison(Filter);
		}
		if (propertyKey === "NOT") {
			return this.ValidateNegation(Filter);
		}
		return false;
	}
	public ValidateMComparitor(MComparitor: any): boolean{
		let mComparator = new RegExp("GT|LT|EQ");
		return mComparator.test(MComparitor);
	}
	public ValidateLogicComparison(LogicComparison: any): boolean{
		let LogicComparisonKey = Object.keys(LogicComparison)[0];
		if (this.ValidateLogic(LogicComparisonKey) && Object.keys(LogicComparison).length === 1) {
			if (LogicComparisonKey === "AND") {
				let arrayOfANDClause = LogicComparison.AND;
				let lastPositionOfAndClause = (arrayOfANDClause.length - 1).toString();
				for (let i in arrayOfANDClause) {
					if (!this.ValidateFilters(arrayOfANDClause[i])) {
						return false;
					} else {
						if (this.ValidateFilters(arrayOfANDClause[i]) && i === lastPositionOfAndClause) {
							return true;
						}
					}
				}
			} else {
				if (LogicComparisonKey === "OR") {
					let arrayOfORClause = LogicComparison.OR;
					let lastPositionOfOrClause = (arrayOfORClause.length - 1).toString();
					for (let i in arrayOfORClause) {
						if (!this.ValidateFilters(arrayOfORClause[i])) {
							return false;
						} else {
							if (this.ValidateFilters(arrayOfORClause[i]) && i === lastPositionOfOrClause) {
								return true;
							}
						}
					}
				}
			}
		}
		return false;
	}
	public ValidateLogic(Logic: any): boolean {
		return Logic === "AND" || Logic === "OR";
	}
	public ValidateMComparison(MComparison: any): boolean {
		let mComparatorKey = Object.keys(MComparison)[0];
		if (this.ValidateMComparitor(mComparatorKey)) {
			let mKeyClause = MComparison[`${mComparatorKey}`];
			let mKey = Object.keys(mKeyClause)[0];
			if (this.ValidateMKey(mKey)) {
				return typeof (mKeyClause[`${mKey}`]) === "number";
			}
		}
		return false;
	}
	public ValidateSComparison(SComparison: any): boolean {
		let SCompRegEx = new RegExp("`*`?" + "[^*]*" + "`*`?");
		let sCompKey = Object.keys(SComparison)[0];
		let skey = Object.keys(SComparison.IS)[0];
		if (sCompKey === "IS" && this.ValidateSKey(skey)) {
			return SCompRegEx.test(SComparison.IS);
		}
		return false;
	}
	public ValidateNegation(Negation: any): boolean {
		if (Object.keys(Negation)[0] !== "NOT") {
			return false;
		} else {
			return this.ValidateFilters(Negation.NOT);
		}
	}
}

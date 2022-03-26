import {InsightError, ResultTooLargeError} from "./IInsightFacade";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

export class Validation {
	private curDatasetId = "";
	private ColumnsOfCurrentQuery: any = [];
	private groupKeys: any = [];
	private applyKeys: any = [];
	private hasTransform = false;
	constructor (datasetId: string) {
		this.curDatasetId = datasetId;
	}

	public Validate (query: any) {
		this.ColumnsOfCurrentQuery = query.OPTIONS.COLUMNS;
		if (!("WHERE" in query)) {
			return false;
		}
		if (("WHERE" in query) && ("OPTIONS" in query) && ("TRANSFORMATIONS" in query)) {
			this.hasTransform = true;
			let syntaxRes = this.ValidateTransformations(query.TRANSFORMATIONS) &&
					this.ValidateWhere(query.WHERE) &&
				this.ValidateOptions(query.OPTIONS);
			const groupAndApplyKeys = (this.groupKeys.concat(this.applyKeys)).slice().sort();
			let SemanticRes = (this.ColumnsOfCurrentQuery.length === groupAndApplyKeys.length &&
				this.ColumnsOfCurrentQuery.slice().sort().every(function(val: any, index: any) {
					return val === groupAndApplyKeys[index];
				}));
			return syntaxRes && SemanticRes;
		}
		if (("WHERE" in query) && ("OPTIONS" in query)) {
			return this.ValidateWhere(query.WHERE) && this.ValidateOptions(query.OPTIONS);
		} else {
			return false;
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
		let resultOfValidateOrder = true;
		let resultOfValidateColumn = false;
		let ColumnObject = Options.COLUMNS;
		let OrderObject = Options.ORDER;
		if (ColumnObject !== undefined && this.hasTransform === false) {
			resultOfValidateColumn = this.ValidateColumns(ColumnObject);
		}
		if (OrderObject !== undefined) {
			resultOfValidateOrder = this.ValidateOrder(OrderObject);
		}
		if (ColumnObject !== undefined && this.hasTransform === true) {
			resultOfValidateColumn = true;
		}
		return resultOfValidateOrder && resultOfValidateColumn;
	}

	public ValidateTransformations(Transform: any): boolean {
		if (Object.keys(Transform).length !== 2 || !("GROUP" in Transform) || !("APPLY" in Transform)) {
			return false;
		}
		return this.ValidateGroup(Transform.GROUP) &&
			this.ValidateApply(Transform.APPLY);
	}

	public ValidateGroup(Group: any): boolean {
		this.groupKeys.push(...Group);
		Group.forEach((val: any) => {
			if (!this.ValidateKey(val) || !this.ColumnsOfCurrentQuery.includes(val)) {
				return false;
			}
		});
		return true;
	}

	public ValidateApply(Apply: any): boolean {
		let applyKeyCounter: any = [];
		let res = true;
		Apply.forEach((val: any) => {
			let curApplyKey = Object.getOwnPropertyNames(val);
			this.applyKeys.push(...curApplyKey);
			let validTokens = ["MAX", "MIN", "AVG", "SUM", "COUNT"];
			let applyToken = Object.keys(val[curApplyKey[0]])[0];
			if (!this.ValidateKey(val[curApplyKey[0]][applyToken]) ||
				curApplyKey.length !== 1 ||
				!validTokens.includes(applyToken) ||
				applyKeyCounter.includes(curApplyKey))  {
				res = false;
			}
			applyKeyCounter.push(curApplyKey);
		});
		return res;
	}

	public ValidateOrder(Orders: any): boolean {
		let res = true;
		if (typeof Orders === "string") {
			return this.ValidateKey(Orders) && this.ColumnsOfCurrentQuery.includes(Orders);
		} else if ("dir" in Orders && "keys" in Orders && Object.keys(Orders).length === 2) {
			Orders.keys.forEach((val: any) => {
				if (!this.ColumnsOfCurrentQuery.includes(val)) {
					res = false;
				}
			});
			if (Orders.dir !== "UP" && Orders.dir !== "DOWN") {
				res = false;
			}
			return res;
		}
		return false;
	}

	public ValidateColumns(Columns: any): boolean {
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
		let MField = new RegExp("(avg|pass|fail|audit|year|lat|lon|seats)");
		const mKey = new RegExp("^[^_]+" + "_" + MField.source + "$");
		let datasetIdOfMKey = Mkey.substring(0,Mkey.indexOf("_"));
		if (datasetIdOfMKey !== this.curDatasetId) {
			return false;
		}
		return mKey.test(Mkey);
	}

	public ValidateSKey(Skey: any): boolean {
		let SField = new RegExp("(dept|id|instructor|title|uuid|fullname|shortname|" +
			"number|name|address|type|furniture|href)");
		const sKey = new RegExp("^[^_]+" + "_" + SField.source + "$");
		let datasetIdOfSKey = Skey.substring(0,Skey.indexOf("_"));
		if (datasetIdOfSKey !== this.curDatasetId) {
			return false;
		}
		return sKey.test(Skey);
	}

	public ValidateRoomSKey(Skey: any): boolean {
		let SField = new RegExp("(number|name|address|type|furniture|href)");
		const sKey = new RegExp("^[^_]+" + "_" + SField.source + "$");
		let datasetIdOfSKey = Skey.substring(0,Skey.indexOf("_"));
		if (datasetIdOfSKey !== this.curDatasetId) {
			return false;
		}
		return sKey.test(Skey);
	}

	public ValidateCourseSKey(Skey: any): boolean {
		let SField = new RegExp("(dept|id|instructor|title|uuid|fullname|shortname)");
		const sKey = new RegExp("^[^_]+" + "_" + SField.source + "$");
		let datasetIdOfSKey = Skey.substring(0,Skey.indexOf("_"));
		if (datasetIdOfSKey !== this.curDatasetId) {
			return false;
		}
		return sKey.test(Skey);
	}

	public ValidateField(inputField: any): boolean {
		let Field = new RegExp("^(avg|pass|fail|audit|year|lat|lon|seats|" +
			"dept|id|instructor|title|uuid|fullname|shortname|number|name|address|type|furniture|href)$");
		return Field.test(inputField);
	}

	public ValidateInputString(inputString: any): boolean {
		const InputString = new RegExp("^[^*]*$");
		return InputString.test(inputString);
	}

	public ValidateIdString(idString: any): boolean {
		const IdStringRegEx = new RegExp("^[^_]+$");
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
		let mComparator = new RegExp("^(GT|LT|EQ)$");
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
		let sKeyClause = SComparison[`${sCompKey}`];
		let skey = Object.keys(SComparison.IS)[0];
		if (sCompKey === "IS" && this.ValidateSKey(skey)) {
			let sKeyClauseValue = sKeyClause[`${skey}`];
			return SCompRegEx.test(sKeyClauseValue) && typeof sKeyClauseValue === "string";
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

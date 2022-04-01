import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import {describe} from "mocha";
import {folderTest} from "@ubccpsc310/folder-test";
import {Validation} from "../../src/controller/Validation";
import {Execution} from "../../src/controller/Execution";

chai.use(chaiAsPromised);


let ValidationObject = new Validation("courses", "courses");
let ExecutionObject = new Execution();

describe("Validation", function () {
	it("Should return True - complex query", function() {
		let x = {
			WHERE: {
				OR: [
					{
						AND: [
							{
								GT: {
									courses_avg: 90
								}
							},
							{
								IS: {
									courses_dept: "adhe"
								}
							}
						]
					},
					{
						EQ: {
							courses_avg: 95
						}
					}
				]
			},
			OPTIONS: {
				COLUMNS: [
					"courses_dept",
					"courses_id",
					"courses_avg"
				],
				ORDER: "courses_avg"
			}
		};
		let result = ValidationObject.Validate(x);
		expect(result).to.be.true;
	});

	it("Should return True - simple query", function() {
		let x = {
			WHERE: {
				GT: {
					courses_avg: 97
				}
			},
			OPTIONS: {
				COLUMNS: [
					"courses_dept",
					"courses_avg"
				],
				ORDER: "courses_avg"
			}
		};
		let result = ValidationObject.Validate(x);
		expect(result).to.be.true;
	});

	describe("ValidateWhere", function () {

		it("Should return true if Where Statement is correct", function () {
			let x = {};
			let result = ValidationObject.ValidateWhere(x);
			expect(result).to.be.true;
		});

		it("Should return true if Filters Statement is correct", function () {
			let x = {GT: {courses_avg: 80}};
			let result = ValidationObject.ValidateWhere(x);
			expect(result).to.be.true;
		});

		// it("Should return true if Filters Statement is correct", function () {
		// 	return false;
		// });


	});

	describe("ValidateInputString", function() {

		it("Should match Regex", function() {
			let result = ValidationObject.ValidateInputString("OMG**");
			console.log(result);
			let resultId = ValidationObject.ValidateIdString("___");
			console.log(resultId);
			let resultKey = ValidationObject.ValidateCourseSKey("courses_name");
			console.log(resultKey);
			let wildCard = new RegExp(".*t.*");
			console.log(wildCard.test("tgkhkhkkj"));
			let omg = "*dsj*";
			console.log(omg.replaceAll("*", ".*"));
			let characterLiteral = new RegExp("^[^_]*_[^_]*$");
			console.log(characterLiteral.test("_courses_dept"));
			let characterLiteral2 = new RegExp("^[^_]+" + "_" + "(dept|href)" + "$");
			console.log(characterLiteral2.test("courses_deptd"));
		});
	});

	describe("ValidateIdString", function() {
		return false;
	});

	describe("ValidateFilters", function() {

		describe("ValidateLogicComparison", function() {
			it("Should return True - correct Filters", function() {
				let x = {OR: [{GT: {courses_avg: 80}},{LT: {courses_avg: 85}}]};
				let result = ValidationObject.ValidateLogicComparison(x);
				expect(result).to.be.true;
			});
		});

		describe("ValidateSComparison", function() {

			it("Should return True - correct IS clause", function() {
				let obj = {IS: {courses_dept: "math"}};
				let x = ValidationObject.ValidateSComparison(obj);
				console.log("result:" + x);
				expect(x).to.be.true;
			});

			it("Should return False - wrong Skey", function() {
				let obj = {IS: {courses__dept: "math"}};
				let x = ValidationObject.ValidateSComparison(obj);
				expect(x).to.be.false;
			});

			it("Should return True - correct wildcards", function() {
				let obj = {IS: {courses_dept: "*math*"}};
				let SCompRegEx = new RegExp( "^[^*]*$");
				console.log(SCompRegEx.test("omg*"));
				let x = ValidationObject.ValidateSComparison(obj);
				expect(x).to.be.true;
			});

			it("Should return False - Skey Value is not String", function() {
				let obj = {IS: {courses__dept: 94}};
				let x = ValidationObject.ValidateSComparison(obj);
				expect(x).to.be.false;
			});

			describe("Skey", function() {
				it("Should match regex for Skey", function() {
					let x = ValidationObject.ValidateCourseSKey("courses_dept");
					expect(x).to.be.true;
				});

				it("Should NOT match regex for Skey - no underscore", function() {
					let x = ValidationObject.ValidateCourseSKey("coursesdeptt");
					expect(x).to.be.false;
				});

				it("Should NOT match regex for Skey - all asterisks", function() {
					let x = ValidationObject.ValidateCourseSKey("****");
					expect(x).to.be.false;
				});

				it("Should NOT match regex for Skey - wrong s key", function() {
					let x = ValidationObject.ValidateCourseSKey("courses_what");
					expect(x).to.be.false;
				});

				it("Should NOT match regex for Skey - two underscores", function() {
					let x = ValidationObject.ValidateCourseSKey("courses__dept");
					expect(x).to.be.false;
				});
				it("Should NOT match regex for Skey - underscore at the start", function() {
					let x = ValidationObject.ValidateCourseSKey("_courses_dept");
					expect(x).to.be.false;
				});

			});

		});

		describe("ValidateMComparison", function() {
			it("Should return True - GT", function() {
				let x = {GT : {courses_avg : 80}};
				let result = ValidationObject.ValidateMComparison(x);
				expect(result).to.be.true;
			});

			it("Should return True - LT", function() {
				let x = {LT : {courses_avg : 85}};
				let result = ValidationObject.ValidateMComparison(x);
				expect(result).to.be.true;
			});

			describe("Mkey", function() {
				it("Should match regex for Mkey", function () {
					let x = ValidationObject.ValidateCourseMKey("courses_avg");
					console.log(x);
					expect(x).to.be.true;
				});

				it("Should not match regex for Mkey - no underscores", function () {
					let x = ValidationObject.ValidateCourseMKey("coursesavg");
					expect(x).to.be.false;
				});

				it("Should not match regex for Mkey - two underscore", function () {
					let x = ValidationObject.ValidateCourseMKey("courses__avg");
					expect(x).to.be.false;
				});

				it("Should not match regex for Mkey - wrong Mfield", function () {
					let x = ValidationObject.ValidateCourseMKey("courses_WRONGavg");
					expect(x).to.be.false;
				});
			});
		});

		describe("ValidateNegation", function() {

			it("Should return True", function() {
				let x = {NOT: {GT: {courses_avg: 80}}};
				let result = ValidationObject.ValidateNegation(x);
				expect(result).to.be.true;
			});

			it("Should NOT return True - wrong NOT", function() {
				let x = {NOTs: {GT: {courses_avg: 80}}};
				let result = ValidationObject.ValidateNegation(x);
				expect(result).to.be.false;
			});
		});

	});
	describe ("Validate Options", function() {
		it("Should return False - Order key not in columns", function() {
			let x = {COLUMNS : ["courses_avg"], ORDER : "courses_dept"};
			let result = ValidationObject.ValidateOptions(x);
			expect(result).to.be.false;
		});
		it("Should return True - Order key is in Columns", function() {
			let x = {COLUMNS : ["courses_avg", "courses_dept"], ORDER : "courses_dept"};
			let result = ValidationObject.ValidateOptions(x);
			expect(result).to.be.true;
		});
		describe ("Validate Columns", function() {
			it("Should return True - Valid Columns", function() {
				let x = ["courses_avg", "courses_dept"];
				let result = ValidationObject.ValidateColumns(x);
				expect(result).to.be.true;
			});
		});
		describe("Validate Orders", function() {
			it("Should return True - Valid Order key", function() {
				let x = "courses_avg";
				let result = ValidationObject.ValidateOrder(x);
				expect(result).to.be.true;
			});
		});
		describe("Validate Groupkeys and ApplyKeys in Columns", function() {
			it("Should return False - extra column", function() {
				let array1 = ["c", "b","a"];
				let array2 = ["b", "a", "c"];
				const array2Sorted = array2.slice().sort();
				let res = array1.length === array2.length && array1.slice().sort().every(function(val, index) {
					return val === array2Sorted[index];
				});
				console.log(res);
				console.log(array1.concat(array2));
			});
		});
	});
});


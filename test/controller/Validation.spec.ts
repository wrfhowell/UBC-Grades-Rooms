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


let ValidationObject = new Validation();
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
			let x = {WHERE: {}};
			let result = ValidationObject.ValidateWhere(x);
			expect(result).to.be.true;
		});

		it("Should return true if Filters Statement is correct", function () {
			let x = {WHERE: {GT: {courses_avg: 80}}};
			let result = ValidationObject.ValidateWhere(x);
			expect(result).to.be.true;
		});

		it("Should return true if Filters Statement is correct", function () {
			return false;
		});


	});

	describe("ValidateInputString", function() {

		it("Should match Regex", function() {
			ValidationObject.ValidateInputString("OMG YASS");
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

			describe("Skey", function() {
				it("Should match regex for Skey", function() {
					let x = ValidationObject.ValidateSKey("courses_dept");
					expect(x).to.be.true;
				});

				it("Should NOT match regex for Skey - no underscore", function() {
					let x = ValidationObject.ValidateSKey("coursesdeptt");
					expect(x).to.be.false;
				});

				it("Should NOT match regex for Skey - wrong s key", function() {
					let x = ValidationObject.ValidateSKey("courses_what");
					expect(x).to.be.false;
				});

				it("Should NOT match regex for Skey - two underscores", function() {
					let x = ValidationObject.ValidateSKey("courses__dept");
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
					let x = ValidationObject.ValidateMKey("courses_avg");
					expect(x).to.be.true;
				});

				it("Should not match regex for Mkey - no underscores", function () {
					let x = ValidationObject.ValidateMKey("coursesavg");
					expect(x).to.be.false;
				});

				it("Should not match regex for Mkey - two underscore", function () {
					let x = ValidationObject.ValidateMKey("courses__avg");
					expect(x).to.be.false;
				});

				it("Should not match regex for Mkey - wrong Mfield", function () {
					let x = ValidationObject.ValidateMKey("courses_WRONGavg");
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
		describe ("Validate Columns", function() {
			it("Should return True - Valid Columns", function() {
				let x = {COLUMNS : ["courses_avg", "courses_dept"]};
				let result = ValidationObject.ValidateColumns(x);
				expect(result).to.be.true;
			});
		});
	});
});


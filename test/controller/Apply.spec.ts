import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {describe} from "mocha";
import Section from "../../src/controller/Section";
import Course from "../../src/controller/Course";
import {Execution} from "../../src/controller/Execution";
import {Transformations} from "../../src/controller/Transformations";

chai.use(chaiAsPromised);

let dataset: Map<string, Course[]>;
dataset = new Map<string, Course[]>();

let section1 = new Section
("cpsc", "001", 87.5, "Will Howell", "cpsc121", 50, 1,
	12, "001");
section1.year = 2000;

let section2 = new Section
("cpsc", "324", 69.2, "John Jacob", "engl112", 23, 52,
	14, "02341");
section2.year = 2014;

let section3 = new Section
("cpsc", "234", 50.3, "Brian Nairb", "math200", 320, 0,
	32, "2351");
section3.year = 2020;

let section4 = new Section
("phys", "212", 90.5, "Jason Yard", "biol112", 93, 94,
	13, "1412");
section4.year = 2005;

let section5 = new Section
("phys", "123", 23.3, "Apple Bottom", "chem123", 1223, 42,
	67, "001332");
section5.year = 2018;

let section6 = new Section
("phys", "321", 45.2, "Perry the Platypus", "phys321", 2, 100,
	122, "32511");
section6.year = 1999;

let course1 = new Course("CPSC 313", 345);
course1.addSection(section1);
course1.addSection(section2);
course1.addSection(section3);

let course2 = new Course("PHYS 432", 110);
course2.addSection(section4);
course2.addSection(section5);
course2.addSection(section6);

let courseArray = [course1, course2];
let x = new Execution();
let y = new Transformations();
dataset.set("courses", courseArray);

describe("Checkpoint 2 Expansion", function () {
	describe("Apply", function() {
		it("Should give correct Count", function () {
			return false;
		});
		it("Should give correct Min", function () {
			let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title"], ORDER: "avg"}};
			let result = x.ExecuteOnCourses(query, courseArray);
			let stringResult = JSON.stringify(result);
			let jsonResult = JSON.parse(stringResult);
			const min = Math.max(...jsonResult.map(function(o: any) {
				return o.avg;
			}));
			console.log(result);
			console.log(min);
		});
		it("Should give correct Sum", function() {
			let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title", "fail"], ORDER: "avg"}};
			let result = x.ExecuteOnCourses(query, courseArray);
			let stringResult = JSON.stringify(result);
			let jsonResult = JSON.parse(stringResult);
			const sum = jsonResult.reduce((prev: any, curr: any) => {
				return prev + curr.fail;
			}, 0);
			console.log(result);
			console.log(sum);
			expect(sum).to.equal(6);
		});
		it("Should give correct Sum from GroupMap", function() {
			let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title", "fail"], ORDER: "avg"}};
			let result: any = x.ExecuteOnCourses(query, courseArray);
			let resultMap = y.ExecuteGroup(["dept"], result);
			let applyRules = {SUM: "fail"};
			let resultApply = y.ApplySum(applyRules, resultMap, "overallFAIL");
			console.log(resultApply);
		});
		it("Should give correct Avg", function() {
			let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title"], ORDER: "avg"}};
			let result = x.ExecuteOnCourses(query, courseArray);
			let stringResult = JSON.stringify(result);
			let jsonResult = JSON.parse(stringResult);
			const sum = jsonResult.reduce((prev: any, curr: any) => {
				return prev + curr.avg;
			}, 0);
			console.log(result);
			console.log(Number(sum / jsonResult.length).toFixed(2));
			expect(sum / jsonResult.length).to.equal(6);
		});
		it("Should give correct Avg from GroupMap", function() {
			let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title", "instructor"], ORDER: "avg"}};
			let result: any = x.ExecuteOnCourses(query, courseArray);
			let groups = ["dept", "title", "overallAvg"];
			let resultMap = y.ExecuteGroup(["dept"], result);
			let applyRules = {AVG: "avg"};
			let resultApply = y.ApplyAvg(applyRules, resultMap, "overallAvg");
			console.log(resultApply);
		});
		it("Should give correct Count - grouped", function() {
			let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title", "instructor"], ORDER: "avg"}};
			let result: any = x.ExecuteOnCourses(query, courseArray);
			let groups = ["dept", "title", "AVG_Count"];
			let resultMap = y.ExecuteGroup(["dept"], result);
			let applyRules = {COUNT: "dept"};
			let resultApply = y.ApplyCount(applyRules, resultMap, "AVG_Count");
			console.log(resultApply);
		});
		it("Should give correct Max - grouped", function() {
			let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title", "instructor"], ORDER: "avg"}};
			let result: any = x.ExecuteOnCourses(query, courseArray);
			let groups = ["dept", "title", "Max_AVG"];
			let resultMap = y.ExecuteGroup(["dept"], result);
			let applyRules = {MIN: "avg"};
			let resultApply = y.ApplyMin(applyRules, resultMap, "Min_AVG");
			console.log(resultApply);
		});
		it("Should give correct AVG and MAX - grouped", function() {
			let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title", "instructor"], ORDER: "avg"}};
			let result: any = x.ExecuteOnCourses(query, courseArray);
			let groups = ["dept", "title", "Max_AVG"];
			let resultMap = y.ExecuteGroup(["dept"], result);
			let applyRules = [{Min_AVG: {MIN: "avg"}},{AVG_AVG: {AVG: "avg"}}];
			let resultApply = y.ExecuteApply(applyRules, resultMap);
			console.log(resultApply);
		});
		it("Should give correct AVG and MAX and MIN and SUM and COUNT - grouped", function() {
			let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title", "instructor"], ORDER: "avg"}};
			let result: any = x.ExecuteOnCourses(query, courseArray);
			let groups = ["dept", "title", "Max_AVG"];
			let resultMap = y.ExecuteGroup(["dept"], result);
			let applyRules = [{Min_AVG: {MIN: "avg"}},{AVG_AVG: {AVG: "avg"}}];
			let resultApply = y.ExecuteApply(applyRules, resultMap);
			console.log(resultApply);
		});
	});
	describe("Group", function() {
		it("Should provide correct unique group values", function() {
			let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title"], ORDER: "avg"}};
			let result = x.ExecuteOnCourses(query, courseArray);
			let unique = y.ExecuteGroup(["dept"], result);
			let test = [...new Set(result.map((item: any) => item.dept))];
			console.log(unique);
			console.log(test);
			console.log(y.groupMap);
			let helper: any = {};
			let resultGrouped = result.reduce(function(r: any, o: any) {
				let mapKeys = Array.from( y.groupMap.keys() );
				let key = "";
				for (let i in mapKeys) {
					key = key + mapKeys[i] + "_";
				}
				key = key.slice(0, -1);
				if(!helper[key]) {
					helper[key] = Object.assign({}, o); // create a copy of o
					r.push(helper[key]);
				} else {
					helper[key].avg += o.avg;
					helper[key].instances++;
				}

				return r;
			}, []);
			console.log(result);
			console.log(helper);
		});
		describe("Group2", function() {
			it("Should provide correct unique group values", function () {
				let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title"], ORDER: "avg"}};
				let result = x.ExecuteOnCourses(query, courseArray);
				let unique = y.ExecuteGroup(["dept", "title"], result);
				let test = [...new Set(result.map((item: any) => item.dept))];
				console.log(unique);
				console.log(test);
				console.log(y.groupMap);

				let groups = Array.from(y.groupMap.keys()),
					grouped = {};

				result.forEach(function (a) {
					groups.reduce(function (o: any, g: any, i) {
						o[a[g]] = o[a[g]] || (i + 1 === groups.length ? [] : {});
						return o[a[g]];
					}, grouped).push(a);
				});
				console.log(grouped);
			});
			it("Should return correct Map with grouped keys", function() {
				let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title", "instructor"], ORDER: "avg"}};
				let result: any = x.ExecuteOnCourses(query, courseArray);
				let groups = ["dept", "title", "overallAvg"];
				let resultMap = y.ExecuteGroup(["dept"], result);
				let applyRules = [{overallAvg: {AVG: "avg"}}];
				let resultApply = y.ExecuteApply(applyRules, resultMap);
				console.log(y.FlattenMap(resultApply));
			});
		});
	});
	describe("Transformations", function() {
		it("Should return correct aggregated result array", function() {
			let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title", "instructor"], ORDER: "avg"}};
			let result: any = x.ExecuteOnCourses(query, courseArray);
			let groups = ["dept", "overallAvg"];
			let transformationClause = {
				TRANSFORMATIONS: {
					GROUP: ["dept"], APPLY: [{overallAvg: {AVG: "avg"}}]}};
			let resultArray = y.ExecuteTransformations(transformationClause, result);
			let correctColumnsArray = x.ReturnResults(groups,resultArray);
			console.log(resultArray);
		});
		it("Should return array from map", function() {
			let query = {ORDER: {dir : "DOWN", keys : ["courses_dept"]}};
			let omg = query.ORDER;
			console.log("dir ? " + Object.keys(omg).includes("dir"));
			console.log("keys ? " + Object.keys(omg).includes("keys"));
		});
		it("Should return correct aggregated result array every apply", function() {
			let query = {
				WHERE: {}, OPTIONS: {
					COLUMNS: ["title","dept", "avg", "fail", "pass", "instructor"], ORDER: "avg"
				}
			};
			let columns = ["dept", "title", "overallAvg", "totalFail", "totalPass", "totalInstructors"];
			let result: any = x.ExecuteOnCourses(query, courseArray);
			let transformationClause = {
				TRANSFORMATIONS: {
					GROUP: ["dept", "title"],
					APPLY: [{
						overallAvg: {
							AVG: "avg"
						}
					}, {
						totalFail: {
							SUM: "fail"
						}
					}, {
						totalPass: {
							SUM: "pass"
						}
					}, {
						totalInstructors: {
							COUNT: "instructor"
						}
					}
					]
				},
			};
			let resultKeys: any = [];
			transformationClause.TRANSFORMATIONS.APPLY.forEach((a: any) => {
				resultKeys.push(...Object.getOwnPropertyNames(a));
			});
			console.log(resultKeys);
			let resultMap = y.ExecuteTransformations(transformationClause, result);
			let resultWithColumns = x.ReturnResults(columns, resultMap);
			let orderKeys = ["totalFail"];
			let dir = "dept";
			let resultOrdered = x.ReturnOrderedSectionsWithDir(orderKeys, dir, resultWithColumns);
			console.log(resultOrdered);
		});
		it("Should return array from map", function() {
			let data = [
				{dept: "math", title: 100, avg: 90, room: 40},
				{dept: "math", title: 200, avg: 89, room: 50},
				{dept: "math", title: 200, avg: 70, room: 60},
				{dept: "pastro", title: 100, avg: 90, room: 45},
				{dept: "cooking", title: 100, avg: 93, room: 30}];
			let sortKeys = ["dept", "title", "avg", "room"];
			let result = data.sort((a: any, b: any) =>
				a.dept.localeCompare(b.dept) || a.title - b.title || a.avg - b.avg || a.room - b.room
			);

			let result1 = data.sort((a: any, b: any) => {
				let direction = 0, dir = "UP";
				if (dir === "UP") {
					direction = 1;
				} else {
					direction = -1;
				}
				sortKeys.forEach((val: any) => {
					if (typeof b[val] === "number") {
						if (a[val] - b[val] < 0) {
							return -1 * direction;
						} else if (a[val] - b[val] > 0) {
							return 1 * direction;
						}
					} else if (typeof a[val] === "string") {
						if (a[val].localeCompare(b[val]) < 0) {
							return -1 * direction;
						} else if (a[val].localeCompare(b[val]) > 0) {
							return 1 * direction;
						}
					}
				});
				return 0;
			});
			console.log(result1);
		});
		describe("Transformation Whole Queries", function() {
			it("Should return correct aggregated result", function () {
				let query = {
					WHERE: {},
					OPTIONS: {
						COLUMNS: ["dept", "avg", "title", "overallAvg", "instructor"],
						ORDER: "instructor"},
					TRANSFORMATIONS: {GROUP: ["dept"], APPLY: [{overallAvg: {COUNT: "instructor"}}]}};
				let result: any = x.ExecuteOnCourses(query, courseArray);
				let groups = ["dept", "overallAvg"];
				console.log(result);
			});
			it("Should return correct aggregated result - on one execute", function () {
				let query = {
					WHERE: {},
					OPTIONS: {
						COLUMNS: ["title", "dept", "overallAvg", "avg"]
					}
				};
				let result: any = x.ExecuteOnCourses(query, courseArray);
				console.log(result);
			});
			it("Should return correct result on a simple Group query", function () {
				let query = {
					WHERE:
							{
								GT: {
									courses_avg: 0
								}
							},
					OPTIONS: {
						COLUMNS: [
							"courses_title",
						]
					}
				};
				let transform =
				{
					TRANSFORMATIONS: {
						GROUP: [
							"courses_title"
						],
						APPLY: [
							{
								overallAvg: {
									AVG: "courses_avg"
								}
							}
						]
					}
				};
				let result: any = x.ExecuteOnCourses(query, courseArray);
				let resultAfterTransform = y.ExecuteTransformations(transform, result);
				console.log(result);
			});
		});
	});
});


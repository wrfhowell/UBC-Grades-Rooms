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
		it("Should give correct Count - grouped", function() {
			let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg"], ORDER: "avg"}};
			let result = x.ExecuteOnCourses(query, courseArray);
			let unique = y.ExecuteGroup(["dept"], result);
			let stringResult = JSON.stringify(result);
			let jsonResult = JSON.parse(stringResult);
			let countResult = [];
			for (let i in unique) {
				let curObj: any = {};
				const count = jsonResult.reduce((prev: any, curr: any) => {
					if (curr.dept === unique[i]) {
						prev = prev + 1;
					}
					return prev;
				}, 0);
				curObj.dept = unique[i];
				curObj.overallCount = count;
				countResult.push(curObj);
			}
			console.log(result);
			console.log(countResult);
		});
		it("Should give correct Max - grouped", function() {
			let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg"], ORDER: "avg"}};
			let result = x.ExecuteOnCourses(query, courseArray);
			let unique = y.ExecuteGroup(["dept"], result);
			let stringResult = JSON.stringify(result);
			let jsonResult = JSON.parse(stringResult);
			let MaxAvgResult = [];
			for (let i in unique) {
				let curObj: any = {};
				const max = jsonResult.reduce((prev: any, curr: any) => {
					if (curr.dept === unique[i] && curr.avg > prev) {
						prev = curr.avg;
					}
					return prev;
				}, 0);
				curObj.dept = unique[i];
				curObj.overallCount = max;
				MaxAvgResult.push(curObj);
			}
			console.log(result);
			console.log(MaxAvgResult);
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
				let unique = y.ExecuteGroup(["dept"], result);
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
		});
		describe("Group", function() {
			it("Should provide correct unique group values", function () {
				let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title"], ORDER: "avg"}};
				let result = x.ExecuteOnCourses(query, courseArray);
				let unique = y.ExecuteGroup(["dept"], result);
				let test = [...new Set(result.map((item: any) => item.dept))];
				console.log(unique);
				console.log(test);
				console.log(y.groupMap);
				let helper: any = {};
				let resultGrouped = result.reduce(function (r: any, o: any) {
					let mapKeys = Array.from(y.groupMap.keys());
					let key = "";
					for (let i in mapKeys) {
						key = key + mapKeys[i] + "_";
					}
					key = key.slice(0, -1);
					if (!helper[key]) {
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
			describe("Group2", function () {
				it("Should provide correct unique group values", function () {
					let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "avg", "title", "instructor"], ORDER: "avg"}};
					let result: any = x.ExecuteOnCourses(query, courseArray);
					let groups = ["dept"];
					let helper: Map<string, any>;
					helper = new Map<string, any>();
					function formKey(section: any, groupKeys: string[]) {
						let key = "";
						for (let i in groupKeys) {
							key = key + section[groupKeys[i]] + "_";
						}
						return key;
					}
					for (let i of result) {
						let currKey = formKey(i, groups);
						let dummy = helper.get(currKey);
						if (!dummy) {
							let blank = [];
							blank.push(i);
							helper.set(currKey, blank);
						} else if (dummy) {
							dummy.push(i);
						}
					}
					let resultArray = [];
					for (const [key, value] of helper.entries()) {
						let currValue = value.reduce((a: any, b: any) => {
							a = a + b.avg;
							return a;
						}, 0);
						currValue = currValue / value.length;
						let dummyObj: any = {};
						for (let i in groups) {
							dummyObj[groups[i]] = value[0][groups[i]];
						}
						dummyObj.Overall_Avg = currValue;
						resultArray.push(dummyObj);
					}
					console.log(resultArray);
				});
			});
		});
	});
});


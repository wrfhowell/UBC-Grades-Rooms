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
import MockDataset from "../../src/controller/MockDataset";
import Section from "../../src/controller/Section";
import Course from "../../src/controller/Course";
import {Execution} from "../../src/controller/Execution";

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

dataset.set("courses", courseArray);

describe("Execution", function () {
	it("Should return correct queried dataset", function () {
		let course = courseArray[0];
		let sections = course.sections;
		// console.log(sections);
		const sectionsAvgGT50 = sections.reduce((previousValue: Section[], currentValue) => {
			if (currentValue.avg > 51) {
				previousValue.push(currentValue);
			}
			return previousValue;
		}, []);
		// console.log(sectionsAvgGT50);
		let columns = ["avg", "uuid", "title", "dept"];
		let result = [];
		let curSection: any = {};
		for (let i in sectionsAvgGT50) {
			for (let n in columns) {
				let dummySection: any = sectionsAvgGT50[i];
				let curColumnId = columns[n];
				curSection[`${curColumnId}`] = (dummySection[`${curColumnId}`]);
			}
			result.push(curSection);
			curSection = {};
		}
		expect(result).to.deep.equal([
			{avg: 87.5, uuid: "001", title: "cpsc121", dept: "cpsc"},
			{avg: 69.2, uuid: "02341", title: "engl112", dept: "cpsc"}
		]
		);
	});
	it("Should return correct sections V2", function () {
		let sections = x.ExecuteMComparison({LT: {avg: 51}}, courseArray[0]);
		let results = x.ReturnResults(["avg", "dept", "title"], sections);
		expect(results).to.deep.equal([{avg: 50.3, dept: "cpsc", title: "math200"}]);
	});
	it("Should return correct sections - test EQ", function () {
		let sections = x.ExecuteMComparison({EQ: {avg: 69.2}}, courseArray[0]);
		let results = x.ReturnResults(["avg", "dept", "title"], sections);
		console.log(results);
		expect(results).to.deep.equal([{avg: 69.2, dept: "cpsc", title: "engl112"}]);
	});
	it("Should return correct sections - test SComparison", function () {
		let sections = x.ExecuteSComparison({IS: {dept: "cpsc"}}, courseArray[0]);
		let results = x.ReturnResults(["uuid", "title", "avg", "dept"], sections);
		expect(results).to.deep.equal([
			{uuid: "001", title: "cpsc121", avg: 87.5, dept: "cpsc"},
			{uuid: "02341", title: "engl112", avg: 69.2, dept: "cpsc"},
			{uuid: "2351", title: "math200", avg: 50.3, dept: "cpsc"}
		]
		);
		let query = {WHERE: {}, OPTIONS: {COLUMNS: ["dept", "title", "avg"], ORDER: "title"}};
		let results1 = x.Execute(query, courseArray[1]);
	});
	it("Should merge two Sections[]", function () {
		let sections1 = [section1, section2];
		let sections2 = [section3, section4];
		let union = [...new Set([...sections1, ...sections2])];
		expect(union).to.deep.equal([section1, section2, section3, section4]);
	});
	it("Should return correct sections - test OR Simple", function () {
		let sections = x.ExecuteFilter({OR: [{LT: {avg: 51}}, {GT: {avg: 51}}]}, courseArray[0]);
		let results = x.ReturnResults(["uuid", "title", "avg", "dept"], sections);
		expect(results).to.deep.equal([
			{uuid: "2351", title: "math200", avg: 50.3, dept: "cpsc"},
			{uuid: "001", title: "cpsc121", avg: 87.5, dept: "cpsc"},
			{uuid: "02341", title: "engl112", avg: 69.2, dept: "cpsc"}
		]
		);
	});
	it("Should return correct sections - test AND Simple", function () {
		let sections = x.ExecuteFilter({AND: [{LT: {avg: 80}}, {GT: {avg: 51}}]}, courseArray[0]);
		let results = x.ReturnResults(["uuid", "title", "avg", "dept"], sections);
		expect(results).to.deep.equal([{uuid: "02341", title: "engl112", avg: 69.2, dept: "cpsc"}]);
	});
	it("Should return correct sections - test NOT Simple", function () {
		let sections = x.ExecuteFilter({NOT: {NOT: {NOT: {GT: {avg: 80}}}}}, courseArray[0]);
		let results = x.ReturnResults(["uuid", "title", "avg", "dept"], sections);
		expect(results).to.deep.equal([
			{uuid: "02341", title: "engl112", avg: 69.2, dept: "cpsc"},
			{uuid: "2351", title: "math200", avg: 50.3, dept: "cpsc"}
		]);
	});
	it("Should return correct sections - test AND with IS", function () {
		let sections = x.ExecuteFilter({AND: [{LT: {avg: 80}}, {GT: {avg: 51}}, {IS: {dept: "cpsc"}}]}, courseArray[0]);
		let results = x.ReturnResults(["dept", "id", "avg"], sections);
		expect(results).to.deep.equal([
			{dept: "cpsc", id: "324", avg: 69.2}
		]);
	});
	it("Should return correct sections - test Execute", function () {
		let query = {
			WHERE: {
				GT: {
					avg: 68
				}
			},
			OPTIONS: {
				COLUMNS: [
					"dept",
					"avg"
				],
				ORDER: "avg"
			}
		};
		let result = x.ReturnOrderedSections(x.ReturnOrder(query),x.Execute(query, courseArray[0]));
		expect(result).deep.equal([
			{dept: "cpsc", avg: 69.2},
			{dept: "cpsc", avg: 87.5}
		]);
	});
	it("Should return right sections - complex query", function () {
		let query = {
			WHERE: {
				OR: [
					{
						OR: [
							{
								LT: {
									avg: 51
								}
							},
							{
								IS: {
									dept: "math"
								}
							}
						]
					},
					{
						EQ: {
							avg: 69.2
						}
					}
				]
			},
			OPTIONS: {
				COLUMNS: [
					"dept",
					"id",
					"avg",
				],
				ORDER: "avg"
			}
		};
		let result = x.ExecuteOnCourses(query, courseArray);
		console.log(result);
		expect(result).to.deep.equal([
			{dept: "phys", id: "123", avg: 23.3},
			{dept: "phys", id: "321", avg: 45.2},
			{dept: "cpsc", id: "234", avg: 50.3},
			{dept: "cpsc", id: "324", avg: 69.2}
		]);
	});
	it("Should return right order", function () {
		let query = {WHERE: {}, OPTIONS: {COLUMNS: ["avg", "title"], ORDER: "avg"}};
		let result = x.ReturnOrderedSections(x.ReturnOrder(query),x.Execute(query, courseArray[0]));
		console.log(result);
		expect(result).to.deep.equal([
			{avg: 50.3, title: "math200"},
			{avg: 69.2, title: "engl112"},
			{avg: 87.5, title: "cpsc121"}
		]);
	});
	it("Should return right sections - complex query v2", function () {
		let query = {
			WHERE: {
				OR: [
					{
						AND: [
							{
								GT: {
									avg: 20
								}
							},
							{
								LT: {
									avg: 100
								}
							}
						]
					},
					{
						EQ: {
							avg: 69.2
						}
					}
				]
			},
			OPTIONS: {
				COLUMNS: [
					"dept",
					"id",
					"avg",
				],
				ORDER: "id"
			}
		};
		let list = [courseArray[1]];
		let result = x.ExecuteOnCourses(query, list);
		console.log(result[0]);
	});
	it("Should return correct queried sections after parsing for dataset id from first Option column", function() {
		let query = {WHERE: {}, OPTIONS: {COLUMNS: ["courses_avg", "courses_title"], ORDER: "courses_avg"}};
		let datasetIdUnParsed = query.OPTIONS.COLUMNS[0];
		let datasetId = datasetIdUnParsed.substring(0, datasetIdUnParsed.indexOf("_"));
		let courses: Course[] = dataset.get(datasetId)!;
		console.log(courses);
		console.log("datasetIdUnparsed is: " + datasetIdUnParsed);
		console.log("datasetId is: " + datasetId);
		console.log("datasetId is: " + datasetId);
		let result = x.ExecuteOnCourses(query, courses);
		console.log(result);
		console.log(x.ReturnColumns(query));
	});
	// it("test concat property key", function() {
	// 	let query = {WHERE: {}, OPTIONS: {COLUMNS: ["courses_avg", "courses_title"], ORDER: "courses_avg"}};
	// 	let columns = x.ReturnColumns(query);
	// 	let results = x.ExecuteOnCourses(query, courseArray);
	// 	console.log(results);
	// 	console.log(Object.keys(results[1]));
	// 	for (let i in results) {
	// 		for (let j in Object.keys(results)) {
	// 			let key = Object.keys(results)[j];
	// 			let currentObject = results[i];
	// 		}
	// 	}
	// });
});

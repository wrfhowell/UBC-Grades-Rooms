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
	it("Should return correct queried dataset", function() {
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
		console.log(result);
	});
	it("Should return correct sections V2", function() {
		let sections = x.ExecuteMComparison({LT : {avg: 51}},courseArray[0]);
		let results = x.ReturnResults(["avg", "dept", "title"], sections);
		console.log(results);
	});
	it("Should return correct sections - test SComparison", function() {
		let sections = x.ExecuteSComparison({IS: {dept: "cpsc"}}, courseArray[0]);
		let results = x.ReturnResults(["uuid", "title", "avg", "dept"], sections);
		console.log(results);
	});
	it("Should merge two Sections[]", function() {
		let sections1 = [section1, section2];
		let sections2 = [section3, section4];
		let union = [...new Set([...sections1, ...sections2])];
		console.log(union);
	});
	it("Should return correct sections - test OR Simple", function() {
		let sections = x.ExecuteFilter({OR: [{LT: {avg: 51}}, {GT: {avg: 51}}]}, courseArray[0]);
		let results = x.ReturnResults(["uuid","title","avg","dept"], sections);
		console.log(results);
	});
	it("Should return correct sections - test AND Simple", function() {
		let sections = x.ExecuteFilter({AND: [{LT: {avg: 80}}, {GT: {avg: 51}}]}, courseArray[0]);
		let results = x.ReturnResults(["uuid","title","avg","dept"], sections);
		console.log(results);
	});
	it("Should return correct sections - test NOT Simple", function() {
		let sections = x.ExecuteFilter({NOT: {GT: {avg: 80}}}, courseArray[0]);
		let results = x.ReturnResults(["uuid","title","avg","dept"], sections);
		console.log(results);
	});
	it("Should return correct sections - test AND with IS", function() {
		let sections = x.ExecuteFilter({AND: [{LT: {avg: 80}}, {GT: {avg: 51}}, {IS: {dept: "cpsc"}}]}, courseArray[0]);
		let results = x.ReturnResults(["uuid","title","avg","dept"], sections);
		console.log(results);
	});
	it("Should return correct sections - test Execute", function() {
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
				ORDER: "courses_avg"
			}
		};
		let result = x.Execute(query,courseArray[0]);
		console.log(result);
		console.log("coursesavg".split("_").pop());
	});
	it("Should return right sections - complex query", function() {
		let query = {
			WHERE: {
				OR: [
					{
						AND: [
							{
								GT: {
									avg: 70
								}
							},
							{
								IS: {
									dept: "cpsc"
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
					"avg"
				],
				ORDER: "courses_avg"
			}
		};
		let result = x.Execute(query, courseArray[0]);
		console.log(result);
	});

});

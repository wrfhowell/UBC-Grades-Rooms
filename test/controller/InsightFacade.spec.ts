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

const regexp = new RegExp("^[1-9]{0,2}$");


type Mfield = "avg" | "pass" | "fail" | "audit" | "year";
type Sfield = "dept" | "id" | "instructor" | "title" | "uuid";
const Idstring = new RegExp("[^_]+");
const Inputstring = new RegExp("[^*]*");


type Query = string;

type Input = unknown;
type Output = Promise<InsightResult[]>;
type Error = "InsightError" | "ResultTooLargeError" | "NotFoundError";

chai.use(chaiAsPromised);

describe("InsightFacade", function () {
	// Promise should fulfill an array of currently added InsightDatasets, and will only fulfill.

	let courses: string;
	let noCoursesDir: string;
	let emptyCoursesDir: string;
	let coursesJson: string;
	let coursesHasJpg: string;
	let image: string;
	let blankJson: string;
	let coursesRemoveOneFile: string;
	let oneInvalidJsonFile: string;

	before(function () {
		courses = getContentFromArchives("courses.zip");
		noCoursesDir = getContentFromArchives("NO_COURSES_DIR.zip");
		emptyCoursesDir = getContentFromArchives("EMPTY_COURSES_DIR.zip");
		coursesJson = getContentFromArchives("courses.json");
		coursesHasJpg = getContentFromArchives("COURSES_HAS_JPG.zip");
		image = getContentFromArchives("IMAGE.zip");
		blankJson = getContentFromArchives("BLANK_JSON.zip");
		coursesRemoveOneFile = getContentFromArchives("courses_remove_one_file.zip");
		oneInvalidJsonFile = getContentFromArchives("ONE_INVALID_JSON_FILE.zip");
	});

	let facade: IInsightFacade;

	describe("List Datasets", function () {

		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		// beforeEach statement was here

		it("should list no datasets", function () {
			return facade.listDatasets().then((insightDatasets) => {
				expect(insightDatasets).to.be.an.instanceof(Array);
				expect(insightDatasets).to.have.length(0);
			});
		});

		it("should list one dataset", function () {
			// 1. Add a dataset
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then((addedIds) => facade.listDatasets())
				.then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal([{
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					}]);
				});
			// 2. List datasets again
		});

		it("should list multiple datasets", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset("courses-2", courses, InsightDatasetKind.Courses);
				})
				.then(() => {
					return facade.listDatasets();
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.an.instanceof(Array);
					expect(insightDatasets).to.have.length(2);
					const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses");
					expect(insightDatasetCourses).to.exist;
					expect(insightDatasetCourses).to.deep.equal({
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					});
					const insightDatasetCourses2 = insightDatasets.find((dataset) => dataset.id = "courses-2");
					expect(insightDatasetCourses2).to.exist;
					expect(insightDatasetCourses2).to.deep.equal({
						id: "courses-2",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					});
				});
		});
	});

	describe("Add Datasets", function () {
		// Promise should fulfill on a successful add with a string array containing
		// the ids of all currently added datasets upon a successful add.
		// Promise should reject with an InsightError describing the error.

		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		it("Should add one Dataset", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then((addedIds) => {
					expect(addedIds).to.be.instanceof(Array);
					expect(addedIds).to.have.length(1);
					expect(addedIds).to.deep.equal(["courses"]);
				})
				.then(() => {
					return facade.listDatasets();
				})
				.then((dataset) => {
					expect(dataset).to.deep.equal([{
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612
					}]
					);
				});
		});

		it("Should reject dataset of InsightDatasetKind.Rooms", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Rooms)
				.then(() => expect.fail())
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				});
		});

		it("Should add multiple Datasets", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset("courses1", courses, InsightDatasetKind.Courses);
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.instanceof(Array);
					expect(insightDatasets).to.have.length(2);
					expect(insightDatasets).to.deep.equal(["courses", "courses1"]);
				})
				.then(() => {
					return facade.listDatasets();
				})
				.then((dataset) => {
					expect(dataset).to.be.instanceof(Array);
					expect(dataset).to.have.length(2);
					expect(dataset).to.deep.equal([{
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612
					},
					{
						id: "courses1",
						kind: InsightDatasetKind.Courses,
						numRows: 64612
					}]);
				});
		});

		it("Should add multiple Datasets on different datasets added", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset("courses1", coursesRemoveOneFile, InsightDatasetKind.Courses);
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.instanceof(Array);
					expect(insightDatasets).to.have.length(2);
					expect(insightDatasets).to.deep.equal(["courses", "courses1"]);
				})
				.then(() => {
					return facade.listDatasets();
				})
				.then((dataset) => {
					expect(dataset).to.be.instanceof(Array);
					expect(dataset).to.have.length(2);
					// expect(dataset).to.deep.equal([{
					//     id: "courses",
					//     kind: InsightDatasetKind.Courses,
					//     numRows: 64612
					// },
					//     {
					//         id: "courses1",
					//         kind: InsightDatasetKind.Courses,
					//         numRows: 64611
					//     }])
				});
		});

		it("Should throw InsightError when adding invalid dataset - folder", function () {
			return facade.addDataset("courses", coursesJson, InsightDatasetKind.Courses)
				.then(() => expect.fail)
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				}
				);
		});

		it("Should throw InsightError when adding invalid dataset - image", function () {
			return facade.addDataset("courses", image, InsightDatasetKind.Courses)
				.then(() => expect.fail)
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				}
				);
		});

		it("Should throw InsightError when adding invalid dataset - folder has image", function () {
			return facade.addDataset("courses", coursesHasJpg, InsightDatasetKind.Courses)
				.then(() => expect.fail)
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				}
				);
		});

		it("Should throw InsightError when adding invalid dataset - contain one invalid json course file", function () {
			return facade.addDataset("courses", oneInvalidJsonFile, InsightDatasetKind.Courses)
				.then(() => expect.fail)
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				}
				);
		});

		it("Should throw InsightError when adding invalid dataset - json file not zip", function () {
			return facade.addDataset("courses", coursesJson, InsightDatasetKind.Courses)
				.then(() => expect.fail)
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				}
				);
		});

		it("Should throw InsightError when adding invalid dataset - blank json", function () {
			return facade.addDataset("courses", blankJson, InsightDatasetKind.Courses)
				.then(() => expect.fail)
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				}
				);
		});

		it("Should throw InsightError when adding same dataset", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset("courses", courses, InsightDatasetKind.Courses);
				})
				.then(() => expect.fail())
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				});
		});

		it("Should reject dataset with no content", function () {
			return facade.addDataset("courses", emptyCoursesDir, InsightDatasetKind.Courses)
				.then(() => expect.fail())
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				});
		});

		it("Should reject dataset with no courses directory", function () {
			return facade.addDataset("courses", noCoursesDir, InsightDatasetKind.Courses)
				.then(() => expect.fail())
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				});
		});

		it("Should throw InsightError if id has underscore", function () {
			return facade.addDataset("courses_", courses, InsightDatasetKind.Courses)
				.then((res) => {
					throw new Error(`Resolved with: ${res}`);
				})
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				});
		});

		it("Should throw InsightError if id has only whitespace", function () {
			return facade.addDataset("    ", courses, InsightDatasetKind.Courses)
				.then((res) => {
					throw new Error(`Resolved with: ${res}`);
				})
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				});
		});
	});

	describe("Remove Datasets", function () {
		// Promise should fulfill with the id of the dataset that was removed.
		// Promise should reject with a NotFoundError (if a valid id was not yet added).
		// Promise should reject with InsightError (invalid id or other failures) describing the error.

		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		it("Should remove one Dataset", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.removeDataset("courses");
				})
				.then((removed) => {
					expect(removed).to.be.instanceof(String);
					expect(removed).to.equal("courses");
				})
				.then(() => {
					return facade.listDatasets();
				})
				.then((dataset) => {
					expect(dataset).to.be.instanceof(Array);
					expect(dataset).to.have.length(0);
				});
		});

		it("Should remove only one Dataset", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset("courses1", courses, InsightDatasetKind.Courses);
				})
				.then(() => {
					return facade.addDataset("courses2", courses, InsightDatasetKind.Courses);
				})
				.then(() => {
					return facade.removeDataset("courses");
				})
				.then((removed) => {
					expect(removed).to.be.instanceof(String);
					expect(removed).to.equal("courses");
				})
				.then(() => {
					return facade.listDatasets();
				})
				.then((dataset) => {
					expect(dataset).to.be.instanceof(Array);
					expect(dataset).to.have.length(2);
				});
		});

		it("Should remove multiple Datasets", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset("courses1", courses, InsightDatasetKind.Courses);
				})
				.then(() => {
					return facade.addDataset("courses2", courses, InsightDatasetKind.Courses);
				})
				.then(() => {
					return facade.removeDataset("courses");
				})
				.then((removed) => {
					expect(removed).to.be.instanceof(String);
					expect(removed).to.equal("courses");
				})
				.then(() => {
					return facade.removeDataset(("courses1"));
				})
				.then((removed) => {
					expect(removed).to.be.instanceof(String);
					expect(removed).to.equal("courses1");
				})
				.then(() => {
					return facade.listDatasets();
				})
				.then((dataset) => {
					expect(dataset).to.be.instanceof(Array);
					expect(dataset).to.have.length(1);
				});
		});

		// it("Should be able to add Dataset after calling removeDataset"), function () {
		// 	return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
		// 		.then(() => {
		// 			return facade.removeDataset("courses");
		// 		})
		// 		.then(() => {
		// 			return facade.addDataset("courses", courses, InsightDatasetKind.Courses);
		// 		})
		// 		.then((addedDataset) => {
		// 			expect(addedDataset).to.be.instanceof(Array);
		// 			expect(addedDataset).to.have.length(1);
		// 		});
		// };

		it("Should throw InsightError if id contains underscore", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.removeDataset("courses_");
				})
				.then((res) => {
					throw new Error(`Resolved with: ${res}`);
				})
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				});
		});

		it("Should throw InsightError if Id contains only whitespace", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.removeDataset("   ");
				})
				.then((res) => {
					throw new Error(`Resolved with: ${res}`);
				})
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				});
		});

		it("Should throw NotFoundError if dataset has not been added", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.removeDataset("courses1");
				})
				.then((res) => {
					throw new Error(`Resolved with: ${res}`);
				})
				.catch((err) => {
					expect(err).to.be.instanceof(NotFoundError);
				});
		});
	});

	describe("Perform Query", function () {
		// Promise should fulfill with an array of results
		// Promise should reject with an InsightError describing the error.

		before(function () {
			clearDisk();
			facade = new InsightFacade();
			facade.addDataset("courses", courses, InsightDatasetKind.Courses);
		});

		function assertResult(actual: any, expected: Awaited<Output>): void {
			expect(actual).to.have.deep.members(expected);
		}

		function assertError(actual: any, expected: Error): void {
			if (expected === "InsightError") {
				expect(actual).to.be.an.instanceof(InsightError);
			} else if (expected === "ResultTooLargeError") {
				expect(actual).to.be.an.instanceof(ResultTooLargeError);
			} else if (expected === "NotFoundError") {
				expect(actual).to.be.an.instanceof(NotFoundError);
			} else {
				expect.fail("UNEXPECTED ERROR");
			}
		}

		folderTest<Input, Output, Error>(
			"dynamic tests for performQuery()",           // suiteName
			(input: Input): Output => facade.performQuery(input),
			"./test/resources/queries",
			{
				assertOnResult: assertResult,
				assertOnError: assertError,            // options
			});
	});
});

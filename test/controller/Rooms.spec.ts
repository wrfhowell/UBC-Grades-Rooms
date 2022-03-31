import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {describe} from "mocha";
import {Execution} from "../../src/controller/Execution";
import {Transformations} from "../../src/controller/Transformations";
import Room from "../../src/controller/Room";
import {Validation} from "../../src/controller/Validation";
import {RoomExecution} from "../../src/controller/RoomExecution";
import InsightFacade from "../../src/controller/InsightFacade";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";
import {clearDisk, getContentFromArchives} from "../TestUtil";

chai.use(chaiAsPromised);

let roomArray: any = [];

let room1 = new Room(
	"Geography","GEO", "43","GEO_43", "132 Road", 100, 200,
	230, "Lecture hall", "Movable chairs", "www.geolink.com"
);
roomArray.push(room1);

let room2 = new Room(
	"Geography","GEO", "12","HEN_12", "56 Wesbrook ave",  23, 80,
	67, "Big room", "Small chairs and tables", "www.henningslink.com"
);
roomArray.push(room2);

let room3 = new Room(
	"Geography","GEO", "89","NES_89", "56 West Mall", 67.3, 34.2,
	700, "Conference room", "empty", "www.amsnest.com"
);
roomArray.push(room3);

let room4 = new Room(
	"Birdcoop","BIR", "1","BIO_1", "27 Main Mall", 12.3
	, 34,
	12, "Office", "Movable chairs", "www.BIO.com"
);
roomArray.push(room4);

let room5 = new Room(
	"Birdcoop","BIR", "24","BIR_24", "6245 Agronomy Road",
	5, 10.23,
	90, "Gm", "Equipment", "www.bircoop.com"
);
roomArray.push(room5);

let roomDataset: Map<string, Room[]> = new Map<string, Room[]>();
roomDataset.set("rooms", roomArray);

let courses = getContentFromArchives("courses.zip");

let x = new Execution();
let y = new Transformations();
let v = new Validation("rooms", "rooms");
let r = new RoomExecution();

describe("Rooms Expansion", function () {
	describe("Simple EBNF", function () {
		it("Should give correct Count", function () {
			let query = {

				WHERE: {},

				OPTIONS: {

					COLUMNS: ["courses_title", "overallAvg"]

				},

				TRANSFORMATIONS: {

					GROUP: ["courses_title"],

					APPLY: [{

						overallAvg: {

							AVG: "courses_avg"

						}

					}]

				}

			};
			// let result = x.ExecuteOnCourses(query, roomArray);
			let validate = v.Validate(query);
			console.log(validate);
			let result = r.ExecuteOnRooms(query, roomArray);
			console.log(result);
		});
	});
	describe("Complex EBNF", function () {
		it("Should give correct Count", function () {
			let query = {
				WHERE: {
					AND: [{
						GT: {
							rooms_lat: 0
						}
					}, {
						GT: {
							rooms_seats: 0
						}
					}]
				},
				OPTIONS: {
					COLUMNS: [
						"rooms_furniture",
						"shortNameCount",
						"maxLat",
						"minLon"
					],
					ORDER: {dir: "DOWN", keys: ["rooms_furniture", "maxLat"]}
				},
				TRANSFORMATIONS: {
					GROUP: ["rooms_furniture"],
					APPLY: [{shortNameCount: {COUNT: "rooms_shortname"}},
						{maxLat: {MAX: "rooms_lat"}},
						{minLon: {MIN: "rooms_lon"}}]
				}
			};
			let result = r.ExecuteOnRooms(query, roomArray);
			console.log(result);
		});
		it ("Should return correct result with dataset id attached", function() {
			let query = {
				WHERE: {
					GT: {
						rooms_seats: 0
					}
				},
				OPTIONS: {
					COLUMNS: [
						"rooms_name",
						"rooms_seats",
						"rooms_furniture"
					],
					ORDER: {dir: "UP", keys: ["rooms_furniture"]}
				}
			};
			// let result = x.ExecuteOnCourses(query, roomArray);
			let validate = v.Validate(query);
			console.log(validate);
			let result = r.ExecuteOnRooms(query, roomArray);
			console.log(result);
		});
		it ("Should return correct key type", function() {
			let key = "names";
			let result = x.ReturnKeyType(key);
			console.log(result);
		});
		it ("Should return initial array", function() {
			let array1 = ["a", "b", "c", "d"];
			let result = array1.flat();
			console.log(result);
		});
		it("Should return correct EQ clause", function() {
			let query = {GT: {seats: 300}};
			let result = r.ExecuteFilter(query, roomArray);
			let column = ["fullname", "number", "name", "seats"];
			let returnedResults = r.ReturnResults(column, result);
			console.log(returnedResults);
		});
		it("Should return correct WHERE clause", function() {
			let query = {WHERE: {GT: {seats: 300}}};
			let result = r.ExecuteWhere(query.WHERE, roomArray);
			let column = ["fullname", "number", "name", "seats"];
			let returnedResults = r.ReturnResults(column, result);
			console.log(returnedResults);
		});
		it("Should return correct TRANSFORMATION clause", function() {
			let query = {WHERE: {}};
			let result = r.ExecuteWhere(query.WHERE, roomArray);
			let column = ["fullname", "number", "name", "seats"];
			let returnedResults = r.ReturnResults(column, result);
			let groupQuery = {GROUP: ["fullname"]};
			let groupedResults = y.ExecuteGroup(groupQuery,returnedResults);
			let transformquery = {TRANSFORMATIONS: {APPLY: [{sumOfSeats: {SUM: "seats"}}]}};
			let transformedResults = y.ExecuteApply(transformquery.TRANSFORMATIONS.APPLY, groupedResults);
			console.log(groupedResults);
			console.log(y.FlattenMap(transformedResults));
		});
		it("Should return correct Order clause", function() {
			let query = false;
		});
		it("Should return correct Filter clause", function() {

			let query = {
				WHERE: {
					GT: {
						rooms_seats: 0
					}
				},
				OPTIONS: {
					COLUMNS: [
						"rooms_name",
						"rooms_seats",
						"rooms_furniture"
					],
					ORDER: {dir: "UP", keys: ["rooms_furniture"]}
				}
			};
			let rooms = getContentFromArchives("rooms.zip");
			let facade = new InsightFacade();
			facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
		});
	});
});

import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {describe} from "mocha";
import Section from "../../src/controller/Section";
import Course from "../../src/controller/Course";
import {Execution} from "../../src/controller/Execution";
import {Transformations} from "../../src/controller/Transformations";
import Room from "../../src/controller/Rooms";

chai.use(chaiAsPromised);

let roomArray = [];

let room1 = new Room(
	"Geography","GEO", "43","GEO_43", "132 Road", 100, 200,
	230, "Lecture hall", "Movable chairs", "www.geolink.com"
);
roomArray.push(room1);

let room2 = new Room(
	"Hennings","HEN", "12","HEN_12", "56 Wesbrook ave",  23, 80,
	67, "Big room", "Small chairs and tables", "www.henningslink.com"
);
roomArray.push(room2);

let room3 = new Room(
	"Nest","NES", "89","NES_89", "56 West Mall", 67.3, 34.2,
	700, "Conference room", "empty", "www.amsnest.com"
);
roomArray.push(room3);

let room4 = new Room(
	"Biology Building","BIO", "1","BIO_1", "27 Main Mall", 12.3
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

let x = new Execution();
let y = new Transformations();

describe("Rooms Expansion", function () {
	describe("Simple EBNF", function () {
		it("Should give correct Count", function () {
			return false;
		});
	});
	describe("Complex EBNF", function () {
		it("Should give correct Count", function () {
			return false;
		});
	});
});

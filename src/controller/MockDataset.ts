import Course from "./Course";
import Section from "./Section";
import Room from "./Room";

export default class MockDataset {

	public dataset: Map<string, Course[]>;

	public constructor() {
		this.dataset = new Map<string, Course[]>();
	}

	public createMockDataset() {
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

		this.dataset.set("courses", courseArray);
	}

	public createRoomsDataset() {
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
	}


}

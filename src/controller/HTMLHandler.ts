import InsightFacade from "./InsightFacade";
import JSZip from "jszip";
import Section from "./Section";
import Course from "./Course";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import DiskHelper from "./DiskHelper";
import parse5 from "parse5";
import GeolocHelper from "./GeolocHelper";
import Building from "./Building";
import Room from "./Room";

export default class HTMLHandler {
	// private  buildingsArray: any;
	//
	// constructor() {
	// 	this.buildingsArray = [];
	// }

	public static getContent(
		id: string,
		content: string,
		data: InsightFacade,
		resolve: (value: any) => any, reject: (value: any) => any): any {
		let jszip: JSZip = new JSZip();
		let zipData = new JSZip();
		jszip.loadAsync(content, {base64: true})
			.then((zip: any) => {
				zipData = zip;
				let promiseArrayBuildings: Array<Promise<any>> = [];
				zip.file("rooms/index.htm").async("string").then((htmlString: string) => {
					let htmlNode = parse5.parse(htmlString);
					// find table with building info - place into tableNode
					let tableNode = HTMLHandler.findTableRecurs(htmlNode);
					promiseArrayBuildings = HTMLHandler.makeBuildingsIterative(tableNode);
				});
				return Promise.all(promiseArrayBuildings);
			}).then((buildings: Building[]) => {
				buildings.filter((oneBuilding) => {
					return oneBuilding !== null;
				});
				let allRooms: any[] = [];
				let numRows = 0;
				for (let building of buildings) {
					let buildingLink = building.link.substring(2);
					let oneBuildingRooms;
					if (buildingLink) {
						oneBuildingRooms = this.getRooms(building, buildingLink, zipData);
					}
					if (oneBuildingRooms.isArray(Room)) {
						numRows += oneBuildingRooms.length;
						allRooms.concat(oneBuildingRooms);
					}
				}
				if (allRooms.length > 0) {
					data.insightDataRooms.set(id, allRooms);
					data.addedDatasets.push({id: id, kind: InsightDatasetKind.Rooms, numRows: numRows} as
						InsightDataset);
					data.idArray.push(id);
					return resolve(DiskHelper.saveToDisk(id, allRooms, data));
				} else {
					return reject(new InsightError("empty"));
				}
			}).then(() => {
				return resolve(data.idArray);
			})
			.catch((e) => {
				return reject(new InsightError("invalid zip"));
			});
	}

	public static findTableRecurs(htmlNode: any): any {
		if (!htmlNode) {
			return null;
		} else if (htmlNode.tagName === "tbody") {
			return htmlNode;
		} else if (htmlNode.childNodes !== null){
			for(let node of htmlNode.childNodes) {
				let retNode = this.findTableRecurs(node);
				if (retNode) {
					return retNode;
				}
			}
			return null;
		}
		return null;
	}

	private static makeBuildingsIterative(tableNode: any): any {
		if (tableNode.tagName === "tbody") {
			let promiseArrayBuildings: Array<Promise<any>> = [];
			for(let trNode of tableNode.childNodes) {
				if (trNode.tagName === "tr" &&
					trNode.attrs[0].value === "odd" ||
					trNode.attrs[0].value === "even" ||
					trNode.attrs[0].value === "odd views-row-first" ||
					trNode.attrs[0].value === "even views-row-last") {
					let building = this.getBuildingData(trNode);
					promiseArrayBuildings.push(building);
				}
			}
			return promiseArrayBuildings;
		}
	}

	private static getBuildingData(node: any): any {
		return new Promise((resolve, reject) => {
			let fullname: string;
			let shortname: string;
			let address: string = "";
			let link: string;
			let lat: number;
			let lon: number;

			for (let tdNode of node.childNodes) {
				if (tdNode.nodeName === "td") {
					if (tdNode.attrs[0].value === "views-field views-field-title") {
						fullname = tdNode.childNodes[1].childNodes[0].value.trim();
					} else if (tdNode.attrs[0].value === "views-field views-field-field-building-code") {
						shortname = tdNode.childNodes[0].value.trim();
					} else if (tdNode.attrs[0].value === "views-field views-field-field-building-address") {
						address = tdNode.childNodes[0].value.trim();
					} else if (tdNode.attrs[0].value === "views-field views-field-nothing") {
						link = tdNode.childNodes[1].attrs[0].value.trim();
					}
				}
			}
			this.getBuildingLatLon(address).then((latLonArr: any) => {
				lat = latLonArr[0];
				lon = latLonArr[1];
				if (lat && lon && fullname && shortname && address && link) {
					let building = new Building(fullname, shortname, address, link, lat, lon);
					resolve(building);
				} else {
					reject(new InsightError("could not make building"));
				}

			});
		});
	}

	private static getBuildingLatLon(address: any): any {
		let urlAddress = encodeURIComponent(address);
		return new Promise((resolve, reject) => {
			return GeolocHelper.getGeoloc(urlAddress)
				.then((ret) => {
					if (ret.lat && ret.lon) {
						resolve([Number(ret.lat), Number(ret.lon)]);
					} else {
						reject(new InsightError("no lat and lon"));
					}
				});
		});
	}

	private static getRooms(building: Building, buildingLink: string, zipData: JSZip): any {
		return new Promise((resolve, reject) => {
			let arrayRooms = [];
			zipData.file(buildingLink)!.async("string")
				.then((htmlString) => {
					let htmlNode = parse5.parse(htmlString);
					let tableNode = HTMLHandler.findTableRecurs(htmlNode);
					arrayRooms = HTMLHandler.makeRoomsIterative(tableNode, building);
					if (arrayRooms.length > 0) {
						resolve(arrayRooms);
					} else {
						reject(new InsightError("no rooms found"));
					}
				});
		});
	}

	private static makeRoomsIterative(tableNode: any, building: Building) {
		let arrayRooms = [];
		if (tableNode.tagName === "tbody") {
			// trNode IS a ROOM data
			for(let trNode of tableNode.childNodes) {
				if (trNode.tagName === "tr" &&
					trNode.attrs[0].value === "odd" ||
					trNode.attrs[0].value === "even" ||
					trNode.attrs[0].value === "odd views-row-first" ||
					trNode.attrs[0].value === "even views-row-last") {
					let room = HTMLHandler.getRoomData(trNode, building);
					if (room) {
						arrayRooms.push(room);
					}
				}
			}
		}
		return arrayRooms;
	}

	private static getRoomData(trNode: any, building: Building) {
		let fullname: string = building.fullname;
		let shortname: string = building.shortname;
		let number = null;
		let name = null;
		let address: string = building.address;
		let lat = building.lat;
		let lon = building.lon;
		let seats = null;
		let type = null;
		let furniture = null;
		let href = null;
		let room = null;
		for (let tdNode of trNode.childNodes) {
			if (tdNode.nodeName === "td") {
				if (tdNode.attrs[0].value === "views-field views-field-field-room-number") {
					number = tdNode.childNodes[1].childNodes[0].value.trim();
					href = tdNode.childNodes[1].attrs[0].value.trim();
				} else if (tdNode.attrs[0].value === "views-field views-field-field-room-capacity") {
					seats = tdNode.childNodes[0].value.trim();
				} else if (tdNode.attrs[0].value === "views-field views-field-field-room-furniture") {
					furniture = tdNode.childNodes[0].value.trim();
				} else if (tdNode.attrs[0].value === "views-field views-field-field-room-type") {
					type = tdNode.childNodes[0].value.trim();
				}
			}
		}
		if (shortname && number) {
			name = shortname + "_" + number;
		}

		if(fullname && shortname &&
			number && name && address && lat && lon && seats && type && furniture && href) {
			room = new Room(fullname, shortname, number, name, address, lat, lon, seats, type, furniture, href);
		}
		return room;
	}
}



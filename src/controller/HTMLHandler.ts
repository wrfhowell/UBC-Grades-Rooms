import InsightFacade from "./InsightFacade";
import JSZip from "jszip";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import DiskHelper from "./DiskHelper";
import parse5 from "parse5";
import GeolocHelper from "./GeolocHelper";
import Building from "./Building";
import Room from "./Room";

export default class HTMLHandler {

	public static getContent(
		id: string,
		content: string,
		data: InsightFacade,
		resolve: (value: any) => any, reject: (value: any) => any): any {
		let jszip: JSZip = new JSZip();
		let zipData: any;
		let buildingArray: any = [];
		jszip.loadAsync(content, {base64: true})
			.then((zip: any) => {
				zipData = zip;
				let promiseArrayBuildings: Array<Promise<any>> = [];
				zip.file("rooms/index.htm").async("string")
					.then((htmlString: string) => {
						if (htmlString) {
							let htmlNode = parse5.parse(htmlString);
							// find table with building info - place into tableNode
							let tableNode = HTMLHandler.findTableRecurs(htmlNode);
							if (tableNode === null) {
								reject(new InsightError("no buildings found in recursion"));
							}
							promiseArrayBuildings = HTMLHandler.makeBuildingsIterative(tableNode);
						}
						return Promise.all(promiseArrayBuildings);
					}).then((buildingsArr: Building[]) => {
						buildingArray = buildingsArr;
						return HTMLHandler.getBuildingFiles(buildingsArr, zipData);
					}).then((htmlArray: any) => {
						let allRooms: any[] = [];
						allRooms = HTMLHandler.parseRooms(htmlArray, buildingArray);
						if (allRooms.length > 0) {
							let numRows = allRooms.length;
							data.insightDataRooms.set(id, allRooms);
							data.addedDatasets.push({id: id, kind: InsightDatasetKind.Rooms, numRows: numRows} as
								InsightDataset);
							data.idArray.push(id);
							return resolve(DiskHelper.saveToDisk(id, allRooms, data));
						} else {
							return reject(new InsightError("empty"));
						}
					}).then(() => {
						// console.log(data.insightDataRooms);
						return resolve(data.idArray);
					}).catch((error: any) => {
						reject(new InsightError("invalid zip"));
					});
			}).catch((error: any) => {
				reject(new InsightError("invalid zip"));
			});
	}

	public static findTableRecurs(htmlNode: any): any {
		if (htmlNode.tagName === "tbody") {
			return htmlNode;
		} else if (htmlNode === null) {
			return null;
		} else if (htmlNode.childNodes !== undefined && htmlNode.childNodes !== null){
			let tableNode: any = null;
			for(let node of htmlNode.childNodes) {
				let retNode = this.findTableRecurs(node);
				if (retNode !== null) {
					tableNode = retNode;
				}
			}
			return tableNode;
		} else {
			return null;
		}
	}

	private static makeBuildingsIterative(tableNode: any): any {
		if (tableNode.tagName === "tbody") {
			let promiseArrayBuildings: Array<Promise<any>> = [];
			for(let trNode of tableNode.childNodes) {
				if (trNode.tagName === "tr") {
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

	private static makeRoomsIterative(tableNode: any, building: any) {
		let arrayRooms = [];
		if (tableNode.tagName === "tbody") {
			// trNode IS a ROOM data
			for(let trNode of tableNode.childNodes) {
				if (trNode.tagName === "tr") {
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
		for (let td of trNode.childNodes) {
			if (td.nodeName === "td") {
				if (td.attrs[0].value === "views-field views-field-field-room-number") {
					number = td.childNodes[1].childNodes[0].value.trim();
					href = td.childNodes[1].attrs[0].value.trim();
				} else if (td.attrs[0].value === "views-field views-field-field-room-capacity") {
					seats = td.childNodes[0].value.trim();
				} else if (td.attrs[0].value === "views-field views-field-field-room-furniture") {
					furniture = td.childNodes[0].value.trim();
				} else if (td.attrs[0].value === "views-field views-field-field-room-type") {
					type = td.childNodes[0].value.trim();
				}
			}
		}
		if (shortname && number) {
			name = shortname + "_" + number;
		}

		if(fullname && shortname &&
			name && address && lat && lon) {
			room = new Room(fullname, shortname, number, name, address, lat, lon, seats, type, furniture, href);
		}
		return room;
	}

	private static getBuildingFiles(buildingsArray: any[], zipData: any): any {
		let allHTMLStrings: Array<Promise<any>> = [];
		for (let building of buildingsArray) {
			let buildingLink = "rooms/" + building.link.substring(2);
			let zipString = zipData.file(buildingLink).async("string");
			allHTMLStrings.push(zipString);
		}
		return Promise.all(allHTMLStrings);
	}

	private static parseRooms(htmlArray: any[], buildingArray: any[]): any[] {
		let allRooms: any[] = [];
		for (let i: number = 0; i < buildingArray.length; i++) {
			let arrayRooms: any = [];
			let htmlNode = parse5.parse(htmlArray[i]);
			let tableNode = HTMLHandler.findTableRecurs(htmlNode);
			if (tableNode !== null) {
				arrayRooms = HTMLHandler.makeRoomsIterative(tableNode, buildingArray[i]);
			}
			for (let room of arrayRooms) {
				allRooms.push(room);
			}
		}
		return allRooms;
	}
}



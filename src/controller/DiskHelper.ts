import Course from "./Course";
import * as fs from "fs";
import {InsightError, NotFoundError} from "./IInsightFacade";
import InsightFacade from "./InsightFacade";

export default class DiskHelper {

	public static saveToDisk(id: string, courses: Course[], data: InsightFacade): any {
		let json = JSON.stringify(courses);
		let dataDir = "./data";
		let idName = dataDir + "/" + id + ".json";

		if (!fs.existsSync(dataDir)){
			fs.mkdirSync(dataDir);
		}

		return new Promise((resolve,reject) => {
			fs.writeFile(idName, json, (error) => {
				if (error) {
					reject(new InsightError("write file error"));
				} else {
					resolve(data.idArray);
				}
			});
		});
	}

	public static deleteFromDisk(id: string): any {
		let dataDir = "./data/" + id + ".json";

		return new Promise((resolve, reject) => {
			if (!fs.existsSync(dataDir)) {
				reject(new NotFoundError("no data to remove"));
			}
			fs.unlink(dataDir, (err) => {
				if (err) {
					reject(new InsightError("remove file error"));
				} else {
					resolve(id);
				}
			});
		});
	}
}

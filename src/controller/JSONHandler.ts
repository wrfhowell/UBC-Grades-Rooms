import InsightFacade from "./InsightFacade";
import JSZip from "jszip";
import Section from "./Section";
import Course from "./Course";
import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";

export default class JSONHandler{

	private static parse(id: string, data: InsightFacade, jsonStrings: string[], courseName: string): any {
		// TODO
		// use JSON.parse() -> return type? ask ta
		// do data processing m key & s key
		let json;
		let courseArray = new Array<Course>();
		let rows = 0;

		for (let jsonString of jsonStrings) {
			try {
				json = JSON.parse(jsonString);
			} catch (error) {
				return null;
			}
			rows++;
			let course = new Course(courseName, json["rank"]);

			if (Object.prototype.hasOwnProperty.call(json,"result")) {
				if(json.result.length > 0) {
					for (let oneSection of json) {
						let section = new Section(oneSection["dept"],
							oneSection["id"],
							oneSection["avg"],
							oneSection["instructor"],
							oneSection["title"],
							oneSection["pass"],
							oneSection["fail"],
							oneSection["audit"],
							oneSection["uuid"]);

						if (oneSection["Section"] === "Overall") {
							section.year = 1900;
						} else {
							section.year = oneSection["year"];
						}
						course.addSection(section);
					}
				}

			}
			courseArray.push(course);
		}
		data.insightData.set(id,courseArray);
		data.addedDatasets.set(id, {id: id, kind: InsightDatasetKind.Courses, numRows: rows} as InsightDataset);

		return 1;
	}
	public static getContent(
		id: string,
		content: string,
		data: InsightFacade,
		resolve: (value: any) => any, reject: (value: any) => any): any {

		let jszip: JSZip = new JSZip();
		let courseName: string;

		jszip.loadAsync(content, {base64: true})
			.then((zip: any) => {
				let jsonStrings: Array<Promise<string>> = [];
				zip.folder("courses")?.forEach( async (relativePath: any, file: any) => {
					jsonStrings.push(file.async("string"));
					courseName = file.name;
				});
				return Promise.all(jsonStrings);
			})
			.then ((jsonStrings: string[]) => {
				// TODO NOW PARSE JSON
				JSONHandler.parse(id, data, jsonStrings, courseName);
			});
	}
}

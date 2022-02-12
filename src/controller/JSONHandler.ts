import InsightFacade from "./InsightFacade";
import JSZip from "jszip";
import Section from "./Section";
import Course from "./Course";
import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import Num from "./Num";

export default class JSONHandler {

	private static parse(id: string, data: InsightFacade, jsonString: string, courseName: string): Promise<Course> {
		let json;


		try {
			json = JSON.parse(jsonString);
		} catch (error) {
			return Promise.reject(null);
		}


		let course = new Course(courseName, json["rank"]);
		// console.log("6");
		if (Object.prototype.hasOwnProperty.call(json,"result")) {
			if(json.result.length > 0) {
				for (let oneSection of json.result) {
					let section = new Section(oneSection["Subject"],
						oneSection["Course"],
						oneSection["Avg"],
						oneSection["Professor"],
						oneSection["Title"],
						oneSection["Pass"],
						oneSection["Fail"],
						oneSection["Audit"],
						oneSection["id"]);

					if (oneSection["Section"] === "Overall") {
						section.year = 1900;
					} else {
						section.year = oneSection["Year"];
					}
					course.addSection(section);
				}
			}
		}


		return Promise.resolve(course);
	}

	// public static getContent(
	// 	id: string,
	// 	content: string,
	// 	data: InsightFacade,
	// 	resolve: (value: any) => any, reject: (value: any) => any): any {
	//
	//
	// 	let jszip: JSZip = new JSZip();
	// 	let courseName: string;
	// 	console.log("2");
	// 	jszip.loadAsync(content, {base64: true})
	// 		.then((zip: any) => {
	// 			console.log("3");
	// 			let jsonStrings: Array<Promise<string>> = [];
	//
	// 			zip.folder("courses")?.forEach( async (relativePath: any, file: any) => {
	//
	// 				jsonStrings.push(file.async("string"));
	// 				courseName = file.name;
	// 			});
	// 			console.log("4");
	// 			return Promise.all(jsonStrings);
	// 		})
	// 		.then ((jsonStrings: string[]) => {
	// 			console.log("5");
	// 			return resolve(JSONHandler.parse(id, data, jsonStrings, courseName));
	// 		})
	// 		.catch((e) => {
	// 			return reject(new InsightError(e));
	// 		});
	// }
	public static getContent(
		id: string,
		content: string,
		data: InsightFacade,
		resolve: (value: any) => any, reject: (value: any) => any): any {

		let jszip: JSZip = new JSZip();
		let courseArray: Course[] = [];
		let courseName: string;
		let numRows: number = 0;


		// console.log("2");

		jszip.loadAsync(content, {base64: true})
			.then((zip: any) => {
				zip.folder("courses")?.forEach(async (relativePath: any, file: any) => {
					courseName = file.name;
					file.async("string")
						.then((jsonString: any) => {
							JSONHandler.parse(id, data, jsonString, courseName).then((course: Course) => {
								// console.log("10");
								if (course !== null) {
									courseArray.push(course);
								}
								numRows = course.sections.length + numRows;
							});
						});
				});
			})
			.then( () => {
				for (let course of courseArray) {
					numRows = course.sections.length + numRows;
				}
				data.insightData.set(id, courseArray);
				data.addedDatasets.push({id: id, kind: InsightDatasetKind.Courses, numRows: numRows} as
					InsightDataset);
				data.idArray.push(id);
				return resolve(data.idArray);
			})
			.catch((e) => {
				return reject(e);
			});
	}
}

import InsightFacade from "./InsightFacade";
import JSZip from "jszip";
import Section from "./Section";
import Course from "./Course";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import {rejects} from "assert";
import DiskHelper from "./DiskHelper";

export default class JSONHandler {

	private static parse(id: string, data: InsightFacade, jsonString: string, courseName: string): any {
		let json;


		try {
			json = JSON.parse(jsonString);
		} catch (error) {
			return null;
		}
		let course = new Course(courseName, json["rank"]);
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
		return course;
	}

	public static getContent(
		id: string,
		content: string,
		data: InsightFacade,
		resolve: (value: any) => any, reject: (value: any) => any): any {

		let jszip: JSZip = new JSZip();
		let courseName: string;
		let numRows: number = 0;

		jszip.loadAsync(content, {base64: true})
			.then((zip: any) => {
				let promiseArray: Array<Promise<any>> = [];
				zip.folder("courses")?.forEach( async (relativePath: any, file: any) => {
					if (file !== null) {
						courseName = file.name;
						let course = JSONHandler.loadFile(file, id, data, courseName);
						promiseArray.push(course);
					}
				});
				return Promise.all(promiseArray);
			})
			.then((courses: Course[]) => {
				courses.filter((oneCourse) => {
					return oneCourse !== null;
				});
				for (let course of courses) {
					numRows = course.sections.length + numRows;
				}
				data.insightData.set(id, courses);
				data.addedDatasets.push({id: id, kind: InsightDatasetKind.Courses, numRows: numRows} as
					InsightDataset);
				data.idArray.push(id);
				if (courses.length > 0) {
					return resolve(DiskHelper.saveToDisk(id, courses, data));
				} else {
					return reject(new InsightError("empty"));
				}
			}).then((c) => {
				return resolve(data.idArray);
			})
			.catch((e) => {
				return reject(new InsightError("invalid zip"));
			});
	}

	public static loadFile(file: any, id: string, data: InsightFacade, courseName: string): Promise<any> {
		return new Promise ((resolve,reject) => {
			if (courseName === null) {
				reject(null);
			} else {
				file.async("string")
					.then((jsonString: any) => {
						let course = JSONHandler.parse(id,data,jsonString, courseName);
						if (course !== null) {
							resolve(course);
						} else {
							resolve(null);
						}
					});
			}
		});
	}
}



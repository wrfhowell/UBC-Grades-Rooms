import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";

import AddDatasetHelper from "./AddDatasetHelper";
import JSONHandler from "./JSONHandler";
import {Validation} from "./Validation";
import {Execution} from "./Execution";
import Course from "./Course";
import DiskHelper from "./DiskHelper";
import Room from "./Room";
import HTMLHandler from "./HTMLHandler";
import {RoomExecution} from "./RoomExecution";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	// key is string containing id, value is array of courses containing sections or rooms?
	public insightData: Map<string, Course[]> = new Map<string, Course[]>();
	public insightDataRooms: Map<string, Room[]> = new Map<string, Room[]>();
	// updated after addDataset adds a dataset - contains ids strings of datasets
	public addedDatasets: InsightDataset[] = [];
	// array of added ids
	public idArray: string[] = [];
	public curDatasetId = "";
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise<string[]>((resolve,reject) => {
			// check if content string is invalid
			if (content === null || content === "" || content === undefined) {
				return reject(new InsightError("invalid content name"));
			}

			// check if id is valid according to spec
			if (!AddDatasetHelper.validIdCheck(id)) {
				return reject(new InsightError("Invalid ID Inputted"));
			}

			// check if id has already been added before
			if (AddDatasetHelper.idAddedAlready(id, this)) {
				return reject(new InsightError("ID already added"));
			}

			if (kind === InsightDatasetKind.Courses) {
				// get content from zip file and parse into dataset
				return JSONHandler.getContent(id, content, this, resolve, reject);
			} else if (kind === InsightDatasetKind.Rooms) {
				return HTMLHandler.getContent(id, content, this, resolve, reject);
			} else {
				return reject(new InsightError("Unknown kind"));
			}


		});
	}

	public removeDataset(id: string): Promise<string> {
		return new Promise((resolve,reject) => {
			// check if id is valid according to spec
			if (!AddDatasetHelper.validIdCheck(id)) {
				return reject(new InsightError("Invalid ID Inputted"));
			}

			// check if id has not been added
			if (!AddDatasetHelper.idAddedAlready(id, this)){
				return reject(new NotFoundError("id Never added"));
			}

			this.insightData.delete(id);
			this.insightDataRooms.delete(id);
			this.idArray.forEach((item, index) => {
				if (item === id){
					this.idArray.splice(index, 1);
				}
			});
			this.addedDatasets.forEach((item, index) => {
				if (item.id === id) {
					this.addedDatasets.splice(index,1);
				}
			});
			DiskHelper.deleteFromDisk(id);
			resolve(id);
		});
	}

	public performQuery(query: any): Promise<InsightResult[]> {
		const y = new Execution();
		const RoomExecutionObject = new RoomExecution();
		if (!("WHERE" in query) || !("OPTIONS" in query) || !("COLUMNS" in query.OPTIONS)) {
			return Promise.reject(new InsightError("No Options or Columns or Where"));
		}
		let datasetIdWithUnderscore = y.ReturnDatasetId(query);
		let datasetId = datasetIdWithUnderscore.substring(0, datasetIdWithUnderscore.indexOf("_"));
		const x = new Validation(datasetId);
		this.curDatasetId = datasetId;
		let datasetCourse = this.insightData.get(datasetId)!;
		let datasetRooms = this.insightDataRooms.get(datasetId)!;
		console.log(this.insightDataRooms);
		console.log(this.insightData);
		if (datasetCourse === undefined && datasetRooms === undefined) {
			return Promise.reject(new InsightError("dataset not added"));
		}
		if (x.Validate(query)) {
			let result: any = [];
			if (datasetCourse !== undefined) {
				result = y.ExecuteOnCourses(query, datasetCourse);
			} else if (datasetRooms !== undefined) {
				result = RoomExecutionObject.ExecuteOnRooms(query, datasetRooms);
			}
			if (result.length > 5000) {
				return Promise.reject(new ResultTooLargeError("too many sections"));
			}
			let resultString = JSON.stringify(result);
			let resultJSON = JSON.parse(resultString);
			return Promise.resolve(resultJSON);
		} else {
			if (!x.Validate(query)) {
				console.log("oops query broken");
			}
		}
		return Promise.reject(new InsightError("Add your error message here"));
	}

	public listDatasets(): Promise<InsightDataset[]> {
		// return Promise.resolve(this.addedDatasets);
		return Promise.resolve(this.addedDatasets);
	}
}

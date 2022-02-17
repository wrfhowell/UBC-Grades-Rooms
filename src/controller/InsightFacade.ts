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


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	// key is string containing id, value is array of courses containing sections or rooms?
	public insightData: Map<string, Course[]> = new Map<string, Course[]>();
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
			// check if id is valid according to spec
			if (!AddDatasetHelper.validIdCheck(id)) {
				return reject(new InsightError("Invalid ID Inputted"));
			}

			// check if id has already been added before
			if (AddDatasetHelper.idAddedAlready(id, this)) {
				return reject(new InsightError("ID already added"));
			}

			// check for right kind (only courses)
			if (kind !== InsightDatasetKind.Courses) {
				return reject(new InsightError("Unknown kind"));
			}

			// check if content string is invalid
			if (content === null || content === "" || content === undefined) {
				return reject(new InsightError("invalid content name"));
			}

			// get content from zip file and parse into dataset
			return JSONHandler.getContent(id, content, this, resolve, reject);
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
			resolve(id);

			// TODO cache removal

		});
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		const y = new Execution();
		let datasetIdWithUnderscore = y.ReturnDatasetId(query);
		let datasetId = datasetIdWithUnderscore.substring(0, datasetIdWithUnderscore.indexOf("_"));
		const x = new Validation(datasetId);
		this.curDatasetId = datasetId;
		let dataset: Course[] = this.insightData.get(datasetId)!;
		if (datasetIdWithUnderscore === false) {
			return Promise.reject(new InsightError("No Options or Columns"));
		}
		if (dataset === undefined) {
			return Promise.reject(new InsightError("dataset not added"));
		}
		if (x.Validate(query)) {
			let result = y.ExecuteOnCourses(query, dataset);
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

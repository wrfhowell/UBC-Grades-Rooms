import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
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
		const x = new Validation();
		const y = new Execution();
		let dataset = new Course("test", 5);
		if (x.Validate(query)) {
			y.Execute(query, dataset);
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

import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult,} from "./IInsightFacade";
import AddDatasetHelper from "./AddDatasetHelper";
import JSONHandler from "./JSONHandler";

import {Validation} from "./Validation";
import {Execution} from "./Execution";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	// key is string containing id, value is array of parse json files into string?
	public insightData: Map<string, any[]> = new Map<string, any[]>();
	// updated after addDataset adds a dataset - contains ids strings of datasets
	public addedDatasets: Map<string, InsightDataset> = new Map<string, InsightDataset>();

	constructor() {
		console.log("InsightFacadeImpl::init()");
	}


	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise<string[]>((resolve,reject) => {
			// check if id is valid according to spec
			if (!AddDatasetHelper.validIdCheck(id)) {
				reject(new InsightError("Invalid ID Inputted"));
			}

			// check if id has already been added before
			if (AddDatasetHelper.idAddedAlready(id,this)) {
				reject(new InsightError("ID already added"));
			}

			// check for right kind (only courses)
			if (kind !== InsightDatasetKind.Courses){
				reject(new InsightError("Unknown kind"));
			}

			// check if content string is invalid
			if (content === null || content === "") {
				reject(new InsightError("invalid content name"));
			}


			// get content from zip file and parse into dataset
			return JSONHandler.getContent(id, content, this, resolve, reject);
		});
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		const x = new Validation();
		const y = new Execution();
		if (x.Validate(query)) {
			y.Execute(query);
		}
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		// return Promise.resolve(this.addedDatasets);
		return Promise.reject("Not implementsd.");
	}
}

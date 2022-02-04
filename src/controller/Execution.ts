import {InsightResult} from "./IInsightFacade";

export class Execution {
	private type = "yes";
	constructor() {
		this.type = "yes";
	}
	public Execute(query: any): Promise<InsightResult[]> {
		let x: InsightResult = {courses: 2};
		return Promise.reject("not implemented");
	}


}

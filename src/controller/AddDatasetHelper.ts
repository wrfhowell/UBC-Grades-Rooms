import InsightFacade from "./InsightFacade";

export default class AddDatasetHelper {
	// check if id is valid
	public static validIdCheck(id: string): boolean {
		if (id === "") {
			return false;
		}
		if (id === null || id === undefined) {
			return false;
		}
		if (id.includes("_")) {
			return false;
		}
		if (id.trim().length === 0) {
			return false;
		}
		return true;
	}

	public static idAddedAlready(id: string, data: InsightFacade): boolean {
		return data.insightData.has(id);
	}
}

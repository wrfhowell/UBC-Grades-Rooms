import {InsightError} from "./IInsightFacade";
import * as http from "http";

export default class GeolocHelper {
	public static getGeoloc(address: any): Promise< {
		lat?: number;
		lon?: number;
		error?: string;
	}> {
		let fullAddress = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team624/" + address;
		return new Promise((resolve, reject) => {
			http.get(fullAddress, (response) => {
				let data = "";
				response.on("data", (chunk) => {
					data += chunk.toString();
				});

				response.on("end", () => {
					resolve(JSON.parse(data));
				});

			}).on("error", (error) => {
				reject(new InsightError("Http request failed"));
			});
		});
	}
}

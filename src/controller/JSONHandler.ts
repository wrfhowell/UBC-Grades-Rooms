import InsightFacade from "./InsightFacade";
import JSZip from "jszip";

export default class JSONHandler{

	public static getContent(id: string,
		content: string,
		data: InsightFacade,
		resolve: (value: any) => any,
		reject: (value: any) => any): any {

		let jszip: JSZip = new JSZip();
		jszip.loadAsync(content, {base64: true})
			.then((zip: any) => {
				let jsonStrings: Array<Promise<string>> = [];
				zip.folder("courses")?.forEach( async (relativePath: any, file: any) => {
					jsonStrings.push(file.async("string"));
				});
				return Promise.all(jsonStrings);
			})
			.then ((jsonStrings: string[]) => {
				// TODO NOW PARSE JSON
				JSONHandler.parse();
			});
	}

	private static parse(): any {
		// TODO
		return 1;
	}
}

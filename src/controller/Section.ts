export default class Section {


	// dept, id, avg, instructor, title, pass, fail, audit, uuid, and year.
	private _dept: string;
	private _id: string;
	private _avg: number;
	private _instructor: string;
	private _title: string;
	private _pass: number;
	private _fail: number;
	private _audit: number;
	private _uuid: string;
	private _year: number;

	public constructor(
		dept: string,
		id: string,
		avg: number,
		instructor: string,
		title: string,
		pass: number,
		fail: number,
		audit: number,
		uuid: string) {
		this._dept = dept;
		this._id = id;
		this._avg = avg;
		this._instructor = instructor;
		this._title = title;
		this._pass = pass;
		this._fail = fail;
		this._audit = audit;
		this._uuid = uuid;
		this._year = 0;
	}

	public get dept(): string {
		return this._dept;
	}

	public get id(): string {
		return this._id;
	}

	public get avg(): number {
		return this._avg;
	}

	public get instructor(): string {
		return this._instructor;
	}

	public get title(): string {
		return this._title;
	}

	public get pass(): number {
		return this._pass;
	}

	public get fail(): number {
		return this._fail;
	}

	public get audit(): number {
		return this._audit;
	}

	public get uuid(): string {
		return this._uuid;
	}

	public get year(): number {
		return this._year;
	}

	public set year(value: number) {
		this._year = value;
	}
}

export default class Building {

	private _fullname: string;
	private _shortname: string;
	private _address: string;
	private _link: string;
	private _lat: number;
	private _lon: number;

	public constructor(fullname: string, shortname: string, address: string, link: string, lat: number, lon: number) {
		this._fullname = fullname;
		this._shortname = shortname;
		this._address = address;
		this._link = link;
		this._lat = lat;
		this._lon = lon;
	}

	public get link(): string {
		return this._link;
	}

	public set link(value: string) {
		this._link = value;
	}

	public get fullname(): string {
		return this._fullname;
	}

	public set fullname(value: string) {
		this._fullname = value;
	}

	public get shortname(): string {
		return this._shortname;
	}

	public set shortname(value: string) {
		this._shortname = value;
	}

	public get address(): string {
		return this._address;
	}

	public set address(value: string) {
		this._address = value;
	}

	public get lat(): number {
		return this._lat;
	}

	public set lat(value: number) {
		this._lat = value;
	}

	public get lon(): number {
		return this._lon;
	}

	public set lon(value: number) {
		this._lon = value;
	}
}

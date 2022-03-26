export default class Room {
	private _fullname: string;
	private _shortname: string;
	private _number: string;
	private _name: string;
	private _address: string;
	private _lat: number;
	private _lon: number;
	private _seats: number;
	private _type: string;
	private _furniture: string;
	private _href: string;



	public constructor(
		fullname: string,
		shortname: string,
		number: string,
		name: string,
		address: string,
		lat: number,
		lon: number,
		seats: number,
		type: string,
		furniture: string,
		href: string) {
		this._fullname = fullname;
		this._shortname = shortname;
		this._number = number;
		this._name = name;
		this._address = address;
		this._lat = lat;
		this._lon = lon;
		this._seats = seats;
		this._type = type;
		this._furniture = furniture;
		this._href = href;
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

	public get number(): string {
		return this._number;
	}

	public set number(value: string) {
		this._number = value;
	}

	public get name(): string {
		return this._name;
	}

	public set name(value: string) {
		this._name = value;
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

	public get seats(): number {
		return this._seats;
	}

	public set seats(value: number) {
		this._seats = value;
	}

	public get type(): string {
		return this._type;
	}

	public set type(value: string) {
		this._type = value;
	}

	public get furniture(): string {
		return this._furniture;
	}

	public set furniture(value: string) {
		this._furniture = value;
	}

	public get href(): string {
		return this._href;
	}

	public set href(value: string) {
		this._href = value;
	}
}

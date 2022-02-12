export default class Num{

	private _number: number;

	public constructor(number: number) {
		this._number = number;
	}

	public get number(): number {
		return this._number;
	}

	public set number(value: number) {
		this._number = value;
	}
}

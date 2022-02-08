import Section from "./Section";

export default class Course{
	public name: string;
	public sections: Section[];
	public rank: number;

	public constructor(courseName: string, rank: number) {
		this.name = courseName;
		this.sections = [];
		this.rank = rank;
	}

	public addSection(section: Section) {
		this.sections.push(section);
	}
}

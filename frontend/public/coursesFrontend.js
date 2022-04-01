document.getElementById("submit").addEventListener("click", getCourseAverage);

let avg;

function getCourseAverage() {
	let dept = document.getElementById("dept").value;
	dept = dept.toLowerCase();
	let course_num = document.getElementById("course_num").value;
	let year = document.getElementById("year").value;
	year = parseInt(year);

	let query = {
		"WHERE": {
			"AND": [
				{
					"IS": {
						"courses_dept":"cpsc"
					}
				},
				{
					"IS": {
						"courses_id":"110"
					}
				},
				{
					"EQ": {
						"courses_year":2014
					}
				}
			]
		},
		"OPTIONS": {
			"COLUMNS": [
				"courses_avg"
			],
			"ORDER": "courses_avg"
		}
	};
	query.WHERE.AND[0].IS.courses_dept = dept;
	query.WHERE.AND[1].IS.courses_id = course_num;
	query.WHERE.AND[2].EQ.courses_year = year;
	let url = "http://localhost:4321/query";
	fetch(url, {
		method: 'POST',
		body: JSON.stringify(query),
		headers: {
			"Content-type": "application/json"
		}
	})
		.then((response) => response.json())
		.then((retData) => {
			getAvgFromJson(retData.results);
		})
		.catch((err) => {
			console.log(err);
		})
}
// let json = {"result":[{"courses_avg":68.9},{"courses_avg":70.83},{"courses_avg":70.9},{"courses_avg":71.07},{"courses_avg":71.09},{"courses_avg":73.13},{"courses_avg":73.56},{"courses_avg":75.81},{"courses_avg":85.11}]}
// getAvgFromJson(json.result);

function getAvgFromJson(json) {
	let total = 0;
	let arr = [json];
	let amount  = arr[0].length
	console.log(amount);
	for (let i = 0; i < amount; i++) {
		let obj = arr[0][i];
		for (let key in obj) {
			total += obj[key];
			console.log(obj[key]);
		}
	}
	avg = total / amount;
	avg = Math.round(avg * 100) / 100;
	setAverage();
}

function setAverage() {
	document.getElementById("avg").textContent = "Average: " + avg + "%";
}

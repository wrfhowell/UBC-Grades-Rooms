// import fs from "fs-extra";

let myArray = [
]

// loadCourseDatasets();
// loadRoomDatasets();
document.getElementById("search").addEventListener("click", searchBuildings);


function loadCourseDatasets() {
	let url = "http://localhost:4321/dataset/:id/:kind"; //??
	let courseFile = getContentFromArchives("courses.zip");
	fetch(url, {
		method: 'PUT',
		body: courseFile,
	}).then(r => {console.log(r)});
}

function loadRoomDatasets() {
	let url = "http://localhost:4321/dataset/:id/:kind"; //??
	let courseFile = getContentFromArchives("rooms.zip");
	fetch(url, {
		method: 'PUT',
		body: courseFile,
	}).then(r => {return});
}

function buildTable(data){
	let table = document.getElementById('myTable')

	for (let i = 0; i < data.length; i++){
		let row = `<tr>
							<td>${data[i].rooms_name}</td>
							<td>${data[i].rooms_furniture}</td>
							<td>${data[i].rooms_address}</td>
					  </tr>`
		table.innerHTML += row


	}
}

function searchBuildings() {
	let data = {
		"WHERE": {
			"IS": {"rooms_fullname": ""}
		},
		"OPTIONS": {
			"COLUMNS": [
				"rooms_name",
				"rooms_furniture",
				"rooms_address"
			],
			"ORDER": {
				"dir": "UP",
				"keys": [
					"rooms_name"
				]
			}
		}
	};
	data.WHERE.IS.rooms_fullname = document.getElementById("buildings").value;
	console.log(document.getElementById("buildings").value);
	console.log(data);
	let url = "http://localhost:4321/query";
	fetch(url, {
		method: 'POST',
		body: JSON.stringify(data),
	})
		.then((response) => response.json())
		.then((retData) => {
			console.log(retData);
			myArray = retData.result;
			buildTable(myArray);
		})
		.catch((err) => {
			console.log(err);
		})
}

// function getContentFromArchives(name){
// 	return fs.readFileSync(`test/resources/archives/${name}`);
// }



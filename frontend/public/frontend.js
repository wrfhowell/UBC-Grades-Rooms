// import fs from "fs-extra";

let myArray = [
]

// loadCourseDatasets();
// loadRoomDatasets();
document.getElementById("search").addEventListener("click", searchBuildings);


// function loadCourseDatasets() {
// 	let url = "http://localhost:4321/dataset/:id/:kind"; //??
// 	let courseFile = getContentFromArchives("courses.zip");
// 	fetch(url, {
// 		method: 'PUT',
// 		body: courseFile,
// 	}).then(r => {console.log(r)});
// }
//
// function loadRoomDatasets() {
// 	let url = "http://localhost:4321/dataset/:id/:kind"; //??
// 	let courseFile = getContentFromArchives("rooms.zip");
// 	fetch(url, {
// 		method: 'PUT',
// 		body: courseFile,
// 	}).then(r => {return});
// }

function buildTable(data){
	let table = document.getElementById('myTable')

	deleteCurrentTable();

	for (let i = 0; i < data.length; i++){
		let row = `<tr>
							<td>${data[i].rooms_name}</td>
							<td>${data[i].rooms_furniture}</td>
							<td>${data[i].rooms_address}</td>
					  </tr>`
		table.innerHTML += row


	}
}

function deleteCurrentTable() {
	document.getElementById("myTable").innerHTML = '';

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
	let url = "http://localhost:4321/query";
	fetch(url, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			"Content-type": "application/json"
		}
	})
		.then((response) => response.json())
		.then((retData) => {
			myArray = retData.results;
			buildTable(myArray);
		})
		.catch((err) => {
			console.log(err);
		})
}

// function getContentFromArchives(name){
// 	return fs.readFileSync(`test/resources/archives/${name}`);
// }



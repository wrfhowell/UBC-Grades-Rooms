let myArray = [
]

buildTable(myArray)



function buildTable(data){
	let table = document.getElementById('myTable')

	for (let i = 0; i < data.length; i++){
		let row = `<tr>
							<td>${data[i].name}</td>
							<td>${data[i].age}</td>
							<td>${data[i].birthdate}</td>
					  </tr>`
		table.innerHTML += row


	}
}

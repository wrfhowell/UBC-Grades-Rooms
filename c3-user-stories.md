## We are going with a Web UI.

## User Story 1
As a UBC Student, I want to make queries for courses within my department and the year of that course to find what the average of all the sections is.


#### Definitions of Done(s)

###### Scenario 1: Valid dataset and query
**Given:** the user has accessed the web UI of our courses database querier, and the courses dataset has already been uploaded to the server, is on the find course average tab.
**When:** The user inputs into the texts field the course department, the course number, and the course year of the course sections they are interested in finding the average for. 
**Then:** The system outputs the average of the sections the user queried for - in the form of text below the text fields. 

###### Scenario 2: Dataset does not contain information about queried course sections
**Given:** the user has accessed the web UI of our courses database querier, and the courses dataset has already been uploaded to the server, is on the find course average tab.
**When:** The user inputs into the texts field the course department, the course number, and the course year of the course sections they are interested in finding the average for, but the dataset does not hold any data with these query paramters. 
**Then:** Text will appears saying "Average: NaN%", to indicate there is no average available.  

## User Story 1
As a UBC Student, I want to make queries for rooms within a specific building to see if their furniture is suitable for the planned event I am organizing.


#### Definitions of Done(s)

###### Scenario 1: Valid dataset and query
**Given:** the user has accessed the web UI of our rooms database querier, and the rooms dataset has already been uploaded to the server. Is on the find rooms tab.
**When:** The user uses a drop down menu to pick a specific building that they want to get rooms information from and hits a search button.
**Then:** The system outputs information about rooms in the building in the form of a table. The table displays room name, room furniture, and room address for each room in that building

###### Scenario 2: Dataset not loaded
**Given:** the user has accessed the web UI of our rooms database querier, and the rooms dataset has not been uploaded to the server. 
**When:** The user chooses a specific building that they want to get rooms information from and hits search.
**Then:** For any building they choose, the results table will be blank (only the headers will be visible for name, furniture, and address)


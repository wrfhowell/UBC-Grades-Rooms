Please edit this template and commit to the master branch for your user stories submission.   
Make sure to follow the *Role, Goal, Benefit* framework for the user stories and the *Given/When/Then* framework for the Definitions of Done! You can also refer to the examples DoDs in [C3 spec](https://sites.google.com/view/ubc-cpsc310-21w2-intro-to-se/project/checkpoint-3).

## We are going with a Web UI.

## User Story 1
As a UBC Student, I want to make queries for courses within my department that have high averages, so that I know which ones to register for my electives.


#### Definitions of Done(s)

###### Scenario 1: Valid dataset and query
Given: the user has accessed the web UI of our courses database querier.  
When: The user selects a valid added dataset, and applies various filters on the dataset (such as filtering for specific departments, years offered, sorting, aggregating etc. from dropdown menus) and hits submit.  
Then: The system outputs the information the user is looking to get as a table.  

###### Scenario 1: No Dataset selected
Given: the user has accessed the web UI of our courses database querier.  
When: The user applies various filters (such as filtering for specific departments, years offered, sorting, aggregating etc. from dropdown menus) and hits submit without selecting a valid added dataset.  
Then: The system rejects the query and outputs an error message, not allowing the user to submit.  

## User Story 2
As a system administrator for this web application, I want to be able to add new Course Datasets to the system, so that students can query against the most updated information.  


#### Definitions of Done(s)
###### Scenario 1: The Dataset added is in JSON format, and is a valid file 
Given: the user has accessed the administor tab of our web UI, and has a valid dataset file stored locally.  
When: the user uploads the valid file into the upload box of our web UI.  
Then: the system loads the valid file into the server followed by a load success message, and now can be accessed by students to perform queries on.  

###### Scenario 2: The Dataset added is not in JSON format, or is an invalid file
Given: the user has accessed the administor tab of our web UI, and has a dataset file stored locally.  
When: the user uploads the invalid file into the upload box of our web UI.  
Then: the system tries to load the invalid file into the server but outputs an error message and prevents the invalid file from being loaded.  

## Others

## User Story 3
As a system administrator for this web application, I want to be able to navigate to a separate page of the website to access add Dataset privileges, so that I can add new Datasets with updated information.  


#### Definitions of Done(s)
###### Scenario 1: The user clicks on the correct link. 
Given: the user navigates to the section of the Web UI that has the link to the admin page.  
When: the user clicks on the link.  
Then: the page changes for the user, allowing for expanded dataset adding capabilities.  



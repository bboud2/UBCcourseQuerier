# DEVELOPMENT TASKS

# PUT

1. Unzip a zip file
1. Decide on a data structure
1. Parse the zip contents into that data structure
1. Save data structure to disk
1. Load data structure into memory

# POST

1. Parse JSON	
1. Find the correct data structure and load it
1. Parse our data structure into a table based on JSON Query
1. Return the table

# DELETE

1. Parse the input to find out which data to delete
2. Delete the correct dataset off of the server

# DIVISION OF LABOR

We're going to attempt to work on everything together, so that no task is done individually. Trial attempt.

# PROGESS LOG

9/25:  Added changes to DataSetController, done by Jordan
		-created Process method to handle .zip files
		-TODO:
			-handle html files
			bug fix

	   Added PUT JSON parser, done by Ben
	    -Handles entire class.json file and creates a course JSON object consisting of multiple sections of that course
	    -TODO:
	    	-Works under debug insepction, requires tests,
	    	-Thouroughly test, and bug fix


	   FOR NEXT TIME:
	   	-go over bugfixes for for PUT
	   	-start on POST


9/27:   Next meet-up time!!

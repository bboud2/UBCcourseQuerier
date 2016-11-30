The UI is designed using the existing frameworks of HTML CSS Javascript and jQuery.

The main page is replaced with a series of 5 buttons, each of which generates a modal (pop-up window) in the middle of the screen:

	 The first button is Add/Remove Dataset which uses the same features as the base model.  It promps the user to enter the name of a dataset, either courses, or rooms and asks them to select a zipFile from their machine.

	 The next 4 buttons are for performing queries on Courses, Rooms, and Instructors (our personal feature).  The modals for these contain an interface for creating QueryRequest objects. At the top is a set of check boxes indicating which fields you want to be displayed in the GET section of the request.  Based on what boxes are checked, this will allow those boxes that are checked to be selected in the ORDER section via a drop down box.  You can also switch from GET mode to GROUP/APPLY mode by clicking a radio button at the top of the modal.  This will replace GET with GROUP and also spawn a text box so the user can enter a custom field for APPLY.  Now, clicking the check boxes will group the results according to what is checked, and when a new APPLY is entered, a drop down is given on which operation you would like to perfrom (COUNT, MAX, MIN, AVG).  The WHERE section is implemented via a plugin called jQuery QueryBuilder.  This allows the user to intuitively select filter paramaters and combine them using AND/OR.

	 The last button is for scheduling courses.  It has two sets of the jQuery QueryBuilder plugin which allows the user to filter which courses they want to schedule into which rooms.

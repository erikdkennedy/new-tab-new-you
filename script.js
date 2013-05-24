$(document).ready(function() {
	/*
	Here is how this code is organized:
		* INITIALIZATION STUFF
		* WIDGET-DRAWING FUNCTIONS - The functions that draw the page based on localStorage data.
		* DATA FUNCTIONS - The CRUD methods that interface with localStorage.  Abstracted beyond individual widgets.
		* LISTENERS - Everything that responds to a click or form submission on the page
		* HELPERS - Functions that are called in different places but don't fit anywhere else
	*/
	
	//to store week that's being viewed currently
	var viewingWeek = moment().day(0).format("M/D/YYYY"); //Sunday of the current week
	
	//initialize widgets from localStorage
	loadSiteKeywords();
	drawWeeklyGoalsList(viewingWeek);	
	drawCarbsTracker();
	
	//set focus to search box
	$("#searchGoogleBox").focus();
	
	
	
	//* * * * * WIDGET-DRAWING FUNCTIONS * * * * * * //
	
	//Site keywords allow you to go to a site without typing in the URL-- this populates the list from localStorage
	function loadSiteKeywords() {
		//clear any children of the #siteKeywords that are already there
		$("#siteKeywords").empty();
		
		//populate #siteKeywords from localStorage
		var siteKeywords = getLocalData("siteKeywords");
		for (key in siteKeywords) {
			var siteName = key;
			var siteUrl = siteKeywords[siteName];
			var siteKeywordAppendage = "<a href='" + siteUrl + "' title='" + siteUrl + "'>" + siteName + "</a> "
				+ "<small>[<a href='#' class='deleteSiteKeyword' id='deleteSiteKeyword-" + siteName + "'>X</a>]</small> | ";
			$("#siteKeywords").append(siteKeywordAppendage);
		}
	}
	
	function drawWeeklyGoalsList(week) {
		//change widget header to current week
		$("#weeklyGoalsWeek").html(viewingWeek);
		
		//clear any goals in #weeklyGoals already
		$("#weeklyGoals").empty();
		
		//populate #weeklyGoals for specified week from localStorage
		var weeklyGoals = getLocalData("weeklyGoals");
		var thisWeeksGoals = weeklyGoals[week];
		
		if (thisWeeksGoals == undefined) { //if there are no goals for the week and never were...
			$("#weeklyGoals").append("<li>There are no weekly goals yet.  Add one below!</li>");
			
		} else if (thisWeeksGoals.length == 0) { //if there were goals for the week but they were all deleted...
			$("#weeklyGoals").append("<li>There are no weekly goals yet.  Add one below!</li>");
			
		} else { //if there are some goals for the week
			var goals = "";
			for (var i=0; i<thisWeeksGoals.length; i++) {
				goals += "<li class='weeklyGoal'>";
				goals += "<label for='checkboxForGoal-" + i + "'>";
				goals += "<input type='checkbox' id='checkboxForGoal-" + i + "'";
				goals += "class='checkboxForGoal' ";
				goals += thisWeeksGoals[i][1] ? "checked='true'" : "";
				goals += "/><span id='goal-" + i + "' class='weeklyGoalText";
				goals += thisWeeksGoals[i][1] ? " goalAccomplished" : "";
				goals += "'>"+ thisWeeksGoals[i][0] + "</span>";
				goals += "</label>";
				goals += " <small>[<a href='#' class='deleteWeeklyGoal' id='deleteWeeklyGoal-" + i + "'>Delete</a>]</small></li>"
			}
			$("#weeklyGoals").append(goals);				
		}
		
		//disable "next" button if this is the current week
		if (viewingWeek == moment().day(0).format("M/D/YYYY")) {
			$("#viewNextWeek").attr("onclick", "")
					.addClass("disabledLink");
		} else {
			$("#viewNextWeek").attr("onclick", "viewNextWeek()")
					.removeClass("disabledLink");
		}
	}
		
	function drawCarbsTracker() {
		//draw carbs chart
		drawCarbsChart();
		
		var date = moment(); //for use in date picker controls		
		
		//populate date picker - months
		var months = "";
		for (i=0; i<12; i++) {
			months += "<option value='" + (i+1) +"'>" + (i+1) + "</option>";
		}
		$("#month").append(months).attr("value", date.month()+1);
		
		//populate date picker - days
		var days = "";
		for (i=0; i<date.daysInMonth(); i++) {
			days += "<option value='" + (i+1) +"'>" + (i+1) + "</option>";
		}
		$("#day").append(days).attr("value", date.date());
		
		//populate date picker - years
		var years = "";
		for (i=2011; i<2022; i++) {
			years += "<option value='" + (i+1) +"'>" + (i+1) + "</option>";
		}
		$("#year").append(years).attr("value", date.year());
	}
	
	//changes the number of days shown in day picker when month or year is changed
	$("#month, #year").change(function() {
		var month = $(this).val();
		console.log("month: " + month);
		var year = $("#year").val();
		var daysInMonth = moment(year + "-" + month, "YYYY-MM").daysInMonth();
		
		//if the currently selected day is more than the number of days in the new month/year combo, bump it down
		var day = $("#day").val() > daysInMonth ? daysInMonth : $("#day").val();
		
		$("#day").empty(); //remove options in #day
		
		//then repopulate #day with the new month's days
		var days = "";
		for (i=0; i<daysInMonth; i++) {
			days += "<option value='" + (i+1) +"'>" + (i+1) + "</option>";
		}
		$("#day").append(days).attr("value", day);
	});
	
	
	
	//* * * * * * * *DATA FUNCTIONS * * * * * * * * //
	
	function getLocalData(objName) {
		//objNames so far include "siteKeywords", "carbs", and "weeklyGoals"
		if (localStorage[objName] == undefined) {
			localStorage[objName] = "{}";
		} else {
			return JSON.parse(localStorage[objName])
		}
	}
	
	//sets a localStorage object (identified by objName) to a dictionary dict
	function setLocalData(objName, dict) {
		localStorage[objName] = JSON.stringify(dict);
	}
	
	//add a key-value pair (appendage) to one of the localStorage dictionaries (identified by objName)
	//appendance should be a table with a single key and a single value
	function appendLocalData(objName, appendage) {
		//possible types are the same as listed for getLocalData(objName)
		if (localStorage[objName] != undefined) {
			var dict = getLocalData(objName);
			dict[appendage[0]] = appendage[1];
			setLocalData(objName, dict);
		} else {
			alert("You're attempting to store data somewhere that can't be found.  There's an error.")
		}
	}
			
	//localStorage has an object for every type of data we're storing.  First parameter is the object name
	//second parameter is the key
	//third parameter is optional-- if the value at that key is an array, this is the index of the array
	function deleteLocalData(objName, key, index) {
		var dict = getLocalData(objName);
		if (index === undefined) {
			delete(dict[key])
		} else {
			dict[key].splice(index, index+1);
		} 
		setLocalData(objName, dict);
	}
	
		
	
	//* * * * * * * * * LISTENERS * * * * * * * * * //
	
	//SEARCH GOOGLE
	//searches Google for whatever's in #searchGoogle input box
	$("#searchGoogle").submit(function() {
		var searchText = $("#searchGoogleBox").attr("value");
		
		//if searchText is a site keyword, go directly to the site URL
		var keywords = getLocalData("siteKeywords");
		if (keywords[searchText] != undefined) {
			window.location.href = keywords[searchText];
			return false;
			
		} else if (searchText.split(" ").length == 1 && searchText.indexOf(".") >= 0) {
			//if searchText is a URL (one word, contains a period)
			window.location.href = "http://" + searchText;
			
		} else {
			//if searchText is not a keyword, search it on Google
			window.location.href = "http://www.google.com/search?q=" + searchText;
		}
		
		return false; //so form is not actually submitted
	});
	
	//ADD SITE KEYWORD
	//adds a site keyword that you can go to by typing into the "Search Google" textbox
	$("#addSiteKeyword").click(function() {
		var defaultSiteUrl = "http://";
		var siteUrl = "", siteName = "";
		
		//prompt for site URL
		siteUrl = prompt("What URL do you want to be able to access directly? (e.g. http://facebook.com)", defaultSiteUrl);
		
		//if user filled our URL, prompt for site name
		if (siteUrl != "" && siteUrl != defaultSiteUrl) {
			siteName = prompt("What should you call the link to go there? (e.g. 'facebook')");
			
			//if both prompt boxes are filled out...
			if (siteName.length>0) {
				appendLocalData("siteKeywords", [siteName, siteUrl])
			
				//now refresh the list of site keywords
				loadSiteKeywords();
			}
		}
	});
	
	//DELETE SITE KEYWORD
	$(".deleteSiteKeyword").live("click", function() {
		//get side name (part of element ID after the first dash)
		var siteName = this.id.substring(this.id.indexOf("-")+1);
		
		//remove site keyword from localStorage
		deleteLocalData("siteKeywords", siteName);
		
		//now refresh the list of site keywords
		loadSiteKeywords();
	});
	
	//CHECK OR UNCHECK WEEKLY GOAL
	//checking or unchecking a weekly goal as completed
	$(".checkboxForGoal").live("click", function() {
		var goalIndex = this.id.substring(this.id.indexOf("-")+1);
		
		//switch completed bit in weeklyGoals
		var weeklyGoals = getLocalData("weeklyGoals");
		weeklyGoals[viewingWeek][goalIndex][1] = !weeklyGoals[viewingWeek][goalIndex][1];
		
		//change HTML class of goal text to cross it off if accomplished
		var classString = weeklyGoals[viewingWeek][goalIndex][1] ? "weeklyGoalText goalAccomplished" : "weeklyGoalText";
		$("#goal-" + goalIndex).attr("class", classString);
		
		//save back localStorage goals data
		setLocalData("weeklyGoals", weeklyGoals);
	});
	
	//DELETE WEEKLY GOAL
	$(".deleteWeeklyGoal").live("click", function() {
		//get goalIndex (part of ID after the first dash)
		var goalIndex = this.id.substring(this.id.indexOf("-")+1);
		
		//remove particular goal from localStorage of particular week (viewingWeek)
		deleteLocalData("weeklyGoals", viewingWeek, goalIndex);
		
		//now redraw the list of goals-- without the deleted goal this time
		drawWeeklyGoalsList(viewingWeek);
	});
	
	//CREATE WEEKLY GOAL
	//Create new weekly goal based on what's in the #newWeeklyGoalBox text box
	$("#newWeeklyGoal").submit(function() {			
		//set the initial variables defining the goal
		var goal = $("#newWeeklyGoalBox").attr("value");
		var dateString = viewingWeek;
		var isAccomplished = false;
		
		//Ensure textbox is filled in
		if (goal.length == 0) {
			alert("Enter a goal to add.");
			return;
		}
		
		//Save data
		var weeklyGoals = getLocalData("weeklyGoals");
		if (weeklyGoals[dateString] == undefined) {
			//no goals for that week yet
			weeklyGoals[dateString] = [[goal, isAccomplished]];
		} else {
			weeklyGoals[dateString].push([goal, isAccomplished]);
		}
		setLocalData("weeklyGoals", weeklyGoals);
		
		//now redraw list of viewingWeek's goals
		drawWeeklyGoalsList(viewingWeek);
		
		//Empty textbox
		$("#newWeeklyGoalBox").attr("value", "");
		
		return false; //so form submit doesn't trigger anything
	});
	
	//VIEW PREVIOUS WEEK'S GOALS
	$("#viewPrevWeek").click(function() {
		viewingWeek = moment(viewingWeek).subtract("days", 7).format("M/D/YYYY");
		drawWeeklyGoalsList(viewingWeek);
	});
	
	//VIEW NEXT WEEK'S GOALS
	$("#viewNextWeek").click(function() {
		viewingWeek = moment(viewingWeek).add("days", 7).format("M/D/YYYY");
		drawWeeklyGoalsList(viewingWeek);
	});
	
	//ADD NEW CARBS DATA
	$("#newCarbsData").submit(function() {
		var userInput = $("#carbsTextBox").attr("value");
		if (isNaN(parseInt(userInput))) {
			alert("Must enter an integer.")
			return
		} else {
			var selectedDate = $("#month").attr("value") + "/" + $("#day").attr("value") + "/" + $("#year").attr("value");
			//if entered date is real
			if (moment(selectedDate).isValid()) {
				//add date-carbs pair to localStorage
				appendLocalData("carbs", [selectedDate, parseInt(userInput)]);
									
				//refresh #carbsChart with new data
				drawCarbsChart();
									
			} else { //if entered date is NOT real...
				alert("Must enter a valid date.");
			}
		}
	});
	
		
	
	//* * * * * * * * * * HELPERS * * * * * * * * * //
	
	function drawCarbsChart() {
		var carbsDict = getLocalData("carbs");
		
		//Grab lifetime data; calculate average
		var lifetimeAverage = calculateAverageOfValues(carbsDict);
		
		//Narrow data to last two weeks; calculate that average
		var fortnightCarbsDict = {};
		for (i=-14; i<1; i++) {
			var date = moment().add("days",i).format("M/D/YYYY");
			fortnightCarbsDict[date] = carbsDict[date];
		}
		var fortnightAverage = calculateAverageOfValues(fortnightCarbsDict);
		
		//Draw line chart
		drawLineChart($("#carbsChart"), fortnightCarbsDict);
		
		//write averages
		var c = $("#carbsChart")[0].getContext("2d");
		var yPos = 14;
		c.font = "14px Helvetica, Arial, sans-serif";
		c.fillStyle = "#666";
		c.textAlign = "end";
		var canvasWidth = $("#carbsChart").attr("width");
		var canvasHeight = $("#carbsChart").attr("height");
		c.fillText("2-WEEK", canvasWidth - 5, yPos);
		c.fillText("LIFETIME", canvasWidth - 5, yPos+40);
		c.font = "bold 21px Helvetica";
		c.fillText(fortnightAverage,canvasWidth - 5, yPos+20);
		c.fillText(lifetimeAverage, canvasWidth - 5, yPos+60);
		
		//empty carbs textbox
		$("#carbsTextBox").attr("value", "");
	}
	
	function calculateAverageOfValues(dict) {
		var total = 0;
		var count = 0;

		//cycle through days
		for (key in dict) {
			//if a day has carbs entered for it...
			if (dict[key] != undefined) {
				total += dict[key];
				count += 1;
			}
		}
		//return average carbs per day over dict's timeframe
		return (total/count).toFixed(2);
	}
});
var apiKey ="65a7ca57e07ca382d1467087756ebdfd";
var previousPlaces = [];
var currentLocation;


function start() {
    previousPlaces = JSON.parse(localStorage.getItem("weatherLocations"));
}

function showPrevious() {

    if (previousPlaces) {
        $("#previousSearches").empty();
        var cityCard = $("<div>").attr("class", "list-group");

        for (var i = 0; i < previousPlaces.length; i++) {
            var newCard = $("<a>").attr("href", "#").attr("id", "loc-btn").text(previousPlaces[i]);
            if (previousPlaces[i] == currentLocation){
                newCard.attr("class", "list-group-item list-group-item-action active");
            }
            else {
                newCard.attr("class", "list-group-item list-group-item-action");
            }
            cityCard.prepend(newCard);
        }

        $("#previousSearches").append(cityCard);
    }
}

function getCity(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + apiKey + "&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function (){
            previousPlaces.splice(previousPlaces.indexOf(city), 1);
            localStorage.setItem("weatherLocations", JSON.stringify(previousPlaces));
            start();
        }
    }).then(function (response) {
        // creating the card
        var currentCard = $("<div>").attr("class", "card bg-light");
        $("#forecast").append(currentCard);

        var currentCardHead = $("<div>").attr("class", "card-header").text("Current weather for " + response.name);
        currentCard.append(currentCardHead);

        var cardRow = $("<div>").attr("class", "row no-gutters");
        currentCard.append(cardRow);


        var textDiv = $("<div>").attr("class", "col-md-8");
        var cardBody = $("<div>").attr("class", "card-body");
        textDiv.append(cardBody);
        cardBody.append($("<h3>").attr("class", "card-title").text(response.name));

        var currentDate = moment(response.dt, "X").format("dddd, MMMM Do YYYY, h:mm a");

        cardBody.append($("<p>").attr("class", "card-text").append($("<small>").attr("class", "text-muted").text("Last updated: " + currentDate)));

        cardBody.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp + " &#8457;"));

        cardBody.append($("<p>").attr("class", "card-text").text("Humidity: " + response.main.humidity + "%"));

        cardBody.append($("<p>").attr("class", "card-text").text("Wind Speed: " + response.wind.speed + " MPH"));

        var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function (response) {
            var uvindex = response.value;

            var uvBackgroundColor;
            if (uvindex <= 3) {
                uvBackgroundColor = "green";
            }
            else if (uvindex >= 3 || uvindex <= 6) {
                uvBackgroundColor = "yellow";
            }
            else if (uvindex >= 6 || uvindex <= 8) {
                uvBackgroundColor = "orange";
            }
            else {
                uvBackgroundColor = "red";
            }
            var uvStuff = $("<p>").attr("class", "card-text").text("UV Index: ");
            uvStuff.append($("<span>").attr("class", "uvindex").attr("style", ("background-color:" + uvBackgroundColor)).text(uvindex));
            cardBody.append(uvStuff);

        });

        cardRow.append(textDiv);
        getForecast(response.id);
    });
}

function getForecast(city) {
    
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=" + apiKey + "&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        var newrow = $("<div>").attr("class", "forecast");
        $("#forecast").append(newrow);


        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                var newCol = $("<div>").attr("class", "SmallCards");
                newrow.append(newCol);

                var newCard = $("<div>").attr("class", "card text-white bg-purple");
                newCol.append(newCard);

                var cardHead = $("<div>").attr("class", "card-header bg-purple").text(moment(response.list[i].dt, "X").format("MMM Do"));
                newCard.append(cardHead);

                var bodyDiv = $("<div>").attr("class", "card-body");
                newCard.append(bodyDiv);

                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"));
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));
            }
        }
    });
}

function clear() {
    $("#forecast").empty();
}

function saveLocation(place){
    if (previousPlaces === null) {
        previousPlaces = [place];
    }
    else if (previousPlaces.indexOf(place) === -1) {
        previousPlaces.push(place);
    }
    localStorage.setItem("weatherLocations", JSON.stringify(previousPlaces));
    showPrevious();
}

$("#searchButton").on("click", function () {
    event.preventDefault();
    var location = $("#searchCity").val().trim();
    if (location !== "") {
        clear();
        currentLocation = location;
        saveLocation(location);
        $("#searchCity").val("");
        getCity(location);
    }
});

$(document).on("click", "#loc-btn", function () {
    clear();
    currentLocation = $(this).text();
    showPrevious();
    getCity(currentLocation);
});

start();
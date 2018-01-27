GOOGLE_KEY = "AIzaSyD2qgiiv8Ajhq_i8Yt9Et7ruQJ9ssuVjZY";
CURRENT_TWEET = "";

// Refresh Button
$(document).on("click", "#refresh-button", function () {
    // Prevent the usual navigation behavior
    event.preventDefault();

    // Get current location
    $.post("https://www.googleapis.com/geolocation/v1/geolocate?key=" + GOOGLE_KEY,
        function (response) {
            lat = response.location.lat;
            lng = response.location.lng;
            units = "metric";
            cnt = 30;

            api_url = "API QUERY GOES HERE";

            $.getJSON(api_url,
                function (data) {
                    // Process response from twitter API call
                    tweets = data.list;
                    // Clear list of existing tweets
                    $('#tweet-list li').remove();
                    // Populate list with fresh tweets
                    $.each(tweets, function (index, tweet) {
                        $('#tweet-list').append(
                            '<li data-id=' + index + '><a id="tweet-details-link" href="#">' + tweet.author +
                            '</a></li>');
                    });
                    // Refresh list content
                    $('#tweet-list').listview('refresh');
                })
        })
});

$(document).on('pagebeforeshow', '#index-page', function () {
    $(document).on('click', '#tweet-details-link', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        // Store the id of the tweet that was clicked
        CURRENT_TWEET = tweets[e.target.parentElement.dataset["id"]];

        // Navigate to details page
        $.mobile.changePage("#tweet-details-page");
    })
});

$(document).on('pagebeforeshow', '#tweet-details-page', function (e) {
    e.preventDefault();
    $('#tweet-text').text("If you don't have time to do it right, where are you going to find the time to do it over?");
    $('#tweet-author').text("Mr. Robot");
});

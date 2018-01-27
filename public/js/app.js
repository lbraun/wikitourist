GOOGLE_KEY = "AIzaSyD2qgiiv8Ajhq_i8Yt9Et7ruQJ9ssuVjZY";
CURRENT_ARTICLE = "";

function refreshIndex() {
    // Get current location
    $.post("https://www.googleapis.com/geolocation/v1/geolocate?key=" + GOOGLE_KEY, function (response) {
        var lat = response.location.lat;
        var lng = response.location.lng;
        var radius = 10000;

        var api_params = $.param({
            format: "json",
            action: "query",
            generator: "geosearch",
            ggsradius: radius,
            ggscoord: `${lat}|${lng}`,
            prop: "coordinates|pageimages|pageterms",
            piprop: "thumbnail",
            pithumbsize: "250",
            pilimit: "50",
            wbptterms: "description",
        });
        var api_url = "https://en.wikipedia.org/w/api.php?callback=?&" + api_params;
        console.log(api_url);

        $.getJSON(api_url, function (data) {
            // Process response from wikipedia API call
            articles = data.query.pages;
            // Clear list of existing articles
            $('#article-list li').remove();
            // Populate list with fresh articles
            console.log(articles);
            $.each(articles, function (index, article) {
                $('#article-list').append(
                    '<li data-id=' + index + '>' +
                    '<a id="article-details-link" href="#">' + article.title +
                    // '<span class="ui-li-count">' + Math.round(article.dist/100)/10 + ' km</span>' +
                    '</a></li>');
            });
            // Refresh list content
            $('#article-list').listview('refresh');
        })
    })
}

$(document).ready(function () {
    refreshIndex();
});

// Refresh Button
$(document).on("click", "#refresh-button", function () {
    // Prevent the usual navigation behavior
    event.preventDefault();

    refreshIndex();
});

$(document).on('pagebeforeshow', '#index-page', function () {
    $(document).on('click', '#article-details-link', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        // Store the id of the article that was clicked
        CURRENT_ARTICLE = articles[e.target.parentElement.dataset["id"]];

        // Navigate to details page
        $.mobile.changePage("#article-details-page");
    });
});

$(document).on('pagebeforeshow', '#article-details-page', function (e) {
    e.preventDefault();
    console.log(CURRENT_ARTICLE)
    $('#article-image').attr('src', CURRENT_ARTICLE.thumbnail.source);
    $('#article-title').text(CURRENT_ARTICLE.title);
    $('#article-description').text(CURRENT_ARTICLE.terms.description);
    var article_text = "If you don't have time to do it right, where are you going to find the time to do it over?";
    $('#article-text').text(article_text);
    $('#article-link').attr('href', 'https://en.wikipedia.org/wiki/' + CURRENT_ARTICLE.title);
});

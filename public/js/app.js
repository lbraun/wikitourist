var GOOGLE_KEY = "AIzaSyD2qgiiv8Ajhq_i8Yt9Et7ruQJ9ssuVjZY";
var CURRENT_ARTICLE = "";
var ARTICLES = [];

// Initialize position with Castellon's coordinates
var LAT = 39.98305556;
var LNG = -0.03305556;

function refreshIndex() {
    // Get current location
    $.post("https://www.googleapis.com/geolocation/v1/geolocate?key=" + GOOGLE_KEY, function (response) {
        LAT = response.location.lat;
        LNG = response.location.lng;
        var radius = 10000;

        var api_params = $.param({
            format: "json",
            action: "query",
            generator: "geosearch",
            ggsradius: radius,
            ggscoord: `${LAT}|${LNG}`,
            prop: "coordinates|pageimages|pageterms",
            piprop: "thumbnail",
            pithumbsize: "250",
            pilimit: "50",
            wbptterms: "description",
        });
        var api_url = "https://en.wikipedia.org/w/api.php?callback=?&" + api_params;

        $.getJSON(api_url, function (data) {
            // Process response from wikipedia API call
            articles = data.query.pages;

            // Clear list of existing articles
            $('#article-list li').remove();

            // Populate list with fresh articles
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

// Refresh button
$(document).on("click", "#refresh-button", function () {
    // Prevent the usual navigation behavior
    event.preventDefault();
    refreshIndex();
});

$(document).on('pagebeforeshow', '#index-page', function () {
    // Map button
    $(document).on('click', '#map-button', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        // Store the current list of articles
        ARTICLES = articles;

        // Navigate to details page
        $.mobile.changePage("#map-page");
    });

    // Article links
    $(document).on('click', '#article-details-link', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        // Store the id of the article that was clicked
        CURRENT_ARTICLE = articles[e.target.parentElement.dataset["id"]];

        // Navigate to details page
        $.mobile.changePage("#article-details-page");
    });
});

$(document).on('pagebeforeshow', '#article-details-page', function(e) {
    e.preventDefault();

    // Fill in article details
    if (CURRENT_ARTICLE.thumbnail) {
        $('#article-image').attr('src', CURRENT_ARTICLE.thumbnail.source);
    }
    $('#article-title').text(CURRENT_ARTICLE.title);
    if (CURRENT_ARTICLE.terms) {
        $('#article-description').text(CURRENT_ARTICLE.terms.description);
    }
    $('#article-link').attr('href', 'https://en.wikipedia.org/wiki/' + CURRENT_ARTICLE.title);
});

/*
 * Google Maps documentation: http://code.google.com/apis/maps/documentation/javascript/basics.html
 * Geolocation documentation: http://dev.w3.org/geo/api/spec-source.html
 */
$(document).on('pagebeforeshow', '#map-page', function() {
    drawMap(new google.maps.LatLng(LAT, LNG));

    function drawMap(latlng) {
        var myOptions = {
            zoom: 12,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);

        // Add markers for nearby wiki articles
        jQuery.each(ARTICLES, function(index, article) {
            var lat = article.coordinates[0].lat;
            var lng = article.coordinates[0].lon;
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: map,
                title: article.title
            });
        });

        google.maps.event.addListenerOnce(map, 'idle', function(){
            // Resize and center map when page is loaded
            google.maps.event.trigger(map, 'resize');
            map.setCenter(latlng);
        });
    };
});

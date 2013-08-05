jQuery(document).ready(function() {
    var metadata = jQuery('#metadata');
    var modulePath =  metadata.data('modulepath');
    var project = metadata.data('project');
    var editable = metadata.data('editable');
    var eventSummary = getTemplate("eventTimelineSummary");
    var timelineData = {
        "timeline":
        {
            "headline":"Timeline of Events" + (project? " for " + project : ""),
            "type":"default",
            "date": [],
            "era": []
        }
    };
    function formatDate(dateString){
        // remove c. from the front of the date string in case of circa
        if (dateString.indexOf("c.") == 0){
            dateString = dateString.substring(2, dateString.length);
        }
        // if it's just a year, return the year
        if (jQuery.isNumeric(dateString)){
            return dateString;
        }
        // otherwise try to parse the date
        try {
            var eventDate = new Date(Date.parse(dateString));
            if (eventDate instanceof Date){
                // format date according to timelinejs requirement
                return eventDate.getFullYear() + "," + (eventDate.getMonth()+1) + "," + eventDate.getDate();
            }
        } catch(e){
            // ignore date parsing error
            return dateString;
        }
    };
    jQuery.ajax({
        type: 'GET',
        url: '/' + modulePath + '/api/events/' + (project? "?project=" + project : ""),
        dataType: "json",
        headers: {
            'Accept': 'application/json'
        },
        success: function(result){
            jQuery(result.results).each(function(i,e){
                e.modulePrefix = 'repository';
                e.hasEditPermission = editable;
                if (project){
                    e.projParam = "?project=" + project;
                }
                var eventData = {
                    headline: e.description + (e.eventType? " (" + e.eventType  + ")": ""),
                    text: eventSummary(e)
                };
                if (e.startDate){
                    eventData.startDate=formatDate(e.startDate);
                }
                if (e.endDate) {
                    eventData.endDate=formatDate(e.endDate);
                }
                timelineData.timeline.date.push(eventData);
            });
            createStoryJS({
                type:       'timeline',
                height:     '400',
                source:     timelineData,
                embed_id:   'canvas'
            });
        }
    });

});
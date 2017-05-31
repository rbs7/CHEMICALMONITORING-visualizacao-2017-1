    <--

    const width = 600;
    const height = 800;
    const margin = {top: 50, right: 50, bottom: 50, left: 50};

    $.ajax({
        url: "sensor_data.csv",
        async: false,
        success: function (csv) {
            data = $.csv.toArrays(csv);
        },
        dataType: "text",
        complete: function () {
            // call a function on complete
        }
    });
    
    debugger;
    
    -->

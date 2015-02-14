/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

$(document).ready(function() {
console.log("requesting TMs");
    updateTaskManagers(); // first call
	setInterval(updateTaskManagers, 5000); // schedule periodic calls.
});

function convertHex(hex,opacity){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
    return result;
}

function getUnixTime() {
	return Math.floor(new Date().getTime()/1000);
}

// this array contains the history metrics for the taskManagers.
var taskManagerMemory = [];

// array with the graphs for each taskManager.
var taskManagerGraph = [];

// values for the memory charting. In order!
var memoryValues = ["memory.non-heap.used" , "memory.flink.used", "memory.heap.used" ];

/**
Create rickshaw graph for the specified taskManager id (tmid).
**/
function createGraph(tmId, maxload, maxmem) {
console.log("creating graph");
    var palette = new Rickshaw.Color.Palette({scheme: "spectrum14"} );
    var series = [];
    var scales = [];
    scales.push(d3.scale.linear().domain([1, maxmem]).nice());
    scales.push(d3.scale.linear().domain([0, maxload]).nice());
    for(i in memoryValues) {
        var value = memoryValues[i];
        taskManagerMemory[tmId][value] = [];
        series.push({
            color: convertHex(palette.color(), 90),
            data: taskManagerMemory[tmId][value],
            name: value,
            scale: scales[0],
            renderer: 'area',
            stroke: 'rgba(0,0,0,0.5)'
        });
    }
    taskManagerMemory[tmId]["load"] = [];
    // add load series
    series.push({
        color: palette.color(),
        scale: scales[1],
        data: taskManagerMemory[tmId]["load"],
        name: "OS Load",
        renderer: 'line',
        //stroke: 'rgba(0,0,0,0.5)'
    });

    var graph = new Rickshaw.Graph( {
        element: document.querySelector("#chart-"+tmId),
        width: 580,
        height: 250,
        series: series,
        renderer: 'multi',
         // renderer: 'line',
        stroke: true
    } );

    var x_axis = new Rickshaw.Graph.Axis.Time( { graph: graph } );

    var y_axis = new Rickshaw.Graph.Axis.Y.Scaled( {
        graph: graph,
        orientation: 'left',
        scale: scales[0],
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        element: document.getElementById("y_axis-"+tmId)
    } );

    var y_axis_load = new Rickshaw.Graph.Axis.Y.Scaled( {
        graph: graph,
        orientation: 'right',
        scale: scales[1],
        grid: false,
        element: document.getElementById("y_axis-load-"+tmId)
    } );

    var hoverDetail = new Rickshaw.Graph.HoverDetail( {
        graph: graph,
        yFormatter: Rickshaw.Fixtures.Number.formatKMBT
    } );

    var legend = new Rickshaw.Graph.Legend({
        graph: graph,
        element: document.querySelector("#legend-"+tmId)
    });

    var tableBox = $("#tm-row-"+tmId+"-memory");

    // make graph resizable
    var resize = function() {
        graph.configure({
            width: tableBox.innerWidth() - $(".y_axis").width() - 75
        });
        graph.render();
    }

    window.addEventListener('resize', resize);
    resize();

    return graph;
}

function drawOrUpdateGCStats(tmId, metrics) {
    var gcs = [];
    for(var key in metrics.gauges) {
        var pat = /gc.([^.]+).(count|time)/
        if(pat.test(key)) {
            var matches = key.match(pat);
            if($.inArray(matches[1], gcs) == -1) {
                gcs.push(matches[1]);
            }
        }
    }

    var html =  "<table class=\"table table-bordered table-hover table-striped\">"+
                "<tr><td>Name</td><td>Count</td><td>Time</td></tr>";
    for(var key in gcs) {
        var gc = gcs[key];
        html += "<tr><td>"+gc+"</td>";
        html += "<td>"+metrics.gauges["gc."+gc+".count"].value+"</td>";
        html += "<td>"+metrics.gauges["gc."+gc+".time"].value+" ms</td></tr>";
    }
    html +="</table>";
    console.log("html",html);
    $("#gcStats-"+tmId).html(html);
}

function getTooltipHTML(txt) {
    return "<i class=\"fa fa-exclamation-circle\" data-toggle=\"tooltip\" data-placement=\"top\" title=\""+txt+"\"></i>";
}
/*
 * Initializes taskmanagers table
 */
function processTMdata(json) {
    var tableHeader = $("#taskmanagerTable-header");

	for (var i = 0; i < json.taskmanagers.length; i++) {
		var tm = json.taskmanagers[i];
		var tmRowIdCssName = "tm-row-"+tm.id;
		var metricsJSON = $.parseJSON(tm.metrics);

		// check if taskManager has a row
		tmRow = $("#"+tmRowIdCssName);
		if(tmRow.length == 0) {
		    var tmMemoryBox = "<div class=\"chart_container\" id=\"chart_container-"+tm.id+"\">"+
                                  "<div class=\"y_axis\" id=\"y_axis-"+tm.id+"\"><p class=\"axis_label\">Memory</p></div>"+
                                  "<div class=\"chart\" id=\"chart-"+tm.id+"\"></div>"+
                                  "<div class=\"y_axis-load\" id=\"y_axis-load-"+tm.id+"\"><p class=\"axis_label\">Load</p></div>"+
                               "</div>"+
                               "<div class=\"legend\" id=\"legend-"+tm.id+"\"></div>";
		    // the taskamanger does not yet have a table row
		    tableHeader.after("<tr id=\""+tmRowIdCssName+"\">" +
		                "<td>"+tm.inetAdress+" <br> IPC Port: "+tm.ipcPort+", Data Port: "+tm.dataPort+"</td>" + // first row: TaskManager
		                "<td id=\""+tmRowIdCssName+"-memory\">"+tmMemoryBox+"</td>" + // second row: memory statistics
		                "<td id=\""+tmRowIdCssName+"-info\"><i>Loading Information</i></td>" + // Information
		                "</tr>");
		    var maxmem = metricsJSON.gauges["memory.total.max"].value
		    taskManagerMemory[tm.id] = []; // create empty array for TM
		    taskManagerGraph[tm.id] = createGraph(tm.id, tm.cpuCores, maxmem); // cpu cores as load approximation
		    taskManagerGraph[tm.id].render();
		}
        // fill (update) row with contents
        // memory statistics
        var time = getUnixTime();
        for(memValIdx in memoryValues) {
            valueKey = memoryValues[memValIdx];

            var flinkMemory = tm.managedMemory * 1000 * 1000;
            switch(valueKey) {
                case "memory.heap.used":
                    var value = metricsJSON.gauges[valueKey].value - flinkMemory;
                    break;
                case "memory.non-heap.used":
                    var value = metricsJSON.gauges[valueKey].value;
                    break;
                case "memory.flink.used":
                    var value = flinkMemory;
                    break;
            }
            taskManagerMemory[tm.id][valueKey].push({x: time, y: value})
        }
        // load
        taskManagerMemory[tm.id]["load"].push({x:time, y:metricsJSON.gauges["load"].value });
        taskManagerGraph[tm.id].update();


        // info box
        tmInfoBox = $("#"+tmRowIdCssName+"-info");
        var slotsInfo = "";
        if(tm.slotsNumber < tm.cpuCores) {
            slotsInfo = getTooltipHTML("The number of configured processing slots ("+tm.slotsNumber+") is lower than the "+
                "number of CPU cores ("+tm.cpuCores+"). For good performance, the number of slots should be at least the number of cores.");
        }
        var memoryInfo = "";
        if(  (tm.managedMemory/tm.physicalMemory) < 0.6 ) {
            memoryInfo = getTooltipHTML("The amout of memory available to Flink ("+tm.managedMemory+" MB) is much lower than "+
                "the physical memory available on the machine ("+tm.physicalMemory+" MB). For good performance, Flink should get as much memory as possible.");
        }
        tmInfoBox.html("Last Heartbeat: "+tm.timeSinceLastHeartbeat+" seconds ago<br>"+
            "Processing Slots: "+tm.freeSlots+"/"+tm.slotsNumber+" "+slotsInfo+"<br>"+
            "Flink Managed Memory: "+tm.managedMemory+" mb "+memoryInfo+"<br>"+
            "CPU cores: "+tm.cpuCores+" <br>"+
            "Physical Memory "+tm.physicalMemory+" mb"+
            "<div id=\"gcStats-"+tm.id+"\"></div>");
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        });
        drawOrUpdateGCStats(tm.id, metricsJSON);
	}
}

function updateTaskManagers() {
	$.ajax({ url : "setupInfo?get=taskmanagers", type : "GET", cache: false, success : function(json) {
		processTMdata(json);
	}, dataType : "json"
	});
}


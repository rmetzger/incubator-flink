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
	setInterval(updateTaskManagers, 5000);
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
	return new Date().getTime()/1000;
}

// this array contains the history metrics for the taskManagers.
var taskManagerMemory = [];

// array with the graphs for each taskManager.
var taskManagerGraph = [];

// values for the memory charting. In order!
var memoryValues = ["memory.total.used", "memory.heap.used", "memory.non-heap.used" ];

/**
Create rickshaw graph for the specified taskManager id (tmid).
**/
function createGraph(tmId) {
}
/*
 * Initializes taskmanagers table
 */
function processTMdata(json) {
    var tableHeader = $("#taskmanagerTable-header");

	for (var i = 0; i < json.taskmanagers.length; i++) {
		var tm = json.taskmanagers[i]
		var tmRowIdCssName = "tm-row-"+tm.id;
		// check if taskManager has a row
		tmRow = $("#"+tmRowIdCssName)
		if(tmRow.length == 0) {
		    var tmMemoryBox = "<div class=\"chart_container\">"+
                                  "<div class=\"y_axis\"></div>"+
                                  "<div class=\"chart\"></div>"+
                               "</div>"+
                               "<div class=\"legend\"></div>";
		    // the taskamanger does not yet have a table row
		    tableHeader.after("<tr id=\""+tmRowIdCssName+"\">" +
		                "<td>"+tm.inetAdress+" <br> IPC Port: "+tm.ipcPort+", Data Port: "+tm.dataPort+"</td>" + // first row: TaskManager
		                "<td id=\""+tmRowIdCssName+"-memory\">"+tmMemoryBox+"</td>" + // second row: memory statistics
		                "<td id=\""+tmRowIdCssName+"-info\"><i>Loading Information</i></td>" + // Information
		                "</tr>");
		    taskManagerMemory[tm.id] = []; // create empty array for TM
		    taskManagerGraph[tm.id] = createGraph(tm.id);
		}
        // fill (update) row with contents
        // memory statistics
        var time = getUnixTime();
        for(i in memoryValues) {
            value = memoryValues[i];
            taskManagerMemory[tm.id][value].push({x: time, y: data.gauges[value].value})
        }


        // info box
        tmInfoBox = $("#"+tmRowIdCssName+"-info")
        tmInfoBox.html("Last Heartbeat: "+tm.timeSinceLastHeartbeat+" seconds ago<br>"+
            "Processing Slots: "+tm.freeSlots+"/"+tm.slotsNumber+"<br>"+
            "Flink Managed Memory: "+tm.managedMemory+" mb<br>"+
            "CPU cores: "+tm.cpuCores+" <br>"+
            "Physical Memory "+tm.physicalMemory+" mb");
	}
}

function updateTaskManagers() {
	$.ajax({ url : "setupInfo?get=taskmanagers", type : "GET", cache: false, success : function(json) {
		processTMdata(json);
	}, dataType : "json",
	});
}


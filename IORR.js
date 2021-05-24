$(document).ready(
    function(){

        var processList = [];

        $('#btnAddProcess').on('click', function(){
            var processID = $('#processID');
            var arrivalTime = $('#arrivalTime');
            var CPUburstTime1 = $('#CPUburstTime1');
	        var IOburstTime = $('#IOburstTime');
	        var CPUburstTime2 = $('#CPUburstTime2');

            if(processID.val() === '' || arrivalTime.val() === '' || CPUburstTime1.val() === '' || IOburstTime.val() === '' || CPUburstTime2.val() === ''){
                processID.addClass('is-invalid');
                arrivalTime.addClass('is-invalid');
                CPUburstTime1.addClass('is-invalid');
		        IOburstTime.addClass('is-invalid');
                CPUburstTime2.addClass('is-invalid');
                return;
            }

            var process = {
                processID: parseInt(processID.val(), 10),
                arrivalTime: parseInt(arrivalTime.val(), 10),
                CPUburstTime1: parseInt(CPUburstTime1.val(), 10),
		        IOburstTime: parseInt(IOburstTime.val(), 10),
		        CPUburstTime2: parseInt(CPUburstTime2.val(), 10)
            }

            processList.push(process);
            
            $('#tblProcessList > tbody:last-child').append(
                `<tr>
                    <td id="tdProcessID">${processID.val()}</td>
                    <td id="tdArrivalTime">${arrivalTime.val()}</td>
                    <td id="tdCPUBurstTime1">${CPUburstTime1.val()}</td>
		            <td id="tdIOBurstTime">${IOburstTime.val()}</td>
		            <td id="tdCPUBurstTime2">${CPUburstTime2.val()}</td>
                </tr>`
            );

            processID.val('');
            arrivalTime.val('');
            CPUburstTime1.val('');
            IOburstTime.val('');
            CPUburstTime2.val('');
        });

        $('#btnCalculate').on('click', function(){

            if (processList.length == 0) {
                alert('Please insert some processes');
                return;
            }
            return roundRobin();
        });


    function roundRobin() {
        var timeQuantum = $('#timeQuantum');
        var timeQuantumVal= parseInt(timeQuantum.val(), 10);
        if(timeQuantum.val() ==''){
            alert('Please enter time quantum');
            timeQuantum.addClass('is-invalid');
            return;
        }
        var completedList = [];
        var time = 0;
        var queue = [];
        
        while (processList.length > 0 || queue.length > 0) {
            addToQueue();
            while (queue.length == 0) {               
                time++;
                addToQueue();
            }
            selectProcessForRR();
        }

        function addToQueue() {
            for(var i = 0; i < processList.length; i++) {
                if(processList[i].arrivalTime === time) {
                    var process = {
                        processID: processList[i].processID, 
                        arrivalTime: processList[i].arrivalTime, 
                        CPUburstTime1: processList[i].CPUburstTime1,
                        IOburstTime: processList[i].IOburstTime,
                        CPUburstTime2: processList[i].CPUburstTime2
                    }
                    processList.splice(i, 1);
                    queue.push(process);
                }
            }
        }
        function selectProcessForRR() {
            if (queue.length!=0) {
                queue.sort(function(a, b){
                    if (a.CPUburstTime1 > b.CPUburstTime1) {
                        return 1;
                    } else {
                        return -1;
                    }
                });
                                            
                if (queue[0].CPUburstTime1 < timeQuantumVal) {
                    process = queue.shift();
                    process.completedTime = time + process.CPUburstTime1;
                        
                    for (var index = 0; index < process.CPUburstTime1; index++) {
                        time++;
                        addToQueue(); 
                    }
                    completedList.push(process);

                }
                else if(queue[0].CPUburstTime1 == timeQuantumVal){
                    process = queue.shift();
                    process.completedTime = time + timeQuantumVal;
                    completedList.push(process);

                    for (var index = 0; index < timeQuantumVal; index++) {
                        time++;
                        addToQueue();   
                    }
                }  
                else if(queue[0].CPUburstTime1 > timeQuantumVal){
                    process = queue[0];
                    queue[0].CPUburstTime1 = process.CPUburstTime1 - timeQuantumVal;

                    for (var index = 0; index < timeQuantumVal; index++) {
                        time++;
                        addToQueue();
                    }
                }   
            }
        }

        // Fetch initial table data
        var TableData = [];
        $('#tblProcessList tr').each(function(row, tr) {
            TableData[row] = {
                "processID": parseInt($(tr).find('td:eq(0)').text()),
                "arrivalTime": parseInt($(tr).find('td:eq(1)').text()),
                "CPUburstTime1": parseInt($(tr).find('td:eq(2)').text()),
                "IOburstTime": parseInt($(tr).find('td:eq(2)').text()),
                "CPUburstTime2": parseInt($(tr).find('td:eq(2)').text())
            }
        });

        // Remove table header row
        TableData.splice(0, 1);
        
        // Reset burst time from original input table.
        TableData.forEach(pInTable => {
            completedList.forEach(pInCompleted => {
                if (pInTable.processID==pInCompleted.processID) {
                    pInCompleted.completedTime = pInTable.CPUburstTime1 + pInTable.IOburstTime + pInTable.CPUburstTime2;
                    pInCompleted.CPUburstTime1= pInTable.CPUburstTime1;
                    pInCompleted.CPUburstTime2= pInTable.CPUburstTime2;
                    pInCompleted.turnAroundTime = pInCompleted.completedTime - pInCompleted.arrivalTime;
                    pInCompleted.waitingTime = pInCompleted.turnAroundTime - pInCompleted.CPUburstTime1 - pInCompleted.CPUburstTime2;
                }
            });
        });

        // Bind table data
        $.each(completedList, function(key, process){
            $('#tblResults > tbody:last-child').append(
                `<tr>
                    <td id="tdProcessID">${process.processID}</td>
                    <td id="tdArrivalTime">${process.arrivalTime}</td>
                    <td id="tdCPUBurstTime1">${process.CPUburstTime1}</td>
                    <td id="tdIOBurstTime">${process.IOburstTime}</td>
                    <td id="tdCPUBurstTime2">${process.CPUburstTime2}</td>
                    <td id="tdCPUBurstTime2">${process.completedTime}</td>
                    <td id="tdCPUBurstTime2">${process.waitingTime}</td>
                    <td id="tdCPUBurstTime2">${process.turnAroundTime}</td>
                </tr>`
            );
        });
            
        // Get average
        var totalTurnaroundTime = 0;
        var totalWaitingTime = 0;
        var maxCompletedTime = 0;

        $.each(completedList, function(key, process){
            if (process.completedTime > maxCompletedTime) {
                maxCompletedTime = process.completedTime;
            }
            totalTurnaroundTime = totalTurnaroundTime + process.turnAroundTime;
            totalWaitingTime = totalWaitingTime + process.waitingTime;
        });

        $('#avgTurnaroundTime').val( totalTurnaroundTime / completedList.length );
        $('#avgWaitingTime').val( totalWaitingTime / completedList.length );
        $('#throughput').val(completedList.length / maxCompletedTime);
        
    }    
}
);
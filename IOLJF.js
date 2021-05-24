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
                return ;
            }
            return longestJobFirst();
        });

        function longestJobFirst(){
            var completedList = [];
            var time = 0;
            var queue = [];

            while (processList.length>0 || queue.length>0) {
                addToQueue();
                while (queue.length==0) {                
                    time++;
                    addToQueue();
                }
                processToRun = selectProcess();
                for (var i = 0; i < processToRun.CPUburstTime1; i++) {
                    time++;
                    addToQueue();
                }
                processToRun.processID = processToRun.processID;
                processToRun.arrivalTime = processToRun.arrivalTime;
                processToRun.CPUburstTime1 = processToRun.CPUburstTime1;
                processToRun.IOburstTime = processToRun.IOburstTime;
                processToRun.CPUburstTime2 = processToRun.CPUburstTime2;
                processToRun.completedTime = processToRun.CPUburstTime1 + processToRun.IOburstTime + processToRun.CPUburstTime2;
                processToRun.turnAroundTime = processToRun.completedTime - processToRun.arrivalTime;
                processToRun.waitingTime = processToRun.turnAroundTime - processToRun.CPUburstTime1 - processToRun.CPUburstTime2;
                completedList.push(processToRun);
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
            function selectProcess() {
                if (queue.length!=0) {
                    queue.sort(function(a, b){
                        if (a.CPUburstTime1 + a.CPUburstTime2 < b.CPUburstTime1 + b.CPUburstTime2) {
                            return 1;
                        } else {
                            return -1;
                        }
                    });
                }
                var process = queue.shift();
                return process;
            }

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
            var avgTurnaroundTime = 0;
            var avgWaitingTime = 0;
            var maxCompletedTime = 0;
            var throughput = 0;

            $.each(completedList, function(key, process){
                if (process.completedTime > maxCompletedTime) {
                    maxCompletedTime = process.completedTime;
                }
                avgTurnaroundTime = avgTurnaroundTime + process.turnAroundTime;
                avgWaitingTime = avgWaitingTime + process.waitingTime;
            });

            $('#avgTurnaroundTime').val( avgTurnaroundTime / completedList.length );
            $('#avgWaitingTime').val( avgWaitingTime / completedList.length );
            $('#throughput').val(completedList.length / maxCompletedTime);
        }
    }
);
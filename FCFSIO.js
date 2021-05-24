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
            console.log(processList);
            
            $('#tblProcessList > tbody:last-child').append(
                `<tr>
                    <td id="tdProcessID">${processID.val()}</td>
                    <td id="tdArrivalTime">${arrivalTime.val()}</td>
                    <td id="tdCPUBurstTime1">${CPUburstTime1.val()}</td>
		            <td id="tdIOBurstTime">${IOburstTime.val()}</td>
		            <td id="tdCPUBurstTime2">${CPUburstTime2.val()}</td>
                </tr>`
            );
            console.log(processList);
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
            return firstComeFirstServed();
        });
	
	
        function firstComeFirstServed(){
            var time = 0;
            var queue = [];
            var completedList = [];
            var IOcompletedList = [];

            while (processList.length > 0 || queue.length > 0) {
                while (queue.length == 0) {
                    time++;
                    addToQueue();
                }

                // Dequeue from queue and run the process.
                process = queue.shift();
                for(var i = 0; i < process.CPUburstTime1; i++){
                    time++;
                    addToQueue();
                }   
                process.completedTime = time-1 + process.IOburstTime;
                completedList.push(process);
                process.IOcompletedTime = comp();
                process.turnAroundTime = process.IOcompletedTime - process.arrivalTime;
                process.waitingTime = process.turnAroundTime - process.CPUburstTime1 - process.CPUburstTime2;
                IOcompletedList.push(process);
                
                
            }
                        
            function comp() {
                for(var i = 0; i < completedList.length; i++){
                    for(var j = 0; j < completedList.length; j++){
              
                        if(completedList[i].completedTime < completedList[j].completedTime - completedList[j].IOburstTime){
                            
                            completedList[i].completedTime = completedList[j].completedTime - completedList[j].IOburstTime + completedList[i].CPUburstTime2;
                            return completedList[i].completedTime;
                        }
                        else{
                            completedList[i].completedTime = completedList[i].completedTime + completedList[i].CPUburstTime2;
                            return completedList[i].completedTime; 
                        }
                    }
                }
            }
        
            function addToQueue() {
                for(var i = 0; i < processList.length; i++) {
                    if(time >= processList[i].arrivalTime) {
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

            // Bind table data
            $.each(IOcompletedList, function(key, process){
                $('#tblResults > tbody:last-child').append(
                    `<tr>
                        <td id="tdProcessID">${process.processID}</td>
                        <td id="tdArrivalTime">${process.arrivalTime}</td>
                        <td id="tdCPUBurstTime1">${process.CPUburstTime1}</td>
                        <td id="tdIOBurstTime">${process.IOburstTime}</td>
                        <td id="tdCPUBurstTime2">${process.CPUburstTime2}</td>
                        <td id="tdCPUBurstTime2">${process.IOcompletedTime}</td>
                        <td id="tdCPUBurstTime2">${process.waitingTime}</td>
                        <td id="tdCPUBurstTime2">${process.turnAroundTime}</td>
                    </tr>`
                );
            });

           // Get average
            var avgTurnaroundTime = 0;
            var avgWaitingTime = 0;
            var maxCompletedTime = 0;

            $.each(IOcompletedList, function(key, process){
                if (process.IOcompletedTime > maxCompletedTime) {
                    maxCompletedTime = process.IOcompletedTime;
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

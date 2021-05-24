$(document).ready(
    function(){

        var processList = [];

        $('#btnAddProcess').on('click', function(){
            var processID = $('#processID');
            var arrivalTime = $('#arrivalTime');
            var burstTime = $('#burstTime');

            if(processID.val() === '' || arrivalTime.val() === '' || burstTime.val() === ''){
                processID.addClass('is-invalid');
                arrivalTime.addClass('is-invalid');
                burstTime.addClass('is-invalid');
                return;
            }

            var process = {
                processID: parseInt(processID.val(), 10),
                arrivalTime: parseInt(arrivalTime.val(), 10),
                burstTime: parseInt(burstTime.val(), 10)
            }

            processList.push(process);
            
            $('#tblProcessList > tbody:last-child').append(
                `<tr>
                    <td id="tdProcessID">${processID.val()}</td>
                    <td id="tdArrivalTime">${arrivalTime.val()}</td>
                    <td id="tdBurstTime">${burstTime.val()}</td>
                </tr>`
            );

            processID.val('');
            arrivalTime.val('');
            burstTime.val('');
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
                for (var i = 0; i < processToRun.burstTime; i++) {
                    time++;
                    addToQueue();
                }
                processToRun.processID = processToRun.processID;
                processToRun.arrivalTime = processToRun.arrivalTime;
                processToRun.burstTime = processToRun.burstTime;
                processToRun.completedTime = time;
                processToRun.turnAroundTime = processToRun.completedTime - processToRun.arrivalTime;
                processToRun.waitingTime = processToRun.turnAroundTime - processToRun.burstTime;
                completedList.push(processToRun);
            }
            function addToQueue() {
                for(var i = 0; i < processList.length; i++) {
                    if(processList[i].arrivalTime === time) {
                        var process = {
                            processID: processList[i].processID, 
                            arrivalTime: processList[i].arrivalTime, 
                            burstTime: processList[i].burstTime
                        }
                        processList.splice(i, 1);
                        queue.push(process);
                    }
                }
            }
            function selectProcess() {
                if (queue.length!=0) {
                    queue.sort(function(a, b){
                        if (a.burstTime < b.burstTime) {
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
                        <td id="tdBurstTime">${process.burstTime}</td>
                        <td id="tdBurstTime">${process.completedTime}</td>
                        <td id="tdBurstTime">${process.waitingTime}</td>
                        <td id="tdBurstTime">${process.turnAroundTime}</td>
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
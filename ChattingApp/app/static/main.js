let chatSocket = io.connect('http://' + document.domain + ':' + location.port + '/chat');
let recordingSocket = io.connect('http://' + document.domain + ':' + location.port + '/recording');
let eventSocket = io.connect('http://' + document.domain + ':' + location.port + '/events');

let startViewingTime = null;
let endViewingTime = null;
let totalViewingTime = 0;
let startSendingTime = null;
let endSendingTime = null;
let totalSendingTime = 0;

let username = null;
let userID = generateUserID(1, 20);

let isTyping = false; // To track user typing status
let userTyping = `
  <div class="message userchattyping">
    <div class="photo" style="background-image: url(./static/user.png);">
      <div class="online"></div>
    </div>
      <div class="chat-bubble">
        <div class="typing">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
  </div>`;
let myTyping = `
  <div class="message text-only mychattyping">
    <div class="response">
      <div class="chat-bubble">
        <div class="typing">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </div>
  </div>`;


// ploting chart
let plotChart;
async function create_chart(values, user_id){
  const ctx = document.getElementById('predicted_sentiment');
  let input_config = {
    type: 'doughnut',
    data: {
      labels: ['Neutral', 'Friendly', 'Aggression'],
      datasets: [{
        label: 'pct:',
        data: [values.neu, values.pos, values.neg],
        borderWidth: 1,
        backgroundColor: [
          'rgb(54, 162, 235)',
          'rgb(84, 219, 52)',
          'rgb(255, 99, 132)'
        ],
        hoverOffset: 4
      }]
    },
    options: {
      plugins:{
        legend: false
      },
      scales: {
        y: { display: false }, 
        x: { display: false }
      }
    }
  };

  if (user_id==userID){
    if(typeof plotChart == 'object'){
      plotChart.destroy();
    }
    try {
      plotChart = new Chart(ctx, input_config);
    } catch(err){
      plotChart.destroy();
      plotChart = new Chart(ctx, input_config);
    }
  }

  document.querySelector("#predValues").innerHTML = `
      Aggression: ${(values.neg * 100).toFixed(2)}%<br>
      Friendly: ${(values.pos * 100).toFixed(2)}%<br>
      Neutral: ${(values.neu * 100).toFixed(2)}%`
}

Swal.fire({
  title: 'Enter username for chat',
  input: 'text',
  inputAttributes: {
    autocapitalize: 'off'
  },
  showCancelButton: true,
  confirmButtonText: 'Enter chat',
  showLoaderOnConfirm: true,
  allowOutsideClick: false
}).then((result) => {
  if (result.isConfirmed) {
    username = result.value;
    $("#userSelectedName").html(username);
    recordingSocket.emit('start_recording', {username: username, userID: userID});
  }
});

// socket start
chatSocket.on('connect', function() {
    console.log('Connected to chat');
});

chatSocket.on('message', function(message) {
    let chatBox = $(".messages-chat")
    let data_ = JSON.parse(message)
    let msgChat;
    if(data_.userID==userID){
      msgChat = `
      <div class="message text-only">
        <div class="response">
          <p class="text"> ${data_.msg}</p>
        </div>
      </div>
      <p class="response-time time"> ${data_.msgTime}</p>`;
    } else {
      msgChat = `
      <div class="message">
        <div class="photo" style="background-image: url(./static/user.png);">
          <div class="online"></div>
        </div>
        <p class="text"> ${data_.msg}</p>
      </div>
      <p class="time"> ${data_.msgTime}</p>`;
    }
    if(data_.pred){
        if(data_.values.predicted == "negative" && data_.userID==userID){
          alertUser("You are typing negative words !");
          $("input#msg").removeClass("abusive");
        }
        create_chart(data_.values, data_.userID);
    }
    chatBox.append(msgChat);
});

// alert user function
function alertUser(text_){
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
  Toast.fire({
    icon: 'error',
    title: text_
  });
}

// Function to handle user typing event
function handleTyping() {
    let messageInput = document.getElementById('msg');
    let message = messageInput.value;
    recordingSocket.emit('current_message', { userID: userID, message: message });
    if (!isTyping) {
        isTyping = true;
        startSendingTime = Date.now();
        eventSocket.emit("start_sending", JSON.stringify({ status: 'sender', startSendingTime: startSendingTime, userID: userID, message: message }));
        if (startViewingTime && !endViewingTime) {
            endViewingTime = Date.now();
            eventSocket.emit('end_viewing', JSON.stringify({
                userID: userID,
                status: 'receiver',
                message: message,
                endViewingTime: endViewingTime,
                totalViewingTime: endViewingTime - startViewingTime
            }));
            startViewingTime = null;
            endViewingTime = null;
            totalViewingTime = 0;
        }
    }
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(function() {
        isTyping = false;
        chatSocket.emit('typing', JSON.stringify({msg:message, isTyping:false, userID:userID}));
    }, 1000);
}

chatSocket.on('user_typing', function(typing) {
    let typingStatus = $(".messages-chat")
    let data_ = JSON.parse(typing)
    if(data_.pred){
        create_chart(data_.values, data_.userID);
        if(data_.values.predicted == "negative" && data_.userID==userID){
          $("input#msg").addClass("abusive");
        } else {
          $("input#msg").removeClass("abusive");
        }
    } else {
      $("input#msg").removeClass("abusive");
    }
    if(data_.isTyping && data_.userID==userID){
      typingStatus.append(myTyping);
    } else if(data_.isTyping==false && data_.userID==userID){
      $(".mychattyping").remove();
    }
    if(data_.isTyping && data_.userID!=userID){
      typingStatus.append(userTyping);
    } else if(data_.isTyping==false && data_.userID!=userID){
      $(".userchattyping").remove();
    }
});

function sendMessage() {
    let messageInput = document.getElementById('msg');
    let message = messageInput.value;
    chatSocket.emit('message', JSON.stringify({msg:message, userID:userID}));
    endSendingTime = Date.now();
    startViewingTime = Date.now();
    eventSocket.emit("start_viewing", JSON.stringify({ status: 'receiver', startViewingTime: startViewingTime, userID: userID, completeMessage: message }));
    eventSocket.emit('end_sending', JSON.stringify({
        userID: userID,
        status: 'sender',
        completeMessage: message,
        endSendingTime: endSendingTime,
        totalSendingTime: endSendingTime - startSendingTime
    }));
    messageInput.value = '';
    isTyping = false;
    startSendingTime = null;
    endSendingTime = null;
    totalSendingTime = 0;
}

// generate user ID
function generateUserID(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

$(window).on('keydown', async function(event){
  if(event.which == 13){
    sendMessage();
    return false;
  }
});

document.getElementById('stop-recording-btn').onclick = function() {
    recordingSocket.emit('stop_recording', {userID: userID});
};
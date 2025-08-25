let chatSocket = io.connect('http://' + document.domain + ':' + location.port + '/chat');
let recordingSocket = io.connect('http://' + document.domain + ':' + location.port + '/recording');
let eventSocket = io.connect('http://' + document.domain + ':' + location.port + '/events');

let startViewingTime = null;
let endViewingTime = null;
let totalViewingTime = 0;
let startSendingTime = null;
let endSendingTime = null;
let totalSendingTime = 0;
let isRecording = true;
let bertEnabled = false;

let username = null;
let userID = generateUserID(1, 20);

let isTyping = false;
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

let langSelect = document.getElementById('translation-lang');
if (langSelect) {
  langSelect.addEventListener('change', () => {
    chatSocket.emit('set_language', JSON.stringify({
      userID: userID,
      language: langSelect.value || ""
    }));
  });
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
    isRecording = true;
    document.getElementById('start-recording-btn').style.display = 'none';
    document.getElementById('stop-recording-btn').style.display = 'block';
  }
});

chatSocket.on('connect', function() {
    console.log('Connected to chat');
});

chatSocket.on('message', function(data) {
  if (data._msg == null) return;
  const chatBox = $(".messages-chat");
  const data_ = JSON.parse(data);
  const currentLang = langSelect ? langSelect.value : "";
  const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const esc = s => (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let translatedLine;
  if (currentLang && data_.translations && data_.translations[currentLang]) {
    translatedLine = `<p class="translation" style="margin:4px 0 0 0;font-size:10px;color:#666;">${esc(data_.translations[currentLang])}</p>`;
  } else {
    translatedLine = `<p class="translation" style="margin:4px 0 0 0;font-size:10px;color:#666;"></p>`;
  }
  let msgChat;
  if (data_.userID == userID) {
    msgChat = `
      <div class="message text-only" id="${msgId}">
        <div class="response">
          <p class="text">${esc(data_.msg)}</p>
          ${translatedLine}
          <p class="response-time time">${esc(data_.msgTime)}</p>
        </div>
      </div>`;
  } else {
    const initials = data_.username ? esc(data_.username.substring(0,2).toUpperCase()) : "??";
    msgChat = `
      <div class="message" id="${msgId}">
        <div class="photo">
          <span class="initials">${initials}</span>
          <div class="online"></div>
        </div>
        <div>
          <p class="text">${esc(data_.msg)}</p>
          ${translatedLine}
          <p class="time">${esc(data_.msgTime)}</p>
        </div>
      </div>`;
  }
  if (bertEnabled && data_.pred && data_.userID == userID) {
    if (data_.values.predicted == "negative") {
      alertUser("You are typing negative words !");
      $("input#msg").removeClass("abusive");
    }
    create_chart(data_.values, data_.userID);
  }
  chatBox.append(msgChat);
  scrollToBottom();
});

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

function handleTyping() {
    let messageInput = document.getElementById('msg');
    let message = messageInput.value;
    if (message == null) return;
    recordingSocket.emit('current_message', { userID: userID, message: message });
    
    if (!isTyping) {
        isTyping = true;
        startSendingTime = new Date().toISOString(); // ✅ ISO format
        
        eventSocket.emit("start_sending", JSON.stringify({ 
            status: 'sender', 
            startSendingTime: startSendingTime, 
            userID: userID, 
            message: message 
        }));
        
        if (startViewingTime && !endViewingTime) {
            endViewingTime = new Date().toISOString(); // ✅ ISO format
            const totalViewing = new Date(endViewingTime) - new Date(startViewingTime);
            
            eventSocket.emit('end_viewing', JSON.stringify({
                userID: userID,
                status: 'receiver',
                message: message,
                endViewingTime: endViewingTime,
                totalViewingTime: totalViewing
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
    if (!bertEnabled) return;
    let typingStatus = $(".messages-chat")
    let data_ = JSON.parse(typing)
    if(data_.pred && data_.userID == userID){
      create_chart(data_.values, data_.userID);
      $("input#msg").removeClass("abusive positive neutral");
      if(data_.values.predicted == "negative") {
          alertUser("You are typing negative words!")
          $("input#msg").addClass("abusive");
      } else if(data_.values.predicted == "positive") {
          $("input#msg").addClass("positive");
      } else if(data_.values.predicted == "neutral") {
          $("input#msg").addClass("neutral");
      }
    } else {
      if(data_.userID == userID) {
          $("input#msg").removeClass("abusive positive neutral");
      }
    }
    if(data_.isTyping && data_.userID==userID){
      typingStatus.append(myTyping);
      scrollToBottom();
    } else if(data_.isTyping==false && data_.userID==userID){
      $(".mychattyping").remove();
    }
    if(data_.isTyping && data_.userID!=userID){
      typingStatus.append(userTyping);
      scrollToBottom();
    } else if(data_.isTyping==false && data_.userID!=userID){
      $(".userchattyping").remove();
    }
});

function sendMessage() {
    let messageInput = document.getElementById('msg');
    let message = messageInput.value;
    
    chatSocket.emit('message', JSON.stringify({
        msg: message, 
        userID: userID, 
        username: username, 
        msgTime: new Date().toLocaleTimeString()
    }));
    
    endSendingTime = new Date().toISOString();
    const totalSending = startSendingTime ? new Date(endSendingTime) - new Date(startSendingTime) : 0;
    
    startViewingTime = new Date().toISOString();
    
    eventSocket.emit("start_viewing", JSON.stringify({ 
        status: 'receiver', 
        startViewingTime: startViewingTime, 
        userID: userID, 
        completeMessage: message 
    }));
    
    eventSocket.emit('end_sending', JSON.stringify({
        userID: userID,
        status: 'sender',
        completeMessage: message,
        endSendingTime: endSendingTime,
        totalSendingTime: totalSending
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

function scrollToBottom() {
  const box = $(".messages-chat");
  if (!box.length) return;
  requestAnimationFrame(() => {
    box.stop(true);
    box.animate({ scrollTop: box[0].scrollHeight }, 250);
  });
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('options-menu');
  const btn = document.getElementById('menu-toggle');
  if (!menu || !btn) return;
  if (btn.contains(e.target)) {
    menu.style.display = (menu.style.display === 'none' || !menu.style.display) ? 'block' : 'none';
  } else if (!menu.contains(e.target)) {
    menu.style.display = 'none';
  }
});

const bertToggle = document.getElementById('toggle-bert');
if (bertToggle) {
  bertToggle.checked = false;
  bertToggle.addEventListener('change', () => {
    bertEnabled = bertToggle.checked;
    document.getElementById('predicted_sentiment').style.display = bertEnabled ? 'block' : 'none';
    document.getElementById('predValues').style.display = bertEnabled ? 'block' : 'none';
    $("input#msg").removeClass("abusive positive neutral");
  });
}

$(window).on('keydown', async function(event){
  if(event.which == 13){
    sendMessage();
    return false;
  }
});

const startRecBtn = document.getElementById('start-recording-menu');
const stopRecBtn  = document.getElementById('stop-recording-menu');
if (startRecBtn && stopRecBtn) {
  startRecBtn.addEventListener('click', () => {
    recordingSocket.emit('start_recording', { username: username, userID: userID });
    isRecording = true;
    startRecBtn.style.display = 'none';
    stopRecBtn.style.display = 'block';
  });
  stopRecBtn.addEventListener('click', () => {
    recordingSocket.emit('stop_recording', { userID: userID });
    isRecording = false;
    stopRecBtn.style.display = 'none';
    startRecBtn.style.display = 'block';
  });
}

recordingSocket.on('recording_started', function(data) {
  isRecording = true;
  if (startRecBtn && stopRecBtn) { startRecBtn.style.display = 'none'; stopRecBtn.style.display = 'block'; }
});
recordingSocket.on('recording_stopped', function(data) {
  isRecording = false;
  if (startRecBtn && stopRecBtn) { stopRecBtn.style.display = 'none'; startRecBtn.style.display = 'block'; }
});

recordingSocket.on('waiting_for_partner', function(data) {
    console.log('Waiting for partner:', data);
    Swal.fire({
        title: 'Waiting for partner...',
        text: data.message,
        icon: 'info',
        timer: 2000,
        showConfirmButton: false
    });
});
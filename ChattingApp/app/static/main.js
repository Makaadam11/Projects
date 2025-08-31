let chatSocket = io.connect('/chat');
let recordingSocket = io.connect('/recording');
let eventSocket = io.connect('/events');

let startViewingTime = null;
let endViewingTime = null;
let totalViewingTime = 0;
let startSendingTime = null;
let endSendingTime = null;
let totalSendingTime = 0;
let isRecording = false;
let bertEnabled = false;

let username = null;
const userID = (typeof crypto !== 'undefined' && crypto.getRandomValues)
  ? crypto.getRandomValues(new Uint32Array(1))[0]
  : Math.floor(1e9 + Math.random() * 9e9);

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
  }
});

chatSocket.on('connect', function() {
    console.log('Connected to chat');
});

chatSocket.on('message', function(payload) {
  const data_ = typeof payload === 'string' ? JSON.parse(payload) : payload;

  const chatBox = $(".messages-chat");
  const currentLang = langSelect ? langSelect.value : "";
  const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const esc = s => (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const translatedLine =
    (currentLang && data_.translations && data_.translations[currentLang])
      ? `<p class="translation" style="margin:4px 0 0 0;font-size:10px;color:#666;">${esc(data_.translations[currentLang])}</p>`
      : `<p class="translation" style="margin:4px 0 0 0;font-size:10px;color:#666;"></p>`;

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
    // if (data_.values.predicted == "negative") {
    //   alertUser("You are typing negative words !");
    //   $("input#msg").removeClass("abusive");
    // }
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

let correctionsCount = 0;
let prevWordTokens = [];
let lastEditEmitTs = 0;
const EDIT_COOLDOWN_MS = 700;

function tokenizeWords(text) {
  if (!text) return [];
  return text.trim().length ? text.trim().split(/\s+/) : [];
}

function trackWordDeletions(message) {
  const curr = tokenizeWords(message || "");
  const diff = Math.max(0, prevWordTokens.length - curr.length);
  if (diff > 0) {
    correctionsCount += diff;
    const now = Date.now();
    if (now - lastEditEmitTs > EDIT_COOLDOWN_MS) {
      chatSocket.emit('correction', JSON.stringify({
        userID: userID,
        correctionsCount: correctionsCount
      }));
      lastEditEmitTs = now;
    }
  }
  prevWordTokens = curr;
}

function handleTyping() {
    let messageInput = document.getElementById('msg');
    if (!messageInput) return;
    let message = messageInput.value ?? "";
    
    trackWordDeletions(message);
    
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

chatSocket.on('user_typing', function(payload) {
  if (!bertEnabled) return;
  const typingStatus = $(".messages-chat");
  const data_ = typeof payload === 'string' ? JSON.parse(payload) : payload;

  if (data_.pred && data_.userID == userID) {
    create_chart(data_.values, data_.userID);
    $("input#msg").removeClass("abusive positive neutral");
    if (data_.values.predicted == "negative") {
      alertUser("You are typing negative words!");
      $("input#msg").addClass("abusive");
    } else if (data_.values.predicted == "positive") {
      $("input#msg").addClass("positive");
    } else if (data_.values.predicted == "neutral") {
      $("input#msg").addClass("neutral");
    }
  } else {
    if (data_.userID == userID) $("input#msg").removeClass("abusive positive neutral");
  }

  if (data_.isTyping && data_.userID==userID){
    typingStatus.append(myTyping);
    scrollToBottom();
  } else if (data_.isTyping==false && data_.userID==userID){
    $(".mychattyping").remove();
  }
  if (data_.isTyping && data_.userID!=userID){
    typingStatus.append(userTyping);
    scrollToBottom();
  } else if (data_.isTyping==false && data_.userID!=userID){
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
    prevWordTokens = [];
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

function ensureVideoEl() {
  let v = document.querySelector('#cam');
  if (!v) {
    v = document.createElement('video');
    v.id = 'cam';
    v.autoplay = true;
    v.playsInline = true;
    v.muted = true;
    v.style.display = 'none'; // ukryty element
    document.body.appendChild(v);
  }
  return v;
}

let mediaStream, frameTimer;
function ensureMediaDevices() {
  if (!navigator.mediaDevices) navigator.mediaDevices = {};
  if (!navigator.mediaDevices.getUserMedia) {
    const legacy = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (legacy) {
      navigator.mediaDevices.getUserMedia = (c) => new Promise((res, rej) => legacy.call(navigator, c, res, rej));
    }
  }
}
async function startCameraAndStreaming() {
  ensureMediaDevices();
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    Swal.fire({ icon:'error', title:'Camera error', text:'Secure context (HTTPS or flagged HTTP) required.' });
    return;
  }
  try {
    const v = ensureVideoEl();
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    v.srcObject = mediaStream;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (frameTimer) clearInterval(frameTimer);
    frameTimer = setInterval(() => {
      if (!v || v.readyState < 2) return;
      canvas.width = v.videoWidth; canvas.height = v.videoHeight;
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const frame = canvas.toDataURL('image/jpeg', 0.6);
      recordingSocket.emit('frame', JSON.stringify({ userID, frame }));
    }, 500);
  } catch (err) {
    console.error('getUserMedia failed:', err);
    Swal.fire({ icon: 'error', title: 'Camera error', text: String(err) });
  }
}
function stopCameraAndStreaming() {
  if (frameTimer) clearInterval(frameTimer);
  frameTimer = null;
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }
}

let waitingOpen = false;
recordingSocket.on('waiting_for_partner', function(data) {
  if (waitingOpen) return;
  waitingOpen = true;
  Swal.fire({
    title: 'Waiting for partner...',
    text: (data && data.message) || 'Please keep this tab open.',
    icon: 'info',
    allowOutsideClick: false,
    showConfirmButton: false
  });
});

recordingSocket.on('paired', function(data) {
  console.log('Paired with:', data.partnerName || data.partnerID);
});

recordingSocket.on('recording_started', function(data) {
  if (waitingOpen) { Swal.close(); waitingOpen = false; }
  isRecording = true;
  if (startRecBtn && stopRecBtn) { startRecBtn.style.display = 'none'; stopRecBtn.style.display = 'block'; }
  startCameraAndStreaming();
});

recordingSocket.on('recording_stopped', function(data) {
  isRecording = false;
  if (startRecBtn && stopRecBtn) { stopRecBtn.style.display = 'none'; startRecBtn.style.display = 'block'; }
  stopCameraAndStreaming();
});

recordingSocket.on('connect', () => console.log('[recording] connected'));
recordingSocket.on('disconnect', () => console.log('[recording] disconnected'));

const startRecBtn = document.getElementById('start-recording-menu');
const stopRecBtn  = document.getElementById('stop-recording-menu');
if (startRecBtn && stopRecBtn) {
  startRecBtn.addEventListener('click', () => {
    recordingSocket.emit('start_recording', { username: username, userID: userID });
  });
  stopRecBtn.addEventListener('click', () => {
    recordingSocket.emit('stop_recording', { userID: userID });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('msg');
  if (messageInput) {
    messageInput.addEventListener('input', handleTyping);
  }
});
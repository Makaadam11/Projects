let chatSocket = io.connect('/chat');
let recordingSocket = io.connect('/recording');
let eventSocket = io.connect('/events');

let startViewingTime = null;
let endViewingTime = null;
let totalViewingTime = 0;
let lastViewedMessage = "";
let startSendingTime = null;
let endSendingTime = null;
let totalSendingTime = 0;
let isRecording = false;
let bertEnabled = false;
let isSending = false;

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
    recordingSocket.emit('start_recording', { userID, username });
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
    if (!startViewingTime) {
      startViewingTime = new Date().toISOString();
      endViewingTime = null;
      totalViewingTime = 0;
      lastViewedMessage = data_.msg || "";
      eventSocket.emit("start_viewing", JSON.stringify({
        status: 'receiver',
        startViewingTime: startViewingTime,
        userID: userID,
        completeMessage: lastViewedMessage
      }));
    }

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
const isEmptyMsg = (s) => !s || !s.trim();
function clearMsgClasses() {
  $("input#msg").removeClass("abusive positive neutral");
}
function getCurrentInput() {
  return document.getElementById('msg')?.value || '';
}

function handleTyping() {
  let messageInput = document.getElementById('msg');
  if (!messageInput) return;
  let message = messageInput.value ?? "";

  if (isEmptyMsg(message)) {
    clearMsgClasses();
  }

  trackWordDeletions(message);

  trackWordDeletions(message);

  recordingSocket.emit('current_message', { userID: userID, message: message });

  if (startSendingTime && isEmptyMsg(message)) {
    const cancelTs = new Date().toISOString();
    const totalSending = new Date(cancelTs) - new Date(startSendingTime);

    eventSocket.emit('cancel_sending', JSON.stringify({
      userID,
      status: 'sender',
      endSendingTime: cancelTs,
      totalSendingTime: totalSending,
      cancelled: true
    }));

    clearMsgClasses();

    startSendingTime = null;
    endSendingTime = null;
    totalSendingTime = 0;
    isTyping = false;
    clearTimeout(window.typingTimeout);
    return;
  }

  if (!isTyping && !isEmptyMsg(message)) {
    isTyping = true;
    startSendingTime = new Date().toISOString();
    eventSocket.emit("start_sending", JSON.stringify({
      status: 'sender',
      startSendingTime,
      userID,
      message
    }));

    if (startViewingTime && !endViewingTime) {
      endViewingTime = new Date().toISOString();
      const totalViewing = new Date(endViewingTime) - new Date(startViewingTime);
      eventSocket.emit('end_viewing', JSON.stringify({
        userID: userID,
        status: 'receiver',
        message: lastViewedMessage,
        endViewingTime: endViewingTime,
        totalViewingTime: totalViewing
      }));
      startViewingTime = null;
      endViewingTime = null;
      totalViewingTime = 0;
      lastViewedMessage = "";
    }
  }

  clearTimeout(window.typingTimeout);
  window.typingTimeout = setTimeout(function() {
    isTyping = false;
    chatSocket.emit('typing', JSON.stringify({msg:message, isTyping:false, userID:userID}));
  }, 500);
}

chatSocket.on('user_typing', function(payload) {
  if (!bertEnabled) return;
  const typingStatus = $(".messages-chat");
  const data_ = typeof payload === 'string' ? JSON.parse(payload) : payload;

  const currentText = getCurrentInput();
  if (data_.userID == userID) {
    if (isEmptyMsg(currentText)) {
      clearMsgClasses();
      return;
    }
    if ((data_.msg || '') !== currentText) {
      return;
    }
  }

  if (data_.pred && data_.userID == userID) {
    create_chart(data_.values, data_.userID);
    clearMsgClasses();
    if (data_.values.neg > 0.31) {
      alertUser("You are typing negative words!");
      $("input#msg").addClass("abusive");
    } else if (data_.values.predicted == "positive") {
      $("input#msg").addClass("positive");
    } else if (data_.values.predicted == "neutral") {
      $("input#msg").addClass("neutral");
    }
  } else {
    if (data_.userID == userID) clearMsgClasses();
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

    if (isEmptyMsg(message)) {
      clearMsgClasses();
      return;
    }
    
    chatSocket.emit('message', JSON.stringify({
        msg: message, 
        userID: userID, 
        username: username, 
        msgTime: new Date().toLocaleTimeString()
    }));
    
    endSendingTime = new Date().toISOString();
    const totalSending = startSendingTime ? new Date(endSendingTime) - new Date(startSendingTime) : 0;
    eventSocket.emit('end_sending', JSON.stringify({
        userID: userID,
        status: 'sender',
        completeMessage: message,
        endSendingTime: endSendingTime,
        totalSendingTime: totalSending
    }));

    document.getElementById('msg').value = '';
    clearMsgClasses();
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

let bertSynced = false;
const bertToggle = document.getElementById('toggle-bert');
if (bertToggle) {
  bertToggle.checked = false;
  applyBertUI(false);
  bertToggle.addEventListener('change', () => {
    applyBertUI(bertToggle.checked);
  });
}

function applyBertUI(enabled) {
  bertEnabled = enabled;
  const pred = document.getElementById('predicted_sentiment');
  const vals = document.getElementById('predValues');
  if (pred) pred.style.display = enabled ? 'block' : 'none';
  if (vals) vals.style.display = enabled ? 'block' : 'none';
  if (!bertSynced) chatSocket.emit('enable_analysis', JSON.stringify({ userID: userID, enabled: enabled }));
  $("input#msg").removeClass("abusive positive neutral");
}

chatSocket.on('enable_analysis', function(payload) {
  const data_ = typeof payload === 'string' ? JSON.parse(payload) : payload;
  if (data_.userID !== userID) return;
  bertSynced = true;
  if (bertToggle) bertToggle.checked = !!data_.enabled;
  applyBertUI(!!data_.enabled);
  bertSynced = false;
});

$(window).on('keydown', async function(event){
  if(event.which == 13){
    const v = document.getElementById('msg')?.value || '';
    if (isEmptyMsg(v)) return false;
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
  console.log('Starting camera and streaming...');
  ensureMediaDevices();
  if (!navigator.mediaDevices?.getUserMedia) {
    Swal.fire({ icon:'error', title:'Camera error', text:'Secure context (HTTPS/localhost) required.' });
    return;
  }
  try {
    const v = ensureVideoEl();
    const constraints = { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false };
    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    v.srcObject = mediaStream;
    v.muted = true; v.playsInline = true; v.setAttribute('playsinline',''); v.setAttribute('muted','');
    try { await v.play(); } catch (e) { console.warn('v.play() rejected', e); }

    // poczekaj aż pojawi się rozmiar wideo
    await new Promise((res) => {
      if (v.videoWidth > 0 && v.videoHeight > 0) return res();
      const to = setTimeout(res, 1500);
      v.onloadedmetadata = () => { clearTimeout(to); res(); };
    });
    if (v.videoWidth === 0 || v.videoHeight === 0) {
      console.warn('[camera] video size is 0x0 – skip frames until ready');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (frameTimer) clearInterval(frameTimer);
    frameTimer = setInterval(() => {
      if (!v || v.readyState < 2 || !v.videoWidth || !v.videoHeight) return;
      canvas.width = v.videoWidth; canvas.height = v.videoHeight;
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const frame = canvas.toDataURL('image/jpeg', 0.6);
      recordingSocket.emit('frame', JSON.stringify({ userID, frame }));
    }, 400);
    console.log('[camera] streaming started', v.videoWidth, 'x', v.videoHeight);
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
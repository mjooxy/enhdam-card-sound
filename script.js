let audio = document.getElementById("audio");

const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();
const source = ctx.createMediaElementSource(audio);

const gain = ctx.createGain();
const bass = ctx.createBiquadFilter();
bass.type = "lowshelf";
bass.frequency.value = 200;

const delay = ctx.createDelay();
delay.delayTime.value = 0;

const feedback = ctx.createGain();
feedback.gain.value = 0;

const convolver = ctx.createConvolver();

const distortion = ctx.createWaveShaper();
distortion.curve = makeDistortionCurve(800);

source
  .connect(distortion)
  .connect(bass)
  .connect(delay)
  .connect(feedback)
  .connect(delay)
  .connect(gain)
  .connect(ctx.destination);

function play(){ ctx.resume(); audio.play(); }
function stop(){ audio.pause(); audio.currentTime=0; }
function toggleLoop(){ audio.loop = !audio.loop; }
function loadFile(e){ audio.src = URL.createObjectURL(e.target.files[0]); }

function setVolume(v){ gain.gain.value = v; }
function setBass(v){ bass.gain.value = v; }
function setEcho(v){ delay.delayTime.value = v; feedback.gain.value = v; }
function setReverb(v){ gain.gain.value = 1 + v; }

function boost(){ gain.gain.value = 5; bass.gain.value = 30; }

function makeDistortionCurve(a){
  let n=44100, curve=new Float32Array(n);
  for(let i=0;i<n;i++){
    let x=i*2/n-1;
    curve[i]=(3+a)*x*20*Math.PI/(Math.PI+a*Math.abs(x));
  }
  return curve;
}

// تسجيل
let recorder, chunks=[];
navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
  recorder=new MediaRecorder(stream);
  recorder.ondataavailable=e=>chunks.push(e.data);
  recorder.onstop=()=>{
    let blob=new Blob(chunks,{type:'audio/webm'});
    chunks=[];
    audio.src=URL.createObjectURL(blob);
  }
});
function record(){ recorder.start(); }
function stopRecord(){ recorder.stop(); }

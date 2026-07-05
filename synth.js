const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audio = new AudioContextClass();

// MASTER
const master = audio.createGain();
master.gain.value = 0.7;
master.connect(audio.destination);

// active notes
const voices = new Map();

// safe state getter
function state(){
    return window.STATE || {
        attack:0.01,
        decay:0.2,
        sustain:0.7,
        release:0.3,
        wave:"sine"
    };
}

// midi → frequency
function freq(m){
    return 440 * Math.pow(2,(m-69)/12);
}

// 🎹 CREATE VOICE (SAFE VERSION)
function makeVoice(f){

    const s = state();

    const osc = audio.createOscillator();
    osc.type = s.wave;
    osc.frequency.value = f;

    const gain = audio.createGain();
    gain.gain.value = 0;

    osc.connect(gain);
    gain.connect(master);

    return {osc,gain};
}

// 🎵 PLAY
window.playNote = function(midi){

    if(voices.has(midi)) return;

    if(audio.state === "suspended")
        audio.resume();

    const v = makeVoice(freq(midi));
    const s = state();
    const now = audio.currentTime;

    // ADSR
    v.gain.gain.cancelScheduledValues(now);
    v.gain.gain.setValueAtTime(0,now);
    v.gain.gain.linearRampToValueAtTime(1,now+s.attack);
    v.gain.gain.linearRampToValueAtTime(s.sustain,now+s.attack+s.decay);

    v.osc.start(now);

    voices.set(midi,v);
};

// 🛑 STOP
window.stopNote = function(midi){

    const v = voices.get(midi);
    if(!v) return;

    const s = state();
    const now = audio.currentTime;

    v.gain.gain.cancelScheduledValues(now);
    v.gain.gain.setValueAtTime(v.gain.gain.value,now);
    v.gain.gain.linearRampToValueAtTime(0,now+s.release);

    const stopTime = now + s.release + 0.05;

    v.osc.stop(stopTime);

    setTimeout(()=>{
        voices.delete(midi);
    },(s.release+0.2)*1000);
};

// volume safety
document.getElementById("volume")?.addEventListener("input",(e)=>{
    master.gain.value = e.target.value/100;
});

// expose master (for debugging)
window.MASTER = master;
window.AUDIO = audio;

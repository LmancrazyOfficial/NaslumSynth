const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audio = new AudioContextClass();

// expose globally
window.AUDIO = audio;

const master = audio.createGain();
master.gain.value = 0.5;
master.connect(audio.destination);

const voices = new Map();

function freq(m){
    return 440 * Math.pow(2,(m-69)/12);
}

// 🎵 PLAY (TEST MODE)
window.playNote = function(midi){

    if(audio.state === "suspended"){
        audio.resume();
    }

    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = "sine";
    osc.frequency.value = freq(midi);

    gain.gain.setValueAtTime(0.5, audio.currentTime);

    osc.connect(gain);
    gain.connect(master);

    osc.start();

    voices.set(midi,{osc,gain});
};

// 🛑 STOP
window.stopNote = function(midi){

    const v = voices.get(midi);
    if(!v) return;

    const t = audio.currentTime;

    v.gain.gain.setValueAtTime(v.gain.gain.value,t);
    v.gain.gain.linearRampToValueAtTime(0,t+0.1);

    v.osc.stop(t+0.15);

    setTimeout(()=>voices.delete(midi),200);
};

// DEBUG
console.log("Audio engine loaded");

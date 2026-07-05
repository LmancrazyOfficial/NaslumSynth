const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audio = new AudioContextClass();

const master = audio.createGain();
master.gain.value = 0.7;
master.connect(audio.destination);

// active voices
const voices = new Map();

function state(){
    return window.STATE || {
        attack:0.01,
        decay:0.2,
        sustain:0.7,
        release:0.3,
        wave:"sine"
    };
}

// frequency
function freq(midi){
    return 440 * Math.pow(2,(midi-69)/12);
}

// 🎧 HIGH QUALITY VOICE
function createVoice(f){

    const s = state();

    const out = audio.createGain();

    // --- detuned layers (thicker sound) ---
    const osc1 = audio.createOscillator();
    const osc2 = audio.createOscillator();
    const osc3 = audio.createOscillator();

    osc1.type = s.wave;
    osc2.type = s.wave;
    osc3.type = s.wave;

    osc1.frequency.value = f;
    osc2.frequency.value = f * 1.003;
    osc3.frequency.value = f * 0.997;

    const gain = audio.createGain();

    // mix oscillators
    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);

    gain.connect(out);
    out.connect(master);

    return {osc:[osc1,osc2,osc3],gain,out};
}

// 🎹 PLAY NOTE
window.playNote = function(midi){

    if(voices.has(midi)) return;

    if(audio.state === "suspended")
        audio.resume();

    const v = createVoice(freq(midi));
    const now = audio.currentTime;
    const s = state();

    // ADSR
    v.gain.gain.setValueAtTime(0,now);
    v.gain.gain.linearRampToValueAtTime(1,now+s.attack);
    v.gain.gain.linearRampToValueAtTime(s.sustain,now+s.attack+s.decay);

    v.osc.forEach(o=>o.start(now));

    voices.set(midi,v);
};

// 🛑 STOP NOTE (FIXED SAFE RELEASE)
window.stopNote = function(midi){

    const v = voices.get(midi);
    if(!v) return;

    const now = audio.currentTime;
    const s = state();

    // smooth release
    v.gain.gain.cancelScheduledValues(now);
    v.gain.gain.setValueAtTime(v.gain.gain.value,now);
    v.gain.gain.linearRampToValueAtTime(0,now+s.release);

    // 🔥 GUARANTEED CLEANUP (fixes stuck notes)
    const stopTime = now + s.release + 0.1;

    v.osc.forEach(o=>o.stop(stopTime));

    setTimeout(()=>{
        voices.delete(midi);
    },(s.release+0.2)*1000);
};

// master volume safety
document.getElementById("volume")?.addEventListener("input",(e)=>{
    master.gain.value = e.target.value/100;
});

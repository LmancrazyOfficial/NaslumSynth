// ---------- Audio Context ----------

const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audio = new AudioContextClass();

const masterGain = audio.createGain();
masterGain.gain.value = 0.7;
masterGain.connect(audio.destination);

// ---------- Active Notes ----------

const activeNotes = new Map();

// ---------- Load default state ----------

function getState(){
    return window.SYNTH_STATE || {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.7,
        release: 0.3,
        waveform: "sine"
    };
}

// ---------- Note math ----------

function noteToMidi(note){
    const match = note.match(/^([A-G])(#?)(\d)$/);

    const name = match[1];
    const sharp = match[2];
    const octave = parseInt(match[3]);

    const map = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };

    let midi = (octave + 1) * 12 + map[name];
    if(sharp) midi++;

    return midi;
}

function noteFrequency(note){
    const midi = noteToMidi(note);
    return 440 * Math.pow(2,(midi-69)/12);
}

// ---------- Oscillator ----------

function createOsc(freq){

    const state = getState();

    const osc = audio.createOscillator();

    let type = state.waveform;

    osc.type = type;
    osc.frequency.value = freq;

    return osc;
}

// ---------- ADSR ----------

function applyADSR(gainNode, now){

    const state = getState();

    const attack = state.attack;
    const decay = state.decay;
    const sustain = state.sustain;

    gainNode.gain.cancelScheduledValues(now);

    gainNode.gain.setValueAtTime(0, now);

    // Attack
    gainNode.gain.linearRampToValueAtTime(1, now + attack);

    // Decay to sustain
    gainNode.gain.linearRampToValueAtTime(
        sustain,
        now + attack + decay
    );

}

// ---------- Play Note ----------

window.playNote = function(note){

    if(activeNotes.has(note)) return;

    if(audio.state === "suspended")
        audio.resume();

    const freq = noteFrequency(note);

    const osc = createOsc(freq);
    const gain = audio.createGain();

    const now = audio.currentTime;

    applyADSR(gain, now);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);

    activeNotes.set(note,{
        osc,
        gain
    });
};

// ---------- Stop Note ----------

window.stopNote = function(note){

    if(!activeNotes.has(note)) return;

    const state = getState();

    const obj = activeNotes.get(note);

    const now = audio.currentTime;

    const gain = obj.gain;

    gain.gain.cancelScheduledValues(now);

    gain.gain.setValueAtTime(gain.gain.value, now);

    gain.gain.linearRampToValueAtTime(
        0,
        now + state.release
    );

    obj.osc.stop(now + state.release + 0.05);

    activeNotes.delete(note);
};

// ---------- Volume ----------

document.getElementById("volume")
.addEventListener("input",(e)=>{

    masterGain.gain.value = e.target.value / 100;

});

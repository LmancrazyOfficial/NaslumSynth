const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audio = new AudioContextClass();

// ---------- MASTER ----------
const masterGain = audio.createGain();
masterGain.gain.value = 0.7;

// ---------- EFFECTS NODES ----------

// Reverb
const reverb = audio.createConvolver();

// simple impulse response (light reverb)
function makeImpulse(){

    const rate = audio.sampleRate;
    const length = rate * 2.5;
    const impulse = audio.createBuffer(2, length, rate);

    for(let c=0;c<2;c++){

        const channel = impulse.getChannelData(c);

        for(let i=0;i<length;i++){
            channel[i] = (Math.random()*2-1) * Math.pow(1 - i/length, 2);
        }

    }

    reverb.buffer = impulse;
}
makeImpulse();

// Delay
const delay = audio.createDelay(2.0);
delay.delayTime.value = 0.25;

const delayGain = audio.createGain();
delayGain.gain.value = 0.25;

// Distortion
const distortion = audio.createWaveShaper();

function makeDistortion(amount=50){

    const samples = 44100;
    const curve = new Float32Array(samples);

    for(let i=0;i<samples;i++){

        const x = (i * 2 / samples) - 1;

        curve[i] = (Math.PI + amount) * x /
                   (Math.PI + amount * Math.abs(x));

    }

    distortion.curve = curve;
    distortion.oversample = "4x";
}
makeDistortion(30);

// ---------- ROUTING ----------

// FX chain:
// gainNode → distortion → delay → reverb → master

const fxInput = audio.createGain();

fxInput.connect(distortion);
distortion.connect(delay);

delay.connect(delayGain);
delayGain.connect(delay);

delay.connect(reverb);

reverb.connect(masterGain);

// dry + wet mix
fxInput.connect(masterGain);

// ---------- ACTIVE NOTES ----------
const activeNotes = new Map();

// ---------- STATE ----------
function getState(){
    return window.SYNTH_STATE || {
        attack:0.01,
        decay:0.2,
        sustain:0.7,
        release:0.3,
        waveform:"sine"
    };
}

// ---------- NOTE MATH ----------
function noteToMidi(note){
    const m = note.match(/^([A-G])(#?)(\d)$/);
    const map={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
    let midi=(parseInt(m[3])+1)*12+map[m[1]];
    if(m[2]) midi++;
    return midi;
}

function freq(note){
    return 440*Math.pow(2,(noteToMidi(note)-69)/12);
}

// ---------- OSC ----------
function createOsc(f){

    const osc = audio.createOscillator();
    const s = getState();

    osc.type = s.waveform;
    osc.frequency.value = f;

    return osc;
}

// ---------- ADSR ----------
function applyADSR(gain, now){

    const s = getState();

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0, now);

    gain.gain.linearRampToValueAtTime(1, now + s.attack);
    gain.gain.linearRampToValueAtTime(
        s.sustain,
        now + s.attack + s.decay
    );

}

// ---------- PLAY ----------
window.playNote = function(note){

    if(activeNotes.has(note)) return;

    if(audio.state === "suspended")
        audio.resume();

    const osc = createOsc(freq(note));
    const gain = audio.createGain();

    const now = audio.currentTime;

    applyADSR(gain, now);

    osc.connect(gain);
    gain.connect(fxInput);

    osc.start(now);

    activeNotes.set(note,{osc,gain});
};

// ---------- STOP ----------
window.stopNote = function(note){

    if(!activeNotes.has(note)) return;

    const s = getState();
    const obj = activeNotes.get(note);

    const now = audio.currentTime;

    const g = obj.gain;

    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);

    g.gain.linearRampToValueAtTime(0, now + s.release);

    obj.osc.stop(now + s.release + 0.05);

    activeNotes.delete(note);
};

// ---------- MASTER VOLUME ----------
document.getElementById("volume")
.addEventListener("input",(e)=>{
    masterGain.gain.value = e.target.value/100;
});

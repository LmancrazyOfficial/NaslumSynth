// ---------- Audio Context ----------

const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audio = new AudioContextClass();

const masterGain = audio.createGain();
masterGain.gain.value = 0.7;
masterGain.connect(audio.destination);

// ---------- Active Notes ----------

const activeNotes = new Map();

// ---------- Note → MIDI ----------

function noteToMidi(note){

    const match = note.match(/^([A-G])(#?)(\d)$/);

    const name = match[1];
    const sharp = match[2];
    const octave = parseInt(match[3]);

    const map = {
        C:0,
        D:2,
        E:4,
        F:5,
        G:7,
        A:9,
        B:11
    };

    let midi = (octave + 1) * 12 + map[name];

    if(sharp) midi++;

    return midi;

}

// ---------- MIDI → Frequency ----------

function noteFrequency(note){

    const midi = noteToMidi(note);

    return 440 * Math.pow(2,(midi-69)/12);

}

// ---------- Oscillator ----------

function createOsc(freq){

    const osc = audio.createOscillator();

    const wave = document.getElementById("waveform").value;

    switch(wave){

        case "pulse":
            osc.type = "square";
            break;

        case "organ":
            osc.type = "triangle";
            break;

        case "bell":
            osc.type = "sine";
            break;

        case "bass":
            osc.type = "sawtooth";
            break;

        case "fm":
            osc.type = "sine";
            break;

        default:
            osc.type = wave;

    }

    osc.frequency.value = freq;

    return osc;

}

// ---------- Play ----------

window.playNote = function(note){

    if(activeNotes.has(note))
        return;

    if(audio.state === "suspended")
        audio.resume();

    const freq = noteFrequency(note);

    const osc = createOsc(freq);

    const gain = audio.createGain();

    gain.gain.setValueAtTime(0,audio.currentTime);
    gain.gain.linearRampToValueAtTime(
        0.9,
        audio.currentTime+0.02
    );

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();

    activeNotes.set(note,{
        osc,
        gain
    });

}

// ---------- Stop ----------

window.stopNote = function(note){

    if(!activeNotes.has(note))
        return;

    const obj = activeNotes.get(note);

    obj.gain.gain.cancelScheduledValues(audio.currentTime);

    obj.gain.gain.setValueAtTime(
        obj.gain.gain.value,
        audio.currentTime
    );

    obj.gain.gain.linearRampToValueAtTime(
        0,
        audio.currentTime+0.15
    );

    obj.osc.stop(audio.currentTime+0.18);

    activeNotes.delete(note);

}

// ---------- Volume ----------

document.getElementById("volume")
.addEventListener("input",(e)=>{

    masterGain.gain.value =
        e.target.value/100;

});

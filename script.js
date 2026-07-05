const keyboard = document.getElementById("keyboard");

const NOTES = [
    "A0","A#0","B0",
    "C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1","A1","A#1","B1",
    "C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2","A2","A#2","B2",
    "C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3",
    "C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4",
    "C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5",
    "C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6","A6","A#6","B6",
    "C7","C#7","D7","D#7","E7","F7","F#7","G7","G#7","A7","A#7","B7",
    "C8"
];

const BLACK = ["C#","D#","F#","G#","A#"];

let whiteIndex = 0;

NOTES.forEach((note)=>{

    const sharp = note.includes("#");

    if(sharp){

        const key = document.createElement("div");

        key.className = "black-key";

        key.style.left = (whiteIndex*42 - 13) + "px";

        key.dataset.note = note;

        key.innerHTML =
            `<span class="note-label">${note}</span>`;

        key.addEventListener("mousedown",()=>pressKey(key));
        key.addEventListener("mouseup",()=>releaseKey(key));
        key.addEventListener("mouseleave",()=>releaseKey(key));

        keyboard.appendChild(key);

    }else{

        const key = document.createElement("div");

        key.className = "white-key";

        key.dataset.note = note;

        key.innerHTML =
            `<span class="note-label">${note}</span>`;

        key.addEventListener("mousedown",()=>pressKey(key));
        key.addEventListener("mouseup",()=>releaseKey(key));
        key.addEventListener("mouseleave",()=>releaseKey(key));

        keyboard.appendChild(key);

        whiteIndex++;

    }

});

function pressKey(key){

    key.classList.add("active");

    if(window.playNote){
        playNote(key.dataset.note);
    }

}

function releaseKey(key){

    key.classList.remove("active");

    if(window.stopNote){
        stopNote(key.dataset.note);
    }

}
function syncState(){

    window.SYNTH_STATE = {
        attack: parseFloat(document.getElementById("attack").value),
        decay: parseFloat(document.getElementById("decay").value),
        sustain: parseFloat(document.getElementById("sustain").value),
        release: parseFloat(document.getElementById("release").value),
        waveform: document.getElementById("waveform").value
    };

}

// Attach listeners
["attack","decay","sustain","release","waveform"]
.forEach(id=>{
    document.getElementById(id).addEventListener("input", syncState);
});

// Presets
const presetSelect = document.getElementById("preset");

// Load preset names
Object.keys(window.PRESETS).forEach(name=>{
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    presetSelect.appendChild(opt);
});

presetSelect.addEventListener("change",(e)=>{

    const preset = window.PRESETS[e.target.value];

    if(!preset) return;

    document.getElementById("attack").value = preset.attack;
    document.getElementById("decay").value = preset.decay;
    document.getElementById("sustain").value = preset.sustain;
    document.getElementById("release").value = preset.release;
    document.getElementById("waveform").value = preset.waveform;

    syncState();

});

const keyboard = document.getElementById("keyboard");

// 88 keys from A0 to C8 using MIDI range
const START = 21;
const END = 108;

// note pattern (used for black key detection)
const blackMap = [1,3,6,8,10]; // semitone positions in octave

let whiteIndex = 0;

for(let midi = START; midi <= END; midi++){

    const noteInOctave = midi % 12;
    const isBlack = blackMap.includes(noteInOctave);

    const key = document.createElement("div");

    if(isBlack){

        key.className = "black-key";

        // position black keys between whites
        key.style.left = (whiteIndex * 40 - 12) + "px";

    } else {

        key.className = "white-key";
        whiteIndex++;
    }

    key.dataset.midi = midi;

    // EVENTS (safe even if synth not loaded yet)
    key.onmousedown = () => window.playNote?.(midi);
    key.onmouseup = () => window.stopNote?.(midi);

    keyboard.appendChild(key);
}
function unlockAudio(){
    if(window._audioUnlocked) return;
    window._audioUnlocked = true;

    const ctx = window.AUDIO || window.audio;
    if(!ctx) return;

    ctx.resume?.();
}

// unlock on ANY user interaction
window.addEventListener("mousedown", unlockAudio);
window.addEventListener("touchstart", unlockAudio);
window.addEventListener("keydown", unlockAudio);

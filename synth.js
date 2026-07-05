const notes = [];

function freq(n){
    return 440*Math.pow(2,(n-69)/12);
}

function state(){
    return window.STATE;
}

function osc(f){
    const o = AUDIO.createOscillator();
    o.type = state().wave;
    o.frequency.value = f;
    return o;
}

function play(note){

    const o = osc(freq(note));
    const g = AUDIO.createGain();

    const s = state();
    const t = AUDIO.currentTime;

    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(1,t+s.attack);
    g.gain.linearRampToValueAtTime(s.sustain,t+s.attack+s.decay);

    o.connect(g);
    g.connect(FX.input);

    o.start();
    notes[note] = {o,g};
}

function stop(note){

    const n = notes[note];
    if(!n) return;

    const t = AUDIO.currentTime;
    const s = state();

    n.g.gain.setValueAtTime(n.g.gain.value,t);
    n.g.gain.linearRampToValueAtTime(0,t+s.release);

    n.o.stop(t+s.release+0.05);
    delete notes[note];
}

window.playNote = play;
window.stopNote = stop;


// ---------- FX STATE ----------
window.FX_STATE = {
    reverbWet: 0.35,
    delayTime: 0.25,
    delayFeedback: 0.25,
    distortion: 30
};

// ---------- AUDIO NODES (shared via synth.js) ----------
window.FX_NODES = {};

// ---------- INIT FX ----------
window.initFX = function(audio, masterGain){

    const nodes = window.FX_NODES;

    // --- Reverb ---
    nodes.reverb = audio.createConvolver();

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

        nodes.reverb.buffer = impulse;
    }
    makeImpulse();

    // --- Delay ---
    nodes.delay = audio.createDelay(2.0);
    nodes.delay.delayTime.value = window.FX_STATE.delayTime;

    nodes.delayFeedback = audio.createGain();
    nodes.delayFeedback.gain.value = window.FX_STATE.delayFeedback;

    nodes.delay.connect(nodes.delayFeedback);
    nodes.delayFeedback.connect(nodes.delay);
    nodes.delayFeedback.connect(masterGain);

    // --- Distortion ---
    nodes.distortion = audio.createWaveShaper();

    function makeCurve(amount){
        const samples = 44100;
        const curve = new Float32Array(samples);

        for(let i=0;i<samples;i++){
            const x = (i*2/samples)-1;
            curve[i] =
                (Math.PI + amount) * x /
                (Math.PI + amount*Math.abs(x));
        }

        nodes.distortion.curve = curve;
        nodes.distortion.oversample = "4x";
    }

    makeCurve(window.FX_STATE.distortion);

    // --- Routing chain ---
    const fxInput = audio.createGain();

    fxInput.connect(nodes.distortion);
    nodes.distortion.connect(nodes.delay);
    nodes.delay.connect(nodes.reverb);

    nodes.reverb.connect(masterGain);
    fxInput.connect(masterGain);

    nodes.input = fxInput;

    return fxInput;
};

// ---------- UPDATE FX ----------
window.updateFX = function(){

    const n = window.FX_NODES;
    const s = window.FX_STATE;

    if(n.delay){
        n.delay.delayTime.value = s.delayTime;
    }

    if(n.delayFeedback){
        n.delayFeedback.gain.value = s.delayFeedback;
    }

    if(n.distortion){
        const samples = 44100;
        const curve = new Float32Array(samples);

        for(let i=0;i<samples;i++){
            const x = (i*2/samples)-1;
            curve[i] =
                (Math.PI + s.distortion) * x /
                (Math.PI + s.distortion*Math.abs(x));
        }

        n.distortion.curve = curve;
    }
};

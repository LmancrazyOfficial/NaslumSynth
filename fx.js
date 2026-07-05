const audio = new (window.AudioContext || window.webkitAudioContext)();

const master = audio.createGain();
master.gain.value = 0.7;
master.connect(audio.destination);

const fx = {
    input: audio.createGain(),

    delay: audio.createDelay(2.0),
    delayGain: audio.createGain(),

    reverb: audio.createConvolver(),

    distortion: audio.createWaveShaper()
};

// delay loop
fx.delay.connect(fx.delayGain);
fx.delayGain.connect(fx.delay);
fx.delayGain.connect(master);

// routing
fx.input.connect(fx.delay);
fx.delay.connect(fx.reverb);
fx.reverb.connect(master);
fx.input.connect(fx.distortion);
fx.distortion.connect(master);

function makeImpulse(){
    const len = audio.sampleRate * 2;
    const buf = audio.createBuffer(2,len,audio.sampleRate);

    for(let c=0;c<2;c++){
        const d = buf.getChannelData(c);
        for(let i=0;i<len;i++){
            d[i] = (Math.random()*2-1)*(1-i/len);
        }
    }
    fx.reverb.buffer = buf;
}
makeImpulse();

window.FX = fx;
window.MASTER = master;
window.AUDIO = audio;

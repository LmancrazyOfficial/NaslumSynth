window.addEventListener("DOMContentLoaded",()=>{

const r = document.getElementById("reverb");
const d = document.getElementById("delay");
const f = document.getElementById("feedback");
const dist = document.getElementById("distortion");

function update(){

    FX.delay.delayTime.value = parseFloat(d.value);

    FX.delayGain.gain.value = parseFloat(f.value);

    const amount = parseFloat(dist.value);

    const curve = new Float32Array(44100);
    for(let i=0;i<44100;i++){
        let x = i*2/44100-1;
        curve[i]=(Math.PI+amount)*x/(Math.PI+amount*Math.abs(x));
    }
    FX.distortion.curve = curve;

}

[r,d,f,dist].forEach(x=>x.addEventListener("input",update));

});

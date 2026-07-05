window.addEventListener("DOMContentLoaded",()=>{

const c = document.getElementById("viz");
const ctx = c.getContext("2d");

const a = AUDIO.createAnalyser();
a.fftSize = 1024;

FX.input.connect(a);

const data = new Uint8Array(a.frequencyBinCount);

function draw(){

    requestAnimationFrame(draw);

    a.getByteTimeDomainData(data);

    ctx.fillStyle="#000";
    ctx.fillRect(0,0,c.width,c.height);

    ctx.beginPath();

    let x=0;
    for(let i=0;i<data.length;i++){
        let v=data[i]/128;
        let y=v*c.height/2;

        if(i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);

        x+=c.width/data.length;
    }

    ctx.strokeStyle="#ff2b2b";
    ctx.stroke();
}

draw();

});

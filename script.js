const keys = document.getElementById("keyboard");

const notes = [];
for(let i=21;i<=108;i++) notes.push(i);

notes.forEach((n,i)=>{

    const div = document.createElement("div");
    div.className = (i%12==1||i%12==3||i%12==6||i%12==8||i%12==10)
        ? "black-key"
        : "white-key";

    div.onmousedown=()=>playNote(n);
    div.onmouseup=()=>stopNote(n);

    keys.appendChild(div);
});

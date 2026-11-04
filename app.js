const $=s=>document.querySelector(s);
$('.burger').onclick=()=>$('.nav ul').classList.toggle('open');
document.querySelectorAll('.nav ul a').forEach(a=>a.onclick=()=>$('.nav ul').classList.remove('open'));
// petals
setInterval(()=>{const p=document.createElement('span');p.className='petal';p.textContent=Math.random()<.5?'♡':'❀';
p.style.left=Math.random()*100+'vw';p.style.fontSize=12+Math.random()*16+'px';p.style.animationDuration=6+Math.random()*6+'s';
$('#petals').appendChild(p);setTimeout(()=>p.remove(),13000)},700);
// lightbox
const lb=$('#lb');document.querySelectorAll('.gal img').forEach(i=>i.onclick=()=>{lb.querySelector('img').src=i.src;lb.hidden=false});
lb.onclick=()=>lb.hidden=true;document.onkeydown=e=>{if(e.key==='Escape')lb.hidden=true};
// meme maker
const cv=$('#cv'),c=cv.getContext('2d'),img=new Image();
function draw(){if(!img.complete)return;const s=Math.max(cv.width/img.width,cv.height/img.height);
c.drawImage(img,(cv.width-img.width*s)/2,0,img.width*s,img.height*s);
c.font='bold 44px Fredoka, sans-serif';c.textAlign='center';c.lineWidth=7;c.strokeStyle='#b3264a';c.fillStyle='#fff';
const t=(txt,y)=>{c.strokeText(txt,300,y,560);c.fillText(txt,300,y,560)};t($('#mtop').value.toUpperCase(),70);t($('#mbot').value.toUpperCase(),770)}
img.onload=draw;img.src=$('#mimg').value;$('#mimg').onchange=e=>img.src=e.target.value;
$('#mtop').oninput=$('#mbot').oninput=draw;document.fonts&&document.fonts.ready.then(draw);
$('#mdl').onclick=()=>{const a=document.createElement('a');a.download='mia-meme.png';a.href=cv.toDataURL();a.click()};

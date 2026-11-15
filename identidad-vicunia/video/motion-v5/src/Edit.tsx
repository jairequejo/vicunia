import '@fontsource/outfit/800.css';
import '@fontsource/outfit/900.css';
import '@fontsource/lora/700-italic.css';
import '@fontsource/inter/700.css';
import type {CSSProperties, ReactNode} from 'react';
import {Video} from '@remotion/media';
import {AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const C={cream:'#E9EDFC',green:'#222446',gold:'#FFC24D',clay:'#F0357E',carnival:'#F0357E',retama:'#FFC24D',purple:'#5A4FE0',dark:'#1A1C33'};
type Beat={from:number;len:number;file:string;video?:boolean;tag:string;words:string[];accent:string;place:'top'|'bottom';font?:'outfit'|'lora'|'inter';pos?:string;bright?:number;wipe?:boolean};
const beats:Beat[]=[
  {from:0,len:35,file:'real-golden.jpeg',tag:'FOTO REAL',words:['¿TU','MASCOTA?'],accent:C.gold,place:'top'},
  {from:28,len:25,file:'mini-orange-studio.png',tag:'AHORA MIRA',words:['¡EN','MINI!'],accent:C.clay,place:'bottom',wipe:true},
  {from:53,len:29,file:'mini-orange.mp4',video:true,tag:'VICUNIA',words:['CON SUS','DETALLES'],accent:C.retama,place:'bottom',font:'lora'},
  {from:100,len:37,file:'real-blackwhite.jpeg',tag:'FOTO REAL',words:['DE SU','FOTO...'],accent:C.purple,place:'top'},
  {from:130,len:32,file:'mini-blackwhite-studio.png',tag:'FIGURA PINTADA',words:['A UNA','FIGURA'],accent:C.gold,place:'bottom',bright:1.12,wipe:true},
  {from:162,len:26,file:'mini-cat.mp4',video:true,tag:'TAMBIÉN',words:['GATITOS'],accent:C.clay,place:'bottom',font:'lora'},
  {from:188,len:26,file:'mini-yellow-studio.png',tag:'Y CLARO',words:['PERRITOS'],accent:C.retama,place:'top'},
  {from:214,len:30,file:'mini-chihuahua-studio.png',tag:'FIGURAS 3D',words:['PINTADAS','A MANO'],accent:C.purple,place:'bottom',font:'inter'},
];
const logo=staticFile('media/vicunia.svg');

const Brand=({large=false}:{large?:boolean})=><div style={{display:'flex',alignItems:'center',gap:large?22:10,padding:large?0:'8px 14px',borderRadius:17,background:large?'transparent':'rgba(26,28,51,.82)',color:C.cream}}>
  <Img src={logo} style={{width:large?125:48,height:large?135:54,objectFit:'contain',filter:'brightness(0) invert(1)'}}/>
  <span style={{fontFamily:'Outfit',fontSize:large?98:34,fontWeight:900,letterSpacing:large?8:3}}>VICUNIA</span>
</div>;
const Sticker=({children,color,style}:{children:ReactNode;color:string;style?:CSSProperties})=><div style={{display:'inline-block',background:color,color:C.cream,padding:'12px 24px',borderRadius:15,fontFamily:'Outfit',fontWeight:900,fontSize:42,boxShadow:'0 12px 30px #0005',...style}}>{children}</div>;

const MediaBeat=({b}:{b:Beat})=>{
  const f=useCurrentFrame();const {fps}=useVideoConfig();const entry=spring({frame:f,fps,config:{damping:12,stiffness:240}});
  const progress=f/b.len;const scale=1.04+.06*progress;const y=interpolate(entry,[0,1],[95,0]);
  const clip=b.wipe?interpolate(f,[0,7],[100,0],{extrapolateRight:'clamp'}):0;
  const flash=b.from!==0&&!b.wipe?interpolate(f,[0,2,5],[.86,.52,0],{extrapolateRight:'clamp'}):0;
  const top=b.place==='top';const font=b.font==='lora'?'Lora':b.font==='inter'?'Inter':'Outfit';
  const mediaStyle:CSSProperties={position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:b.pos??'center',transform:`scale(${scale})`,filter:`brightness(${b.bright??1}) saturate(1.08)`};
  return <AbsoluteFill style={{background:C.dark,overflow:'hidden',clipPath:`inset(0 ${clip}% 0 0)`}}>
    {b.video?<Video src={staticFile('media/'+b.file)} muted objectFit="cover" style={mediaStyle}/>:<Img src={staticFile('media/'+b.file)} style={mediaStyle}/>}
    <AbsoluteFill style={{background:top?'linear-gradient(180deg,#111b16dc,transparent 55%)':'linear-gradient(0deg,#111b16e8,transparent 58%)'}}/>
    <div style={{position:'absolute',left:58,top:top?245:1210,transform:`translateY(${y}px) rotate(${b.font==='lora'?-3:-2}deg)`,opacity:entry,maxWidth:950}}>
      <Sticker color={b.accent} style={{fontSize:30,padding:'8px 17px',letterSpacing:2}}>{b.tag}</Sticker>
      <div style={{marginTop:22,fontFamily:font,fontStyle:b.font==='lora'?'italic':'normal',fontWeight:b.font==='lora'?700:900,fontSize:b.words.some(w=>w.length>10)?84:104,lineHeight:.92,letterSpacing:-4,color:C.cream,textShadow:'0 12px 32px #000a'}}>{b.words.map((word,i)=><div key={i}>{word}</div>)}</div>
    </div>
    <div style={{position:'absolute',right:48,top:65}}><Brand/></div>
    <div style={{position:'absolute',left:60,bottom:65,width:105,height:7,borderRadius:5,background:b.accent}}/>
    {flash>0&&<AbsoluteFill style={{background:b.accent,opacity:flash}}/>}
  </AbsoluteFill>;
};

const Flash=()=>{const f=useCurrentFrame();const {fps}=useVideoConfig();const s=spring({frame:f,fps,config:{damping:9,stiffness:260}});return <AbsoluteFill style={{background:C.carnival,overflow:'hidden'}}>
  <div style={{position:'absolute',inset:-250,background:`repeating-linear-gradient(130deg,transparent 0px,transparent 100px,${C.retama} 103px,${C.retama} 125px)`,opacity:.3,transform:`translateX(${f*18}px)`}}/>
  <div style={{position:'absolute',left:70,top:510,fontFamily:'Outfit',fontWeight:900,fontSize:135,lineHeight:.92,color:C.cream,textShadow:'8px 14px #7c301d',transform:`scale(${.6+.4*s}) rotate(-5deg)`,transformOrigin:'left center'}}>IMPRESA<br/>EN 3D</div>
  <div style={{position:'absolute',right:70,top:1000,transform:`scale(${.7+.3*s}) rotate(8deg)`}}><Sticker color={C.purple}>Y PINTADA ✦</Sticker></div>
</AbsoluteFill>};

const PhotoCard=({file,x,y,angle,color,delay}:{file:string;x:number;y:number;angle:number;color:string;delay:number})=>{const f=useCurrentFrame();const {fps}=useVideoConfig();const s=spring({frame:Math.max(0,f-delay),fps,config:{damping:10,stiffness:210}});return <div style={{position:'absolute',left:x,top:y,width:315,height:450,padding:12,background:color,borderRadius:23,boxShadow:'0 25px 55px #0005',transform:`translateY(${(1-s)*240}px) rotate(${angle*s}deg) scale(${.75+.25*s})`}}><Img src={staticFile('media/'+file)} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:13}}/></div>};
const Price=()=>{const f=useCurrentFrame();const {fps}=useVideoConfig();const s=spring({frame:Math.max(0,f-8),fps,config:{damping:9,stiffness:260}});return <AbsoluteFill style={{background:C.cream,overflow:'hidden'}}>
  <div style={{position:'absolute',left:-200,top:-300,width:660,height:660,borderRadius:'50%',background:C.gold,opacity:.72}}/>
  <div style={{position:'absolute',right:-300,bottom:-300,width:800,height:800,borderRadius:'50%',background:C.clay,opacity:.2}}/>
  <PhotoCard file="mini-orange-studio.png" x={40} y={230} angle={-10} color={C.gold} delay={0}/>
  <PhotoCard file="mini-blackwhite-studio.png" x={380} y={185} angle={5} color={C.green} delay={2}/>
  <PhotoCard file="mini-yellow-studio.png" x={715} y={225} angle={10} color={C.clay} delay={4}/>
  <div style={{position:'absolute',left:70,top:930,fontFamily:'Outfit',fontWeight:900,fontSize:62,color:C.green}}>TU MASCOTA EN MINI</div>
  <div style={{position:'absolute',left:70,top:1070,fontFamily:'Outfit',fontWeight:900,fontSize:176,color:C.carnival,textShadow:`8px 10px ${C.gold}`,transform:`scale(${.65+.35*s})`,transformOrigin:'left center'}}>S/ 28</div>
  <div style={{position:'absolute',left:75,top:1260,transform:'rotate(-4deg)'}}><Sticker color={C.purple}>DESDE</Sticker></div>
  <div style={{position:'absolute',left:74,top:1470,fontFamily:'Inter',fontWeight:700,fontSize:35,color:C.dark,maxWidth:900}}>El precio final depende de los detalles de pintura.</div>
  <div style={{position:'absolute',left:65,bottom:75}}><Brand/></div>
</AbsoluteFill>};

const Closing=({noPrice=false}:{noPrice?:boolean})=>{const f=useCurrentFrame();const {fps}=useVideoConfig();const s=spring({frame:f,fps,config:{damping:11,stiffness:190}});return <AbsoluteFill style={{background:C.green,overflow:'hidden'}}>
  <div style={{position:'absolute',right:-300,top:-340,width:890,height:890,borderRadius:'50%',background:C.gold,opacity:.9,transform:`scale(${.8+.2*s})`}}/>
  <div style={{position:'absolute',left:-340,bottom:-380,width:900,height:900,borderRadius:'50%',background:C.clay,opacity:.8}}/>
  <div style={{position:'absolute',top:185,left:65,transform:`translateY(${(1-s)*100}px)`}}><Brand large/></div>
  <div style={{position:'absolute',left:65,top:505,fontFamily:'Outfit',fontWeight:900,fontSize:112,lineHeight:.94,color:C.cream}}>ENVÍANOS<br/><span style={{color:C.gold}}>SU FOTO</span></div>
  <div style={{position:'absolute',left:67,top:780,fontFamily:'Lora',fontStyle:'italic',fontWeight:700,fontSize:46,color:C.cream}}>y hacemos su miniatura</div>
  {!noPrice&&<><div style={{position:'absolute',left:67,top:890}}><Sticker color={C.carnival} style={{fontSize:62}}>DESDE S/ 28</Sticker></div>
  <div style={{position:'absolute',left:70,top:1060,fontFamily:'Inter',fontWeight:700,fontSize:34,color:C.cream,maxWidth:730}}>Cotización final según los detalles de pintura.</div></>}
  {f>=(noPrice?40:70)&&<div style={{position:'absolute',left:68,top:noPrice?950:1150,padding:'12px 26px',borderRadius:20,background:C.cream,color:C.green,boxShadow:'0 18px 40px #0006',transform:`scale(${.75+.25*spring({frame:f-(noPrice?40:70),fps,config:{damping:8,stiffness:260}})})`,transformOrigin:'left center'}}>
    <div style={{fontFamily:'Outfit',fontWeight:900,fontSize:28,letterSpacing:3,color:C.carnival}}>PEDIDOS</div>
    <div style={{fontFamily:'Outfit',fontWeight:900,fontSize:70,lineHeight:1}}>907 677 175</div>
  </div>}
  <div style={{position:'absolute',left:105,top:1280,width:380,height:500,border:`12px solid ${C.gold}`,borderRadius:30,overflow:'hidden',transform:`rotate(-8deg) translateY(${(1-s)*360}px)`,boxShadow:'0 25px 65px #0006'}}><Img src={staticFile('media/mini-yellow-studio.png')} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
  <div style={{position:'absolute',left:515,top:1280,width:380,height:500,border:`12px solid ${C.cream}`,borderRadius:30,overflow:'hidden',transform:`rotate(8deg) translateY(${(1-s)*360}px)`,boxShadow:'0 25px 65px #0006'}}><Img src={staticFile('media/mini-orange-studio.png')} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
  <div style={{position:'absolute',right:70,bottom:55,fontFamily:'Outfit',fontWeight:900,fontSize:27,color:C.cream,letterSpacing:4}}>CAJAMARCA</div>
</AbsoluteFill>};

export const Edit=({noPrice=false}:{noPrice?:boolean})=> <AbsoluteFill style={{background:C.dark}}>
  {beats.map((b,i)=><Sequence key={i} from={b.from} durationInFrames={b.len}><MediaBeat b={b}/></Sequence>)}
  <Sequence from={82} durationInFrames={18}><Flash/></Sequence>
  {!noPrice&&<Sequence from={244} durationInFrames={46}><Price/></Sequence>}
  <Sequence from={noPrice?244:290} durationInFrames={noPrice?146:160}><Closing noPrice={noPrice}/></Sequence>
</AbsoluteFill>;

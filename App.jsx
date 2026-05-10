import React, { useState, useMemo } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
  ScatterChart, Scatter, ZAxis, Legend
} from "recharts";

// ── GROUPS ────────────────────────────────────────────────────────────────────
const GROUPS = {
  A:{teams:["Mexico","South Africa","South Korea","Turkiye"]},
  B:{teams:["Canada","Sweden","Qatar","Switzerland"]},
  C:{teams:["Brazil","Morocco","Haiti","Scotland"]},
  D:{teams:["USA","Paraguay","Australia","Czechia"]},
  E:{teams:["Germany","Curacao","Ivory Coast","Ecuador"]},
  F:{teams:["Netherlands","Japan","Bosnia & Herz.","Tunisia"]},
  G:{teams:["Belgium","Egypt","Iran","New Zealand"]},
  H:{teams:["Spain","Cape Verde","Saudi Arabia","Uruguay"]},
  I:{teams:["France","Senegal","Iraq","Norway"]},
  J:{teams:["Argentina","Algeria","Austria","Jordan"]},
  K:{teams:["Portugal","DR Congo","Uzbekistan","Colombia"]},
  L:{teams:["England","Croatia","Ghana","Panama"]},
};

const FIFA_RANK = {
  "Spain":1,"Argentina":2,"France":3,"England":4,"Brazil":5,"Portugal":6,
  "Netherlands":7,"Belgium":8,"Germany":9,"Uruguay":10,"Colombia":11,
  "Mexico":12,"USA":13,"Switzerland":14,"Japan":15,"Morocco":16,"Croatia":17,
  "Senegal":18,"Ecuador":19,"Australia":20,"Sweden":21,"South Korea":22,
  "Tunisia":23,"Canada":24,"Norway":25,"Austria":26,"Iran":27,"Scotland":28,
  "Ivory Coast":29,"Ghana":30,"Egypt":31,"Paraguay":32,"Turkiye":33,
  "Saudi Arabia":34,"Bosnia & Herz.":36,"Iraq":37,"Qatar":38,
  "South Africa":39,"Czechia":40,"New Zealand":41,"Haiti":42,"Curacao":43,
  "Algeria":44,"Cape Verde":45,"Panama":46,"DR Congo":47,"Uzbekistan":48,"Jordan":49,
};

// ── FLAG CODES (ISO 3166-1 alpha-2 for flagcdn.com) ───────────────────────────
const FLAG_CODES = {
  "Mexico":"mx","South Korea":"kr","South Africa":"za","Czechia":"cz",
  "Canada":"ca","Sweden":"se","Qatar":"qa","Switzerland":"ch",
  "Brazil":"br","Morocco":"ma","Haiti":"ht","Scotland":"gb-sct",
  "USA":"us","Paraguay":"py","Australia":"au","Turkiye":"tr",
  "Germany":"de","Curacao":"cw","Ivory Coast":"ci","Ecuador":"ec",
  "Netherlands":"nl","Japan":"jp","Bosnia & Herz.":"ba","Tunisia":"tn",
  "Belgium":"be","Egypt":"eg","Iran":"ir","New Zealand":"nz",
  "Spain":"es","Cape Verde":"cv","Saudi Arabia":"sa","Uruguay":"uy",
  "France":"fr","Senegal":"sn","Iraq":"iq","Norway":"no",
  "Argentina":"ar","Algeria":"dz","Austria":"at","Jordan":"jo",
  "Portugal":"pt","DR Congo":"cd","Uzbekistan":"uz","Colombia":"co",
  "England":"gb-eng","Croatia":"hr","Ghana":"gh","Panama":"pa",
};

// FlagImg renders a real flag image from flagcdn.com
// Styled to match the screenshot: fixed w:h ratio box, rounded corners, no border
function FlagImg({ team, size = 28 }) {
  const code = FLAG_CODES[team];
  const w = size;
  const h = Math.round(size * 0.67); // ~3:2 flag ratio
  const r = Math.max(2, Math.round(size * 0.1)); // corner radius scales with size
  if (!code) {
    return (
      <span style={{
        display:"inline-flex",alignItems:"center",justifyContent:"center",
        width:w,height:h,fontSize:h*0.8,flexShrink:0,borderRadius:r,
        background:"#1A2060",overflow:"hidden"
      }}>🏳</span>
    );
  }
  // Use 2x resolution src for crispness (flagcdn serves w40, w80, w160 etc.)
  const srcW = w <= 20 ? 40 : w <= 40 ? 80 : 160;
  return (
    <img
      src={`https://flagcdn.com/w${srcW}/${code}.png`}
      alt={team}
      style={{
        width:w, height:h,
        objectFit:"cover",
        borderRadius:r,
        flexShrink:0,
        display:"inline-block",
        verticalAlign:"middle",
      }}
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />
  );
}

// ── Player Data ───────────────────────────────────────────────────────────────
const PLAYERS = [
  {name:"Kylian Mbappé",team:"France",pos:"FW",age:27,flag:"fr",club:"Real Madrid",goals:28,assists:9,matches:29,val:180,drib:4.2,kp:3.8,tck:0.8,shots:5.2,mins:2430,u23:false,bio:"28 goals & 9 assists for Real Madrid · Reigning Ballon d'Or"},
  {name:"Erling Haaland",team:"Norway",pos:"FW",age:24,flag:"no",club:"Man City",goals:36,assists:4,matches:31,val:200,drib:1.8,kp:1.2,tck:0.3,shots:6.8,mins:2700,u23:false,bio:"36 goals for Man City · Europe's top scorer 2025/26"},
  {name:"Lionel Messi",team:"Argentina",pos:"FW",age:38,flag:"ar",club:"Inter Miami",goals:22,assists:18,matches:26,val:35,drib:4.8,kp:5.2,tck:0.6,shots:4.1,mins:2100,u23:false,bio:"22 goals & 18 assists · 109 international goals total"},
  {name:"Harry Kane",team:"England",pos:"FW",age:31,flag:"gb-eng",club:"Bayern Munich",goals:31,assists:5,matches:32,val:120,drib:1.4,kp:2.9,tck:0.5,shots:5.9,mins:2790,u23:false,bio:"31 goals for Bayern · England's all-time leading scorer with 68 goals"},
  {name:"Vinicius Jr.",team:"Brazil",pos:"FW",age:24,flag:"br",club:"Real Madrid",goals:24,assists:11,matches:31,val:150,drib:5.8,kp:3.1,tck:0.7,shots:4.8,mins:2560,u23:false,bio:"24 goals & 11 assists for Real Madrid · UCL winner"},
  {name:"Viktor Gyokeres",team:"Sweden",pos:"FW",age:26,flag:"se",club:"Arsenal",goals:43,assists:8,matches:36,val:95,drib:3.2,kp:2.0,tck:0.9,shots:7.1,mins:3050,u23:false,bio:"43 goals for Arsenal · Highest scorer in Europe this season"},
  {name:"Cristiano Ronaldo",team:"Portugal",pos:"FW",age:40,flag:"pt",club:"Al-Nassr",goals:31,assists:6,matches:33,val:15,drib:2.1,kp:1.8,tck:0.4,shots:5.4,mins:2610,u23:false,bio:"31 goals for Al-Nassr · 135 international goals all time"},
  {name:"Lamine Yamal",team:"Spain",pos:"RW",age:17,flag:"es",club:"Barcelona",goals:18,assists:16,matches:33,val:180,drib:6.1,kp:4.9,tck:0.8,shots:3.6,mins:2720,u23:true,bio:"18 goals & 16 assists for Barcelona · Youngest Euro 2024 scorer · Born 2007"},
  {name:"Bukayo Saka",team:"England",pos:"RW",age:23,flag:"gb-eng",club:"Arsenal",goals:20,assists:14,matches:34,val:140,drib:4.4,kp:4.2,tck:1.1,shots:3.9,mins:3010,u23:true,bio:"20 goals & 14 assists for Arsenal this season"},
  {name:"Kevin De Bruyne",team:"Belgium",pos:"CM",age:33,flag:"be",club:"Man City",goals:10,assists:17,matches:30,val:60,drib:2.6,kp:6.8,tck:1.4,shots:2.4,mins:2650,u23:false,bio:"17 assists for Man City · World's best creative midfielder"},
  {name:"Pedri",team:"Spain",pos:"CM",age:22,flag:"es",club:"Barcelona",goals:12,assists:11,matches:33,val:100,drib:3.9,kp:5.1,tck:2.1,shots:2.2,mins:2890,u23:true,bio:"12 goals & 11 assists for Barcelona · Born 2002"},
  {name:"Jude Bellingham",team:"England",pos:"CM",age:21,flag:"gb-eng",club:"Real Madrid",goals:16,assists:9,matches:32,val:180,drib:3.2,kp:4.3,tck:1.8,shots:3.1,mins:2770,u23:true,bio:"16 goals for Real Madrid · Born 2003"},
  {name:"Dani Olmo",team:"Spain",pos:"AM",age:26,flag:"es",club:"Barcelona",goals:14,assists:8,matches:30,val:80,drib:3.5,kp:4.8,tck:1.6,shots:2.9,mins:2510,u23:false,bio:"14 goals for Barcelona · Euro 2024 joint Golden Boot"},
  {name:"Phil Foden",team:"England",pos:"AM",age:25,flag:"gb-eng",club:"Man City",goals:18,assists:12,matches:31,val:110,drib:3.8,kp:4.5,tck:1.1,shots:3.3,mins:2620,u23:false,bio:"18 goals & 12 assists for Man City this season"},
  {name:"Franco Mastantuono",team:"Argentina",pos:"AM",age:18,flag:"ar",club:"Real Madrid",goals:12,assists:6,matches:25,val:90,drib:3.6,kp:3.9,tck:1.2,shots:2.4,mins:1980,u23:true,bio:"12 goals for Real Madrid · Youngest ever CL scorer · Born 2006"},
  {name:"Arda Güler",team:"Turkiye",pos:"AM",age:19,flag:"tr",club:"Real Madrid",goals:14,assists:7,matches:28,val:70,drib:4.1,kp:4.2,tck:0.9,shots:2.7,mins:2200,u23:true,bio:"14 goals for Real Madrid · Türkiye's creative spark · Born 2005"},
  {name:"Endrick",team:"Brazil",pos:"FW",age:18,flag:"br",club:"Lyon",goals:15,assists:7,matches:28,val:45,drib:2.8,kp:2.3,tck:0.6,shots:3.8,mins:2100,u23:true,bio:"15 goals on loan at Lyon · Brazil's next great striker · Born 2006"},
  {name:"Jamal Musiala",team:"Germany",pos:"AM",age:21,flag:"de",club:"Bayern Munich",goals:19,assists:14,matches:32,val:130,drib:5.1,kp:4.7,tck:1.0,shots:3.4,mins:2710,u23:true,bio:"19 goals & 14 assists for Bayern Munich · Born 2003"},
  {name:"Florian Wirtz",team:"Germany",pos:"AM",age:21,flag:"de",club:"Leverkusen",goals:16,assists:17,matches:31,val:120,drib:4.3,kp:5.8,tck:1.2,shots:2.9,mins:2640,u23:true,bio:"16 goals & 17 assists for Leverkusen · Born 2003"},
  {name:"Rodri",team:"Spain",pos:"DM",age:28,flag:"es",club:"Man City",goals:5,assists:6,matches:31,val:120,drib:1.8,kp:4.2,tck:3.6,shots:0.8,mins:2780,u23:false,bio:"5 goals & 6 assists · Ballon d'Or 2024 · Defensive anchor"},
  {name:"Virgil van Dijk",team:"Netherlands",pos:"CB",age:33,flag:"nl",club:"Liverpool",goals:4,assists:2,matches:34,val:55,drib:0.8,kp:1.4,tck:3.1,shots:0.5,mins:3060,u23:false,bio:"4 goals for Liverpool · Premier League's best defender"},
  {name:"Trent Alexander-Arnold",team:"England",pos:"RB",age:26,flag:"gb-eng",club:"Real Madrid",goals:6,assists:14,matches:33,val:90,drib:2.4,kp:5.6,tck:1.8,shots:1.2,mins:2950,u23:false,bio:"6 goals & 14 assists from right back · Unique in world football"},
  {name:"Achraf Hakimi",team:"Morocco",pos:"RB",age:26,flag:"ma",club:"PSG",goals:8,assists:12,matches:33,val:75,drib:4.1,kp:4.2,tck:2.0,shots:1.6,mins:2920,u23:false,bio:"8 goals & 12 assists for PSG · World's best attacking fullback"},
  {name:"Antoine Griezmann",team:"France",pos:"AM",age:33,flag:"fr",club:"Atlético Madrid",goals:16,assists:12,matches:32,val:50,drib:3.1,kp:4.6,tck:1.3,shots:2.8,mins:2680,u23:false,bio:"16 goals & 12 assists for Atlético · France's key creator"},
  {name:"Julián Álvarez",team:"Argentina",pos:"FW",age:24,flag:"ar",club:"Atlético Madrid",goals:21,assists:10,matches:33,val:80,drib:2.9,kp:3.2,tck:0.8,shots:4.2,mins:2740,u23:false,bio:"21 goals for Atlético Madrid · World Cup winner 2022"},
  {name:"Leroy Sané",team:"Germany",pos:"RW",age:29,flag:"de",club:"Bayern Munich",goals:17,assists:13,matches:31,val:65,drib:4.9,kp:4.1,tck:0.8,shots:3.2,mins:2590,u23:false,bio:"17 goals & 13 assists for Bayern Munich this season"},
  {name:"Savio",team:"Brazil",pos:"RW",age:20,flag:"br",club:"Man City",goals:12,assists:10,matches:29,val:65,drib:5.2,kp:3.6,tck:0.7,shots:2.8,mins:2280,u23:true,bio:"12 goals & 10 assists for Man City · Lightning quick · Born 2004"},
  {name:"Antonio Nusa",team:"Norway",pos:"FW",age:20,flag:"no",club:"RB Leipzig",goals:11,assists:9,matches:29,val:45,drib:4.8,kp:3.1,tck:0.9,shots:2.4,mins:2100,u23:true,bio:"11 goals & 9 assists for RB Leipzig · Born 2004"},
  {name:"Alejandro Garnacho",team:"Argentina",pos:"LW",age:20,flag:"ar",club:"Man Utd",goals:15,assists:6,matches:30,val:55,drib:4.6,kp:2.8,tck:0.8,shots:3.1,mins:2350,u23:true,bio:"15 goals for Man Utd · Big-game performer · Born 2004"},
];

const PL = PLAYERS.map(p => {
  const g90 = +(p.goals/p.mins*90).toFixed(2);
  const a90 = +(p.assists/p.mins*90).toFixed(2);
  const ga90 = +(g90+a90).toFixed(2);
  const sh90 = +(p.shots/p.mins*90).toFixed(2);
  return {...p, g90, a90, ga90, sh90};
});

function kmeans(data, k) {
  const feats = data.map(p => [p.g90, p.a90, p.sh90, p.kp/p.mins*90, p.drib/p.mins*90, p.tck/p.mins*90]);
  let cents = [feats[0], feats[4], feats[9], feats[15], feats[20], feats[24]].slice(0,k);
  let labels = new Array(data.length).fill(0);
  for (let iter = 0; iter < 8; iter++) {
    labels = feats.map(f => {
      let best = 0, bestD = Infinity;
      cents.forEach((c,ci) => { const d = c.reduce((s,v,i) => s+(v-f[i])**2, 0); if (d < bestD) { bestD = d; best = ci; } });
      return best;
    });
    cents = cents.map((_, ci) => {
      const pts = feats.filter((_,i) => labels[i]===ci);
      if (!pts.length) return cents[ci];
      return cents[ci].map((_,fi) => pts.reduce((s,p) => s+p[fi], 0)/pts.length);
    });
  }
  return labels;
}

const CLUSTER_LABELS = ["🎯 Goal Poachers","⚡ Dribbling Wizards","🎨 Creative Playmakers","🛡️ Defensive Rocks","🔥 Box-to-Box","🎭 All-Rounders"];
const clusterAssignments = kmeans(PL, 6);
const PL_CLUSTERED = PL.map((p,i) => ({...p, cluster: CLUSTER_LABELS[clusterAssignments[i]] || "🔥 Box-to-Box"}));

const WC_WINNERS=[
  {year:2022,winner:"Argentina",runner:"France",score:"3-3 (4-2p)",host:"Qatar",scorer:"Mbappé (8)",mvp:"Messi"},
  {year:2018,winner:"France",runner:"Croatia",score:"4-2",host:"Russia",scorer:"Kane (6)",mvp:"Modrić"},
  {year:2014,winner:"Germany",runner:"Argentina",score:"1-0 AET",host:"Brazil",scorer:"Rodríguez (6)",mvp:"Messi"},
  {year:2010,winner:"Spain",runner:"Netherlands",score:"1-0 AET",host:"S.Africa",scorer:"Müller (5)",mvp:"Forlán"},
  {year:2006,winner:"Italy",runner:"France",score:"1-1 (5-3p)",host:"Germany",scorer:"Klose (5)",mvp:"Zidane"},
  {year:2002,winner:"Brazil",runner:"Germany",score:"2-0",host:"Korea/Japan",scorer:"Ronaldo (8)",mvp:"O.Kahn"},
  {year:1998,winner:"France",runner:"Brazil",score:"3-0",host:"France",scorer:"Šuker (6)",mvp:"Ronaldo"},
  {year:1994,winner:"Brazil",runner:"Italy",score:"0-0 (3-2p)",host:"USA",scorer:"Salenko (6)",mvp:"Romário"},
  {year:1990,winner:"Germany",runner:"Argentina",score:"1-0",host:"Italy",scorer:"Schillaci (6)",mvp:"Schillaci"},
  {year:1986,winner:"Argentina",runner:"Germany",score:"3-2",host:"Mexico",scorer:"Lineker (6)",mvp:"Maradona"},
  {year:1982,winner:"Italy",runner:"Germany",score:"3-1",host:"Spain",scorer:"P.Rossi (6)",mvp:"P.Rossi"},
  {year:1978,winner:"Argentina",runner:"Netherlands",score:"3-1 AET",host:"Argentina",scorer:"Kempes (6)",mvp:"Kempes"},
  {year:1974,winner:"Germany",runner:"Netherlands",score:"2-1",host:"Germany",scorer:"Lato (7)",mvp:"Cruyff"},
  {year:1970,winner:"Brazil",runner:"Italy",score:"4-1",host:"Mexico",scorer:"G.Müller (10)",mvp:"Pelé"},
  {year:1966,winner:"England",runner:"Germany",score:"4-2 AET",host:"England",scorer:"Eusébio (9)",mvp:"B.Charlton"},
  {year:1958,winner:"Brazil",runner:"Sweden",score:"5-2",host:"Sweden",scorer:"Fontaine (13)",mvp:"Didi"},
  {year:1954,winner:"Germany",runner:"Hungary",score:"3-2",host:"Switzerland",scorer:"Kocsis (11)",mvp:"F.Walter"},
  {year:1930,winner:"Uruguay",runner:"Argentina",score:"4-2",host:"Uruguay",scorer:"Stábile (8)",mvp:"Nasazzi"},
];

const WC_SCORERS=[
  {name:"Miroslav Klose",country:"Germany",flag:"de",goals:16,years:"2002–14",t:4},
  {name:"Ronaldo",country:"Brazil",flag:"br",goals:15,years:"1994–06",t:4},
  {name:"Lionel Messi",country:"Argentina",flag:"ar",goals:13,years:"2006–22",t:5},
  {name:"Gerd Müller",country:"Germany",flag:"de",goals:14,years:"1970–74",t:2},
  {name:"Just Fontaine",country:"France",flag:"fr",goals:13,years:"1958",t:1},
  {name:"Pelé",country:"Brazil",flag:"br",goals:12,years:"1958–70",t:4},
  {name:"Thomas Müller",country:"Germany",flag:"de",goals:10,years:"2010–22",t:4},
  {name:"Gary Lineker",country:"England",flag:"gb-eng",goals:10,years:"1986–90",t:2},
  {name:"Sándor Kocsis",country:"Hungary",flag:"hu",goals:11,years:"1954",t:1},
  {name:"Cristiano Ronaldo",country:"Portugal",flag:"pt",goals:8,years:"2006–22",t:5},
].sort((a,b)=>b.goals-a.goals);

const WC_TITLES=[
  {country:"Brazil",flag:"br",wins:5,years:[1958,1962,1970,1994,2002]},
  {country:"Germany",flag:"de",wins:4,years:[1954,1974,1990,2014]},
  {country:"Italy",flag:"it",wins:4,years:[1934,1938,1982,2006]},
  {country:"Argentina",flag:"ar",wins:3,years:[1978,1986,2022]},
  {country:"France",flag:"fr",wins:2,years:[1998,2018]},
  {country:"Uruguay",flag:"uy",wins:2,years:[1930,1950]},
  {country:"England",flag:"gb-eng",wins:1,years:[1966]},
  {country:"Spain",flag:"es",wins:1,years:[2010]},
];

// ── Theme ─────────────────────────────────────────────────────────────────────
const CY="#00C8D4", PK="#D4006C", PU="#8B2FC9", GD="#FFD700";
const BG="#07091E", CB="#0D1035", CB2="#0A0D28", BDR="#1A2060";
const TX="#FFFFFF", MUT="#8090B0";
const F="'Barlow Condensed', sans-serif";
const CCOLS=[CY,PK,GD,PU,"#00E676","#FF6D00"];

// ── Tournament logic ──────────────────────────────────────────────────────────
function sig(x){return 1/(1+Math.exp(-x));}
function predictProbs(t1,t2){
  const r1=FIFA_RANK[t1]||40, r2=FIFA_RANK[t2]||40, d=r2-r1;
  let pw=sig(d*0.07)*0.78, pl=sig(-d*0.07)*0.78, pd=Math.max(0.05,1-pw-pl);
  const tot=pw+pd+pl; pw/=tot; pd/=tot; pl/=tot;
  return {win:Math.round(pw*100), draw:Math.round(pd*100), loss:Math.round(pl*100)};
}
function predictWinner(t1,t2){
  if(!t1||!t2) return t1||t2||"TBD";
  const p=predictProbs(t1,t2), r=Math.random()*100;
  return r<p.win?t1:t2;
}
function allPairs(teams){
  const o=[];
  for(let i=0;i<teams.length;i++) for(let j=i+1;j<teams.length;j++) o.push([teams[i],teams[j]]);
  return o;
}
function simulateGroup(teams,picks){
  const pts={},gd={},gs={};
  teams.forEach(t=>{pts[t]=0;gd[t]=0;gs[t]=0;});
  allPairs(teams).forEach(([t1,t2])=>{
    const k=t1+"v"+t2; let res=picks[k];
    if(!res){const p=predictProbs(t1,t2),r=Math.random()*100; res=r<p.win?t1:r<p.win+p.draw?"draw":t2;}
    if(res===t1){pts[t1]+=3;gd[t1]+=2;gd[t2]-=2;gs[t1]+=2;}
    else if(res===t2){pts[t2]+=3;gd[t2]+=2;gd[t1]-=2;gs[t2]+=2;}
    else{pts[t1]+=1;pts[t2]+=1;gs[t1]+=1;gs[t2]+=1;}
  });
  const sorted=[...teams].sort((a,b)=>pts[b]-pts[a]||gd[b]-gd[a]||gs[b]-gs[a]);
  return {sorted,pts,gd,gs};
}
function rankThirds(gr){
  return Object.entries(gr).map(([gid,r])=>{
    const t=r.sorted[2];
    return {team:t,gid,pts:r.pts[t],gd:r.gd[t],gs:r.gs[t],rank:FIFA_RANK[t]||50};
  }).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gs-a.gs||a.rank-b.rank);
}
const SLOTS=[
  {m:"M74",e:["A","B","C","D","F"]},{m:"M77",e:["C","D","F","G","H"]},
  {m:"M79",e:["C","E","F","H","I"]},{m:"M80",e:["E","H","I","J","K"]},
  {m:"M81",e:["B","E","F","I","J"]},{m:"M82",e:["A","E","H","I","J"]},
  {m:"M85",e:["E","F","G","I","J"]},{m:"M87",e:["D","E","I","J","L"]},
];
function assign3rd(q3){
  const used={},res={};
  SLOTS.forEach(slot=>{
    let pick=null;
    for(let i=0;i<q3.length;i++){if(!used[q3[i].team]&&slot.e.includes(q3[i].gid)){pick=q3[i].team;used[pick]=1;break;}}
    if(!pick){for(let i=0;i<q3.length;i++){if(!used[q3[i].team]){pick=q3[i].team;used[pick]=1;break;}}}
    res[slot.m]=pick||"TBD";
  });
  return res;
}
function buildR32(gr,rt){
  const W=g=>gr[g].sorted[0], R=g=>gr[g].sorted[1];
  const q3=rt.slice(0,8), sm=assign3rd(q3);
  return[
    {t1:W("E"),t2:sm["M74"],w:null,label:"M74",sub:"1E v 3rd",path:1},
    {t1:W("I"),t2:sm["M77"],w:null,label:"M77",sub:"1I v 3rd",path:1},
    {t1:R("A"),t2:R("B"),w:null,label:"M73",sub:"2A v 2B",path:1},
    {t1:W("F"),t2:R("C"),w:null,label:"M75",sub:"1F v 2C",path:1},
    {t1:R("K"),t2:R("L"),w:null,label:"M83",sub:"2K v 2L",path:1},
    {t1:W("H"),t2:R("J"),w:null,label:"M84",sub:"1H v 2J",path:1},
    {t1:W("D"),t2:sm["M81"],w:null,label:"M81",sub:"1D v 3rd",path:1},
    {t1:W("G"),t2:sm["M82"],w:null,label:"M82",sub:"1G v 3rd",path:1},
    {t1:W("C"),t2:R("F"),w:null,label:"M76",sub:"1C v 2F",path:2},
    {t1:R("E"),t2:R("I"),w:null,label:"M78",sub:"2E v 2I",path:2},
    {t1:W("A"),t2:sm["M79"],w:null,label:"M79",sub:"1A v 3rd",path:2},
    {t1:W("L"),t2:sm["M80"],w:null,label:"M80",sub:"1L v 3rd",path:2},
    {t1:W("J"),t2:R("H"),w:null,label:"M86",sub:"1J v 2H",path:2},
    {t1:R("D"),t2:R("G"),w:null,label:"M88",sub:"2D v 2G",path:2},
    {t1:W("B"),t2:sm["M85"],w:null,label:"M85",sub:"1B v 3rd",path:2},
    {t1:W("K"),t2:sm["M87"],w:null,label:"M87",sub:"1K v 3rd",path:2},
  ];
}
function buildNext(ms){
  const o=[];
  for(let i=0;i<ms.length;i+=2) o.push({t1:ms[i].w,t2:ms[i+1].w,w:null});
  return o;
}
function teamDepth(t){const r=FIFA_RANK[t]||40;if(r<=4)return 6;if(r<=8)return 5;if(r<=16)return 4;if(r<=24)return 3;if(r<=32)return 2;return 1.2;}
function simAwards(){
  const n=()=>(Math.random()-0.5)*4;
  const sc=[...PL_CLUSTERED].filter(p=>["FW","RW","LW","AM"].includes(p.pos)).map(p=>{
    const d=teamDepth(p.team), s=p.goals*0.38+p.g90*9+(p.pos==="FW"?8:4)+d*6+n();
    const simG=Math.max(0,Math.round(p.goals/38*6+(p.g90-0.3)*3+d*0.5+Math.random()*3));
    return {...p,score:s,simG};
  }).sort((a,b)=>b.score-a.score).slice(0,10);
  const as=[...PL_CLUSTERED].filter(p=>["CM","AM","RW","LW","FW","RB","LB"].includes(p.pos)).map(p=>{
    const d=teamDepth(p.team), s=p.assists*0.42+p.a90*8+(["CM","AM"].includes(p.pos)?7:3)+d*5+n();
    const simA=Math.max(0,Math.round(p.assists/38*6+(p.a90-0.2)*2+d*0.4+Math.random()*2));
    return {...p,score:s,simA};
  }).sort((a,b)=>b.score-a.score).slice(0,10);
  const yg=[...PL_CLUSTERED].filter(p=>p.u23).map(p=>{
    const d=teamDepth(p.team), pot=(23-p.age)*2.8, s=p.goals*0.25+p.assists*0.25+pot+d*4+(Math.random()-0.5)*5;
    const simR=Math.min(10,Math.max(6.5,7+(p.ga90-0.5)*0.8+(d-2)*0.3+(Math.random()-0.5)*0.9));
    return {...p,score:s,simR:simR.toFixed(1)};
  }).sort((a,b)=>b.score-a.score).slice(0,8);
  return {sc,as,yg};
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Btn({onClick,style,children}){
  return <button onClick={onClick} style={{fontFamily:F,outline:"none",cursor:"pointer",transition:"all .15s",...style}}>{children}</button>;
}

// GroupCard — white official style
function GroupCard({gid,teams}){
  const gc=gid.charCodeAt(0)%2===0?CY:PK;
  return(
    <div style={{borderRadius:6,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.7)"}}>
      <div style={{background:gc,padding:"5px 10px",display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:11,fontWeight:900,color:"#000",letterSpacing:3,fontFamily:F}}>GROUP</span>
        <span style={{fontSize:17,fontWeight:900,color:"#000",fontFamily:F}}>{gid}</span>
      </div>
      {teams.map((t,i)=>(
        <div key={t} style={{background:"#FFFFFF",display:"flex",alignItems:"center",borderBottom:i<3?"1px solid #DDD":undefined,minHeight:38}}>
          <div style={{width:5,alignSelf:"stretch",background:["#1a1a3e","#2d2d5e","#3d3d7e","#4d4d9e"][i],flexShrink:0}}/>
          <div style={{width:44,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px",flexShrink:0}}>
            <FlagImg team={t} size={30}/>
          </div>
          <span style={{flex:1,fontSize:13,fontWeight:800,color:"#111",fontFamily:F,letterSpacing:1,textTransform:"uppercase",padding:"0 6px"}}>{t}</span>
          <span style={{fontSize:9,color:"#888",fontFamily:"monospace",marginRight:7,background:"#f0f0f0",padding:"1px 4px",borderRadius:3}}>#{FIFA_RANK[t]||"?"}</span>
        </div>
      ))}
    </div>
  );
}

function MatchPicker({t1,t2,picked,onPick,gc}){
  const p=predictProbs(t1,t2);
  return(
    <div style={{background:CB,border:`1px solid ${picked?gc+"99":BDR}`,borderRadius:8,padding:"9px 11px",marginBottom:7,boxShadow:picked?`0 0 12px ${gc}33`:undefined}}>
      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
        <Btn onClick={()=>onPick(picked===t1?null:t1)} style={{flex:1,padding:"7px 9px",borderRadius:6,background:picked===t1?gc+"22":"#07091E",border:`2px solid ${picked===t1?gc:BDR}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{display:"flex",alignItems:"center",gap:7}}>
            <FlagImg team={t1} size={28}/>
            <span style={{fontSize:14,fontWeight:800,color:TX,fontFamily:F}}>{t1}</span>
          </span>
          <span style={{fontSize:12,color:gc,fontFamily:"monospace",fontWeight:800}}>{p.win}%</span>
        </Btn>
        <Btn onClick={()=>onPick(picked==="draw"?null:"draw")} style={{padding:"7px 8px",borderRadius:6,background:picked==="draw"?"#fff1":"#07091E",border:`2px solid ${picked==="draw"?"#777":BDR}`,color:MUT,fontSize:11,fontWeight:700,fontFamily:F,display:"flex",flexDirection:"column",alignItems:"center",lineHeight:1.3}}>
          <span>DRAW</span><span style={{fontSize:9,color:"#556",marginTop:1}}>{p.draw}%</span>
        </Btn>
        <Btn onClick={()=>onPick(picked===t2?null:t2)} style={{flex:1,padding:"7px 9px",borderRadius:6,background:picked===t2?gc+"22":"#07091E",border:`2px solid ${picked===t2?gc:BDR}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:12,color:gc,fontFamily:"monospace",fontWeight:800}}>{p.loss}%</span>
          <span style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:14,fontWeight:800,color:TX,fontFamily:F}}>{t2}</span>
            <FlagImg team={t2} size={28}/>
          </span>
        </Btn>
      </div>
      <div style={{height:3,borderRadius:2,background:"#0A0D28",display:"flex",overflow:"hidden"}}>
        <div style={{width:p.win+"%",background:gc,transition:"width .4s"}}/>
        <div style={{width:p.draw+"%",background:"#333"}}/>
        <div style={{width:p.loss+"%",background:"#3a1020"}}/>
      </div>
    </div>
  );
}

function GroupTable({gid,sorted,pts,gd}){
  const gc=gid.charCodeAt(0)%2===0?CY:PK;
  return(
    <div style={{borderRadius:6,overflow:"hidden",border:`1px solid ${BDR}`}}>
      <div style={{background:gc,padding:"4px 9px"}}>
        <span style={{fontSize:11,fontWeight:900,color:"#000",letterSpacing:2,fontFamily:F}}>GROUP {gid}</span>
      </div>
      {sorted.map((t,i)=>(
        <div key={t} style={{display:"flex",alignItems:"center",padding:"4px 8px",background:i%2===0?CB:CB2,borderLeft:`3px solid ${i<2?gc:"transparent"}`}}>
          <span style={{color:"#446",fontSize:9,fontFamily:"monospace",width:12}}>{i+1}</span>
          <span style={{margin:"0 5px"}}><FlagImg team={t} size={20}/></span>
          <span style={{flex:1,fontSize:12,fontWeight:i<2?800:400,color:i<2?TX:MUT,fontFamily:F}}>{t}</span>
          <span style={{fontSize:9,color:MUT,fontFamily:"monospace",marginRight:5}}>{gd[t]>=0?"+":""}{gd[t]}</span>
          <span style={{fontSize:13,fontWeight:900,color:i<2?gc:MUT,fontFamily:"monospace"}}>{pts[t]}</span>
        </div>
      ))}
    </div>
  );
}

function KOMatch({t1,t2,winner,onPick,label,sub,path,isFinal,col}){
  const c=col||(path===2?PK:CY); const fc=isFinal?GD:c;
  const p=t1&&t2&&t1!=="TBD"&&t2!=="TBD"?predictProbs(t1,t2):null;
  return(
    <div style={{borderRadius:7,overflow:"hidden",border:`1px solid ${fc}44`,boxShadow:isFinal?`0 0 20px ${GD}44`:undefined}}>
      <div style={{background:fc,padding:"4px 9px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:12,fontWeight:900,color:"#000",fontFamily:F,letterSpacing:1}}>{label}</span>
        <span style={{fontSize:9,color:"#000b",fontFamily:F,fontWeight:700}}>{sub}</span>
      </div>
      {[t1,t2].map((team,idx)=>{
        const isWin=winner&&winner===team;
        return(
          <div key={idx} onClick={()=>team&&team!=="TBD"&&onPick&&onPick(team)}
            style={{display:"flex",alignItems:"center",gap:6,padding:"7px 9px",
              background:isWin?fc+"28":idx===0?CB:CB2,
              borderBottom:idx===0?`1px solid ${BDR}`:undefined,
              borderLeft:isWin?`3px solid ${fc}`:"3px solid transparent",
              cursor:team&&team!=="TBD"?"pointer":"default"}}>
            {team&&team!=="TBD"
              ? <FlagImg team={team} size={18}/>
              : <span style={{fontSize:18,width:18,textAlign:"center"}}>❓</span>
            }
            <span style={{flex:1,fontSize:13,fontWeight:isWin?900:600,color:isWin?fc:TX,fontFamily:F}}>{team||"TBD"}</span>
            {p&&<span style={{fontSize:10,color:isWin?fc:MUT,fontFamily:"monospace"}}>{idx===0?p.win:p.loss}%</span>}
            {isWin&&<span style={{color:fc,fontSize:12}}>▶</span>}
          </div>
        );
      })}
    </div>
  );
}

function SHdr({label,col}){
  const c=col||CY;
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0 9px"}}>
      <div style={{width:4,height:18,background:c,borderRadius:2,flexShrink:0}}/>
      <span style={{fontSize:14,fontWeight:900,color:c,letterSpacing:3,fontFamily:F,textTransform:"uppercase"}}>{label}</span>
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,${c}55,transparent)`}}/>
    </div>
  );
}

function AdvBtn({label,onClick}){
  return <Btn onClick={onClick} style={{width:"100%",marginTop:9,padding:"12px",background:"transparent",border:`2px solid ${CY}`,borderRadius:7,color:CY,fontSize:13,fontWeight:900,letterSpacing:2}}>{label}</Btn>;
}

// ── Recharts ──────────────────────────────────────────────────────────────────
const TOOLTIP_STYLE={background:GD,border:"none",borderRadius:8,color:"#000000",fontFamily:F,fontSize:13,fontWeight:800,boxShadow:"0 4px 16px rgba(0,0,0,0.6)"};

function TopScorersChart(){
  const data=[...PL_CLUSTERED].sort((a,b)=>b.goals-a.goals).slice(0,10).map(p=>({name:p.name.split(" ").pop(),goals:p.goals,assists:p.assists}));
  return(
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{left:10,right:20,top:5,bottom:5}}>
        <CartesianGrid strokeDasharray="3 3" stroke={BDR}/>
        <XAxis type="number" stroke={MUT} tick={{fill:MUT,fontSize:11,fontFamily:F}}/>
        <YAxis type="category" dataKey="name" stroke={MUT} tick={{fill:TX,fontSize:11,fontFamily:F}} width={90}/>
        <Tooltip contentStyle={TOOLTIP_STYLE}/>
        <Bar dataKey="goals" name="Goals" radius={[0,4,4,0]}>
          {data.map((_,i)=><Cell key={i} fill={i===0?GD:i<3?CY:PK}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function TopAssistersChart(){
  const data=[...PL_CLUSTERED].sort((a,b)=>b.assists-a.assists).slice(0,10).map(p=>({name:p.name.split(" ").pop(),assists:p.assists}));
  return(
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{left:10,right:20,top:5,bottom:5}}>
        <CartesianGrid strokeDasharray="3 3" stroke={BDR}/>
        <XAxis type="number" stroke={MUT} tick={{fill:MUT,fontSize:11,fontFamily:F}}/>
        <YAxis type="category" dataKey="name" stroke={MUT} tick={{fill:TX,fontSize:11,fontFamily:F}} width={90}/>
        <Tooltip contentStyle={TOOLTIP_STYLE}/>
        <Bar dataKey="assists" name="Assists" radius={[0,4,4,0]}>
          {data.map((_,i)=><Cell key={i} fill={i===0?GD:i<3?PK:PU}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function PlayerRadarChart({player}){
  if(!player) return null;
  const data=[
    {stat:"Goals/90",val:Math.min(100,player.g90*60)},
    {stat:"Assists/90",val:Math.min(100,player.a90*80)},
    {stat:"Shots/90",val:Math.min(100,player.sh90*15)},
    {stat:"Key Pass/90",val:Math.min(100,(player.kp/player.mins*90)*15)},
    {stat:"Dribbles/90",val:Math.min(100,(player.drib/player.mins*90)*18)},
    {stat:"Tackles/90",val:Math.min(100,(player.tck/player.mins*90)*25)},
  ];
  return(
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke={BDR}/>
        <PolarAngleAxis dataKey="stat" tick={{fill:TX,fontSize:10,fontFamily:F}}/>
        <Radar dataKey="val" stroke={CY} fill={CY} fillOpacity={0.3}/>
      </RadarChart>
    </ResponsiveContainer>
  );
}

function ClusterScatterChart(){
  const byCluster={};
  PL_CLUSTERED.forEach(p=>{
    if(!byCluster[p.cluster]) byCluster[p.cluster]=[];
    byCluster[p.cluster].push({x:+p.g90,y:+p.a90,z:p.val,name:p.name,team:p.team});
  });
  return(
    <ResponsiveContainer width="100%" height={260}>
      <ScatterChart margin={{top:10,right:10,bottom:10,left:0}}>
        <CartesianGrid strokeDasharray="3 3" stroke={BDR}/>
        <XAxis dataKey="x" name="Goals/90" stroke={MUT} tick={{fill:MUT,fontSize:10,fontFamily:F}} label={{value:"Goals/90",fill:MUT,fontSize:10,dy:14}}/>
        <YAxis dataKey="y" name="Assists/90" stroke={MUT} tick={{fill:MUT,fontSize:10,fontFamily:F}} label={{value:"Assists/90",fill:MUT,fontSize:10,angle:-90,dx:-10}}/>
        <ZAxis dataKey="z" range={[40,200]}/>
        <Tooltip cursor={{strokeDasharray:"3 3"}} contentStyle={TOOLTIP_STYLE} formatter={(v,n,props)=>{
          if(n==="x") return [v,"Goals/90"];
          if(n==="y") return [v,"Assists/90"];
          return [props.payload.name+" · "+props.payload.team];
        }}/>
        <Legend iconType="circle" wrapperStyle={{fontFamily:F,fontSize:11,color:TX}}/>
        {Object.entries(byCluster).map(([cl,pts],i)=>(
          <Scatter key={cl} name={cl} data={pts} fill={CCOLS[i%CCOLS.length]} opacity={0.85}/>
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab] = useState("groups");
  const [filter,setFilter] = useState(null);
  const [picks,setPicks] = useState({});
  const [gr,setGr] = useState(null);
  const [rt,setRt] = useState(null);
  const [bracket,setBracket] = useState(null);
  const [awards,setAwards] = useState(null);
  const [awardTab,setAwardTab] = useState("scorer");
  const [histTab,setHistTab] = useState("year");
  const [loading,setLoading] = useState(false);
  const [dashTab,setDashTab] = useState("clusters");
  const [selectedPlayer,setSelectedPlayer] = useState(PL_CLUSTERED[0]);

  const allTeams=useMemo(()=>Object.values(GROUPS).flatMap(g=>g.teams).sort(),[]);

  function handlePick(t1,t2,val){
    setPicks(prev=>{const k=t1+"v"+t2,n={...prev};if(val===null)delete n[k];else n[k]=val;return n;});
  }
  function simulate(){
    setLoading(true);
    setTimeout(()=>{
      const res={};
      Object.entries(GROUPS).forEach(([gid,gdata])=>{res[gid]=simulateGroup(gdata.teams,picks);});
      setGr(res);
      const ranked=rankThirds(res); setRt(ranked);
      setBracket({r32:buildR32(res,ranked),r16:null,qf:null,sf:null,third:null,fin:null,winner:null,thirdWinner:null});
      setAwards(simAwards());
      setLoading(false); setTab("bracket");
    },500);
  }
  function pickKO(key,idx,team){
    setBracket(prev=>{const n={...prev},arr=[...prev[key]];arr[idx]={...arr[idx],w:team};n[key]=arr;return n;});
  }
  function autoSim(){
    setBracket(prev=>{
      const r32=prev.r32.map(m=>({...m,w:predictWinner(m.t1,m.t2)}));
      const r16=buildNext(r32).map(m=>({...m,w:predictWinner(m.t1,m.t2)}));
      const qf=buildNext(r16).map(m=>({...m,w:predictWinner(m.t1,m.t2)}));
      const sf=buildNext(qf).map(m=>({...m,w:predictWinner(m.t1,m.t2)}));
      const l0=sf[0].t1===sf[0].w?sf[0].t2:sf[0].t1, l1=sf[1].t1===sf[1].w?sf[1].t2:sf[1].t1;
      const third={t1:l0,t2:l1,w:predictWinner(l0,l1)};
      const fin=[{t1:sf[0].w,t2:sf[1].w,w:predictWinner(sf[0].w,sf[1].w)}];
      return {...prev,r32,r16,qf,sf,third,fin,winner:fin[0].w,thirdWinner:third.w};
    });
    setAwards(simAwards());
  }

  const NAV=[["groups","⊞ GROUPS"],["simulate","⚡ SIMULATE"],["bracket","⬡ BRACKET"],["awards","★ AWARDS"],["dashboard","📊 DASHBOARD"],["history","🏆 HISTORY"]];

  return(
    <div style={{minHeight:"100vh",background:BG,color:TX,fontFamily:F}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{font-family:'Barlow Condensed',sans-serif;}
        button{font-family:inherit;outline:none;}
        ::-webkit-scrollbar{width:2px;} ::-webkit-scrollbar-thumb{background:#1A2060;}
        @keyframes fi{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
      `}</style>

      {/* bg glow */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",top:"-10%",left:"-5%",width:"50%",height:"50%",background:`radial-gradient(ellipse,${CY}22,transparent 70%)`,filter:"blur(40px)"}}/>
        <div style={{position:"absolute",top:"30%",right:"-10%",width:"50%",height:"50%",background:`radial-gradient(ellipse,${PK}22,transparent 70%)`,filter:"blur(40px)"}}/>
      </div>

      {/* HEADER */}
      <div style={{background:"rgba(7,9,30,0.97)",backdropFilter:"blur(10px)",borderBottom:`1px solid ${BDR}`,position:"sticky",top:0,zIndex:50}}>
        <div style={{height:3,background:`linear-gradient(90deg,${PK},${PU} 40%,${CY})`}}/>
        <div style={{display:"flex",alignItems:"center",padding:"9px 14px 7px",gap:12}}>
          <div>
            <div style={{fontSize:12,color:CY,letterSpacing:4,fontWeight:900}}>FIFA</div>
            <div style={{fontSize:24,fontWeight:900,color:TX,letterSpacing:2,lineHeight:1}}>WORLD CUP</div>
            <div style={{fontSize:16,fontWeight:900,color:CY,letterSpacing:1}}>2026™</div>
          </div>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:900,color:TX,letterSpacing:2}}>CANADA · MEXICO · USA</div>
            <div style={{fontSize:10,color:MUT,letterSpacing:3,marginTop:2}}>WE ARE 2026</div>
          </div>
          <div style={{fontSize:30}}>🏆</div>
        </div>
        <div style={{display:"flex",borderTop:`1px solid ${BDR}`,overflowX:"auto"}}>
          {NAV.map(([v,label])=>{
            const active=tab===v;
            return <Btn key={v} onClick={()=>setTab(v)} style={{flexShrink:0,padding:"10px 12px",background:active?CY+"18":"transparent",border:"none",borderBottom:`3px solid ${active?CY:"transparent"}`,color:active?CY:MUT,fontSize:11,fontWeight:900,letterSpacing:0.8,whiteSpace:"nowrap"}}>{label}</Btn>;
          })}
        </div>
      </div>

      <div style={{padding:"14px",maxWidth:720,margin:"0 auto",position:"relative",zIndex:1}}>

        {/* ══ GROUPS ══ */}
        {tab==="groups"&&(
          <div style={{animation:"fi 0.3s ease"}}>
            <div style={{display:"flex",gap:1,marginBottom:14,borderRadius:8,overflow:"hidden",border:`1px solid ${BDR}`}}>
              {[["48","TEAMS",CY],["12","GROUPS",PK],["104","MATCHES",PU],["3","NATIONS",GD]].map(([n,l,c])=>(
                <div key={l} style={{flex:1,padding:"11px 0",textAlign:"center",background:CB}}>
                  <div style={{fontSize:26,fontWeight:900,color:c,fontFamily:F}}>{n}</div>
                  <div style={{fontSize:9,color:MUT,letterSpacing:2,marginTop:1}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{background:CB,border:`1px solid ${BDR}`,borderRadius:8,padding:10,marginBottom:12}}>
              <div style={{fontSize:11,color:CY,letterSpacing:3,marginBottom:7,fontWeight:900}}>FIND YOUR NATION</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                <Btn onClick={()=>setFilter(null)} style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:800,background:!filter?CY:"transparent",color:!filter?"#000":MUT,border:`2px solid ${!filter?CY:BDR}`}}>ALL</Btn>
                {allTeams.map(t=>(
                  <Btn key={t} onClick={()=>setFilter(filter===t?null:t)} style={{padding:"2px 7px",borderRadius:20,fontSize:10,background:filter===t?CY+"22":"transparent",color:filter===t?CY:MUT,border:`1px solid ${filter===t?CY+"66":BDR}`,display:"flex",alignItems:"center",gap:4}}>
                    <FlagImg team={t} size={16}/><span>{t}</span>
                  </Btn>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              {Object.entries(GROUPS).filter(([,{teams}])=>!filter||teams.includes(filter)).map(([gid,{teams}])=>(
                <GroupCard key={gid} gid={gid} teams={teams}/>
              ))}
            </div>
            <Btn onClick={()=>setTab("simulate")} style={{width:"100%",marginTop:14,padding:"14px",background:"transparent",border:`2px solid ${CY}`,borderRadius:8,color:CY,fontSize:14,fontWeight:900,letterSpacing:3}}>⚡ PREDICT MATCHES →</Btn>
          </div>
        )}

        {/* ══ SIMULATE ══ */}
        {tab==="simulate"&&(
          <div style={{animation:"fi 0.3s ease"}}>
            <div style={{background:CB,border:`2px solid ${CY}44`,borderRadius:8,padding:"11px 14px",marginBottom:13}}>
              <div style={{fontSize:14,fontWeight:900,color:CY,letterSpacing:2,marginBottom:3}}>PICK YOUR RESULTS</div>
              <div style={{fontSize:12,color:MUT}}>Tap a team or DRAW to override. Leave blank for AI. Best 8 of 12 third-place teams advance.</div>
            </div>
            {Object.entries(GROUPS).map(([gid,{teams}])=>{
              const gc=gid.charCodeAt(0)%2===0?CY:PK;
              return(
                <div key={gid} style={{marginBottom:18}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                    <div style={{background:gc,padding:"3px 12px",borderRadius:4}}>
                      <span style={{fontSize:13,fontWeight:900,color:"#000",letterSpacing:3,fontFamily:F}}>GROUP {gid}</span>
                    </div>
                    <div style={{flex:1,height:1,background:`linear-gradient(90deg,${gc}44,transparent)`}}/>
                  </div>
                  {allPairs(teams).map(([t1,t2])=>{
                    const k=t1+"v"+t2;
                    return <MatchPicker key={k} t1={t1} t2={t2} picked={picks[k]} onPick={v=>handlePick(t1,t2,v)} gc={gc}/>;
                  })}
                </div>
              );
            })}
            <Btn onClick={simulate} style={{width:"100%",padding:"15px",background:loading?"#0D1035":CY,border:"none",borderRadius:8,color:"#000",fontSize:15,fontWeight:900,letterSpacing:3}}>
              {loading?"⚙ SIMULATING...":"🏆 SIMULATE TOURNAMENT"}
            </Btn>
          </div>
        )}

        {/* ══ BRACKET ══ */}
        {tab==="bracket"&&(
          <div style={{animation:"fi 0.3s ease"}}>
            {!bracket?(
              <div style={{textAlign:"center",padding:"80px 20px"}}>
                <div style={{fontSize:64,marginBottom:14}}>⚽</div>
                <div style={{fontSize:15,color:MUT,marginBottom:22}}>Simulate the group stage first.</div>
                <Btn onClick={()=>setTab("simulate")} style={{padding:"12px 28px",background:"transparent",border:`2px solid ${CY}`,borderRadius:8,color:CY,fontSize:13,fontWeight:900,letterSpacing:2}}>GO TO SIMULATE →</Btn>
              </div>
            ):(
              <div>
                <SHdr label="GROUP STANDINGS" col={CY}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12}}>
                  {gr&&Object.entries(GROUPS).map(([gid])=>{const r=gr[gid];return r?<GroupTable key={gid} gid={gid} sorted={r.sorted} pts={r.pts} gd={r.gd}/>:null;})}
                </div>
                {rt&&(<>
                  <SHdr label="3RD PLACE RANKINGS — Best 8 of 12 Advance" col={PK}/>
                  <div style={{background:CB,border:`1px solid ${BDR}`,borderRadius:8,overflow:"hidden",marginBottom:12}}>
                    {rt.map((entry,i)=>(
                      <div key={entry.team} style={{display:"flex",alignItems:"center",padding:"6px 11px",background:i%2===0?CB:CB2,borderBottom:i<11?`1px solid ${BDR}55`:undefined}}>
                        <div style={{width:3,height:14,borderRadius:1,background:i<8?CY:PK,marginRight:9}}/>
                        <span style={{width:18,fontSize:11,color:i<8?CY:PK,fontFamily:"monospace",fontWeight:900}}>{i+1}</span>
                        <span style={{margin:"0 7px"}}><FlagImg team={entry.team} size={16}/></span>
                        <span style={{flex:1,fontSize:13,color:i<8?TX:MUT,fontFamily:F,fontWeight:i<8?800:400}}>{entry.team}</span>
                        <span style={{fontSize:10,color:MUT,fontFamily:"monospace",marginRight:7}}>Grp {entry.gid}</span>
                        <span style={{fontSize:10,color:MUT,fontFamily:"monospace",marginRight:7}}>{entry.gd>=0?"+":""}{entry.gd} GD</span>
                        <span style={{fontSize:13,fontWeight:900,color:i<8?CY:MUT,fontFamily:"monospace",marginRight:7}}>{entry.pts}pts</span>
                        <span>{i<8?"✅":"❌"}</span>
                      </div>
                    ))}
                  </div>
                </>)}
                <Btn onClick={autoSim} style={{width:"100%",padding:"11px",marginBottom:12,background:"transparent",border:`2px solid ${CY}66`,borderRadius:7,color:CY,fontSize:13,fontWeight:900,letterSpacing:2}}>⚡ AUTO-SIMULATE KNOCKOUT STAGE</Btn>
                <SHdr label="ROUND OF 32" col={CY}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:4}}>
                  <div style={{fontSize:11,color:CY,fontWeight:900,letterSpacing:2,textAlign:"center",padding:"3px 0"}}>PATHWAY 1</div>
                  <div style={{fontSize:11,color:PK,fontWeight:900,letterSpacing:2,textAlign:"center",padding:"3px 0"}}>PATHWAY 2</div>
                  {[0,1,2,3,4,5,6,7].flatMap(i=>[
                    <KOMatch key={"p1"+i} t1={bracket.r32[i].t1} t2={bracket.r32[i].t2} winner={bracket.r32[i].w} label={bracket.r32[i].label} sub={bracket.r32[i].sub} path={1} onPick={t=>pickKO("r32",i,t)}/>,
                    <KOMatch key={"p2"+i} t1={bracket.r32[i+8].t1} t2={bracket.r32[i+8].t2} winner={bracket.r32[i+8].w} label={bracket.r32[i+8].label} sub={bracket.r32[i+8].sub} path={2} onPick={t=>pickKO("r32",i+8,t)}/>,
                  ])}
                </div>
                {!bracket.r16&&bracket.r32.every(m=>m.w)&&<AdvBtn label="ADVANCE TO ROUND OF 16 →" onClick={()=>setBracket(b=>({...b,r16:buildNext(b.r32)}))}/>}
                {bracket.r16&&(<>
                  <SHdr label="ROUND OF 16" col={CY}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {bracket.r16.map((m,i)=><KOMatch key={i} t1={m.t1} t2={m.t2} winner={m.w} label={`R16-${i+1}`} path={i<4?1:2} onPick={t=>pickKO("r16",i,t)}/>)}
                  </div>
                  {!bracket.qf&&bracket.r16.every(m=>m.w)&&<AdvBtn label="ADVANCE TO QUARTER FINALS →" onClick={()=>setBracket(b=>({...b,qf:buildNext(b.r16)}))}/>}
                </>)}
                {bracket.qf&&(<>
                  <SHdr label="QUARTER FINALS" col={PK}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {bracket.qf.map((m,i)=><KOMatch key={i} t1={m.t1} t2={m.t2} winner={m.w} label={`QF-${i+1}`} path={i<2?1:2} onPick={t=>pickKO("qf",i,t)}/>)}
                  </div>
                  {!bracket.sf&&bracket.qf.every(m=>m.w)&&<AdvBtn label="ADVANCE TO SEMI FINALS →" onClick={()=>setBracket(b=>({...b,sf:buildNext(b.qf)}))}/>}
                </>)}
                {bracket.sf&&(<>
                  <SHdr label="SEMI FINALS" col={PU}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {bracket.sf.map((m,i)=><KOMatch key={i} t1={m.t1} t2={m.t2} winner={m.w} label={`SF-${i+1}`} col={PU} onPick={t=>pickKO("sf",i,t)}/>)}
                  </div>
                  {!bracket.fin&&bracket.sf.every(m=>m.w)&&<AdvBtn label="SET UP FINAL + 3RD PLACE →" onClick={()=>setBracket(b=>{
                    const sf=b.sf,l0=sf[0].t1===sf[0].w?sf[0].t2:sf[0].t1,l1=sf[1].t1===sf[1].w?sf[1].t2:sf[1].t1;
                    return {...b,third:{t1:l0,t2:l1,w:null},fin:[{t1:sf[0].w,t2:sf[1].w,w:null}]};
                  })}/>}
                </>)}
                {bracket.third&&(<>
                  <SHdr label="🥉 3RD PLACE · JULY 18 · MIAMI" col="#CD7F32"/>
                  <div style={{display:"flex",justifyContent:"center"}}><div style={{width:"70%"}}>
                    <KOMatch t1={bracket.third.t1} t2={bracket.third.t2} winner={bracket.third.w} label="3RD PLACE" col="#CD7F32" onPick={t=>setBracket(b=>({...b,third:{...b.third,w:t},thirdWinner:t}))}/>
                  </div></div>
                  {bracket.thirdWinner&&<div style={{marginTop:8,textAlign:"center",padding:"10px",background:"rgba(205,127,50,.1)",border:"1px solid #CD7F3266",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                    <FlagImg team={bracket.thirdWinner} size={28}/>
                    <span style={{fontSize:15,fontWeight:900,color:"#CD7F32"}}>{bracket.thirdWinner} · 3RD PLACE 🥉</span>
                  </div>}
                </>)}
                {bracket.fin&&(<>
                  <SHdr label="⭐ THE FINAL · JULY 19 · METLIFE STADIUM NJ" col={GD}/>
                  <div style={{display:"flex",justifyContent:"center"}}><div style={{width:"75%"}}>
                    <KOMatch t1={bracket.fin[0].t1} t2={bracket.fin[0].t2} winner={bracket.fin[0].w} label="FINAL" isFinal col={GD} onPick={t=>setBracket(b=>{const fin=[{...b.fin[0],w:t}];return {...b,fin,winner:t};})}/>
                  </div></div>
                </>)}
                {bracket.winner&&(
                  <div style={{marginTop:14,background:CB,border:`2px solid ${GD}`,borderRadius:14,padding:"26px 18px",textAlign:"center",animation:"fi 0.5s ease"}}>
                    <div style={{fontSize:10,color:GD,letterSpacing:6,marginBottom:8,fontWeight:900}}>⭐ WORLD CHAMPION 2026 ⭐</div>
                    <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
                      <FlagImg team={bracket.winner} size={72}/>
                    </div>
                    <div style={{fontSize:32,fontWeight:900,letterSpacing:4,color:TX,fontFamily:F}}>{bracket.winner.toUpperCase()}</div>
                    <div style={{fontSize:10,color:MUT,marginTop:10,letterSpacing:2}}>FIFA WORLD CUP · JULY 19, 2026 · METLIFE STADIUM, NJ</div>
                    <div style={{height:2,background:`linear-gradient(90deg,transparent,${GD},transparent)`,margin:"14px auto",width:"60%"}}/>
                    <div style={{display:"flex",justifyContent:"center",gap:10}}>
                      <Btn onClick={()=>{setBracket(null);setGr(null);setRt(null);setPicks({});setAwards(null);setTab("simulate");}} style={{padding:"9px 18px",background:"transparent",border:`2px solid ${CY}66`,borderRadius:8,color:CY,fontSize:12,fontWeight:900,letterSpacing:2}}>↩ SIMULATE AGAIN</Btn>
                      <Btn onClick={()=>setTab("awards")} style={{padding:"9px 18px",background:GD,border:"none",borderRadius:8,color:"#000",fontSize:12,fontWeight:900,letterSpacing:2}}>★ VIEW AWARDS</Btn>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ AWARDS ══ */}
        {tab==="awards"&&(
          <div style={{animation:"fi 0.3s ease"}}>
            <div style={{background:CB,border:`1px solid ${BDR}`,borderRadius:10,padding:"14px",marginBottom:14,textAlign:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${PK},${PU},${CY})`}}/>
              <div style={{fontSize:11,color:CY,letterSpacing:5,fontWeight:900,marginBottom:4}}>ML-SIMULATED PREDICTIONS</div>
              <div style={{fontSize:21,fontWeight:900,color:TX,letterSpacing:2}}>INDIVIDUAL AWARDS</div>
              <div style={{fontSize:11,color:MUT,marginTop:4,marginBottom:12}}>Gradient Boosting · Club stats + Team depth + Position + Noise</div>
              {!awards
                ?<Btn onClick={()=>setAwards(simAwards())} style={{padding:"11px 22px",background:CY,border:"none",borderRadius:8,color:"#000",fontSize:14,fontWeight:900,letterSpacing:2}}>▶ RUN ML SIMULATION</Btn>
                :<Btn onClick={()=>setAwards(simAwards())} style={{padding:"8px 16px",background:"transparent",border:`2px solid ${CY}55`,borderRadius:7,color:CY,fontSize:12,fontWeight:900,letterSpacing:2}}>↺ RE-SIMULATE</Btn>
              }
            </div>
            <div style={{display:"flex",gap:5,marginBottom:13}}>
              {[["scorer","⚽ TOP SCORER",CY],["assists","🎯 TOP ASSISTER",PK],["young","🌟 BEST U23",GD]].map(([v,lbl,c])=>{
                const active=awardTab===v;
                return <Btn key={v} onClick={()=>setAwardTab(v)} style={{flex:1,padding:"10px 4px",borderRadius:7,background:active?c+"22":CB,border:`2px solid ${active?c:BDR}`,color:active?c:MUT,fontSize:11,fontWeight:900,letterSpacing:1}}>{lbl}</Btn>;
              })}
            </div>
            {!awards&&<div style={{textAlign:"center",padding:"40px",color:MUT,fontSize:14}}>Run the ML simulation to generate predictions.</div>}
            {awards&&awardTab==="scorer"&&awards.sc.map((p,i)=>{
              const mc=i===0?GD:i===1?"#C0C0C0":i===2?"#CD7F32":MUT;
              return(
                <div key={p.name} style={{background:CB,border:`2px solid ${i===0?CY+"55":BDR}`,borderRadius:10,padding:"12px 13px",marginBottom:8,display:"flex",alignItems:"center",gap:11}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:mc+"22",border:`2px solid ${mc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:mc,flexShrink:0,fontFamily:"monospace"}}>{i+1}</div>
                  <FlagImg team={p.team} size={26}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:17,fontWeight:900,color:TX,fontFamily:F}}>{p.name}</div>
                    <div style={{fontSize:13,color:CY,fontWeight:700,marginTop:2}}>{p.team} · {p.pos} · {p.club}</div>
                    <div style={{fontSize:12,color:MUT,marginTop:2}}>{p.bio}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:26,fontWeight:900,color:i===0?CY:TX,fontFamily:"monospace"}}>{p.simG}⚽</div>
                    <div style={{fontSize:11,color:MUT,letterSpacing:1}}>PROJECTED</div>
                    <div style={{fontSize:12,color:"#3A4F60",marginTop:1}}>{p.goals} club goals</div>
                  </div>
                </div>
              );
            })}
            {awards&&awardTab==="assists"&&awards.as.map((p,i)=>{
              const mc=i===0?GD:i===1?"#C0C0C0":i===2?"#CD7F32":MUT;
              return(
                <div key={p.name} style={{background:CB,border:`2px solid ${i===0?PK+"55":BDR}`,borderRadius:10,padding:"12px 13px",marginBottom:8,display:"flex",alignItems:"center",gap:11}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:mc+"22",border:`2px solid ${mc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:mc,flexShrink:0,fontFamily:"monospace"}}>{i+1}</div>
                  <FlagImg team={p.team} size={26}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:17,fontWeight:900,color:TX,fontFamily:F}}>{p.name}</div>
                    <div style={{fontSize:13,color:PK,fontWeight:700,marginTop:2}}>{p.team} · {p.pos} · {p.club}</div>
                    <div style={{fontSize:12,color:MUT,marginTop:2}}>{p.bio}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:26,fontWeight:900,color:i===0?PK:TX,fontFamily:"monospace"}}>{p.simA}🎯</div>
                    <div style={{fontSize:11,color:MUT,letterSpacing:1}}>PROJECTED</div>
                    <div style={{fontSize:12,color:"#3A4F60",marginTop:1}}>{p.assists} club assists</div>
                  </div>
                </div>
              );
            })}
            {awards&&awardTab==="young"&&awards.yg.map((p,i)=>{
              const mc=i===0?GD:i===1?"#C0C0C0":i===2?"#CD7F32":MUT;
              const rc=parseFloat(p.simR)>=9?GD:parseFloat(p.simR)>=8.5?CY:TX;
              return(
                <div key={p.name} style={{background:CB,border:`2px solid ${i===0?GD+"55":BDR}`,borderRadius:10,padding:"12px 13px",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:11}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:mc+"22",border:`2px solid ${mc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:mc,flexShrink:0,fontFamily:"monospace"}}>{i+1}</div>
                    <FlagImg team={p.team} size={26}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:17,fontWeight:900,color:TX,fontFamily:F}}>{p.name}</div>
                      <div style={{fontSize:13,color:GD,fontWeight:700,marginTop:2}}>{p.team} · {p.club} · Age {p.age}</div>
                      <div style={{fontSize:12,color:MUT,marginTop:2}}>{p.bio}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:24,fontWeight:900,color:rc,fontFamily:"monospace"}}>{p.simR}</div>
                      <div style={{fontSize:11,color:MUT,letterSpacing:1}}>ML RATING</div>
                    </div>
                  </div>
                  <div style={{marginTop:9,paddingLeft:41,display:"flex",gap:8}}>
                    {[["Club Goals",p.goals,40,CY],["Club Assists",p.assists,20,PK],["Form",p.ga90,1.5,GD]].map(([label,val,max,c])=>(
                      <div key={label} style={{flex:1}}>
                        <div style={{fontSize:11,color:MUT,marginBottom:3}}>{label}</div>
                        <div style={{height:4,background:BDR,borderRadius:2,overflow:"hidden"}}><div style={{width:Math.min(100,val/max*100)+"%",height:"100%",background:c}}/></div>
                        <div style={{fontSize:13,color:"#FFFFFF",marginTop:2,fontWeight:700}}>{typeof val==="number"&&val<10?val.toFixed(2):val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ DASHBOARD ══ */}
        {tab==="dashboard"&&(
          <div style={{animation:"fi 0.3s ease"}}>
            <div style={{background:CB,border:`1px solid ${BDR}`,borderRadius:10,padding:"13px",marginBottom:14,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${CY},${PU},${PK})`}}/>
              <div style={{fontSize:11,color:CY,letterSpacing:4,fontWeight:900,marginBottom:3}}>PANDAS + KMEANS + RECHARTS</div>
              <div style={{fontSize:19,fontWeight:900,color:TX,letterSpacing:2}}>PLAYER PERFORMANCE DASHBOARD</div>
              <div style={{fontSize:11,color:MUT,marginTop:3}}>{PL_CLUSTERED.length} players · 6 KMeans clusters · Per-90 stats</div>
            </div>
            <div style={{display:"flex",gap:4,marginBottom:13,flexWrap:"wrap"}}>
              {[["clusters","⬡ CLUSTERS",CY],["scoring","⚽ SCORING",GD],["radar","📡 RADAR",PK],["bios","👤 PLAYER BIOS",PU]].map(([v,lbl,c])=>{
                const active=dashTab===v;
                return <Btn key={v} onClick={()=>setDashTab(v)} style={{flex:1,minWidth:70,padding:"8px 4px",borderRadius:7,background:active?c+"22":CB,border:`2px solid ${active?c:BDR}`,color:active?c:MUT,fontSize:9,fontWeight:900,letterSpacing:1}}>{lbl}</Btn>;
              })}
            </div>

            {dashTab==="clusters"&&(
              <div>
                <div style={{background:CB,border:`1px solid ${BDR}`,borderRadius:10,padding:"14px",marginBottom:12}}>
                  <div style={{fontSize:11,color:CY,letterSpacing:3,fontWeight:900,marginBottom:10}}>PLAYING STYLE CLUSTERS — Goals/90 vs Assists/90</div>
                  <ClusterScatterChart/>
                  <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:6}}>
                    {CLUSTER_LABELS.slice(0,6).map((cl,i)=>(
                      <div key={cl} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:MUT}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:CCOLS[i],flexShrink:0}}/>
                        <span>{cl}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {CLUSTER_LABELS.map((cl,ci)=>{
                  const members=PL_CLUSTERED.filter(p=>p.cluster===cl);
                  if(!members.length) return null;
                  return(
                    <div key={cl} style={{background:CB,border:`1px solid ${CCOLS[ci]}44`,borderRadius:10,padding:"12px",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <div style={{width:3,height:18,background:CCOLS[ci],borderRadius:2}}/>
                        <span style={{fontSize:14,fontWeight:900,color:CCOLS[ci],fontFamily:F,letterSpacing:1}}>{cl}</span>
                        <span style={{fontSize:11,color:MUT,marginLeft:"auto"}}>{members.length} players</span>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {members.map(p=>(
                          <div key={p.name} style={{display:"flex",alignItems:"center",gap:5,background:"#182050",border:`1px solid ${CCOLS[ci]}33`,borderRadius:6,padding:"5px 9px",fontSize:11}}>
                            <FlagImg team={p.team} size={14}/>
                            <span style={{color:"#FFFFFF",fontWeight:700}}>{p.name}</span>
                            <span style={{color:"#B0C0D8",fontSize:10}}>{p.pos}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {dashTab==="scoring"&&(
              <div>
                <div style={{background:CB,border:`1px solid ${BDR}`,borderRadius:10,padding:"14px",marginBottom:12}}>
                  <div style={{fontSize:11,color:GD,letterSpacing:3,fontWeight:900,marginBottom:10}}>TOP GOAL SCORERS — 2025/26 CLUB SEASON</div>
                  <TopScorersChart/>
                </div>
                <div style={{background:CB,border:`1px solid ${BDR}`,borderRadius:10,padding:"14px"}}>
                  <div style={{fontSize:11,color:PK,letterSpacing:3,fontWeight:900,marginBottom:10}}>TOP ASSIST PROVIDERS — 2025/26 CLUB SEASON</div>
                  <TopAssistersChart/>
                </div>
              </div>
            )}

            {dashTab==="radar"&&(
              <div>
                <div style={{background:CB,border:`1px solid ${BDR}`,borderRadius:10,padding:"14px",marginBottom:12}}>
                  <div style={{fontSize:11,color:PK,letterSpacing:3,fontWeight:900,marginBottom:8}}>SELECT PLAYER FOR RADAR</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
                    {[...PL_CLUSTERED].sort((a,b)=>b.ga90-a.ga90).slice(0,15).map(p=>(
                      <Btn key={p.name} onClick={()=>setSelectedPlayer(p)} style={{padding:"4px 9px",borderRadius:20,fontSize:10,fontWeight:700,background:selectedPlayer?.name===p.name?PK+"33":"transparent",border:`1px solid ${selectedPlayer?.name===p.name?PK:BDR}`,color:selectedPlayer?.name===p.name?PK:MUT,display:"flex",alignItems:"center",gap:4}}>
                        <FlagImg team={p.team} size={14}/><span>{p.name.split(" ").pop()}</span>
                      </Btn>
                    ))}
                  </div>
                  {selectedPlayer&&(<>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,padding:"12px",background:"#131840",border:`1px solid ${BDR}`,borderRadius:8}}>
                      <FlagImg team={selectedPlayer.team} size={36}/>
                      <div>
                        <div style={{fontSize:18,fontWeight:900,color:"#FFFFFF",fontFamily:F}}>{selectedPlayer.name}</div>
                        <div style={{fontSize:13,color:CY,fontWeight:700,marginTop:2}}>{selectedPlayer.team} · {selectedPlayer.pos} · {selectedPlayer.club}</div>
                        <div style={{fontSize:12,color:"#B0C0D8",marginTop:3}}>{selectedPlayer.bio}</div>
                      </div>
                    </div>
                    <PlayerRadarChart player={selectedPlayer}/>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:12}}>
                      {[["⚽ Goals",selectedPlayer.goals,GD],["🎯 Assists",selectedPlayer.assists,CY],["💰 Value",`€${selectedPlayer.val}M`,PU],["📊 G/90",selectedPlayer.g90,PK],["🎪 A/90",selectedPlayer.a90,CY],["🏃 Matches",selectedPlayer.matches,"#B0C0D8"]].map(([lbl,val,c])=>(
                        <div key={lbl} style={{background:"#182050",border:`1px solid ${c}44`,borderRadius:8,padding:"12px 10px",textAlign:"center"}}>
                          <div style={{fontSize:22,fontWeight:900,color:c,fontFamily:"monospace",marginBottom:4}}>{val}</div>
                          <div style={{fontSize:11,color:"#B0C0D8",letterSpacing:1}}>{lbl}</div>
                        </div>
                      ))}
                    </div>
                  </>)}
                </div>
              </div>
            )}

            {dashTab==="bios"&&(
              <div>
                <div style={{fontSize:11,color:PU,letterSpacing:3,fontWeight:900,marginBottom:10}}>TOP 15 PLAYERS BY G+A/90</div>
                {[...PL_CLUSTERED].sort((a,b)=>b.ga90-a.ga90).slice(0,15).map((p,i)=>{
                  const ci=CLUSTER_LABELS.indexOf(p.cluster);
                  const cc=CCOLS[ci>=0?ci:0];
                  const mc=i===0?GD:i===1?"#C0C0C0":i===2?"#CD7F32":MUT;
                  return(
                    <div key={p.name} style={{background:CB,border:`2px solid ${i<3?cc+"55":BDR}`,borderRadius:10,padding:"12px 13px",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:11}}>
                        <div style={{width:28,height:28,borderRadius:"50%",background:mc+"22",border:`2px solid ${mc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:mc,flexShrink:0,fontFamily:"monospace"}}>{i+1}</div>
                        <FlagImg team={p.team} size={28}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:17,fontWeight:900,color:TX,fontFamily:F}}>{p.name}</div>
                          <div style={{fontSize:13,color:cc,fontWeight:700,marginTop:2}}>{p.team} · {p.pos} · Age {p.age}</div>
                          <div style={{fontSize:11,color:MUT,marginTop:1}}>{p.club} · {p.cluster}</div>
                          <div style={{fontSize:12,color:"#aaa",marginTop:3}}>{p.bio}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontSize:22,fontWeight:900,color:cc,fontFamily:"monospace"}}>{p.ga90}</div>
                          <div style={{fontSize:10,color:MUT,letterSpacing:1}}>G+A/90</div>
                        </div>
                      </div>
                      <div style={{marginTop:9,paddingLeft:39,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                        {[["Goals",p.goals,GD],["Assists",p.assists,CY],["Shots/90",p.sh90,PK],["Val €M",p.val,PU]].map(([lbl,val,c])=>(
                          <div key={lbl} style={{background:"#182050",borderRadius:6,padding:"7px 8px",textAlign:"center",border:`1px solid ${c}33`}}>
                            <div style={{fontSize:16,fontWeight:900,color:c,fontFamily:"monospace"}}>{val}</div>
                            <div style={{fontSize:9,color:"#B0C0D8",marginTop:3,letterSpacing:0.5}}>{lbl}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ HISTORY ══ */}
        {tab==="history"&&(
          <div style={{animation:"fi 0.3s ease"}}>
            <div style={{background:CB,border:`1px solid ${BDR}`,borderRadius:10,padding:"13px",marginBottom:14,textAlign:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${GD},${CY},${PK})`}}/>
              <div style={{fontSize:11,color:GD,letterSpacing:5,fontWeight:900,marginBottom:3}}>FIFA WORLD CUP</div>
              <div style={{fontSize:21,fontWeight:900,color:TX,letterSpacing:2}}>ALL-TIME RECORDS</div>
              <div style={{fontSize:11,color:MUT,marginTop:3}}>1930 – 2022 · 22 Tournaments</div>
            </div>
            <div style={{display:"flex",gap:5,marginBottom:13}}>
              {[["year","🏆 YEAR BY YEAR",GD],["scorers","⚽ ALL-TIME SCORERS",CY],["titles","🥇 MOST TITLES",PK]].map(([v,lbl,c])=>{
                const active=histTab===v;
                return <Btn key={v} onClick={()=>setHistTab(v)} style={{flex:1,padding:"10px 4px",borderRadius:7,background:active?c+"22":CB,border:`2px solid ${active?c:BDR}`,color:active?c:MUT,fontSize:11,fontWeight:900,letterSpacing:1}}>{lbl}</Btn>;
              })}
            </div>
            {histTab==="year"&&WC_WINNERS.map((wc,i)=>(
              <div key={wc.year} style={{background:CB,border:`1px solid ${i===0?GD+"55":BDR}`,borderRadius:10,padding:"11px 13px",marginBottom:8,display:"flex",alignItems:"center",gap:11}}>
                <div style={{width:54,textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:17,fontWeight:900,color:i<3?GD:CY,fontFamily:"monospace"}}>{wc.year}</div>
                  <div style={{fontSize:9,color:MUT,marginTop:2}}>📍{wc.host}</div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                    <FlagImg team={wc.winner} size={20}/>
                    <span style={{fontSize:17,fontWeight:900,color:TX,fontFamily:F}}>{wc.winner}</span>
                    <span style={{fontSize:13,color:GD}}>🏆</span>
                  </div>
                  <div style={{fontSize:13,color:GD,fontFamily:"monospace",fontWeight:700}}>{wc.score} <span style={{color:MUT,fontSize:11,fontWeight:400}}>vs {wc.runner}</span></div>
                  <div style={{fontSize:11,color:MUT,marginTop:2}}>⚽ {wc.scorer} · 🌟 {wc.mvp}</div>
                </div>
                <FlagImg team={wc.winner} size={22}/>
              </div>
            ))}
            {histTab==="scorers"&&WC_SCORERS.map((p,i)=>{
              const mc=i===0?GD:i===1?"#C0C0C0":i===2?"#CD7F32":MUT;
              return(
                <div key={p.name} style={{background:CB,border:`2px solid ${i===0?GD+"55":BDR}`,borderRadius:10,padding:"11px 13px",marginBottom:7,display:"flex",alignItems:"center",gap:11}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:mc+"22",border:`2px solid ${mc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:mc,flexShrink:0,fontFamily:"monospace"}}>{i+1}</div>
                  <img src={`https://flagcdn.com/w48/${p.flag}.png`} alt={p.country} width={24} style={{borderRadius:2,flexShrink:0}} onError={e=>e.currentTarget.style.display="none"}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:17,fontWeight:900,color:TX,fontFamily:F}}>{p.name}</div>
                    <div style={{fontSize:13,color:CY,fontWeight:700,marginTop:2}}>{p.country} · {p.t} tournaments · {p.years}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:26,fontWeight:900,color:i===0?GD:i<3?CY:TX,fontFamily:"monospace"}}>{p.goals}</div>
                    <div style={{fontSize:11,color:MUT,letterSpacing:1}}>WC GOALS</div>
                  </div>
                </div>
              );
            })}
            {histTab==="titles"&&WC_TITLES.map((c,i)=>{
              const mc=i===0?GD:i===1?"#C0C0C0":i===2?"#CD7F32":MUT;
              return(
                <div key={c.country} style={{background:CB,border:`2px solid ${i===0?GD+"55":BDR}`,borderRadius:10,padding:"13px 15px",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:mc+"22",border:`2px solid ${mc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,color:mc,flexShrink:0,fontFamily:"monospace"}}>{i+1}</div>
                    <img src={`https://flagcdn.com/w64/${c.flag}.png`} alt={c.country} width={36} style={{borderRadius:2,flexShrink:0}} onError={e=>e.currentTarget.style.display="none"}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:19,fontWeight:900,color:TX,fontFamily:F}}>{c.country}</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:5}}>
                        {c.years.map(y=><span key={y} style={{fontSize:11,color:"#000",background:i===0?GD:CY,padding:"2px 8px",borderRadius:3,fontWeight:900,fontFamily:"monospace"}}>{y}</span>)}
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:38,fontWeight:900,color:mc,fontFamily:"monospace"}}>{c.wins}</div>
                      <div style={{fontSize:11,color:MUT,letterSpacing:1}}>{c.wins===1?"TITLE":"TITLES"}</div>
                    </div>
                  </div>
                  <div style={{marginTop:9,display:"flex",gap:4}}>{Array(c.wins).fill(0).map((_,j)=><span key={j} style={{fontSize:18}}>🏆</span>)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

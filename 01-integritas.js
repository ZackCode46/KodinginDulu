const fs=require('fs'),vm=require('vm');
let js=fs.readFileSync(__dirname+'/../js/app.js','utf8').replace(/\ndraw\(\);\s*$/,'\n');
const ctx={console,document:{}};vm.createContext(ctx);vm.runInContext(js+`
;globalThis.R=function(){var res=[];
TP.forEach(function(T,t){var seen={},seenSol={};
 for(var L=1;L<=10;L++)for(var q=0;q<CNT[L-1];q++){
  var sp,id=T.n+" L"+L+"#"+(q+1);
  try{tp=t;lv=L;qi=q;sp=spec()}catch(e){res.push(id+" GEN ERROR "+e.message);continue}
  var r;try{r=sp.rn?sp.rn(sp.sol):run(sp.sol,!!sp.go)}catch(e){res.push(id+" RUN ERROR "+e.message);continue}
  sp.c.forEach(function(x){var ok=false;try{ok=!!x[1](sp.sol,r)}catch(e){res.push(id+" CHECK THROW "+x[0]+": "+e.message)}
   if(!ok)res.push(id+" FAIL sol: "+x[0]+(r.err?" | err: "+r.err:"")+" | out="+JSON.stringify(r.out).slice(0,80))});
  if(seen[sp.s])res.push(id+" DUP STORY with "+seen[sp.s]);else seen[sp.s]=id;
  if(seenSol[sp.sol])res.push(id+" DUP SOLUTION with "+seenSol[sp.sol]);else seenSol[sp.sol]=id;
 }});
return res}`,ctx);
const out=ctx.R();console.log(out.length?out.join("\n"):"SEMUA OK");

const fs=require('fs'),vm=require('vm');
let js=fs.readFileSync(__dirname+'/../js/app.js','utf8').replace(/\ndraw\(\);\s*$/,'\n');
const ctx={console,document:{}};vm.createContext(ctx);vm.runInContext(js+`
;globalThis.R=function(){var res=[],pass=0,tot=0,pv=0;
TP.forEach(function(T,t){for(var L=1;L<=10;L++)for(var q=0;q<CNT[L-1];q++){tp=t;lv=L;qi=q;var sp=spec(),id=T.n+" L"+L+"#"+(q+1);
 // jawaban salah/kosong harus gagal
 var bad=T.l==="dart"?"void main() {\\n}":T.l==="go"?"package main\\nfunc main() {\\n}":T.l==="json"?"{}":T.l==="http"?"GET http://x":"Text('x')";
 var r=sp.rn?sp.rn(bad):run(bad,!!sp.go),all=true;
 sp.c.forEach(function(x){var ok=false;try{ok=!!x[1](bad,r)}catch(e){}if(!ok)all=false});
 tot++;if(all)res.push(id+" jawaban kosong malah LOLOS");else pass++;
 if(T.l==="flutter"){try{var h=fr(fparse(sp.sol));if(/belum didukung/.test(h))res.push(id+" widget tak didukung di solusi");pv++}catch(e){res.push(id+" PREVIEW ERROR "+e.message)}}
}});
res.push("kosong ditolak: "+pass+"/"+tot+", preview flutter ok: "+pv);return res}`,ctx);
console.log(ctx.R().join("\n"));

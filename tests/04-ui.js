const {JSDOM,VirtualConsole}=require('jsdom');const fs=require('fs');
const errs=[];const path=require('path');
const vc=new VirtualConsole();vc.on("jsdomError",e=>{if(!/fonts\.googleapis|Could not load link/.test(e.message))errs.push("jsdomError: "+e.message)});vc.on("error",e=>errs.push("console.error: "+e));
const opts={runScripts:"dangerously",virtualConsole:vc};
let dom;
JSDOM.fromFile(path.join(__dirname,'..','index.html'),{runScripts:'dangerously',resources:'usable',virtualConsole:vc}).then(go);
function go(d){dom=d;setTimeout(run,300)}
function run(){
 const w=dom.window,doc=w.document,$=s=>doc.querySelector(s),$$=s=>[...doc.querySelectorAll(s)];
 const out=[];let benar=0,salah=0,total=0;
 out.push("progress awal: "+$("#pt").textContent);
 const topics=$$("#nav button");out.push("jumlah tombol sub-bab: "+topics.length);
 for(let t=0;t<topics.length;t++){
  $$("#nav button")[t].click();
  for(const L of $$("[data-l]").map(b=>+b.dataset.l)){
   $$("[data-l]").find(b=>+b.dataset.l===L).click();
   const nq=$$("[data-q]").length;
   for(let q=0;q<nq;q++){
    $$("[data-q]")[q].click();total++;
    const sp=w.spec(),sol=sp.sol,ed=$("#ed")||{set value(v){const rs=$$("input[name=o]");rs.forEach(x=>x.checked=false);const i=/^\d+$/.test(v)?+v:sp.opts.indexOf(v);if(rs[i])rs[i].checked=true},dispatchEvent(){}};
    // jawaban salah dulu
    ed.value="// kosong";$("#go").click();
    if(/Benar/.test($("#msg").textContent))out.push("SALAH diterima di "+t+"/"+L+"/"+q);else salah++;
    ed.value=sol;ed.dispatchEvent(new w.Event("input"));$("#go").click();
    if(/Benar/.test($("#msg").textContent))benar++;else out.push("benar ditolak "+t+"/"+L+"/"+q+": "+$("#msg").textContent);
    if($$("#chk li .n").length)out.push("ada ✗ walau benar "+t+"/"+L+"/"+q);
   }
  }
 }
 out.push("soal diperiksa: "+total+", jawaban benar diterima: "+benar+", jawaban kosong ditolak: "+salah);
 out.push("progress akhir: "+$("#pt").textContent+", bar: "+$("#pb").style.width);
 // flutter: preview live
 $$("#nav button")[8].click();$$("[data-l]")[0].click();$$("[data-q]")[0].click();
 const pv=$("#pv");out.push("flutter preview ada: "+!!pv);
 const ed=$("#ed");ed.value="Text('Halo', style: TextStyle(fontSize: 24, color: Colors.red))";ed.dispatchEvent(new w.Event("input"));
 out.push("preview live: "+pv.innerHTML.slice(0,90));
 ed.value="Text(";ed.dispatchEvent(new w.Event("input"));out.push("preview error ditangani: "+pv.textContent.slice(0,60));
 ed.value="Text('<img src=x onerror=alert(1)>')";ed.dispatchEvent(new w.Event("input"));out.push("xss di preview ter-escape: "+(!pv.querySelector("img")));
 // reset & next
 $("#rs").click();out.push("reset -> starter: "+JSON.stringify($("#ed").value.slice(0,30)));
 w.tp=0;w.lv=10;w.qi=7;$$("#nav button")[10].click();$$("[data-l]")[9].click();$$("[data-q]")[7].click();$("#nx").click();out.push("next di soal terakhir tidak error");
 // keamanan evaluator Dart
 $$("#nav button")[0].click();$$("[data-q]")[0].click();
 const e2=$("#ed");e2.value='void main() {\n  print(this.constructor.constructor("return 1")());\n  print(window.location);\n}';$("#go").click();
 out.push("evaluator berbahaya diblokir: "+$("#out").textContent.slice(0,70));
 console.log(out.join("\n"));console.log("ERROR SKRIP: "+(errs.length?errs.join("\n"):"tidak ada"));process.exit(0);
}

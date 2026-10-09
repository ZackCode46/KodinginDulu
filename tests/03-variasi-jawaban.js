const fs=require('fs'),vm=require('vm');
let js=fs.readFileSync(__dirname+'/../js/app.js','utf8').replace(/\ndraw\(\);\nintroInit\(\);\s*$/,'\n');
const ctx={console,document:{}};vm.createContext(ctx);vm.runInContext(js+`
;globalThis.R=function(){var res=[],ok={},bad={};
function evalSp(sp,code){var r=sp.rn?sp.rn(code):run(code,!!sp.go),all=true,fails=[];sp.c.forEach(function(x){var o=false;try{o=!!x[1](code,r)}catch(e){}if(!o){all=false;fails.push(x[0])}});return{all:all,fails:fails}}
var TR={
 crlf:{only:null,f:function(s){return s.replace(/\\n/g,"\\r\\n")}},
 blank:{only:["dart","go","json","flutter"],f:function(s){return s.replace(/\\n/g,"\\n\\n  ")}},
 squote:{only:["dart"],f:function(s){return s.replace(/"/g,"'")}},
 goshort:{only:["go"],f:function(s){return s.replace(/var (\\w+) (string|int|float64|bool) = /g,"$1 := ")}},
 govar:{only:["go"],f:function(s){return s.replace(/var (\\w+) (string|int|float64|bool) = /g,"var $1 = ")}},
 dqflutter:{only:["flutter"],f:function(s){return s.replace(/'/g,'"')}},
 constf:{only:["flutter"],f:function(s){return s.replace(/\\b([A-Z]\\w*)\\(/g,"const $1(")}},
 retf:{only:["flutter"],f:function(s){return"return MaterialApp(home: "+s+");"}},
 trailf:{only:["flutter"],f:function(s){return s.replace(/\\]\\)/g,",])").replace(/\\)\\)$/,",))")}},
 compact:{only:["json"],f:function(s){return JSON.stringify(JSON.parse(s))}},
 tabs:{only:["json"],f:function(s){return JSON.stringify(JSON.parse(s),null,"\\t")}},
 lower:{only:["http"],f:function(s){return s.split("\\n").map(function(l,i){return i&&/^[\\w-]+:/.test(l)?l.replace(/^([\\w-]+):/,function(m){return m.toLowerCase()}):l}).join("\\n")+"\\n\\n  "}},
 pretty:{only:["http"],f:function(s){var i=s.indexOf("\\n\\n");if(i<0)return s;return s.slice(0,i)+"\\n\\n"+JSON.stringify(JSON.parse(s.slice(i+2)),null,2)}}
};
var NEG={
 mut:function(sp,T,s){if(sp.opts)return sp.opts[(sp.ans+1)%sp.opts.length];if(T.l==="http")return s.replace(/^(GET|POST|PUT|PATCH|DELETE)/,"HEAD");
  if(T.l==="json")return /"nama": "[^"]*"/.test(s)?s.replace(/"nama": "[^"]*"/,'"nama": "ZZZ"'):s.replace(/\d+/,function(m){return String(+m+1)});
  if(T.l==="flutter")return s.replace(/Text\\('[^']*'/,"Text('ZZZ'");
  if(T.l==="go"){var ix=s.indexOf("func main");return s.slice(0,ix)+NEG.mut(sp,{l:"dart"},s.slice(ix))}
  if(/true|false/.test(s))return s.replace(/true|false/,function(m){return m==="true"?"false":"true"});
  if(/"[^"]+"/.test(s))return s.replace(/"([^"]+)"/,'"ZZZ"');
  return s.replace(/\\d+/,function(m){return String(+m+1)})}};
TP.forEach(function(T,t){for(var L=1;L<=10;L++)for(var q=0;q<CN(t)[L-1];q++){tp=t;lv=L;qi=q;var sp=spec(),id=T.n+" L"+L+"#"+(q+1);
 Object.keys(TR).forEach(function(k){var tr=TR[k];if(sp.opts)return;if(tr.only&&tr.only.indexOf(T.l)<0)return;if(k==="retf"&&/^MaterialApp/.test(sp.sol))return;var code;try{code=tr.f(sp.sol)}catch(e){res.push(id+" transform "+k+" error");return}
  var e=evalSp(sp,code);ok[k]=ok[k]||[0,0];ok[k][1]++;if(e.all)ok[k][0]++;else if(res.length<400)res.push(id+" ["+k+"] jawaban benar ditolak: "+e.fails.join(" | "))});
 var m=NEG.mut(sp,T,sp.sol),e2=evalSp(sp,m);bad.n=(bad.n||0)+1;if(!e2.all)bad.rej=(bad.rej||0)+1;else if(res.length<400)res.push(id+" jawaban SALAH diterima: "+m.slice(0,60).replace(/\\n/g," "));
}});
res.push("toleransi (lolos/total): "+JSON.stringify(ok));res.push("salah-sedikit ditolak: "+bad.rej+"/"+bad.n);return res}`,ctx);
console.log(ctx.R().join("\n"));

var CNT0=[6,5,5,5,5,5,5,5,5,8];
var NM={String:['namaToko','namaSiswa','kotaAsal','judulBuku','namaMenu','merkLaptop'],int:['jumlahPembeli','stokBarang','nilaiUjian','jumlahSiswa','poinGame','totalTiket'],double:['beratGula','tinggiBadan','hargaKopi','suhuRuang','panjangKain','saldoDompet'],bool:['sudahLunas','sedangBuka','stokTersedia','lulusUjian','anggotaAktif','diskonAktif'],num:['suhuGudang','kecepatan','jumlahStok','skorTim','durasi','kapasitas']};
var WD=['Zaki Mart','Budi','Depok','Dart Dasar','Nasi Goreng','Gunadarma','Kopi Susu','Bandung'];
var GT={String:'string',int:'int',double:'float64',bool:'bool'};
function rng(s){var h=1779033703^s.length;for(var i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}
 return function(){h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);h^=h>>>16;return(h>>>0)/4294967296}}
function pick(r,a,n){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a.slice(0,n)}
function esc(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function fmt(v){if(typeof v==="string")return v;if(Array.isArray(v))return"["+v.map(fmt).join(", ")+"]";
 if(v&&typeof v==="object")return"{"+Object.keys(v).map(function(k){return k+": "+fmt(v[k])}).join(", ")+"}";return String(v)}
function canon(o){if(Array.isArray(o))return o.map(canon);if(o&&typeof o==="object"){var x={};Object.keys(o).sort().forEach(function(k){x[k]=canon(o[k])});return x}return o}
function deq(a,b){return JSON.stringify(canon(a))===JSON.stringify(canon(b))}
function outEq(exp){return function(c,r){return!r.err&&r.out.join("\n")===exp.join("\n")}}
// ---- simulator Dart / Go
var GO=false;
function ev(e,vars){e=e.trim();
 if(!GO&&/^(["']).*\1$/s.test(e)){return e.slice(1,-1).replace(/\$\{([^}]+)\}|\$(\w+)/g,function(_,a,b){return fmt(ev(a||b,vars))})}
 if(!/^[\w\s"'.,:\[\]{}+\-*\/()<>&|!=]+$/.test(e))throw new Error("ekspresi tidak didukung: "+e);
 var ids=e.replace(/(["'])(?:(?!\1).)*\1/g,"").match(/[A-Za-z_]\w*/g)||[];
 ids.forEach(function(x){if(!Object.prototype.hasOwnProperty.call(vars,x)&&["length","len","true","false","null","toUpperCase","toLowerCase","toString"].indexOf(x)<0)throw new Error("belum dikenal: "+x)});
 var k=Object.keys(vars);
 return Function.apply(null,k.concat("len","return ("+e+")")).apply(null,k.map(function(x){return vars[x]}).concat(function(x){return x.length}))}
function args(s){var o=[],d=0,q="",b="";for(var i=0;i<s.length;i++){var c=s[i];
 if(q){if(c===q)q="";}else if(c==='"'||c==="'")q=c;else if("([{".indexOf(c)>-1)d++;else if(")]}".indexOf(c)>-1)d--;else if(c===","&&!d){o.push(b);b="";continue}
 b+=c}o.push(b);return o}
function run(code,go){GO=go;var vars={},out=[],err=null,sts;
 code=code.replace(/\/\/.*$/gm,"");
 if(go)sts=code.split("\n").filter(function(l){l=l.trim();return l&&!/^(package|import)\b/.test(l)&&!/^func\s+main/.test(l)&&l!=="}"});
 else sts=code.replace(/void\s+main\s*\(\s*\)\s*\{/,"").replace(/;\s*\}\s*$/,";").split(";");
 sts.forEach(function(st){if(err)return;st=st.trim();if(!st)return;
  try{var m;
   if(m=st.match(go?/^fmt\.Println\(([\s\S]*)\)$/:/^print\s*\(([\s\S]*)\)$/))out.push(args(m[1]).map(function(a){return fmt(ev(a,vars))}).join(" "));
   else if(m=go?(st.match(/^var\s+(\w+)(?:\s+[\w\[\]]+)?\s*=\s*(.+)$/)||st.match(/^(\w+)\s*:=\s*(.+)$/)):st.match(/^(?:final\s+|const\s+)?(?:String|int|double|num|bool|dynamic|var|List(?:<[^>]*>)?|Map(?:<[^>]*>)?)\s+(\w+)\s*=\s*([\s\S]+)$/))vars[m[1]]=ev(m[2],vars);
   else if(m=st.match(/^(\w+)\s*=\s*([\s\S]+)$/)){if(!(m[1] in vars))throw new Error("variabel "+m[1]+" belum dideklarasikan");vars[m[1]]=ev(m[2],vars)}
   else throw new Error("perintah tidak dikenali: "+st.slice(0,30))
  }catch(e){err=e.message}});
 return{out:out,err:err}}
// ---- generator soal
function scalar(kind,L,r,go){var k=1+(L>>1),mut=kind==="num"||(kind==="bool"&&!go),nm=pick(r,NM[kind],k),vals=[],nv=[],lits=[],dt=kind,gt=GT[kind],i,v;
 for(i=0;i<k;i++){v=kind==="String"?pick(r,WD,1)[0]:kind==="bool"?r()<.5:2+Math.floor(r()*58);
  if(kind==="double")v+=[.5,.25,.75][Math.floor(r()*3)];
  vals.push(v);lits.push(kind==="String"?'"'+v+'"':String(v));nv.push(kind==="bool"?!v:v+.5)}
 var c=[],sol=[],exp=[],pr=function(x){return go?"fmt.Println("+x+")":"print("+x+");"};
 if(go)c.push(["Kerangka Go: package main, import \"fmt\", dan func main()",function(code){return/package\s+main\b/.test(code)&&/import\s*(\(\s*)?"fmt"/.test(code)&&/func\s+main\s*\(\s*\)\s*\{/.test(code)}]);
 nm.forEach(function(n,i){
  c.push([(go?"Deklarasi "+n+" = "+lits[i]:dt+" "+n+" = "+lits[i]),function(code){return go?new RegExp("(var\\s+"+n+"(\\s+"+gt+")?\\s*=\\s*"+esc(lits[i])+"|"+n+"\\s*:=\\s*"+esc(lits[i])+")\\s*(\\n|$)").test(code):new RegExp("\\b"+dt+"\\s+"+n+"\\s*=\\s*"+esc(lits[i])+"\\s*;").test(code.replace(/'/g,'"'))}]);
  sol.push(go?"var "+n+" "+gt+" = "+lits[i]:dt+" "+n+" = "+lits[i]+";");
  if(mut){c.push(["Ubah "+n+" menjadi "+nv[i],function(code){return new RegExp("\\n\\s*"+n+"\\s*=\\s*"+esc(nv[i])+"\\s*;").test(code)}]);sol.push(n+" = "+nv[i]+";")}});
 (mut?nv:vals).forEach(function(x,i){exp.push(fmt(x));sol.push(pr(nm[i]))});
 var ex=L>=4&&!mut&&kind!=="bool"&&!(kind==="int"&&L>=6);
 if(ex){if(kind==="String"){exp.push(vals.join(" "));sol.push(pr(go?nm.join(' + " " + '):"'"+nm.map(function(n){return"$"+n}).join(" ")+"'"))}
  else{exp.push(fmt(vals.reduce(function(a,b){return a+b})));sol.push(pr(nm.join(" + ")))}}
 var xs=[],VV=mut?nv:vals,more="",cd=function(n){return"<code class='k'>"+n+"</code>"};
 if(L>=6&&k>1){
  if(kind==="int"){var t=vals.reduce(function(a,b){return a+b});xs.push(["total",nm.join(" + "),t,1,"Hitung "+cd("total")+" (jumlah semua variabel, tulis sebagai ekspresi dari variabel) lalu tampilkan."]);if(L>=8){var dk=1+Math.floor(r()*9);xs.push(["diskon",String(dk),dk,0,"Diskon: "+cd("diskon")+" = "+dk+"."],["bayar","total - diskon",t-dk,1,"Hitung "+cd("bayar")+" = total - diskon lalu tampilkan."])}}
  else if(kind==="double"||kind==="num")xs.push(["hasil",nm[0]+" * "+nm[1],VV[0]*VV[1],1,"Hitung "+cd("hasil")+" = "+nm[0]+" dikali "+nm[1]+" (ekspresi dari variabel) lalu tampilkan."]);
  else if(kind==="bool")xs.push(["gabung",nm[0]+" && "+nm[1],VV[0]&&VV[1],1,"Hitung "+cd("gabung")+" = "+nm[0]+" DAN "+nm[1]+" (operator &&) lalu tampilkan."]);
  else{xs.push([null,go?"len("+nm[0]+")":nm[0]+".length",vals[0].length,1,"Tampilkan juga panjang teks "+cd(nm[0])+" (jumlah karakter)."]);if(L>=8)xs.push([null,go?"len("+nm[k-1]+")":nm[k-1]+".length",vals[k-1].length,1,"Tampilkan juga panjang teks "+cd(nm[k-1])+"."])}}
 xs.forEach(function(x){var nv2=x[0];
  if(nv2==="diskon"){c.push(["Variabel diskon = "+x[2],function(code){return new RegExp("\\bdiskon\\s*(:=|=)\\s*"+x[2]+"\\b").test(code)}]);sol.push(go?"diskon := "+x[2]:"int diskon = "+x[2]+";")}
  else{if(nv2){c.push(["Variabel "+nv2+" dihitung dari variabel (bukan angka langsung)",function(code){return new RegExp("\\b"+nv2+"\\s*(:=|=)[^;\\n]*\\b("+nm.concat(["total","diskon"]).join("|")+")\\b").test(code)}]);sol.push(go?nv2+" := "+x[1]:kind+" "+nv2+" = "+x[1]+";")}
   sol.push(pr(nv2||x[1]));exp.push(fmt(x[2]))}
  more+=" "+x[4]});
 c.push(["Output sesuai ("+exp.length+" baris)",outEq(exp)]);
 var story="Catat data berikut sebagai <code class='k'>"+(go?gt:dt)+"</code>: "+nm.map(function(n,i){return"<code class='k'>"+n+"</code> = "+lits[i]}).join(", ")+"."+(mut?" Lalu ubah tiap nilainya menjadi "+nv.map(fmt).join(", ")+" (urut sama) dan tampilkan satu per baris.":" Tampilkan tiap nilai di barisnya sendiri"+(ex?(kind==="String"?", lalu satu baris berisi semua nilai dipisah spasi.":", lalu satu baris berisi jumlah semuanya."):"."))+(go?" Boleh pakai <code class='k'>var</code> atau <code class='k'>:=</code>.":"");
 return{s:story+more,c:c,h:"Satu print() per nilai, urutan sama dengan soal.",sol:go?"package main\n\nimport \"fmt\"\n\nfunc main() {\n  "+sol.join("\n  ")+"\n}":"void main() {\n  "+sol.join("\n  ")+"\n}",go:go}}
function dyn(L,r){var nm=pick(r,["data","kode","nilai","isi","info","hasil"],1)[0],n=Math.min(2+(L>>1),6),ty=pick(r,["s","i","d","b"],4),seq=[],c=[],sol=[],exp=[],i;
 for(i=0;i<n;i++){var t=ty[i%4];seq.push(t==="s"?'"'+pick(r,["A01","B02","K77","Halo","Kopi","Dart","Zaki"],1)[0]+'"':t==="i"?String(100+Math.floor(r()*900)):t==="d"?(1+Math.floor(r()*50))+[".5",".25",".75"][Math.floor(r()*3)]:String(r()<.5))}
 seq.forEach(function(v,i){c.push([i?"Ubah "+nm+" menjadi "+v:"dynamic "+nm+" = "+v,function(code){return new RegExp((i?"\\n\\s*":"dynamic\\s+")+nm+"\\s*=\\s*"+esc(v)+"\\s*;").test(code.replace(/'/g,'"'))}]);
  sol.push((i?"":"dynamic ")+nm+" = "+v+";","print("+nm+");");exp.push(v.replace(/"/g,""))});
 c.push(["Output sesuai ("+n+" baris)",outEq(exp)]);
 return{s:"Satu variabel <code class='k'>"+nm+"</code> bertipe <code class='k'>dynamic</code> diisi berturut-turut dengan: "+seq.map(function(v){return"<b>"+v.replace(/"/g,"&quot;")+"</b>"}).join(", ")+". Tampilkan nilainya setelah tiap pengisian ("+n+" baris).",c:c,h:"print("+nm+") setelah setiap pengisian, termasuk nilai awal.",sol:"void main() {\n  "+sol.join("\n  ")+"\n}"}}
function lst(L,r){var n=L+2>8?8:L+2,it=pick(r,WD,n),c=[],exp=[it[0],String(n)],lit=it.map(function(x){return'"'+x+'"'}).join(", "),pr=['print(menu[0]);','print(menu.length);'];
 c.push(["List<String> menu dengan "+n+" item urut",function(code){return new RegExp("List<String>\\s+menu\\s*=\\s*\\[\\s*"+it.map(function(x){return"([\"'])"+esc(x)+"\\"+(1)}).join("").replace(/\\1/g,"")+"").test(code)||code.replace(/'/g,'"').replace(/\s+/g,"").indexOf("List<String>menu=["+lit.replace(/ /g,"").replace(/"/g,'"')+"]")>-1||code.replace(/'/g,'"').replace(/\s+/g,"").indexOf("List<String>menu=["+it.map(function(x){return'"'+x.replace(/\s/g,"")+'"'}).join(",")+"]")>-1}]);
 if(L>=4){exp.push(it[n-1]);pr.push("print(menu[menu.length - 1]);")}
 c.push(["Output sesuai ("+exp.length+" baris)",outEq(exp)]);
 return{s:"Daftar menu: "+it.map(function(x){return"<b>\""+x+"\"</b>"}).join(", ")+". Simpan di <code class='k'>menu</code> bertipe <code class='k'>List&lt;String&gt;</code>. Tampilkan menu pertama, jumlah menu"+(L>=4?", dan menu terakhir (pakai menu.length).":"."),c:c,h:"menu[0], menu.length, menu[menu.length - 1].",sol:"void main() {\n  List<String> menu = ["+lit+"];\n  "+pr.join("\n  ")+"\n}"}}
function mp(L,r){var n=Math.min(2+(L>>1),5),K=[["nama",pick(r,WD,1)[0]],["harga",(5+Math.floor(r()*45))*1000],["stok",2+Math.floor(r()*58)],["tersedia",r()<.5],["kategori",pick(r,["minuman","makanan","alat"],1)[0]]].slice(0,n),c=[],lit=K.map(function(x){return'"'+x[0]+'": '+(typeof x[1]==="string"?'"'+x[1]+'"':x[1])}),exp=K.map(function(x){return fmt(x[1])});
 c.push(["Map<String, dynamic> produk dengan "+n+" key",function(code){var q=code.replace(/'/g,'"').replace(/\s+/g,"");return/Map<String,dynamic>produk=\{/.test(q)&&K.every(function(x){return q.indexOf('"'+x[0]+'":'+(typeof x[1]==="string"?'"'+x[1].replace(/\s/g,"")+'"':x[1]))>-1})}]);
 c.push(["Output sesuai ("+n+" baris)",outEq(exp)]);
 return{s:"Data satu produk: "+K.map(function(x){return"<code class='k'>"+x[0]+"</code> = "+(typeof x[1]==="string"?'"'+x[1]+'"':x[1])}).join(", ")+". Simpan di <code class='k'>produk</code> bertipe <code class='k'>Map&lt;String, dynamic&gt;</code>, lalu tampilkan tiap nilai lewat key-nya, urut seperti di atas.",c:c,h:'produk["nama"], produk["harga"], dst.',sol:"void main() {\n  Map<String, dynamic> produk = {\n    "+lit.join(",\n    ")+"\n  };\n  "+K.map(function(x){return'print(produk["'+x[0]+'"]);'}).join("\n  ")+"\n}"}}
function fire(L,r){var root=pick(r,["produk","siswa","pesanan"],1)[0],k=1+(L>>1),E={},ch=E[root]={},d=[];
 for(var i=1;i<=k;i++){var o={nama:pick(r,WD,1)[0],harga:(2+Math.floor(r()*48))*1000};if(L>=4)o.tersedia=r()<.5;if(L>=7)o.tags=pick(r,["baru","promo","laris","hemat"],2);ch["p"+i]=o;d.push("<code class='k'>p"+i+"</code>: "+Object.keys(o).map(function(f){return f+"="+JSON.stringify(o[f])}).join(", "))}
 return{s:"Buat JSON untuk Realtime Database dengan node <code class='k'>"+root+"</code> berisi "+k+" anak (key = id):<br>"+d.join("<br>")+"<br>Teks ditulis dengan tanda petik, angka tanpa petik.",
 c:[["JSON valid",function(c,x){return!!x.o}],["Ada node "+root,function(c,x){return!!x.o&&root in x.o}],["Isi data persis sesuai soal",function(c,x){return!!x.o&&deq(x.o,E)}]],
 h:'{ "'+root+'": { "p1": { ... } } }',sol:JSON.stringify(E,null,2),
 rn:function(code){try{var o=JSON.parse(code);return{o:o,out:[JSON.stringify(o,null,2)]}}catch(e){return{err:"JSON tidak valid: "+e.message,out:[]}}}}}
function pm(L,r){var B="https://api.tokozaki.id",res=pick(r,["produk","siswa","pesanan"],1)[0],id=2+Math.floor(r()*98),tk="tok"+(100+Math.floor(r()*900)),a=1+Math.floor(r()*9),b=1+Math.floor(r()*5),M,U,H=[],body=null,t;
 var bd=function(){var o={nama:pick(r,WD,1)[0],harga:(2+Math.floor(r()*48))*1000};if(L>=6)o.tersedia=r()<.5;return o};
 if(L<=3){M="GET";U=L===1?B+"/"+res+"/"+id:B+"/"+res+"?limit="+a+"&page="+b;t=L===1?"ambil satu data dengan id "+id:"ambil daftar dengan query limit="+a+" dan page="+b;if(L>=2)H.push(["Accept","application/json"])}
 else if(L<=6){M="POST";U=B+"/"+res;body=bd();t="membuat data baru";H.push(["Content-Type","application/json"])}
 else if(L<=8){M="PUT";U=B+"/"+res+"/"+id;body=bd();t="mengganti data dengan id "+id;H.push(["Content-Type","application/json"],["Authorization","Bearer "+tk])}
 else if(L===9){M="PATCH";U=B+"/"+res+"/"+id;body={harga:(2+Math.floor(r()*48))*1000};t="mengubah harga saja pada id "+id;H.push(["Content-Type","application/json"],["Authorization","Bearer "+tk])}
 else{M="DELETE";U=B+"/"+res+"/"+id;t="menghapus data dengan id "+id;H.push(["Authorization","Bearer "+tk],["X-Api-Key","key"+id])}
 var P=function(code){var ls=code.split("\n"),f=(ls[0]||"").trim(),hs=[],i=1;for(;i<ls.length&&ls[i].trim();i++)hs.push(ls[i].trim());var bt=ls.slice(i+1).join("\n").trim(),o;try{if(bt)o=JSON.parse(bt)}catch(e){o=null}return{f:f,hs:hs,bt:bt,o:o}};
 var c=[["Baris pertama: "+M+" "+U,function(code){return P(code).f===M+" "+U}]];
 H.forEach(function(h){c.push(["Header "+h[0]+": "+h[1],function(code){return P(code).hs.some(function(x){return x.toLowerCase()===(h[0]+": "+h[1]).toLowerCase()})}])});
 if(body)c.push(["Body JSON sesuai: "+JSON.stringify(body),function(code){var p=P(code);return!!p.o&&deq(p.o,body)}]);
 return{s:"Tulis raw HTTP request untuk <b>"+t+"</b> di <code class='k'>"+B+"</code>. Format: baris pertama <code class='k'>METHOD URL</code>, lalu satu header per baris"+(body?", baris kosong, lalu body JSON":"")+".<br>"+(H.length?"Header wajib: "+H.map(function(h){return"<code class='k'>"+h[0]+": "+h[1]+"</code>"}).join(", ")+".":"Tanpa header.")+(body?"<br>Body: <code class='k'>"+JSON.stringify(body)+"</code>":""),
 c:c,h:"Contoh: GET https://... lalu header, baris kosong, body.",sol:M+" "+U+"\n"+H.map(function(h){return h[0]+": "+h[1]}).join("\n")+(body?"\n\n"+JSON.stringify(body):""),
 rn:function(code){var p=P(code);return{out:["Request : "+p.f,"Header  : "+p.hs.length,"Body    : "+(p.bt?(p.o?"JSON valid":"JSON tidak valid"):"kosong")]}}}}
// ---- Flutter mini renderer
function fparse(src){
 src=src.replace(/\/\/.*$/gm,"").replace(/\bconst\s+|\bnew\s+/g,"").replace(/\(\s*\)\s*(\{[^{}]*\}|=>\s*[^,)]+)/g,"null").trim().replace(/^return\s+/,"").replace(/;\s*$/,"");
 var T=[],re=/\s*(?:('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?)|([A-Za-z_$][\w.$]*)|(=>|[()\[\],:{};]))/y,m,i=0,p=0;
 while(i<src.length){re.lastIndex=i;m=re.exec(src);if(!m){if(/^\s*$/.test(src.slice(i)))break;throw new Error("karakter tidak dikenal dekat: "+src.slice(i,i+12))}
  T.push(m[1]?{t:"s",v:m[1].slice(1,-1)}:m[2]?{t:"n",v:+m[2]}:m[3]?{t:"i",v:m[3]}:{t:"p",v:m[4]});i=re.lastIndex}
 function val(){var t=T[p++];if(!t)throw new Error("kode berhenti di tengah, cek tanda kurung");
  if(t.t==="s")return{s:t.v};if(t.t==="n")return{x:t.v};
  if(t.t==="p"&&t.v==="("){while(T[p]&&T[p].v!==")")p++;p++;if(T[p]&&T[p].v==="=>"){p++;return{lam:val()}}if(T[p]&&T[p].v==="{"){p++;if(T[p]&&T[p].v==="return")p++;var bd=val();if(T[p]&&T[p].v===";")p++;if(T[p]&&T[p].v==="}")p++;return{lam:bd}}throw new Error("tanda kurung ( tidak dikenali")}
  if(t.t==="p"&&t.v==="["){var a=[];while(T[p]&&T[p].v!=="]"){a.push(val());if(T[p]&&T[p].v===",")p++}if(!T[p])throw new Error("tanda ] belum ditutup");p++;return{l:a}}
  if(t.t==="i"){if(T[p]&&T[p].v==="("){p++;var n={n:t.v,p:[],o:{}};
    while(T[p]&&T[p].v!==")"){if(T[p].t==="i"&&T[p+1]&&T[p+1].v===":"){var k=T[p].v;p+=2;n.o[k]=val()}else n.p.push(val());if(T[p]&&T[p].v===",")p++}
    if(!T[p])throw new Error("tanda ) belum ditutup di "+t.v);p++;return n}
   return{id:t.v}}
  throw new Error("tidak terduga: "+t.v)}
 var r=val();if(p<T.length)throw new Error("ada kode berlebih setelah widget utama");if(!r.n)throw new Error("tulis sebuah widget, mis. Text('Halo')");return r}
var CL={red:"#e53935",blue:"#1e88e5",green:"#43a047",orange:"#fb8c00",purple:"#8e24aa",teal:"#00897b",grey:"#9e9e9e",amber:"#ffb300",pink:"#d81b60",indigo:"#3949ab",white:"#fff",black:"#000",transparent:"transparent"};
var IC={home:"🏠",person:"👤",shopping_cart:"🛒",star:"⭐",settings:"⚙️",notifications:"🔔",favorite:"❤️",email:"✉️",attach_money:"💰",trending_up:"📈",people:"👥",check_circle:"✅",menu:"☰",search:"🔍",add:"＋"};
var JM={start:"flex-start",center:"center",end:"flex-end",spaceBetween:"space-between",spaceAround:"space-around",spaceEvenly:"space-evenly",stretch:"stretch"};
function col(v){if(!v||!v.id)return"";var m=v.id.match(/^Colors\.(\w+)(?:\.shade(\d+))?$/);if(!m||!CL[m[1]])return"";var s=+m[2];return s&&s<500?"color-mix(in srgb,"+CL[m[1]]+" "+(s<=100?18:s<=200?35:s<=300?50:65)+"%,#fff)":CL[m[1]]}
function nu(v){return v&&v.x!==undefined?v.x:0}
function edge(v){if(!v||!v.n)return"0";var o=v.o,p=v.p;if(v.n==="EdgeInsets.all")return nu(p[0])+"px";if(v.n==="EdgeInsets.symmetric")return nu(o.vertical)+"px "+nu(o.horizontal)+"px";if(v.n==="EdgeInsets.only")return[o.top,o.right,o.bottom,o.left].map(function(x){return nu(x)+"px"}).join(" ");return"0"}
function esch(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
function al(v){return v&&v.id?JM[v.id.split(".").pop()]||"flex-start":"flex-start"}
function ch(n){return n&&n.n?fr(n):""}
function kids(o){return(o.children&&o.children.l||[]).map(ch).join("")}
var IX=null;function ix(s){return IX===null?s:s.replace(/\$\{\s*index\s*\+\s*(\d+)\s*\}/g,function(_,a){return IX+ +a}).replace(/\$index/g,IX)}
function fr(n){var o=n.o,p=n.p,N=n.n;
 switch(N){
 case"MaterialApp":return ch(o.home);
 case"Text":var st=o.style&&o.style.o||{};return"<span style='font-size:"+(nu(st.fontSize)||14)+"px;color:"+(col(st.color)||"inherit")+";font-weight:"+(st.fontWeight&&/bold/.test(st.fontWeight.id)?700:400)+"'>"+esch(ix(p[0]&&p[0].s||""))+"</span>";
 case"Icon":return"<span style='font-size:"+(nu(o.size)||24)+"px'>"+(IC[(p[0]&&p[0].id||"").replace("Icons.","")]||"▣")+"</span>";
 case"Container":var d=o.decoration&&o.decoration.o||{},br=d.borderRadius&&d.borderRadius.p[0]?nu(d.borderRadius.p[0]):0;return"<div style='background:"+col(d.color||o.color)+";padding:"+edge(o.padding)+";margin:"+edge(o.margin)+";border-radius:"+br+"px;"+(o.width?"width:"+nu(o.width)+"px;":"")+(o.height?"height:"+nu(o.height)+"px;":"")+"'>"+ch(o.child)+"</div>";
 case"Padding":return"<div style='padding:"+edge(o.padding)+"'>"+ch(o.child)+"</div>";
 case"Center":return"<div style='display:flex;justify-content:center;align-items:center'>"+ch(o.child)+"</div>";
 case"SizedBox":return"<div style='width:"+(o.width?nu(o.width)+"px":"auto")+";height:"+(o.height?nu(o.height)+"px":"auto")+"'>"+ch(o.child)+"</div>";
 case"Expanded":return"<div style='flex:1;min-width:0'>"+ch(o.child)+"</div>";
 case"ListView.builder":var nn=nu(o.itemCount),bl=o.itemBuilder&&o.itemBuilder.lam,hh="";for(var ii=0;ii<nn&&ii<30;ii++){IX=ii;hh+=bl&&bl.n?fr(bl):""}IX=null;return"<div style='display:flex;flex-direction:column'>"+hh+"</div>";
 case"FloatingActionButton":return"<div style='display:flex;justify-content:flex-end;padding:12px'><div style='width:52px;height:52px;border-radius:50%;background:#1e88e5;color:#fff;display:flex;align-items:center;justify-content:center'>"+ch(o.child)+"</div></div>";
 case"Row":case"Column":return"<div style='display:flex;flex-direction:"+(N==="Row"?"row":"column")+";justify-content:"+al(o.mainAxisAlignment)+";align-items:"+al(o.crossAxisAlignment)+"'>"+kids(o)+"</div>";
 case"ListView":return"<div style='display:flex;flex-direction:column'>"+kids(o)+"</div>";
 case"Card":return"<div style='background:"+(col(o.color)||"var(--panel)")+";border-radius:10px;box-shadow:0 1px 5px #0003;margin:6px'>"+ch(o.child)+"</div>";
 case"ListTile":return"<div style='display:flex;gap:12px;align-items:center;padding:10px 14px'>"+ch(o.leading)+"<div style='flex:1'><div style='font-weight:600'>"+ch(o.title)+"</div><div style='opacity:.7;font-size:13px'>"+ch(o.subtitle)+"</div></div>"+ch(o.trailing)+"</div>";
 case"ElevatedButton":case"TextButton":return"<button style='padding:8px 16px;border-radius:8px;border:0;font:inherit;margin:4px;"+(N==="ElevatedButton"?"background:#1e88e5;color:#fff":"background:none;color:#1e88e5")+"'>"+ch(o.child)+"</button>";
 case"AppBar":return"<div style='background:"+(col(o.backgroundColor)||"#1e88e5")+";color:#fff;padding:14px 16px;font-size:18px;font-weight:600'>"+ch(o.title)+"</div>";
 case"Scaffold":return"<div style='background:"+(col(o.backgroundColor)||"var(--bg)")+";min-height:100%'>"+ch(o.appBar)+ch(o.body)+ch(o.floatingActionButton)+"</div>";
 default:return"<div style='background:#fee;color:#b00;padding:6px;font-size:12px'>Widget belum didukung: "+esch(N)+"</div>"}}
function pv(){var e=document.getElementById("ed"),p=document.getElementById("pv");if(!e||!p)return;
 if(!e.value.replace(/\/\/.*$/gm,"").trim()){p.innerHTML="<div class='er'>Preview akan muncul di sini.</div>";return}
 try{p.innerHTML=fr(fparse(e.value))}catch(x){p.innerHTML="<div class='er'>"+esch(x.message)+"</div>"}}
function walk(n,f){if(!n)return;if(n.n)f(n);if(n.lam)walk(n.lam,f);(n.p||[]).forEach(function(x){walk(x,f)});for(var k in n.o||{})walk(n.o[k],f);(n.l||[]).forEach(function(x){walk(x,f)})}
function cnt2(t,N){var c=0;walk(t,function(n){if(n.n===N)c++});return c}
function txs(t){var a=[];walk(t,function(n){if(n.n==="Text"&&n.p[0]&&n.p[0].s!==undefined)a.push(n.p[0].s)});return a}
function anyn(t,N,fn){var ok=false;walk(t,function(n){if(n.n===N&&fn(n))ok=true});return ok}
function sty(n,k){var s=n.o.style&&n.o.style.o;return s&&s[k]}
function cid(n){var c=n.o.color||(n.o.decoration&&n.o.decoration.o&&n.o.decoration.o.color);return c&&c.id}
function W(f){return function(c,r){return!r.err&&f(r.t)}}
function flt(L,r){
 var w=pick(r,["Selamat pagi","Halo Zaki","Toko Kopi","Diskon hari ini","Menu utama","Laporan harian"],3),cs=pick(r,["red","blue","green","orange","purple","teal"],1)[0],
 ic=pick(r,["home","star","settings","notifications","favorite","people","trending_up"],3),S=[18,20,24,28][Math.floor(r()*4)],
 lb=pick(r,["Pesanan","Pelanggan","Pendapatan","Produk"],3),n=[0,1,2].map(function(){return String(2+Math.floor(r()*98))}),
 ac=pick(r,["Pesanan baru masuk","Stok hampir habis","Pembayaran diterima","Pelanggan baru"],3),
 T=function(s){return"Text('"+s+"')"},tx=function(s){return["Teks '"+s+"' tampil",W(function(t){return txs(t).indexOf(s)>-1})]},
 sc=function(i){return"Card(child: Padding(padding: EdgeInsets.all(12), child: Column(children: [Icon(Icons."+ic[i]+"), "+T(lb[i])+", Text('"+n[i]+"', style: TextStyle(fontSize: 28))])))"},
 stat=[["Ada Column",W(function(t){return cnt2(t,"Column")>0})],tx(lb[0]),["Angka "+n[0]+" berukuran minimal 24",W(function(t){return anyn(t,"Text",function(x){return x.p[0]&&x.p[0].s===n[0]&&nu(sty(x,"fontSize"))>=24})})],["Ada Icon",W(function(t){return cnt2(t,"Icon")>0})]],
 tri=[["Row berisi 3 Expanded",W(function(t){return cnt2(t,"Row")>0&&cnt2(t,"Expanded")>=3})]].concat(lb.map(tx),n.map(tx)),
 lst=[["ListView berisi 3 ListTile",W(function(t){return cnt2(t,"ListView")>0&&cnt2(t,"ListTile")>=3})]].concat(ac.map(tx)),
 lv=function(){return"Card(child: ListView(children: [ListTile(title: "+T(ac[0])+"), ListTile(title: "+T(ac[1])+"), ListTile(title: "+T(ac[2])+")]))"},
 row3="Row(children: [Expanded(child: "+sc(0)+"), Expanded(child: "+sc(1)+"), Expanded(child: "+sc(2)+")])",
 D=[
 ["Tampilkan teks <b>'"+w[0]+"'</b> dengan fontSize <b>"+S+"</b> dan warna <code class='k'>Colors."+cs+"</code> (pakai <code class='k'>TextStyle</code>).",
  [tx(w[0]),["fontSize "+S,W(function(t){return anyn(t,"Text",function(x){return nu(sty(x,"fontSize"))===S})})],["Warna Colors."+cs,W(function(t){return anyn(t,"Text",function(x){var c=sty(x,"color");return c&&c.id==="Colors."+cs})})]],
  "Text('"+w[0]+"', style: TextStyle(fontSize: "+S+", color: Colors."+cs+"))"],
 ["Buat <code class='k'>Row</code> berisi <code class='k'>Icon(Icons."+ic[0]+")</code> lalu teks <b>'"+w[0]+"'</b>.",
  [["Ada Row",W(function(t){return cnt2(t,"Row")>0})],["Icon Icons."+ic[0],W(function(t){return anyn(t,"Icon",function(x){return x.p[0]&&x.p[0].id==="Icons."+ic[0]})})],tx(w[0])],
  "Row(children: [Icon(Icons."+ic[0]+"), SizedBox(width: 8), "+T(w[0])+"])"],
 ["Buat <code class='k'>Container</code> berwarna <code class='k'>Colors."+cs+"</code> dengan <code class='k'>padding</code> <code class='k'>EdgeInsets.all(16)</code> dan child teks <b>'"+w[0]+"'</b>.",
  [["Container berwarna "+cs,W(function(t){return anyn(t,"Container",function(x){return cid(x)==="Colors."+cs})})],["Container punya padding",W(function(t){return anyn(t,"Container",function(x){return!!x.o.padding})})],tx(w[0])],
  "Container(color: Colors."+cs+", padding: EdgeInsets.all(16), child: "+T(w[0])+")"],
 ["Susun <code class='k'>Column</code> berisi 3 teks berurutan: <b>'"+w[0]+"'</b>, <b>'"+w[1]+"'</b>, <b>'"+w[2]+"'</b>, dipisah <code class='k'>SizedBox(height: 8)</code>.",
  [["Ada Column",W(function(t){return cnt2(t,"Column")>0})],["Urutan 3 teks sesuai",W(function(t){return JSON.stringify(txs(t))===JSON.stringify(w)})],["Minimal 2 SizedBox",W(function(t){return cnt2(t,"SizedBox")>=2})]],
  "Column(children: ["+T(w[0])+", SizedBox(height: 8), "+T(w[1])+", SizedBox(height: 8), "+T(w[2])+"])"],
 ["Buat <code class='k'>Card</code> berisi <code class='k'>ListTile</code> dengan leading <code class='k'>Icon(Icons."+ic[0]+")</code>, title <b>'"+w[0]+"'</b>, subtitle <b>'"+w[1]+"'</b>.",
  [["Ada Card dan ListTile",W(function(t){return cnt2(t,"Card")>0&&cnt2(t,"ListTile")>0})],["Leading Icons."+ic[0],W(function(t){return anyn(t,"ListTile",function(x){var l=x.o.leading;return l&&l.n==="Icon"&&l.p[0].id==="Icons."+ic[0]})})],["Title '"+w[0]+"' dan subtitle '"+w[1]+"'",W(function(t){return anyn(t,"ListTile",function(x){var a=x.o.title,b=x.o.subtitle;return a&&a.p[0]&&a.p[0].s===w[0]&&b&&b.p[0]&&b.p[0].s===w[1]})})]],
  "Card(child: ListTile(leading: Icon(Icons."+ic[0]+"), title: "+T(w[0])+", subtitle: "+T(w[1])+"))"],
 ["Buat <code class='k'>Row</code> berisi <code class='k'>ElevatedButton</code> bertulis <b>'"+w[0]+"'</b> dan <code class='k'>TextButton</code> bertulis <b>'"+w[1]+"'</b>. Isi <code class='k'>onPressed: () {}</code>.",
  [["Ada Row",W(function(t){return cnt2(t,"Row")>0})],["ElevatedButton '"+w[0]+"'",W(function(t){return anyn(t,"ElevatedButton",function(x){return x.o.child&&x.o.child.p[0]&&x.o.child.p[0].s===w[0]})})],["TextButton '"+w[1]+"'",W(function(t){return anyn(t,"TextButton",function(x){return x.o.child&&x.o.child.p[0]&&x.o.child.p[0].s===w[1]})})]],
  "Row(children: [ElevatedButton(onPressed: () {}, child: "+T(w[0])+"), TextButton(onPressed: () {}, child: "+T(w[1])+")])"],
 ["Buat <b>kartu statistik</b>: <code class='k'>Card</code> dengan <code class='k'>Column</code> berisi <code class='k'>Icon(Icons."+ic[0]+")</code>, teks label <b>'"+lb[0]+"'</b>, dan angka <b>'"+n[0]+"'</b> berukuran fontSize 28.",stat,sc(0)],
 ["Susun <code class='k'>Row</code> berisi 3 kartu statistik, tiap kartu dibungkus <code class='k'>Expanded</code>: <b>"+lb.map(function(x,i){return x+" ("+n[i]+")"}).join(", ")+"</b>.",tri,row3],
 ["Buat <code class='k'>Card</code> berisi <code class='k'>ListView</code> dengan 3 <code class='k'>ListTile</code> (cukup title): <b>"+ac.join("</b>, <b>")+"</b>.",lst,lv()],
 ["<b>Dashboard penuh.</b> <code class='k'>Scaffold</code> dengan <code class='k'>appBar: AppBar(title: Text('Dashboard "+w[0]+"'))</code>. Body-nya <code class='k'>Column</code>: baris 3 kartu statistik (<b>"+lb.map(function(x,i){return x+" "+n[i]}).join(", ")+"</b>, pakai Expanded), lalu Card berisi ListView 3 ListTile: <b>"+ac.join("</b>, <b>")+"</b>.",
  [["Ada Scaffold dan AppBar berjudul 'Dashboard "+w[0]+"'",W(function(t){return t.n==="Scaffold"&&txs(t.o.appBar||{}).indexOf("Dashboard "+w[0])>-1})]].concat(tri,[["ListView berisi 3 ListTile",lst[0][1]]],ac.map(tx)),
  "Scaffold(appBar: AppBar(title: Text('Dashboard "+w[0]+"')), body: Column(children: ["+row3+", "+lv()+"]))"]
 ][L-1];
 var ad=function(note,cs2,fn){D[0]+=" "+note;D[1]=D[1].concat(cs2);D[2]=fn(D[2])},
  szc=function(k,v,m){return W(function(t){var c=0;walk(t,function(x){if(x.n==="SizedBox"&&nu(x.o[k])===v)c++});return c>=m})},
  ali=function(N,k,re){return W(function(t){return anyn(t,N,function(x){var m=x.o[k];return m&&re.test(m.id)})})};
 if(L===1)ad("Tebalkan teksnya dengan <code class='k'>fontWeight: FontWeight.bold</code>.",[["fontWeight bold",W(function(t){return anyn(t,"Text",function(x){var f=sty(x,"fontWeight");return f&&f.id==="FontWeight.bold"})})]],function(s){return s.replace("color: Colors."+cs+")","color: Colors."+cs+", fontWeight: FontWeight.bold)")});
 else if(L===2)ad("Atur <code class='k'>mainAxisAlignment: MainAxisAlignment.spaceBetween</code> pada Row dan beri Icon <code class='k'>size: 32</code>.",[["Row spaceBetween",ali("Row","mainAxisAlignment",/spaceBetween$/)],["Icon size 32",W(function(t){return anyn(t,"Icon",function(x){return nu(x.o.size)===32})})]],function(s){return s.replace("Row(children:","Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children:").replace("Icon(Icons."+ic[0]+")","Icon(Icons."+ic[0]+", size: 32)")});
 else if(L===3)ad("Pakai <code class='k'>decoration: BoxDecoration(color: ..., borderRadius: BorderRadius.circular(12))</code> (bukan color langsung) dan <code class='k'>margin: EdgeInsets.all(8)</code>.",[["borderRadius circular 12",W(function(t){return anyn(t,"Container",function(x){var d=x.o.decoration&&x.o.decoration.o,b=d&&d.borderRadius;return b&&b.p[0]&&nu(b.p[0])===12})})],["Container punya margin",W(function(t){return anyn(t,"Container",function(x){return!!x.o.margin})})]],function(s){return s.replace("Container(color: Colors."+cs+", padding","Container(margin: EdgeInsets.all(8), decoration: BoxDecoration(color: Colors."+cs+", borderRadius: BorderRadius.circular(12)), padding")});
 else if(L===4){D[0]=D[0].replace("height: 8","height: 12");ad("Ratakan isinya ke tengah dengan <code class='k'>crossAxisAlignment: CrossAxisAlignment.center</code>.",[["SizedBox tinggi 12 (minimal 2)",szc("height",12,2)],["Column crossAxisAlignment center",ali("Column","crossAxisAlignment",/center$/)]],function(s){return s.replace(/height: 8/g,"height: 12").replace("Column(children:","Column(crossAxisAlignment: CrossAxisAlignment.center, children:")})}
 else if(L===5)ad("Tambahkan <code class='k'>trailing: Icon(Icons."+ic[1]+")</code> pada ListTile.",[["trailing Icons."+ic[1],W(function(t){return anyn(t,"ListTile",function(l){var a=l.o.trailing;return a&&a.p[0]&&a.p[0].id==="Icons."+ic[1]})})]],function(s){return s.replace(/\)\)\)$/,"), trailing: Icon(Icons."+ic[1]+")))")});
 else if(L===6)ad("Beri jarak <code class='k'>SizedBox(width: 12)</code> di antara kedua tombol dan pusatkan Row (<code class='k'>MainAxisAlignment.center</code>).",[["SizedBox lebar 12",szc("width",12,1)],["Row center",ali("Row","mainAxisAlignment",/center$/)]],function(s){return s.replace("Row(children:","Row(mainAxisAlignment: MainAxisAlignment.center, children:").replace(", TextButton",", SizedBox(width: 12), TextButton")});
 else if(L===7)ad("Beri angka warna <code class='k'>Colors."+cs+"</code>.",[["Angka berwarna "+cs,W(function(t){return anyn(t,"Text",function(x){var c=sty(x,"color");return x.p[0]&&x.p[0].s===n[0]&&c&&c.id==="Colors."+cs})})]],function(s){return s.replace("TextStyle(fontSize: 28)","TextStyle(fontSize: 28, color: Colors."+cs+")")});
 else if(L===8)ad("Beri jarak <code class='k'>SizedBox(width: 8)</code> antar kartu (minimal 2).",[["SizedBox lebar 8 (minimal 2)",szc("width",8,2)]],function(s){return s.replace(/\), Expanded/g,"), SizedBox(width: 8), Expanded")});
 else if(L===9)ad("Tambahkan <code class='k'>trailing: Icon(Icons."+ic[0]+")</code> pada setiap ListTile.",[["3 ListTile punya trailing Icons."+ic[0],W(function(t){var c=0;walk(t,function(l){var a=l.n==="ListTile"&&l.o.trailing;if(a&&a.p[0]&&a.p[0].id==="Icons."+ic[0])c++});return c>=3})]],function(s){return s.replace(/(ListTile\(title: Text\('[^']*'\))\)/g,"$1, trailing: Icon(Icons."+ic[0]+"))")});
 else if(L===10)ad("Scaffold juga memakai <code class='k'>backgroundColor: Colors."+cs+".shade100</code>.",[["Scaffold backgroundColor "+cs+".shade100",W(function(t){var b=t.o&&t.o.backgroundColor;return t.n==="Scaffold"&&b&&b.id==="Colors."+cs+".shade100"})]],function(s){return s.replace("Scaffold(appBar:","Scaffold(backgroundColor: Colors."+cs+".shade100, appBar:")});
 return{s:D[0]+"<br><span class='note'>Tulis satu ekspresi widget. Preview tampil di samping dan ikut berubah saat kamu mengetik.</span>",c:D[1],h:"Mulai dari widget terluar, isi child/children dari luar ke dalam, dan jangan lupa koma antar argumen.",sol:D[2],
  rn:function(code){try{var t=fparse(code),c=0;if(t.n==="MaterialApp"&&t.o.home&&t.o.home.n)t=t.o.home;walk(t,function(){c++});return{t:t,out:["Widget terbaca: "+c+" node"]}}catch(e){return{err:e.message,out:[]}}}}}
// ---- Modul MCS (ACSL): kuis konsep + soal praktik per bab
function mcq(b,r){var o=pick(r,b[1].map(function(_,i){return i}),b[1].length),ops=o.map(function(i){return b[1][i]}),ans=o.indexOf(b[2]);
 return{s:"<b>Pilihan ganda.</b> "+b[0],opts:ops,ans:ans,c:[["Pilih jawaban yang benar",function(c,x){return x.sel===ans}]],h:"Baca lagi materi di bagian atas halaman.",sol:ops[ans],
  rn:function(code){var i=/^\d+$/.test(code)?+code:ops.indexOf(code);return{sel:i,out:[i>=0?"Pembahasan: "+b[3]:"Pilih salah satu jawaban."]}}}}
function frn(code){try{var root=fparse(code),t=root,c=0;if(t.n==="MaterialApp"&&t.o.home&&t.o.home.n)t=t.o.home;walk(root,function(){c++});return{t:t,root:root,out:["Widget terbaca: "+c+" node"]}}catch(e){return{err:e.message,out:[]}}}
function jrn(code){try{var o=JSON.parse(code);return{o:o,out:[JSON.stringify(o,null,2)]}}catch(e){return{err:"JSON tidak valid: "+e.message,out:[]}}}
function fb1(L,r){var w=pick(r,["Toko Kopi","Warung Zaki","Kasir Mini","Katalog Buku","Menu Harian"],1)[0],cs=pick(r,["blue","green","orange","purple","teal","red"],2),tx=pick(r,["Halo, selamat datang","Pesanan masih kosong","Belum ada data","Tekan tombol untuk mulai"],1)[0],
 body=L>=5?"Column(mainAxisAlignment: MainAxisAlignment.center, children: [Text('"+tx+"'), SizedBox(height: 16), ElevatedButton(onPressed: () {}, child: Text('Mulai'))])":"Center(child: Text('"+tx+"'))",
 sc="Scaffold("+(L>=6?"backgroundColor: Colors."+cs[1]+".shade100, ":"")+"appBar: AppBar(title: Text('"+w+"'), backgroundColor: Colors."+cs[0]+"), body: "+body+(L>=4?", floatingActionButton: FloatingActionButton(onPressed: () {}, child: Icon(Icons.add))":"")+")",
 sol="MaterialApp(title: '"+w+"', debugShowCheckedModeBanner: false"+(L>=6?", theme: ThemeData(primarySwatch: Colors."+cs[0]+")":"")+", home: "+sc+")",
 R=function(f){return function(c,x){return!x.err&&!!f(x.root)}},hm=function(t){return t.o.home||{o:{}}},
 c=[["MaterialApp dengan title '"+w+"'",R(function(t){return t.n==="MaterialApp"&&t.o.title&&t.o.title.s===w})],
  ["debugShowCheckedModeBanner: false",R(function(t){var d=t.o.debugShowCheckedModeBanner;return d&&d.id==="false"})],
  ["home: Scaffold dengan AppBar berjudul '"+w+"' berwarna "+cs[0],R(function(t){var h=hm(t);return h.n==="Scaffold"&&anyn(h,"AppBar",function(a){var b=a.o.backgroundColor;return txs(a).indexOf(w)>-1&&b&&b.id==="Colors."+cs[0]})})],
  ["Teks '"+tx+"' tampil di body",R(function(t){return txs(hm(t).o.body||{}).indexOf(tx)>-1})]];
 if(L>=4)c.push(["floatingActionButton berisi Icon Icons.add",R(function(t){var f=hm(t).o.floatingActionButton;return f&&f.n==="FloatingActionButton"&&anyn(f,"Icon",function(i){return i.p[0]&&i.p[0].id==="Icons.add"})})]);
 if(L>=5)c.push(["Body Column: mainAxisAlignment center, SizedBox tinggi 16, ElevatedButton 'Mulai'",R(function(t){var b=hm(t).o.body,m=b&&b.o&&b.o.mainAxisAlignment;return b&&b.n==="Column"&&m&&/center$/.test(m.id)&&anyn(b,"SizedBox",function(s){return nu(s.o.height)===16})&&anyn(b,"ElevatedButton",function(e){return txs(e).indexOf("Mulai")>-1})})]);
 if(L>=6)c.push(["theme ThemeData(primarySwatch: Colors."+cs[0]+") dan Scaffold backgroundColor Colors."+cs[1]+".shade100",R(function(t){var th=t.o.theme,ps=th&&th.o&&th.o.primarySwatch,bg=hm(t).o.backgroundColor;return ps&&ps.id==="Colors."+cs[0]&&bg&&bg.id==="Colors."+cs[1]+".shade100"})]);
 var f=["MaterialApp: title '"+w+"', debugShowCheckedModeBanner false","home: Scaffold dengan AppBar '"+w+"' (backgroundColor <code class='k'>Colors."+cs[0]+"</code>)","body: "+(L>=5?"Column di tengah (<code class='k'>mainAxisAlignment: MainAxisAlignment.center</code>) berisi teks '"+tx+"', <code class='k'>SizedBox(height: 16)</code>, dan <code class='k'>ElevatedButton</code> bertulis 'Mulai'":"Center berisi teks '"+tx+"'")];
 if(L>=4)f.push("<code class='k'>floatingActionButton: FloatingActionButton</code> berisi <code class='k'>Icon(Icons.add)</code>");
 if(L>=6)f.push("<code class='k'>theme: ThemeData(primarySwatch: Colors."+cs[0]+")</code> dan <code class='k'>backgroundColor: Colors."+cs[1]+".shade100</code> pada Scaffold");
 return{s:"<b>Rangkai satu aplikasi utuh</b> sesuai spesifikasi:<br>• "+f.join("<br>• ")+"<br><span class='note'>Tulis satu ekspresi MaterialApp(...). Preview tampil di samping.</span>",c:c,h:"Susun dari luar: MaterialApp, lalu home: Scaffold, lalu appBar dan body.",sol:sol,rn:frn}}
function fb2(L,r){var N=3+Math.floor(r()*6),it=pick(r,["Kucing","Produk","Siswa","Tugas","Buku"],1)[0],ic=pick(r,["star","favorite","home"],2),
 item=L===2?"ListTile(title: Text('"+it+" ${index + 1}'))":L===3?"ListTile(leading: Icon(Icons."+ic[0]+"), title: Text('"+it+" ${index + 1}'), subtitle: Text('Urutan ke-$index'))":"Card(child: ListTile(leading: Icon(Icons."+ic[0]+"), title: Text('"+it+" ${index + 1}'), trailing: Icon(Icons."+ic[1]+")))",
 lvb="ListView.builder(itemCount: "+N+", itemBuilder: (context, index) { return "+item+"; })",
 sol=L>=5?"Scaffold(appBar: AppBar(title: Text('Daftar "+it+"')), body: "+lvb+")":lvb,
 R=function(f){return function(c,x){return!x.err&&!!f(x.t)}},
 bl=function(t){var b=null;walk(t,function(n){if(n.n==="ListView.builder")b=n});return b},
 c=[["ListView.builder dengan itemCount: "+N,R(function(t){var b=bl(t);return b&&nu(b.o.itemCount)===N})],
  ["itemBuilder mengembalikan "+(L>=4?"Card berisi ListTile":"ListTile"),R(function(t){var b=bl(t),l=b&&b.o.itemBuilder&&b.o.itemBuilder.lam;return l&&(L>=4?l.n==="Card"&&cnt2(l,"ListTile")>0:l.n==="ListTile")})],
  ["Judul item memakai index, mis. '"+it+" ${index + 1}'",function(code){return/\$\{\s*index\s*\+\s*1\s*\}/.test(code)}]];
 if(L===3)c.push(["leading Icons."+ic[0]+" dan subtitle memakai $index",function(code,x){return!x.err&&anyn(x.t,"ListTile",function(l){var ld=l.o.leading;return ld&&ld.p[0]&&ld.p[0].id==="Icons."+ic[0]&&!!l.o.subtitle})&&/\$index/.test(code)}]);
 if(L>=4)c.push(["leading Icons."+ic[0]+" dan trailing Icons."+ic[1],R(function(t){return anyn(t,"ListTile",function(l){var a=l.o.leading,b=l.o.trailing;return a&&a.p[0]&&a.p[0].id==="Icons."+ic[0]&&b&&b.p[0]&&b.p[0].id==="Icons."+ic[1]})})]);
 if(L>=5)c.push(["Scaffold dengan AppBar berjudul 'Daftar "+it+"'",R(function(t){return t.n==="Scaffold"&&txs(t.o.appBar||{}).indexOf("Daftar "+it)>-1})]);
 return{s:"<b>Dinamis UI.</b> Tampilkan "+N+" data dengan <code class='k'>ListView.builder</code> (<code class='k'>itemCount: "+N+"</code>). Tiap item: "+(L===2?"<code class='k'>ListTile</code> dengan title <b>'"+it+" ${index + 1}'</b> (interpolasi <code class='k'>index</code>).":L===3?"<code class='k'>ListTile</code> dengan leading <code class='k'>Icon(Icons."+ic[0]+")</code>, title <b>'"+it+" ${index + 1}'</b>, subtitle <b>'Urutan ke-$index'</b>.":"<code class='k'>Card</code> berisi <code class='k'>ListTile</code>: leading <code class='k'>Icon(Icons."+ic[0]+")</code>, title <b>'"+it+" ${index + 1}'</b>, trailing <code class='k'>Icon(Icons."+ic[1]+")</code>."+(L>=5?" Bungkus dengan <code class='k'>Scaffold</code> + <code class='k'>AppBar</code> berjudul <b>'Daftar "+it+"'</b>.":""))+"<br><span class='note'>Tulis <code class='k'>itemBuilder: (context, index) { return ...; }</code>. Preview merender "+N+" item.</span>",c:c,h:"itemCount menentukan jumlah item, dan index dimulai dari 0.",sol:sol,rn:frn}}
function ep(set,byL){return function(L,r,q){var H=pick(r,["localhost","127.0.0.1","192.168.1.10","192.168.0.5"],1)[0]+":"+pick(r,["8080","3000","8000"],1)[0],id=pick(r,["A1B2C3","04F9E2","7D31AA","CARD01","9C8B7E"],1)[0]+(10+Math.floor(r()*89)),sv=r()<.5?0:1,
 E={cards:["GET","/cards","membaca semua kartu yang sudah masuk dari RFID"],input:["POST","/card/input/"+id,"menyimpan kartu dengan id <b>"+id+"</b> ke database"],del:["DELETE","/card/delete/"+id,"menghapus kartu dengan id <b>"+id+"</b> dari database"],init:["POST","/servo/init-proj","menginisialisasi data servo (id = 1, status = 0)"],stat:["GET","/servo/status","membaca status servo saat ini"],upd:["PUT","/servo/update/"+sv,"mengubah status servo menjadi <b>"+sv+"</b>"]},
 n=(!byL&&L>=4)?3:1,es=[];for(var z=0;z<n;z++)es.push(E[set[byL?(L-2)%set.length:(q+L+z*2)%set.length]]);
 var ln=es.map(function(x){return x[0]+" http://"+H+x[1]}),ds=es.map(function(x,i){return n>1?(i+1)+") "+x[2]:x[2]});
 return{s:"Server Gin berjalan di <code class='k'>http://"+H+"</code>. "+(n>1?"Tulis "+n+" raw HTTP request <b>berurutan</b> (satu per baris, format <code class='k'>METHOD URL</code>) untuk: ":"Tulis raw HTTP request (satu baris, format <code class='k'>METHOD URL</code>) untuk ")+ds.join("; ")+".",
  c:ln.map(function(l,i){return["Baris "+(i+1)+": "+l,function(code){var a=code.split("\n").map(function(s){return s.trim()}).filter(Boolean);return a[i]===l&&a.length===ln.length}]}),h:"Method dan path sesuai daftar endpoint di modul. Parameter :id atau :srv_status diganti nilai nyata. Urutan baris mengikuti urutan langkah.",sol:ln.join("\n"),
  rn:function(code){return{out:code.split("\n").filter(function(s){return s.trim()}).map(function(s,i){return"Request "+(i+1)+" : "+s.trim()})}}}}}
function jb(L,r,q){var k=2+(q%3),rows=[],i,sh=L-2,nm=pick(r,["Kebun","Gudang","Kelas"],1)[0],E,d;
 for(i=1;i<=k;i++)rows.push({id:i,suhu:20+Math.floor(r()*15),lembab:40+Math.floor(r()*40)});
 var nest=function(x){return{id:x.id,sensor:{suhu:x.suhu,lembab:x.lembab}}},lst=function(f){return rows.map(function(x){return x[f]})},
  T=["array of object","array with nested object","object with array","object berisi array of nested object"];
 E=sh===0?rows:sh===1?rows.map(nest):sh===2?{nama:nm,suhu:lst("suhu"),lembab:lst("lembab")}:{nama:nm,data:rows.map(nest)};
 d=sh<2?"setiap elemen berbentuk "+(sh?"{id, sensor: {suhu, lembab}}":"{id, suhu, lembab}"):sh===2?"objek {nama: '"+nm+"', suhu: [..], lembab: [..]}":"objek {nama: '"+nm+"', data: [{id, sensor: {suhu, lembab}}]}";
 return{s:"<b>Format JSON: "+T[sh]+".</b> Tulis JSON untuk "+k+" pembacaan sensor ("+d+"): "+rows.map(function(x){return"id "+x.id+" suhu "+x.suhu+" lembab "+x.lembab}).join("; ")+".",
  c:[["JSON valid",function(c,x){return!x.err&&x.o!==undefined}],["Bentuk "+T[sh]+" ("+(sh<2?"array":"object")+" di level atas)",function(c,x){return!x.err&&(sh<2?Array.isArray(x.o):x.o&&!Array.isArray(x.o))}],["Isi data persis sesuai soal",function(c,x){return!x.err&&deq(x.o,E)}]],
  h:"Perhatikan bentuk level atas: [ ] untuk array, { } untuk object.",sol:JSON.stringify(E,null,2),rn:jrn}}
var B1=[[["Properti MaterialApp yang menetapkan halaman pertama saat aplikasi dijalankan?",["home","title","theme","routes"],0,"home mengatur navigasi saat aplikasi berjalan sekaligus menetapkan halaman pertama yang tampil."],
 ["Apa fungsi debugShowCheckedModeBanner?",["Mengatur banner debug di pojok kanan atas (nilai boolean)","Mengatur judul aplikasi","Mengatur warna tema aplikasi","Menentukan halaman pertama"],0,"Properti ini menerima true atau false untuk menampilkan atau menyembunyikan banner debug."],
 ["Package apa yang di-import agar MaterialApp() bisa dipakai?",["package:flutter/material.dart","dart:io","package:http/http.dart","dart:math"],0,"MaterialApp() memerlukan import package:flutter/material.dart."]],
 [["Apa perbedaan utama StatelessWidget dan StatefulWidget?",["Stateful bisa menangani perubahan tampilan, Stateless hanya fokus pada tampilan","Stateless bisa berubah tampilan, Stateful tidak","Keduanya sama persis","Stateful hanya untuk halaman login"],0,"Stateless tidak dapat menangani perubahan tampilan, sedangkan Stateful dapat."],
 ["StatefulWidget dibuat dengan dua class. Apa saja?",["Widget dan State","Scaffold dan AppBar","Model dan Controller","Provider dan Consumer"],0,"Menurut modul, StatefulWidget memakai 2 class berbeda, yaitu widget dan state."]]];
var B2=[[["Properti tambahan ListView.builder dibanding ListView() adalah...",["itemCount","children","appBar","home"],0,"itemCount merender konten sesuai banyaknya nilai yang diinput."],
 ["Pada ListView.builder dengan itemCount sesuai panjang data, jika data bertambah maka...",["Widget di dalam list terbentuk otomatis sesuai jumlah data","Aplikasi harus ditulis ulang","List berhenti bisa digulir","Tema berubah ke dark mode"],0,"UI dibuat dinamis berdasarkan data yang tersedia."],
 ["Pada Bab 1 isi ListView ditulis manual. Pada Bab 2 isinya...",["Dibentuk otomatis dari data dummy","Tetap ditulis manual","Diambil dari Firebase","Tidak ada isinya"],0,"Bab 2 membentuk widget di dalam ListView secara otomatis dari data yang tersedia."]]];
var B3=[[["Authentication adalah...",["Proses memvalidasi identitas pengguna sebelum memakai layanan","Proses mempercepat aplikasi","Proses mengubah tema aplikasi","Proses mengompres data"],0,"Authentication memverifikasi identitas sebelum pengguna boleh memakai layanan aplikasi atau sistem."],
 ["Jika id atau password yang diinput tidak sesuai, apa yang terjadi?",["Sistem menolak dan mengarahkan kembali ke halaman login","Pengguna tetap masuk","Akun dihapus","Password diganti otomatis"],0,"Sesuai alur pada modul, pengguna ditolak dan dikembalikan ke halaman login."],
 ["Platform pihak ke-3 untuk authentication pada praktikum Bab 3?",["Firebase","Thingspeak","PostgreSQL","Postman"],0,"Praktikum Bab 3 memakai Firebase."],
 ["Mana yang BUKAN metode authentication yang disebut modul?",["Hot reload","Token-based","Biometric-based","Authentication dengan OTP"],0,"Hot reload adalah fitur pengembangan, bukan metode authentication."]],
 [["Mana yang BUKAN package state management Flutter yang disebut modul?",["Gin","bloc","getX","riverpod"],0,"Gin adalah framework Go untuk backend, bukan state management Flutter."],
 ["Apa yang dimaksud prop drilling?",["State diturunkan manual lewat constructor dari widget induk ke anak","Menghapus widget yang tidak dipakai","Menggabungkan dua class widget","Memperbesar ukuran widget"],0,"Tanpa provider, state diteruskan manual lewat constructor atau parameter, level demi level."],
 ["Keuntungan utama Provider menurut modul?",["Business logic terpisah dari UI dan state terpusat, widget bisa mendengar (listen) tanpa lewat induk","UI otomatis menjadi dark mode","Aplikasi tidak butuh internet","Kode tidak perlu class"],0,"Provider memisahkan business logic dari UI dan mengelola state secara terpusat."]]];
var B4=[[["Dalam analogi restoran, API berperan sebagai...",["Waiter / pelayan","Customer / pelanggan","Chef","Daftar menu saja"],0,"API = waiter, front end = customer, back end = chef."],
 ["Dalam analogi tersebut, back end diibaratkan sebagai...",["Chef","Waiter","Customer","Kasir"],0,"Back end memproses permintaan seperti chef memasak pesanan."],
 ["API menjadi jembatan antara...",["Front end dan back end","Dua monitor","Dua database tanpa server","Android dan iOS"],0,"API menghubungkan front end dan back end dalam pengembangan aplikasi."],
 ["Developer tidak perlu tahu cara server menyiapkan data. Yang penting adalah...",["Data yang diminta berhasil didapat","Server memakai bahasa tertentu","Server berada di jaringan lokal","Server memakai database tertentu"],0,"Seperti pelanggan di restoran, yang penting data (pesanan) sampai ke pemesan."]]];
var B5=[[["Apa itu encode pada JSON?",["Mengubah object dari bahasa pemrograman menjadi format JSON","Mengubah JSON menjadi object","Menghapus data JSON","Menyalin JSON ke file"],0,"Encode: object menjadi JSON, misalnya saat mengirim data."],
 ["Apa itu decode pada JSON?",["Mengubah JSON menjadi object yang dimengerti bahasa pemrograman","Mengubah object menjadi JSON","Mengenkripsi JSON","Mengompres JSON"],0,"Decode: JSON menjadi object, misalnya saat aplikasi membaca data dari API."],
 ["Tiga format JSON yang dibahas pada Bab 5?",["Array of object, array with nested object, object with array","String, number, boolean","Map, set, queue","GET, POST, PUT"],0,"Modul membahas ketiga format tersebut."]]];
var B6=[[["Framework Go dan database pada Bab 6?",["Gin dan PostgreSQL","Flask dan MySQL","Express dan MongoDB","Laravel dan SQLite"],0,"Backend memakai Go dengan framework Gin dan migrasi ke PostgreSQL."],
 ["Method yang dipakai untuk berkomunikasi dengan RESTful API di modul?",["GET, POST, PUT, DELETE","SEND, RECEIVE","OPEN, CLOSE","READ, WRITE"],0,"Modul menyebut GET, POST, PUT, dan DELETE."],
 ["Pada Bab 6, apa peran server?",["Menyimpan id kartu dari RFID sebagai database dan menjadi penghubung aplikasi Android dengan IoT","Menggerakkan servo langsung","Menampilkan UI Flutter","Mengompilasi kode Dart"],0,"Server menjadi connector sekaligus database untuk nilai id dari RFID."]]];
var B7=[[["Nilai status servo yang dipakai pada Bab 7?",["0 atau 1","1 sampai 100","true atau false","A atau B"],0,"Status servo berisi angka 0 atau 1 untuk pengkondisian."],
 ["Field id pada data servo bernilai...",["1, dan tidak ada id lain yang terbentuk","Acak setiap kali","Sama dengan status servo","Kosong"],0,"Id bernilai 1 dan tidak ada id lain."],
 ["Hardware sisi IoT pada Bab 7?",["ESP32 dan servo","Arduino Uno dan sensor suhu","Raspberry Pi dan kamera","ESP8266 dan LCD"],0,"Bab 7 memakai microcontroller ESP32 dan servo."]]];
var B8=[[["Endpoint Bab 6 untuk membaca kartu?",["GET /cards","POST /cards","PUT /cards","DELETE /cards"],0,"Route /cards dengan metode GET."],
 ["Endpoint untuk mengubah status servo?",["PUT /servo/update/:srv_status","GET /servo/update","POST /servo/status","DELETE /servo/status"],0,"Route /servo/update/:srv_status dengan metode PUT."],
 ["Bab 8 mengonsumsi API yang dibuat pada...",["Bab 6 dan Bab 7","Bab 3 dan Bab 4","Bab 1 saja","Bab 5 saja"],0,"Aplikasi memakai API bab 6 (kartu) dan bab 7 (servo)."]],
 [["POST /servo/init-proj melakukan apa?",["Menginisialisasi id menjadi 1 dan status servo menjadi 0","Membaca status servo","Menghapus semua kartu","Mengubah status menjadi 1"],0,"Sesuai daftar endpoint Bab 7."],
 ["Route untuk menghapus id kartu dari database?",["DELETE /card/delete/:id","POST /card/delete","GET /card/delete/:id","PUT /card/delete/:id"],0,"Route /card/delete/:id dengan metode DELETE."],
 ["Software yang dibutuhkan Bab 8 selain Visual Studio Code dan Postman?",["Arduino IDE","Android Studio saja","PostgreSQL","Docker"],0,"Daftar software Bab 8: Visual Studio Code, Arduino IDE, dan Postman."]]];
function bab(bank,F){return function(L,r,q){return bank[L-1]?mcq(bank[L-1][q],r):F(L,r,q)}}
function P10(a){while(a.length<10)a.push(0);return a}
var GM="Modul MCS (ACSL)",SRC=function(p,n){return"<br><a href='https://mcs.acsl.my.id/docs/"+p+"/' target='_blank' rel='noopener'>Baca modul Bab "+n+" di sumber (mcs.acsl.my.id)</a>"},K=function(s){return"<code class='k'>"+s+"</code>"};
var MCS=[
{n:"Bab 1 · Widget Dasar",bab:1,g:GM,l:"flutter",cn:P10([3,2,3,3,3,3]),f:bab(B1,fb1),m:"<b>Widget dasar Flutter.</b> "+K("MaterialApp()")+" adalah fondasi aplikasi: "+K("title")+", "+K("debugShowCheckedModeBanner")+", "+K("theme")+", "+K("home")+", "+K("routes")+". "+K("Scaffold()")+" membentuk halaman lewat "+K("appBar")+", "+K("body")+", "+K("drawer")+", "+K("floatingActionButton")+", "+K("bottomNavigationBar")+". StatelessWidget hanya fokus pada tampilan, StatefulWidget bisa menangani perubahan (memakai dua class: widget dan state)."+SRC("babone","1")},
{n:"Bab 2 · Dinamis UI",bab:2,g:GM,l:"flutter",cn:P10([3,3,3,3,3]),f:bab(B2,fb2),m:"<b>Dinamis UI.</b> Isi halaman dibentuk otomatis dari data, bukan ditulis manual. "+K("ListView.builder()")+" mirip ListView() tetapi punya "+K("itemCount")+" yang menentukan berapa item dirender. Praktikum membuat aplikasi daftar kucing yang jumlah datanya bisa ditambah atau dikurangi."+SRC("babtwo","2")},
{n:"Bab 3 · Authentication & Provider",bab:3,g:GM,l:"quiz",cn:P10([4,3]),f:bab(B3,null),m:"<b>Authentication</b> memvalidasi identitas pengguna sebelum memakai layanan (praktikum memakai Firebase). Metode yang disebut modul: SFA, 2FA, MFA, token-based, biometric-based, dan OTP. <b>Provider</b> adalah state management yang memisahkan business logic dari UI dan menghindari prop drilling. Alternatif lain: setState, bloc, getX, riverpod."+SRC("babthree","3")},
{n:"Bab 4 · API",bab:4,g:GM,l:"http",cn:P10([4,3,3]),f:bab(B4,function(L,r){return pm(L===2?1:3,r)}),m:"<b>Application Programming Interface.</b> API adalah perantara front end dan back end. Analogi restoran: API = waiter, front end = customer, back end = chef. Developer cukup menerima data tanpa tahu cara server menyiapkannya. Praktikum memanggil data dari API dan menampilkannya di aplikasi."+SRC("babfour","4")},
{n:"Bab 5 · JSON & Thingspeak",bab:5,g:GM,l:"json",cn:P10([3,3,3,3,3]),f:bab(B5,jb),m:"<b>Thingspeak</b> adalah software open source untuk mengumpulkan, memperbarui, dan memantau data lewat API (umum dipakai di proyek IoT). Aplikasi membaca data berformat JSON. <b>Encode</b> = object menjadi JSON, <b>decode</b> = JSON menjadi object. Tiga format: array of object, array with nested object, object with array."+SRC("babfive","5")},
{n:"Bab 6 · Card Bridge (Go)",bab:6,g:GM,l:"http",cn:P10([3,3,3,3]),f:bab(B6,ep(["cards","input","del"],true)),m:"<b>Card Bridge.</b> Backend RESTful API memakai Go dengan framework Gin dan database PostgreSQL. ESP32 + sensor RFID mengirim id kartu ke server, lalu aplikasi Android membacanya. Endpoint: "+K("GET /cards")+", "+K("POST /card/input/:id")+", "+K("DELETE /card/delete/:id")+"."+SRC("babsix","6")},
{n:"Bab 7 · Servo Controller",bab:7,g:GM,l:"http",cn:P10([3,3,3,3]),f:bab(B7,ep(["init","stat","upd"],true)),m:"<b>Servo Controller.</b> RESTful API memantau data di database. Jika data berubah, ESP32 menggerakkan servo. Field id bernilai 1, status servo bernilai 0 atau 1. Endpoint: "+K("POST /servo/init-proj")+", "+K("GET /servo/status")+", "+K("PUT /servo/update/:srv_status")+"."+SRC("babseven","7")},
{n:"Bab 8 · Card Reader & Servo",bab:8,g:GM,l:"http",cn:P10([3,3,3,3]),f:bab(B8,ep(["cards","input","del","init","stat","upd"],false)),m:"<b>Card Reader &amp; Servo Controller.</b> Aplikasi mengonsumsi API Bab 6 (kartu RFID) dan Bab 7 (servo) untuk mengontrol servo dan melihat id kartu yang masuk. Software: Visual Studio Code, Arduino IDE, Postman. Praktik di sini: menulis request ke keenam endpoint."+SRC("babeight","8")}
];
var D=function(k){return function(L,r){return scalar(k,L,r,false)}},GG=function(k){return function(L,r){return scalar(k,L,r,true)}};
var TP=[
{n:"String",g:"Dart",l:"dart",f:D("String"),m:"Tipe paling umum, membaca nilai sebagai kalimat. Ditandai keyword <code class='k'>String</code> atau nilai di dalam tanda petik."},
{n:"Integer",g:"Dart",l:"dart",f:D("int"),m:"Bilangan bulat (1, 3, 10, -30). Ditandai keyword <code class='k'>int</code>."},
{n:"Double",g:"Dart",l:"dart",f:D("double"),m:"Bilangan desimal (3.14, 5.7). Ditandai keyword <code class='k'>double</code>."},
{n:"Number",g:"Dart",l:"dart",f:D("num"),m:"Gabungan int dan double. Ditandai keyword <code class='k'>num</code>."},
{n:"Boolean",g:"Dart",l:"dart",f:D("bool"),m:"Hanya <code class='k'>true</code> atau <code class='k'>false</code>. Ditandai keyword <code class='k'>bool</code>."},
{n:"Dynamic",g:"Dart",l:"dart",f:dyn,m:"Tipe fleksibel yang jenisnya mengikuti nilai yang diterima. Ditandai keyword <code class='k'>dynamic</code>."},
{n:"List",g:"Dart",l:"dart",f:lst,m:"Menampung banyak data dalam kurung siku <code class='k'>[…]</code>. Diakses lewat indeks mulai dari 0."},
{n:"Map",g:"Dart",l:"dart",f:mp,m:"Menyimpan data format <code class='k'>key: value</code> dalam kurung kurawal. Diakses lewat key."},
{n:"Flutter UI",g:"Dart",l:"flutter",f:flt,m:"Bangun tampilan dari komponen kecil sampai layout dashboard. Tulis widget sebagai <b>satu ekspresi</b> Dart (tanpa class), hasilnya langsung tampil di preview. Widget yang didukung: Text, Icon, Container, Padding, Center, SizedBox, Row, Column, Expanded, Card, ListTile, ListView, ElevatedButton, TextButton, AppBar, Scaffold, FloatingActionButton, MaterialApp, ListView.builder."},
{n:"Golang",g:"Backend & tools",l:"go",f:function(L,r){return scalar(["String","int","double","bool"][Math.floor(r()*4)],L,r,true)},m:"Tipe dasar Go: <code class='k'>string</code>, <code class='k'>int</code>, <code class='k'>float64</code>, <code class='k'>bool</code>. Deklarasi dengan <code class='k'>var nama tipe = nilai</code> atau singkat <code class='k'>nama := nilai</code>. Cetak dengan <code class='k'>fmt.Println()</code>."},
{n:"Firebase",g:"Backend & tools",l:"json",f:fire,m:"Realtime Database menyimpan data sebagai pohon JSON: node berisi anak dengan key unik. Nilai bisa string, angka, boolean, array, atau objek bersarang."},
{n:"Postman",g:"Backend & tools",l:"http",f:pm,m:"Klien HTTP untuk menguji API. Method: GET (baca), POST (buat), PUT/PATCH (ubah), DELETE (hapus). Request terdiri dari URL, header, dan body JSON."}
].concat(MCS);
var ST={dart:"void main() {\n  \n}",go:"package main\n\nimport \"fmt\"\n\nfunc main() {\n  \n}",json:"{\n  \n}",http:"METHOD URL\nHeader: nilai\n\n{ }",flutter:"// tulis widget sebagai satu ekspresi\n",quiz:""};
var done={},codes={},tp=0,lv=1,qi=0,cache={};
function key(t,l,q){return t+"-"+l+"-"+q}
function spec(){var k=key(tp,lv,qi);if(!cache[k]){var T=TP[tp],sn={},ss={},L,q,a,sp;
 for(L=1;L<=10;L++)for(q=0;q<CN(tp)[L-1];q++){for(a=0;a<80;a++){sp=T.f(L,rng(T.n+L+"/"+q+(a?"/"+a:"")),q);if(!sn[sp.sol]&&!ss[sp.s])break}sn[sp.sol]=1;ss[sp.s]=1;cache[key(tp,L,q)]=sp}}
 return cache[k]}
function cnt(t,l){var n=0,i;for(i=0;i<CN(t)[l-1];i++)if(done[key(t,l,i)])n++;return n}
function tcnt(t){var n=0,l;for(l=1;l<=10;l++)n+=cnt(t,l);return n}
function CN(t){return TP[t].cn||CNT0}
function tot(t){return CN(t).reduce(function(a,b){return a+b},0)}
var TOT=TP.reduce(function(a,t,i){return a+tot(i)},0);
function nav(){var n=document.getElementById("nav"),g="";n.innerHTML="";
 TP.forEach(function(t,i){if(t.g!==g){g=t.g;var s=document.createElement("small");s.textContent=g;n.appendChild(s)}
  var b=document.createElement("button");b.className=i===tp?"on":"";b.innerHTML="<span>"+t.n+"</span><span class='c'>"+tcnt(i)+"/"+tot(i)+"</span>";
  b.onclick=function(){tp=i;lv=1;qi=0;draw()};n.appendChild(b)});
 var d=Object.keys(done).length;document.getElementById("pt").textContent=d+" / "+TOT+" soal selesai";document.getElementById("pb").style.width=(d/TOT*100)+"%"}
function draw(){var T=TP[tp],q=spec(),m=document.getElementById("main"),k=key(tp,lv,qi),i,h="";nav();
 if(codes[k]==null)codes[k]=ST[T.l];
 h+="<h2>"+T.n+"</h2><p>"+T.m+"</p><div class='lv' role='group' aria-label='Level'>";
 for(i=1;i<=10;i++)if(CN(tp)[i-1])h+="<button data-l='"+i+"' class='"+(i===lv?"on ":"")+(cnt(tp,i)===CN(tp)[i-1]?"ok":"")+"'>Level "+i+" ("+cnt(tp,i)+"/"+CN(tp)[i-1]+")</button>";
 h+="</div><div class='qs' role='group' aria-label='Nomor soal'>";
 for(i=0;i<CN(tp)[lv-1];i++)h+="<button data-q='"+i+"' class='"+(i===qi?"on ":"")+(done[key(tp,lv,i)]?"ok":"")+"'>"+(i+1)+"</button>";
 h+="</div><div class='story'><b>Level "+lv+", soal "+(qi+1)+".</b> "+q.s+"</div>"+
 (q.opts?"<div class='mc' role='radiogroup' aria-label='Pilihan jawaban'>"+q.opts.map(function(o,i){return"<label><input type='radio' name='o' value='"+i+"'> "+o.replace(/</g,"&lt;")+"</label>"}).join("")+"</div><div class='out' id='out'><span class='l'>Pembahasan muncul setelah kamu memeriksa jawaban.</span></div>":(T.l==="flutter"?"<div class='split'><div>":"")+"<textarea id='ed' spellcheck='false' aria-label='Editor kode'></textarea><div class='out' id='out'><span class='l'>Output akan muncul di sini.</span></div>"+(T.l==="flutter"?"</div><div class='phone' id='pv' aria-label='Preview'></div></div>":""))+
 "<div class='row'><button class='btn' id='go'>Jalankan &amp; periksa</button><button class='btn g' id='rs'>Reset</button><button class='btn g' id='nx'>Soal berikutnya</button>"+
 (T.l==="dart"?"<a class='btn g' target='_blank' rel='noopener' href='https://dartpad.dev'>Coba di DartPad</a>":T.l==="go"?"<a class='btn g' target='_blank' rel='noopener' href='https://go.dev/play/'>Coba di Go Playground</a>":"")+
 "</div><ul class='chk' id='chk'></ul><div class='msg' id='msg'></div>"+
 "<details><summary>Petunjuk</summary><p>"+q.h.replace(/</g,"&lt;")+"</p></details><details><summary>Lihat contoh jawaban</summary><pre>"+q.sol.replace(/&/g,"&amp;").replace(/</g,"&lt;")+"</pre></details>"+
 (T.l==="dart"||T.l==="go"?"<p class='note'>Simulator sederhana (variabel, print, interpolasi). Format angka asli bisa beda, misalnya Dart mencetak 35000.0 untuk double.</p>":"");
 m.innerHTML=h;var ed=document.getElementById("ed")||{};ed.value=codes[k];
 ed.oninput=function(){codes[k]=ed.value;if(T.l==="flutter")pv()};if(T.l==="flutter")pv();
 ed.onkeydown=function(e){if(e.key==="Tab"){e.preventDefault();var s=ed.selectionStart;ed.value=ed.value.slice(0,s)+"  "+ed.value.slice(ed.selectionEnd);ed.selectionStart=ed.selectionEnd=s+2;codes[k]=ed.value}};
 m.querySelectorAll("[data-l]").forEach(function(b){b.onclick=function(){lv=+b.dataset.l;qi=0;draw()}});
 m.querySelectorAll("[data-q]").forEach(function(b){b.onclick=function(){qi=+b.dataset.q;draw()}});
 document.getElementById("rs").onclick=function(){codes[k]=ST[T.l];draw()};
 document.getElementById("nx").onclick=function(){if(qi<CN(tp)[lv-1]-1)qi++;else{var z=lv+1;while(z<=10&&!CN(tp)[z-1])z++;if(z<=10){lv=z;qi=0}}draw()};
 document.getElementById("go").onclick=check}
function check(){var T=TP[tp],q=spec(),code=q.opts?((document.querySelector("input[name=o]:checked")||{}).value||""):document.getElementById("ed").value,r=q.rn?q.rn(code):run(code,!!q.go),all=true,h="",o=document.getElementById("out");
 o.innerHTML=r.err?"<span style='color:var(--bad)'>Error: "+r.err.replace(/</g,"&lt;")+"</span>":(r.out.length?r.out.map(function(l){return(q.rn?"":"<span class='l'>&gt; </span>")+l.replace(/</g,"&lt;")}).join("\n"):"<span class='l'>(tidak ada output, tambahkan print)</span>");
 q.c.forEach(function(x){var ok=false;try{ok=!!x[1](code,r)}catch(e){}if(!ok)all=false;h+="<li><span class='"+(ok?"y":"n")+"'>"+(ok?"✓":"✗")+"</span> "+x[0].replace(/</g,"&lt;")+"</li>"});
 document.getElementById("chk").innerHTML=h;var m=document.getElementById("msg");
 if(all){done[key(tp,lv,qi)]=true;m.style.color="var(--ok)";m.textContent="Benar! Soal ini selesai."}
 else{m.style.color="var(--bad)";m.textContent="Belum sesuai. Perbaiki poin yang bertanda ✗."}
 nav();document.querySelectorAll("[data-q]")[qi].classList.toggle("ok",all||!!done[key(tp,lv,qi)]);
 var lb=document.querySelector("[data-l='"+lv+"']");lb.textContent="Level "+lv+" ("+cnt(tp,lv)+"/"+CN(tp)[lv-1]+")";lb.classList.toggle("ok",cnt(tp,lv)===CN(tp)[lv-1])}
var SN=["MaterialApp(\n  title: 'MCS',\n  debugShowCheckedModeBanner: false,\n  home: Scaffold(...),\n)","ListView.builder(\n  itemCount: 5,\n  itemBuilder: (context, index) {\n    return ListTile(...);\n  },\n)","GET /cards\n\n// membaca kartu RFID yang masuk","PUT /servo/update/1\n\n// status servo: 0 atau 1"];
function openApp(i){if(i!=null){tp=i;lv=1;qi=0}document.getElementById("intro").classList.add("off");document.getElementById("app").hidden=false;draw();window.scrollTo(0,0)}
function introInit(){var el=document.getElementById("tw"),si=0,ci=0,rm=document.getElementById("rm");
 TP.forEach(function(t,i){if(!t.bab)return;var b=document.createElement("button");b.className="rn";b.type="button";b.style.animationDelay=(.25+t.bab*.12)+"s";b.innerHTML="<i>"+t.bab+"</i>"+t.n.replace(/^Bab \d · /,"");b.onclick=function(){openApp(i)};rm.appendChild(b)});
 document.getElementById("st").innerHTML="<span><b>"+TP.length+"</b>sub-bab</span><span><b>10</b>level</span><span><b>"+TOT+"</b>soal</span>";
 document.getElementById("start").onclick=function(){openApp(0)};
 document.getElementById("home").onclick=function(){document.getElementById("intro").classList.remove("off");document.getElementById("app").hidden=true};
 if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches){el.textContent=SN[0];return}
 (function t(){var s=SN[si];el.textContent=s.slice(0,ci);if(ci<s.length){ci++;setTimeout(t,36)}else setTimeout(function(){ci=0;si=(si+1)%SN.length;t()},1800)})()}
draw();
introInit();

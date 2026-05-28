import{Q as S,T as R,b3 as J,g as K,s as Y,a as tt,b as et,t as rt,q as at,_ as u,l as W,c as it,H as nt,L as ot,a4 as st,e as lt,A as ct,I as pt}from"./m5wn-8Qa.js";import{p as ut}from"./DOf6-ZWA.js";import{p as dt}from"./DJ9yc-AN.js";import{d as P}from"./Brbj3JEj.js";import{o as gt}from"./CmKTTxBW.js";import"./Bj8b6L22.js";import"./BmoFcw8Y.js";import"./B5bMZ3cL.js";import"./D1CiAWah.js";import"./i8hHMFjf.js";import"./DhEqZVGG.js";import"./ChH9gCf4.js";import"./FqRMBMnW.js";import"./DOidW3Co.js";import"./BiJz4hF6.js";import"./CT5UHkhQ.js";import"./Cd0HPBLx.js";import"./5ZlaO9h1.js";import"./HXv1cMEd.js";import"./CPslRd07.js";import"./CwcW9wj6.js";import"./DzCnY6Z3.js";import"./wYwt1McO.js";import"./IH3JTTWd.js";import"./D_2HTvvy.js";import"./zTXtu7QF.js";import"./D1T2bqqs.js";import"./uWNJ_3DK.js";import"./DO0fceEe.js";import"./CowgS77W.js";import"./C3OTAO1T.js";import"./CjsDbM40.js";import"./Gi6I4Gst.js";function mt(t,r){return r<t?-1:r>t?1:r>=t?0:NaN}function ft(t){return t}function ht(){var t=ft,r=mt,m=null,y=S(0),o=S(R),d=S(0);function s(e){var i,l=(e=J(e)).length,g,f,v=0,c=new Array(l),n=new Array(l),x=+y.apply(this,arguments),w=Math.min(R,Math.max(-R,o.apply(this,arguments)-x)),h,D=Math.min(Math.abs(w)/l,d.apply(this,arguments)),$=D*(w<0?-1:1),p;for(i=0;i<l;++i)(p=n[c[i]=i]=+t(e[i],i,e))>0&&(v+=p);for(r!=null?c.sort(function(A,C){return r(n[A],n[C])}):m!=null&&c.sort(function(A,C){return m(e[A],e[C])}),i=0,f=v?(w-l*$)/v:0;i<l;++i,x=h)g=c[i],p=n[g],h=x+(p>0?p*f:0)+$,n[g]={data:e[g],index:i,value:p,startAngle:x,endAngle:h,padAngle:D};return n}return s.value=function(e){return arguments.length?(t=typeof e=="function"?e:S(+e),s):t},s.sortValues=function(e){return arguments.length?(r=e,m=null,s):r},s.sort=function(e){return arguments.length?(m=e,r=null,s):m},s.startAngle=function(e){return arguments.length?(y=typeof e=="function"?e:S(+e),s):y},s.endAngle=function(e){return arguments.length?(o=typeof e=="function"?e:S(+e),s):o},s.padAngle=function(e){return arguments.length?(d=typeof e=="function"?e:S(+e),s):d},s}var vt=pt.pie,z={sections:new Map,showData:!1},T=z.sections,F=z.showData,xt=structuredClone(vt),St=u(()=>structuredClone(xt),"getConfig"),yt=u(()=>{T=new Map,F=z.showData,ct()},"clear"),wt=u(({label:t,value:r})=>{if(r<0)throw new Error(`"${t}" has invalid value: ${r}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);T.has(t)||(T.set(t,r),W.debug(`added new section: ${t}, with value: ${r}`))},"addSection"),At=u(()=>T,"getSections"),Ct=u(t=>{F=t},"setShowData"),Dt=u(()=>F,"getShowData"),_={getConfig:St,clear:yt,setDiagramTitle:at,getDiagramTitle:rt,setAccTitle:et,getAccTitle:tt,setAccDescription:Y,getAccDescription:K,addSection:wt,getSections:At,setShowData:Ct,getShowData:Dt},$t=u((t,r)=>{ut(t,r),r.setShowData(t.showData),t.sections.map(r.addSection)},"populateDb"),Tt={parse:u(async t=>{const r=await dt("pie",t);W.debug(r),$t(r,_)},"parse")},bt=u(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),kt=bt,Et=u(t=>{const r=[...t.values()].reduce((o,d)=>o+d,0),m=[...t.entries()].map(([o,d])=>({label:o,value:d})).filter(o=>o.value/r*100>=1);return ht().value(o=>o.value).sort(null)(m)},"createPieArcs"),Mt=u((t,r,m,y)=>{W.debug(`rendering pie chart
`+t);const o=y.db,d=it(),s=nt(o.getConfig(),d.pie),e=40,i=18,l=4,g=450,f=g,v=ot(r),c=v.append("g");c.attr("transform","translate("+f/2+","+g/2+")");const{themeVariables:n}=d;let[x]=st(n.pieOuterStrokeWidth);x??=2;const w=s.textPosition,h=Math.min(f,g)/2-e,D=P().innerRadius(0).outerRadius(h),$=P().innerRadius(h*w).outerRadius(h*w);c.append("circle").attr("cx",0).attr("cy",0).attr("r",h+x/2).attr("class","pieOuterCircle");const p=o.getSections(),A=Et(p),C=[n.pie1,n.pie2,n.pie3,n.pie4,n.pie5,n.pie6,n.pie7,n.pie8,n.pie9,n.pie10,n.pie11,n.pie12];let b=0;p.forEach(a=>{b+=a});const L=A.filter(a=>(a.data.value/b*100).toFixed(0)!=="0"),k=gt(C).domain([...p.keys()]);c.selectAll("mySlices").data(L).enter().append("path").attr("d",D).attr("fill",a=>k(a.data.label)).attr("class","pieCircle"),c.selectAll("mySlices").data(L).enter().append("text").text(a=>(a.data.value/b*100).toFixed(0)+"%").attr("transform",a=>"translate("+$.centroid(a)+")").style("text-anchor","middle").attr("class","slice");const V=c.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),G=[...p.entries()].map(([a,M])=>({label:a,value:M})),E=c.selectAll(".legend").data(G).enter().append("g").attr("class","legend").attr("transform",(a,M)=>{const O=i+l,Q=O*G.length/2,X=12*i,Z=M*O-Q;return"translate("+X+","+Z+")"});E.append("rect").attr("width",i).attr("height",i).style("fill",a=>k(a.label)).style("stroke",a=>k(a.label)),E.append("text").attr("x",i+l).attr("y",i-l).text(a=>o.getShowData()?`${a.label} [${a.value}]`:a.label);const U=Math.max(...E.selectAll("text").nodes().map(a=>a?.getBoundingClientRect().width??0)),j=f+e+i+l+U,N=V.node()?.getBoundingClientRect().width??0,q=f/2-N/2,H=f/2+N/2,B=Math.min(0,q),I=Math.max(j,H)-B;v.attr("viewBox",`${B} 0 ${I} ${g}`),lt(v,g,I,s.useMaxWidth)},"draw"),Rt={draw:Mt},de={parser:Tt,db:_,renderer:Rt,styles:kt};export{de as diagram};

import{_ as f,H as u,L as B,e as C,l as w,b as S,a as D,q as T,t as F,g as P,s as z,F as A,I as E,A as W}from"./m5wn-8Qa.js";import{p as _}from"./DOf6-ZWA.js";import{p as L}from"./DJ9yc-AN.js";import"./Bj8b6L22.js";import"./BmoFcw8Y.js";import"./B5bMZ3cL.js";import"./D1CiAWah.js";import"./i8hHMFjf.js";import"./DhEqZVGG.js";import"./ChH9gCf4.js";import"./FqRMBMnW.js";import"./DOidW3Co.js";import"./BiJz4hF6.js";import"./CT5UHkhQ.js";import"./Cd0HPBLx.js";import"./5ZlaO9h1.js";import"./HXv1cMEd.js";import"./CPslRd07.js";import"./CwcW9wj6.js";import"./DzCnY6Z3.js";import"./wYwt1McO.js";import"./IH3JTTWd.js";import"./D_2HTvvy.js";import"./zTXtu7QF.js";import"./D1T2bqqs.js";import"./uWNJ_3DK.js";import"./DO0fceEe.js";import"./CowgS77W.js";import"./C3OTAO1T.js";import"./CjsDbM40.js";var N=E.packet,b,v=(b=class{constructor(){this.packet=[],this.setAccTitle=S,this.getAccTitle=D,this.setDiagramTitle=T,this.getDiagramTitle=F,this.getAccDescription=P,this.setAccDescription=z}getConfig(){const t=u({...N,...A().packet});return t.showBits&&(t.paddingY+=10),t}getPacket(){return this.packet}pushWord(t){t.length>0&&this.packet.push(t)}clear(){W(),this.packet=[]}},f(b,"PacketDB"),b),I=1e4,M=f((e,t)=>{_(e,t);let a=-1,o=[],n=1;const{bitsPerRow:l}=t.getConfig();for(let{start:r,end:s,bits:p,label:c}of e.blocks){if(r!==void 0&&s!==void 0&&s<r)throw new Error(`Packet block ${r} - ${s} is invalid. End must be greater than start.`);if(r??=a+1,r!==a+1)throw new Error(`Packet block ${r} - ${s??r} is not contiguous. It should start from ${a+1}.`);if(p===0)throw new Error(`Packet block ${r} is invalid. Cannot have a zero bit field.`);for(s??=r+(p??1)-1,p??=s-r+1,a=s,w.debug(`Packet block ${r} - ${a} with label ${c}`);o.length<=l+1&&t.getPacket().length<I;){const[d,i]=Y({start:r,end:s,bits:p,label:c},n,l);if(o.push(d),d.end+1===n*l&&(t.pushWord(o),o=[],n++),!i)break;({start:r,end:s,bits:p,label:c}=i)}}t.pushWord(o)},"populate"),Y=f((e,t,a)=>{if(e.start===void 0)throw new Error("start should have been set during first phase");if(e.end===void 0)throw new Error("end should have been set during first phase");if(e.start>e.end)throw new Error(`Block start ${e.start} is greater than block end ${e.end}.`);if(e.end+1<=t*a)return[e,void 0];const o=t*a-1,n=t*a;return[{start:e.start,end:o,label:e.label,bits:o-e.start},{start:n,end:e.end,label:e.label,bits:e.end-n}]},"getNextFittingBlock"),x={parser:{yy:void 0},parse:f(async e=>{const t=await L("packet",e),a=x.parser?.yy;if(!(a instanceof v))throw new Error("parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");w.debug(t),M(t,a)},"parse")},H=f((e,t,a,o)=>{const n=o.db,l=n.getConfig(),{rowHeight:r,paddingY:s,bitWidth:p,bitsPerRow:c}=l,d=n.getPacket(),i=n.getDiagramTitle(),g=r+s,m=g*(d.length+1)-(i?0:r),h=p*c+2,k=B(t);k.attr("viewBox",`0 0 ${h} ${m}`),C(k,m,h,l.useMaxWidth);for(const[y,$]of d.entries())O(k,$,y,l);k.append("text").text(i).attr("x",h/2).attr("y",m-g/2).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("class","packetTitle")},"draw"),O=f((e,t,a,{rowHeight:o,paddingX:n,paddingY:l,bitWidth:r,bitsPerRow:s,showBits:p})=>{const c=e.append("g"),d=a*(o+l)+l;for(const i of t){const g=i.start%s*r+1,m=(i.end-i.start+1)*r-n;if(c.append("rect").attr("x",g).attr("y",d).attr("width",m).attr("height",o).attr("class","packetBlock"),c.append("text").attr("x",g+m/2).attr("y",d+o/2).attr("class","packetLabel").attr("dominant-baseline","middle").attr("text-anchor","middle").text(i.label),!p)continue;const h=i.end===i.start,k=d-2;c.append("text").attr("x",g+(h?m/2:0)).attr("y",k).attr("class","packetByte start").attr("dominant-baseline","auto").attr("text-anchor",h?"middle":"start").text(i.start),h||c.append("text").attr("x",g+m).attr("y",k).attr("class","packetByte end").attr("dominant-baseline","auto").attr("text-anchor","end").text(i.end)}},"drawWord"),j={draw:H},q={byteFontSize:"10px",startByteColor:"black",endByteColor:"black",labelColor:"black",labelFontSize:"12px",titleColor:"black",titleFontSize:"14px",blockStrokeColor:"black",blockStrokeWidth:"1",blockFillColor:"#efefef"},G=f(({packet:e}={})=>{const t=u(q,e);return`
	.packetByte {
		font-size: ${t.byteFontSize};
	}
	.packetByte.start {
		fill: ${t.startByteColor};
	}
	.packetByte.end {
		fill: ${t.endByteColor};
	}
	.packetLabel {
		fill: ${t.labelColor};
		font-size: ${t.labelFontSize};
	}
	.packetTitle {
		fill: ${t.titleColor};
		font-size: ${t.titleFontSize};
	}
	.packetBlock {
		stroke: ${t.blockStrokeColor};
		stroke-width: ${t.blockStrokeWidth};
		fill: ${t.blockFillColor};
	}
	`},"styles"),yt={parser:x,get db(){return new v},renderer:j,styles:G};export{yt as diagram};

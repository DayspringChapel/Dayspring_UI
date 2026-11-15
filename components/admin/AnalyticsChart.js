'use client';
import { useEffect, useId, useRef, useState } from 'react';
import styles from './AnalyticsChart.module.css';
const amount=(value,unit)=>new Intl.NumberFormat(undefined,{notation:value>=10000?'compact':'standard',maximumFractionDigits:unit==='count'?0:1}).format(value);
function axis(max,unit){const raw=Math.max(max,1)/4,magnitude=10**Math.floor(Math.log10(raw)),normal=raw/magnitude;let step=(normal<=1?1:normal<=2?2:normal<=5?5:10)*magnitude;if(unit==='count')step=Math.max(1,step);const top=Math.max(step,Math.ceil(max/step)*step);return{top,ticks:Array.from({length:Math.round(top/step)+1},(_,i)=>i*step)};}
export default function AnalyticsChart({points,title,unit='count',kind='line',intervalMinutes=0,calendarDays=false,empty='No measurements are available yet.'}){
    const container=useRef(null),id=useId();const [width,setWidth]=useState(720),[active,setActive]=useState(null);
    useEffect(()=>{const observer=new ResizeObserver(([entry])=>setWidth(Math.max(280,Math.round(entry.contentRect.width))));observer.observe(container.current);return()=>observer.disconnect();},[]);
    const data=points.filter(p=>Number.isFinite(p.value)&&p.value>=0&&Number.isFinite(Date.parse(p.time))).map(p=>({...p,stamp:Date.parse(p.time)})).sort((a,b)=>a.stamp-b.stamp);
    const height=240,left=46,right=16,top=18,bottom=38,plotWidth=width-left-right,plotHeight=height-top-bottom;
    const scale=axis(Math.max(0,...data.map(p=>p.value)),unit),first=data[0]?.stamp||0,last=data.at(-1)?.stamp||first;
    const x=p=>last===first?left+plotWidth/2:left+(p.stamp-first)/(last-first)*plotWidth,y=value=>top+plotHeight*(1-value/scale.top);
    const selected=active==null?null:data[Math.max(0,Math.min(active,data.length-1))];
    const segments=[];for(const point of data){let segment=segments.at(-1);if(!segment||(intervalMinutes>0&&point.stamp-segment.at(-1).stamp>intervalMinutes*90000)){segment=[];segments.push(segment);}segment.push(point);}
    const indexes=[...new Set(Array.from({length:Math.min(data.length,Math.max(2,Math.floor(plotWidth/110)))},(_,i)=>Math.round(i*(data.length-1)/Math.max(1,Math.min(data.length,Math.max(2,Math.floor(plotWidth/110)))-1))))];
    const daily=last-first>=86400000;
    const label=p=>new Date(p.stamp).toLocaleString(undefined,daily||calendarDays?{month:'short',day:'numeric',...(calendarDays?{timeZone:'UTC'}:{})}:{hour:'2-digit',minute:'2-digit'});
    function move(event){if(!data.length)return;const rect=event.currentTarget.getBoundingClientRect(),at=(event.clientX-rect.left)/rect.width*width;let nearest=0;for(let i=1;i<data.length;i++)if(Math.abs(x(data[i])-at)<Math.abs(x(data[nearest])-at))nearest=i;setActive(nearest);}
    return <div ref={container} className={styles.frame}>
        {!data.length?<div className={styles.empty}>{empty}</div>:<>
            <div className={styles.readout} aria-live="polite">{selected?<><strong>{amount(selected.value,unit)} {unit==='count'?'':unit}</strong><span>{calendarDays?new Date(selected.stamp).toLocaleDateString(undefined,{timeZone:'UTC',dateStyle:'medium'}):new Date(selected.stamp).toLocaleString()}</span></>:<><span>{kind==='line'?'Follow the line to see how this changed.':'Compare the amount recorded in each period.'}</span><small>Hover, tap, or use arrow keys for exact values.</small></>}</div>
            <svg viewBox={`0 0 ${width} ${height}`} className={styles.chart} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`} tabIndex={0} onPointerMove={move} onPointerLeave={()=>setActive(null)} onFocus={()=>setActive(value=>value??0)} onKeyDown={event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();setActive(value=>event.key==='Home'?0:event.key==='End'?data.length-1:Math.max(0,Math.min(data.length-1,(value??0)+(event.key==='ArrowLeft'?-1:1))));}}}>
                <title id={`${id}-title`}>{title}</title><desc id={`${id}-desc`}>{`${kind==='line'?'Line':'Column'} chart. Vertical axis: ${unit==='count'?'number':unit}. Horizontal axis: time. Missing periods are left blank. Use arrow keys to inspect ${data.length} recorded points.`}</desc>
                <defs><linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#ec8a46" stopOpacity=".25"/><stop offset="100%" stopColor="#ec8a46" stopOpacity=".02"/></linearGradient></defs>
                {scale.ticks.map(value=><g key={value}><line x1={left} x2={width-right} y1={y(value)} y2={y(value)} className={styles.grid}/><text x={left-9} y={y(value)+4} textAnchor="end">{amount(value,unit)}</text></g>)}
                {kind==='line'?segments.map((segment,i)=><g key={i}>{segment.length>1&&<polygon points={`${x(segment[0])},${y(0)} ${segment.map(p=>`${x(p)},${y(p.value)}`).join(' ')} ${x(segment.at(-1))},${y(0)}`} fill={`url(#${id}-fill)`}/>}<polyline points={segment.map(p=>`${x(p)},${y(p.value)}`).join(' ')} className={styles.line}/>{segment.length===1&&<circle cx={x(segment[0])} cy={y(segment[0].value)} r="4" className={styles.dot}/>}</g>):data.map(p=><rect key={p.time} x={x(p)-Math.min(28,plotWidth/Math.max(data.length,2)*.65)/2} y={y(p.value)} width={Math.min(28,plotWidth/Math.max(data.length,2)*.65)} height={Math.max(0,y(0)-y(p.value))} rx="3" className={styles.bar}/>)}
                {selected&&<g><line x1={x(selected)} x2={x(selected)} y1={top} y2={y(0)} className={styles.cursor}/><circle cx={x(selected)} cy={y(selected.value)} r="5" className={styles.dot}/></g>}
                {indexes.map(index=><text key={index} x={x(data[index])} y={height-10} textAnchor={index===0?'start':index===data.length-1?'end':'middle'}>{label(data[index])}</text>)}
            </svg>
            {data.length===1&&<p className={styles.hint}>One measurement is available. A trend appears after more data is recorded.</p>}
        </>}
    </div>;
}

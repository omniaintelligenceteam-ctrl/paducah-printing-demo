(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const menuButton=document.querySelector('.menu-toggle');
  const nav=document.querySelector('#site-nav');
  function setMenu(open){nav.classList.toggle('is-open',open);menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');}
  menuButton?.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){setMenu(false);menuButton.focus();}});
  document.addEventListener('click',event=>{if(!event.target.closest('.site-header')&&menuButton?.getAttribute('aria-expanded')==='true')setMenu(false);});
  document.querySelector('.site-header').addEventListener('focusout',event=>{if(event.relatedTarget&&!event.currentTarget.contains(event.relatedTarget))setMenu(false);});
  nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
  matchMedia('(min-width:851px)').addEventListener('change',()=>setMenu(false));

  const filters=document.querySelectorAll('[data-filter]');
  filters.forEach(button=>button.addEventListener('click',()=>{
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    let visible=0;
    document.querySelectorAll('[data-service-card]').forEach(card=>{const show=button.dataset.filter==='all'||card.dataset.groups.split(' ').includes(button.dataset.filter);card.hidden=!show;if(show)visible++;});
    document.querySelector('#filter-status').textContent=`${visible} services shown for ${button.textContent.toLowerCase()}.`;
    window.ScrollCraft?.instances.forEach(instance=>instance.layout());
  }));

  const reduce=matchMedia('(prefers-reduced-motion:reduce)');
  window.ScrollCraft?.mount(document.body);
  const registration=document.querySelector('#registration');
  const range=document.querySelector('#registration-control');
  let manuallyAligned=false;
  function align(value){
    const progress=Math.max(0,Math.min(100,value));
    registration.style.setProperty('--offset',String(1-progress/100));
    range.value=String(Math.round(progress));
    document.querySelector('#registration-status').textContent=progress>98?'In perfect registration':'A little attention changes everything';
    document.querySelector('.ink-art').dataset.scVerifyState=`offset:${(1-progress/100).toFixed(2)}`;
  }
  if(registration&&range){
    range.addEventListener('input',()=>{manuallyAligned=true;align(Number(range.value));});
    let scheduled=false;
    const update=()=>{scheduled=false;if(reduce.matches){align(100);return;}if(manuallyAligned)return;const rect=registration.getBoundingClientRect();const travel=Math.max(1,registration.offsetHeight-innerHeight);const progress=Math.max(0,Math.min(1,-rect.top/travel));align(Math.min(1,progress/0.82)*100);};
    const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}};
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});reduce.addEventListener('change',()=>{manuallyAligned=false;update();});update();
  }

  const form=document.querySelector('#project-form');
  if(form){
    const fields=document.querySelector('#project-fields');fields.disabled=false;
    const service=form.elements.service;
    const incoming=new URLSearchParams(location.search).get('service');
    if(incoming&&Array.from(service.options).some(o=>o.value===incoming))service.value=incoming;
    const status=document.querySelector('#brief-status');
    status.textContent='Your brief stays on this device until you choose to share it.';
    function brief(){return [
      'PADUCAH PRINTING — PROJECT BRIEF',
      'Prepared on your device. This brief has not been submitted.',
      '',
      `Project: ${service.selectedOptions[0].textContent.trim()}`,
      `Quantity: ${form.elements.quantity.value.trim()||'To discuss'}`,
      `Requested date: ${form.elements.deadline.value||'To discuss'}`,
      '',
      'Project details:',form.elements.details.value.trim(),
      '',
      'Next step: call 270.443.5383 to discuss an estimate.',
      'Send artwork: https://paducahprintingcorp.com/ftp',
      '233 North 8th Street, Paducah, KY 42001',
      'Monday–Friday, 8:00 a.m.–5:00 p.m.',
      '',
      'Quantity, pricing, materials, and schedule are confirmed with the team.'
    ].join('\n');}
    form.addEventListener('submit',event=>{
      event.preventDefault();if(!form.reportValidity())return;
      const blob=new Blob([brief()],{type:'text/plain;charset=utf-8'});
      const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='paducah-printing-project-brief.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
      status.textContent='Your brief has been downloaded. Call 270.443.5383 to discuss your project; nothing has been sent.';
    });
    document.querySelector('#copy-brief')?.addEventListener('click',async()=>{
      if(!form.reportValidity())return;
      try{await navigator.clipboard.writeText(brief());status.textContent='Brief copied. It has not been sent. Call 270.443.5383 for an estimate.';}catch{status.textContent='Clipboard access is unavailable. Use Download project brief instead.';}
    });
  }
})();

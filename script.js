const menuBtn=document.querySelector('.menu');
const siteNav=document.getElementById('site-nav');
if(menuBtn&&siteNav){menuBtn.addEventListener('click',()=>{const open=siteNav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));});siteNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{siteNav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');}));}
const SHEET2API_URL='https://sheet2api.com/v1/A80k3nstQtGT/addmission-info';

function bindWhatsAppLinks(){
  const whatsappLinks=document.querySelectorAll('.js-whatsapp-link');

  if(!whatsappLinks.length){
    return;
  }

  whatsappLinks.forEach(link=>{
    link.addEventListener('click',event=>{
      event.preventDefault();

      const phone=(link.dataset.whatsappPhone||'').replace(/\D/g,'');
      const text=link.dataset.whatsappText||'';

      if(!phone){
        window.open(link.href,'_blank','noopener');
        return;
      }

      const encodedText=encodeURIComponent(text);
      const appUrl=`whatsapp://send?phone=${phone}&text=${encodedText}`;
      const isMobile=/Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
      const fallbackUrl=isMobile
        ? `https://wa.me/${phone}?text=${encodedText}`
        : `https://web.whatsapp.com/send?phone=${phone}&text=${encodedText}`;

      let appOpened=false;
      const markAppOpened=()=>{
        appOpened=true;
      };

      window.addEventListener('blur',markAppOpened,{once:true});
      document.addEventListener('visibilitychange',markAppOpened,{once:true});

      window.location.href=appUrl;

      window.setTimeout(()=>{
        if(!appOpened){
          window.open(fallbackUrl,'_blank','noopener');
        }
      },1400);
    });
  });
}

async function submitForm(event){
  event.preventDefault();

  const form=document.getElementById('enquiry-form');
  const msg=document.getElementById('reg-msg');
  const submitBtn=form.querySelector('button[type="submit"]');
  const required=['fname','phone','course'];
  const missing=required.some(id=>!document.getElementById(id).value.trim());

  if(missing){
    msg.style.color='#d74430';
    msg.textContent='Please fill in your first name, phone number, and preferred course.';
    return;
  }

  const now=new Date();
  const firstName=document.getElementById('fname').value.trim();
  const lastName=document.getElementById('lname').value.trim();
  const payload={
    Name:[firstName,lastName].filter(Boolean).join(' '),
    Email:document.getElementById('email').value.trim(),
    Phone:document.getElementById('phone').value.trim(),
    Course:document.getElementById('course').value.trim(),
    Batch:document.getElementById('batch').value.trim(),
    Date:now.toLocaleDateString('en-CA'),
    Time:now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})
  };

  msg.style.color='#605a78';
  msg.textContent='Submitting your enquiry...';
  submitBtn.disabled=true;

  try{
    const response=await fetch(SHEET2API_URL,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Accept':'application/json'
      },
      body:JSON.stringify(payload)
    });

    if(!response.ok){
      throw new Error(`Request failed with status ${response.status}`);
    }

    msg.style.color='#3f9a4a';
    msg.textContent='Admission enquiry submitted successfully. The LGES team can contact you within 24 hours.';
    form.reset();
  }catch(error){
    msg.style.color='#d74430';
    msg.textContent='We could not submit your enquiry right now. Please try again in a moment.';
    console.error('Form submission failed:',error);
  }finally{
    submitBtn.disabled=false;
  }
}

bindWhatsAppLinks();
document.getElementById('enquiry-form').addEventListener('submit',submitForm);

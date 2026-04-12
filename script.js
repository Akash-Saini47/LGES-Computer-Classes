const menuBtn=document.querySelector('.menu');
const siteNav=document.getElementById('site-nav');
if(menuBtn&&siteNav){
  menuBtn.addEventListener('click',()=>{
    const open=siteNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded',String(open));
  });

  siteNav.addEventListener('click',e=>{
    if(e.target.closest('a')){
      siteNav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded','false');
    }
  });
}

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

const enquiryForm=document.getElementById('enquiry-form');
if(enquiryForm){
  enquiryForm.addEventListener('submit',submitForm);
}

// Scroll-triggered animations for course-cards and feature-boxes
const observerOptions={
  root:null,
  rootMargin:'0px',
  threshold:0.1
};

const observer=new IntersectionObserver((entries,observerInstance)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      observerInstance.unobserve(entry.target);
    }
  });
},observerOptions);

document.querySelectorAll('.course, .review, .list-item, .contact-item, .stat, .image-card, .support-card, .feature-box').forEach(element=>{
  observer.observe(element);
});

// ===== BRANCH CARDS SCROLL ANIMATION =====
const branchObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 120);
      branchObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.branch-card')
  .forEach(card => branchObserver.observe(card));

// Active nav highlight on scroll
const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const allSections = document.querySelectorAll('section[id]');
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('nav-active'));
      const a = document.querySelector(`.site-nav a[href="#${e.target.id}"]`);
      if (a) a.classList.add('nav-active');
    }
  });
}, { threshold: 0.35 });
allSections.forEach(s => navObserver.observe(s));

// Counter animation for stats
document.querySelectorAll('.stat strong').forEach(el => {
  const raw = el.textContent.trim();
  const target = parseInt(raw);
  if (!target) return;
  const suffix = raw.replace(/[0-9]/g, '');
  new IntersectionObserver(([entry], obs) => {
    if (!entry.isIntersecting) return;
    obs.unobserve(el);
    let n = 0;
    const step = Math.ceil(target / 50);
    const timer = setInterval(() => {
      n = Math.min(n + step, target);
      el.textContent = n + suffix;
      if (n >= target) clearInterval(timer);
    }, 30);
  }, { threshold: 0.6 }).observe(el);
});

// Back to top
const topBtn = document.getElementById('back-to-top');
if (topBtn) {
  window.addEventListener('scroll', () => {
    topBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
  });
  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Course details toggle for click or touch
document.querySelectorAll('.course').forEach(card => {
  card.addEventListener('click', event => {
    if (event.target.closest('a, button')) return;
    card.classList.toggle('is-open');
  });
});

// Course filter buttons
document.querySelectorAll('.cf-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.cf-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const filter=btn.dataset.filter;
    document.querySelectorAll('.course').forEach(card=>{
      const show=filter==='all'||card.dataset.level===filter;
      card.style.transition='opacity .3s ease, transform .3s ease';
      if(show){
        card.style.display='flex';
        card.style.flexDirection='column';
        setTimeout(()=>{card.style.opacity='1';card.style.transform='translateY(0)'},10);
      } else {
        card.style.opacity='0';
        card.style.transform='translateY(10px)';
        setTimeout(()=>{card.style.display='none'},300);
      }
    });
  });
});

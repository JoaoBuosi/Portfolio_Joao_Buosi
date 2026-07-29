  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // Trajetória: bolinhas acendem e ficam acesas conforme o scroll passa por cada commit
  const logEl = document.querySelector('.log');
  const commitEls = document.querySelectorAll('.commit');
  const prefersReducedLog = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(logEl && commitEls.length){
    const total = commitEls.length;

    if(prefersReducedLog){
      commitEls.forEach(el => el.querySelector('.commit-dot').classList.add('active'));
      logEl.style.setProperty('--log-progress', '100%');
    } else {
      let lastActiveIndex = -1;
      const commitList = Array.from(commitEls);

      const commitIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            const idx = commitList.indexOf(entry.target);
            entry.target.querySelector('.commit-dot').classList.add('active');
            if(idx > lastActiveIndex) lastActiveIndex = idx;
            logEl.style.setProperty('--log-progress', (((lastActiveIndex + 1) / total) * 100) + '%');
            commitIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -30% 0px' });

      commitList.forEach(el => commitIO.observe(el));
    }
  }

  // Hero terminal typewriter (skipped if reduced motion)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const termBody = document.getElementById('termBody');

  if(!prefersReduced && termBody){
    const lines = Array.from(termBody.children);
    lines.forEach(l => { l.dataset.full = l.innerHTML; l.innerHTML=''; l.style.visibility='hidden'; });

    let i = 0;
    function typeLine(){
      if(i >= lines.length) return;
      const line = lines[i];
      line.style.visibility='visible';
      const full = line.dataset.full;
      // strip cursor span for typing, then re-add
      const hasCursor = full.includes('cursor');
      const clean = full.replace(/<span class="cursor"><\/span>/, '');
      let pos = 0;
      const isPrompt = clean.indexOf('term-prompt') !== -1 || clean.indexOf('&gt;') === -1 ? false : false;
      // simple char reveal using textContent of a temp element
      const temp = document.createElement('div');
      temp.innerHTML = clean;
      const text = temp.textContent;
      const prefix = clean.split(text)[0] || '';
      line.innerHTML = prefix;
      const speed = 14;
      const typer = setInterval(() => {
        pos++;
        line.innerHTML = prefix + text.slice(0, pos) + (hasCursor && pos>=text.length ? '<span class="cursor"></span>' : '');
        if(pos >= text.length){
          clearInterval(typer);
          i++;
          setTimeout(typeLine, 120);
        }
      }, speed);
    }
    setTimeout(typeLine, 400);
  }

  // ---------- Novidades: progresso de scroll, nav ativo, topo, tilt 3D, cubo ----------
  const prefersReducedAll = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Menu mobile
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if(menuToggle && mobileMenu){
    function closeMobileMenu(){
      menuToggle.classList.remove('open');
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
  }

  // Barra de progresso de leitura
  const scrollBar = document.getElementById('scrollProgress');
  function updateScrollBar(){
    if(!scrollBar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateScrollBar, { passive: true });
  window.addEventListener('resize', updateScrollBar);
  updateScrollBar();

  // Nav ativo conforme a seção visível
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const navSections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if(navSections.length){
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    navSections.forEach(sec => navIO.observe(sec));
  }

  // Botão voltar ao topo
  const toTopBtn = document.getElementById('toTop');
  const floatWhatsapp = document.getElementById('floatWhatsapp');
  function updateToTop(){
    const show = window.scrollY > window.innerHeight * 0.8;
    if(toTopBtn) toTopBtn.classList.toggle('visible', show);
    if(floatWhatsapp) floatWhatsapp.classList.toggle('visible', show);
  }
  window.addEventListener('scroll', updateToTop, { passive: true });
  updateToTop();
  if(toTopBtn){
    toTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedAll ? 'auto' : 'smooth' });
    });
  }

  // Tilt 3D sutil em hover (terminal e cards de projeto), só em telas com mouse
  if(hoverCapable && !prefersReducedAll){
    function attachTilt(el, max){
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        el.style.setProperty('--tilt-x', ((px - 0.5) * max * 2) + 'deg');
        el.style.setProperty('--tilt-y', ((0.5 - py) * max * 2) + 'deg');
      });
      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--tilt-x', '0deg');
        el.style.setProperty('--tilt-y', '0deg');
      });
    }
    document.querySelectorAll('.project-card').forEach(el => attachTilt(el, 4));
    const heroTerminal = document.querySelector('.terminal');
    if(heroTerminal) attachTilt(heroTerminal, 5);
  }

  // Spotlight seguindo o mouse no site inteiro
  const globalSpot = document.getElementById('globalSpotlight');
  if(globalSpot && hoverCapable && !prefersReducedAll){
    window.addEventListener('mousemove', (e) => {
      globalSpot.style.setProperty('--gx', ((e.clientX / window.innerWidth) * 100) + '%');
      globalSpot.style.setProperty('--gy', ((e.clientY / window.innerHeight) * 100) + '%');
    });
  }

  // Cubo 3D da stack — gira sozinho e pode ser arrastado
  const stackCube = document.getElementById('stackCube');
  if(stackCube){
    let rotX = -18, rotY = 35;
    let dragging = false, lastX = 0, lastY = 0;

    function applyCubeRot(){
      stackCube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }
    applyCubeRot();

    function spin(){
      if(!dragging && !prefersReducedAll){
        rotY += 0.35;
        applyCubeRot();
      }
      requestAnimationFrame(spin);
    }
    if(!prefersReducedAll) requestAnimationFrame(spin);

    function dragStart(x, y){ dragging = true; lastX = x; lastY = y; }
    function dragMove(x, y){
      if(!dragging) return;
      rotY += (x - lastX) * 0.4;
      rotX -= (y - lastY) * 0.4;
      lastX = x; lastY = y;
      applyCubeRot();
    }
    function dragEnd(){ dragging = false; }

    stackCube.addEventListener('pointerdown', (e) => { dragStart(e.clientX, e.clientY); stackCube.setPointerCapture(e.pointerId); });
    stackCube.addEventListener('pointermove', (e) => dragMove(e.clientX, e.clientY));
    stackCube.addEventListener('pointerup', dragEnd);
    stackCube.addEventListener('pointercancel', dragEnd);
  }

  // Pequeno recado pra quem abre o devtools
  console.log('%cJoão Buosi', 'font-size:20px;font-weight:700;color:#3fe8b0;');
  console.log('%cEstudante de Engenharia de Software — Java · Spring Boot · AWS · Docker', 'color:#d9a44c;font-family:monospace;font-size:12px;');
  console.log('%cbora trocar uma ideia? github.com/JoaoBuosi · linkedin.com/in/joaovitorbuosi', 'color:#9aa1af;font-family:monospace;font-size:12px;');

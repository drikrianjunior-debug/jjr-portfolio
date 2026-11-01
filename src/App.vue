<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Motion } from 'motion-v'
import {
  ArrowDownRight, ArrowUpRight, BriefcaseBusiness, Code2, GraduationCap, House,
  Languages, Mail, Menu, Moon, PencilLine, Plus, Sun, UserRound, X, Github,
  ExternalLink, LockKeyhole, CalendarDays, Layers3, Phone, CarFront, Heart,
  Check, LoaderCircle, Sparkles, FileDown, FileText, Shield, ScrollText
} from 'lucide-vue-next'

type Project = { id?: number; name: string; url: string; icon: string; completed_at: string; stack: string[] }
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''
const api = (path: string) => `${API_BASE}${path}`
const dark = ref(true)
const loading = ref(true)
const activeSection = ref('accueil')
const adminOpen = ref(false)
const legalOpen = ref<null | 'privacy' | 'terms'>(null)
const admin = ref(false)
const token = ref('')
const email = ref('')
const password = ref('')
const loginError = ref('')
const saving = ref(false)
const editingId = ref<number | null>(null)
const formError = ref('')
const generatingPdf = ref(false)
const generatingLetter = ref(false)
const letterJob = ref('Développeur Fullstack')
const letterCompany = ref('')
const letterAddress = ref('')
const projectForm = ref<Project>({ name:'', url:'', icon:'✳', completed_at:new Date().toISOString().slice(0,10), stack:[] })
const stackText = ref('')
const projects = ref<Project[]>([
  {name:'Portfolio personnel',url:'https://jjr-portfolio.vercel.app',icon:'J',completed_at:'2026-01-01',stack:['HTML','CSS','JavaScript','Vercel']},
  {name:'GitHub — mes projets',url:'https://github.com/drikrianjunior',icon:'⌘',completed_at:'2026-01-01',stack:['Git','GitHub','Web development']}
])
const nav = [
  {id:'accueil',label:'Accueil',icon:House},
  {id:'profil',label:'Profil',icon:UserRound},
  {id:'experiences',label:'Expériences',icon:BriefcaseBusiness},
  {id:'realisations',label:'Réalisations',icon:Code2},
  {id:'formation',label:'Formation',icon:GraduationCap},
  {id:'competences',label:'Compétences',icon:Layers3},
  {id:'contact',label:'Contact',icon:Mail}
]
const skillGroups = [
  {title:'Langages & technologies',items:['HTML5','CSS3','JavaScript','PHP','NodeJS','React','Bootstrap','Shopify','WordPress','Joomla']},
  {title:'Logiciels maîtrisés',items:['Word (avancé)','Excel (avancé)','PowerPoint (avancé)','Canva','Git / GitHub','MySQL']},
  {title:'Langues',items:['Français — courant','Anglais — intermédiaire','Allemand — intermédiaire']}
]
const experiences = [
  {period:'2019 — 2026',company:'H&DEV',role:'Gestion de projet et développement d’applications web et mobiles.',stack:'HTML, CSS, JS, PHP, MySQL, jQuery, Bootstrap, WordPress, Laravel.'},
  {period:'2022 — 2023',company:'BIN LENOIR',role:'Conception et développement de la plateforme e-commerce et du dashboard client.',stack:'HTML, CSS, JS, PHP, MySQL, jQuery, Bootstrap, WordPress.'},
  {period:'2021 — 2022',company:'SNEM',role:'Stagiaire : conception et réalisation d’un site vitrine.',stack:'HTML, CSS, JS, PHP, MySQL, jQuery, Bootstrap.'}
]
const education = [
  {period:'2024 — 2026',title:'Formation en langue Allemande',place:'German Center, Cocody Angré les Oscars'},
  {period:'Août — Octobre 2020',title:'Formation en programmation avec WinDev',place:'E2manuel Technology'},
  {period:'2017 — 2020',title:'Licence Professionnelle en Informatique Télécoms et Réseaux',place:'UTT-LOKO de Marcory (licence 1, 2 et 3), ITER'},
  {period:'2016 — 2017',title:'Baccalauréat série D',place:'Cours Secondaire Méthodiste de Koumassi'}
]
const themeClass = computed(() => dark.value ? 'theme-dark' : 'theme-light')
function go(id:string) {
  activeSection.value = id
  document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})
}
function setProject(p?:Project) {
  if (p) {
    editingId.value = p.id ?? null
    projectForm.value = {...p, stack:[...p.stack]}
    stackText.value = p.stack.join(', ')
  } else {
    editingId.value = null
    projectForm.value = {name:'',url:'',icon:'✳',completed_at:new Date().toISOString().slice(0,10),stack:[]}
    stackText.value = ''
  }
  formError.value = ''
  adminOpen.value = true
}
async function login() {
  loginError.value = ''
  try {
    const res = await fetch(api('/api/admin/login'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email.value,password:password.value})})
    const raw = await res.text()
    let data: any = {}
    try { data = raw ? JSON.parse(raw) : {} } catch { throw new Error('Réponse API invalide. Vérifiez que le serveur (port 8787) tourne et que le proxy Vite est actif.') }
    if (!res.ok) throw new Error(data.error || 'Connexion impossible.')
    token.value = data.token; admin.value = true; password.value = ''
    await loadProjects()
  } catch (e) { loginError.value = e instanceof Error ? e.message : 'Erreur de connexion.' }
}
function logout() { admin.value=false; token.value=''; adminOpen.value=false }
async function loadProjects() {
  try {
    const res = await fetch(api('/api/projects'))
    if (res.ok) projects.value = await res.json()
  } catch { /* Les projets de démonstration restent visibles hors connexion API. */ }
}
async function saveProject() {
  formError.value = ''
  if (!projectForm.value.name.trim() || !projectForm.value.url.trim()) { formError.value='Le nom et le lien de démo sont obligatoires.'; return }
  try {
    saving.value=true
    const payload = {...projectForm.value, stack:stackText.value.split(',').map(s=>s.trim()).filter(Boolean)}
    const res = await fetch(editingId.value ? api(`/api/projects/${editingId.value}`) : api('/api/projects'),{
      method:editingId.value?'PUT':'POST',
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${token.value}`},
      body:JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Enregistrement impossible.')
    await loadProjects(); adminOpen.value=false
  } catch(e) { formError.value=e instanceof Error?e.message:'Erreur inattendue.' }
  finally { saving.value=false }
}
async function deleteProject(id?:number) {
  if (!id || !confirm('Supprimer cette réalisation ?')) return
  try {
    const res=await fetch(api(`/api/projects/${id}`),{method:'DELETE',headers:{Authorization:`Bearer ${token.value}`}})
    if(!res.ok) throw new Error('Suppression impossible.')
    await loadProjects()
  } catch(e) { alert(e instanceof Error?e.message:'Erreur.') }
}
function onScroll() {
  const ids=nav.map(n=>n.id)
  const current=ids.map(id=>({id,top:document.getElementById(id)?.getBoundingClientRect().top ?? 9999})).filter(x=>x.top<window.innerHeight*.45).sort((a,b)=>b.top-a.top)[0]
  if(current) activeSection.value=current.id
}

function escapeHtml(str: string) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

/** Génère un CV PDF via fenêtre imprimable (Enregistrer au format PDF). */
async function generateCV() {
  generatingPdf.value = true
  let photoDataUrl = ''
  try {
    const imgRes = await fetch('/portrait.jpg')
    if (imgRes.ok) {
      const blob = await imgRes.blob()
      photoDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    }
  } catch { /* photo optionnelle */ }

  const projectsHtml = projects.value.map(p => `<div class="cv-item"><strong>${escapeHtml(p.name)}</strong><span class="cv-meta">${p.completed_at ? new Date(p.completed_at).toLocaleDateString('fr-FR',{year:'numeric',month:'long'}) : ''} · ${escapeHtml((p.stack||[]).join(', '))}</span><a href="${escapeHtml(p.url)}">${escapeHtml(p.url)}</a></div>`).join('')
  const expHtml = experiences.map(e => `<div class="cv-item"><div class="cv-row"><strong>${escapeHtml(e.company)}</strong><span>${escapeHtml(e.period)}</span></div><p>${escapeHtml(e.role)}</p><span class="cv-meta">Stack : ${escapeHtml(e.stack)}</span></div>`).join('')
  const eduHtml = education.map(e => `<div class="cv-item"><div class="cv-row"><strong>${escapeHtml(e.title)}</strong><span>${escapeHtml(e.period)}</span></div><p>${escapeHtml(e.place)}</p></div>`).join('')
  const skillsHtml = skillGroups.map(g => `<div class="cv-skill-group"><h4>${escapeHtml(g.title)}</h4><p>${g.items.map(escapeHtml).join(' · ')}</p></div>`).join('')
  const photoHtml = photoDataUrl
    ? `<img class="cv-photo" src="${photoDataUrl}" alt="Christ Hervé Charles Joseph Junior Seri"/>`
    : ''

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>CV — Christ Hervé Charles Joseph Junior Seri</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Poppins',sans-serif;color:#171715;background:#f8f7f2;padding:36px 44px;line-height:1.45;font-size:11.5px}
h1{font-size:24px;font-weight:700;letter-spacing:-0.5px;color:#0b0b0b}
h2{font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#9a7011;margin:24px 0 10px;padding-bottom:5px;border-bottom:1.5px solid #e6bd55}
h4{font-size:11px;font-weight:600;color:#9a7011;margin-bottom:4px}
.header{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:6px}
.header-left{display:flex;gap:18px;align-items:center}
.cv-photo{width:92px;height:92px;object-fit:cover;border-radius:8px;border:2px solid #e6bd55;flex-shrink:0}
.header-right{text-align:right;font-size:10.5px;color:#555}
.header-right a{color:#9a7011;text-decoration:none}
.tagline{font-size:12px;color:#666;margin-top:4px}
.cv-item{margin-bottom:12px}
.cv-row{display:flex;justify-content:space-between;gap:12px;margin-bottom:2px}
.cv-row span{color:#888;font-size:10.5px;white-space:nowrap}
.cv-meta{display:block;font-size:10px;color:#888;margin-top:2px}
.cv-item a{font-size:10px;color:#9a7011;word-break:break-all}
.cv-skill-group{margin-bottom:10px}
.cv-skill-group p{font-size:11px;color:#333}
.footer{margin-top:28px;padding-top:10px;border-top:1px solid #ddd;font-size:9px;color:#999;text-align:center}
@media print{body{padding:16px 22px}@page{margin:10mm}}
</style></head><body>
<div class="header">
  <div class="header-left">
    ${photoHtml}
    <div>
      <h1>Christ Hervé Charles Joseph Junior Seri</h1>
      <p class="tagline">Développeur Fullstack & Infographe · Abidjan, Côte d’Ivoire</p>
    </div>
  </div>
  <div class="header-right">
    <div><a href="mailto:junser700@gmail.com">junser700@gmail.com</a></div>
    <div>+225 07 59 12 80 35</div>
    <div><a href="https://github.com/drikrianjunior">github.com/drikrianjunior</a></div>
  </div>
</div>
<h2>Profil</h2>
<p>Développeur Fullstack passionné, spécialisé dans la création d’applications web modernes et performantes. Fort d’une expérience en gestion de projet et curieux d’apprendre, je mets mes compétences techniques au service de solutions innovantes.</p>
<h2>Expériences professionnelles</h2>${expHtml}
<h2>Réalisations</h2>${projectsHtml||'<p>Aucune réalisation enregistrée.</p>'}
<h2>Formation</h2>${eduHtml}
<h2>Compétences</h2>${skillsHtml}
<h2>Centres d’intérêt</h2>
<p>Football, natation, musique, dessin, basketball et lecture. · Permis toute catégorie.</p>
<div class="footer">CV généré depuis le portfolio CHCJJr. SERI · by VinCi — ${new Date().toLocaleDateString('fr-FR')}</div>
<script>window.onload=function(){setTimeout(function(){window.print()},400)}<\/script>
</body></html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (win) { win.document.write(html); win.document.close() }
  else alert('Veuillez autoriser les pop-ups pour générer le CV.')
  generatingPdf.value = false
}

/** Génère une lettre de motivation PDF adaptée au profil. */
async function generateCoverLetter() {
  generatingLetter.value = true
  let photoDataUrl = ''
  try {
    const imgRes = await fetch('/portrait.jpg')
    if (imgRes.ok) {
      const blob = await imgRes.blob()
      photoDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    }
  } catch { /* optionnel */ }

  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const topSkills = skillGroups[0]?.items.slice(0, 6).join(', ') || 'HTML, CSS, JavaScript, PHP, Node.js, React'
  const latestExp = experiences[0]
  const projectsLine = projects.value.slice(0, 3).map(p => p.name).join(', ') || 'mes projets web'

  const photoHtml = photoDataUrl
    ? `<img class="lm-photo" src="${photoDataUrl}" alt="Photo"/>`
    : ''

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>Lettre de motivation — Christ Hervé Charles Joseph Junior Seri</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Poppins',sans-serif;color:#171715;background:#f8f7f2;padding:40px 48px;line-height:1.55;font-size:12px}
.top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:28px;padding-bottom:16px;border-bottom:1.5px solid #e6bd55}
.identity{display:flex;gap:16px;align-items:center}
.lm-photo{width:72px;height:72px;object-fit:cover;border-radius:6px;border:2px solid #e6bd55;flex-shrink:0}
.identity h1{font-size:18px;font-weight:700;letter-spacing:-0.3px;color:#0b0b0b}
.identity .role{font-size:11px;color:#9a7011;font-weight:500;margin-top:2px}
.identity .coords{font-size:10px;color:#666;margin-top:6px;line-height:1.6}
.identity .coords a{color:#9a7011;text-decoration:none}
.date-block{text-align:right;font-size:11px;color:#555}
.destinataire{margin-bottom:22px;font-size:11.5px;line-height:1.5}
.objet{font-weight:600;margin-bottom:18px;font-size:12px}
.corps p{margin-bottom:12px;text-align:justify}
.corps strong{font-weight:600}
.formule{margin-top:22px}
.signature{margin-top:28px}
.signature .name{font-weight:600;margin-top:36px}
.footer{margin-top:36px;padding-top:10px;border-top:1px solid #ddd;font-size:9px;color:#999;text-align:center}
@media print{body{padding:18px 24px}@page{margin:12mm}}
</style></head><body>
<div class="top">
  <div class="identity">
    ${photoHtml}
    <div>
      <h1>Christ Hervé Charles Joseph Junior Seri</h1>
      <div class="role">Développeur Fullstack & Infographe</div>
      <div class="coords">
        Abidjan, Côte d’Ivoire<br/>
        <a href="mailto:junser700@gmail.com">junser700@gmail.com</a> · +225 07 59 12 80 35<br/>
        <a href="https://github.com/drikrianjunior">github.com/drikrianjunior</a>
      </div>
    </div>
  </div>
  <div class="date-block">Abidjan, le ${today}</div>
</div>

<div class="destinataire">
  À l’attention du responsable du recrutement<br/>
  <strong>${escapeHtml(letterCompany.value.trim() || "[Nom de l’entreprise]")}</strong><br/>
  ${letterAddress.value.trim() ? escapeHtml(letterAddress.value.trim()).split(String.fromCharCode(10)).join('<br/>') : "<em>[Adresse de l’entreprise]</em>"}
</div>

<p class="objet">Objet : Candidature au poste de ${escapeHtml(letterJob.value.trim() || 'Développeur Fullstack')}</p>

<div class="corps">
  <p>Madame, Monsieur,</p>

  <p>Développeur Fullstack passionné, fort de plus de sept années d’expérience dans la conception et la réalisation d’applications web et mobiles, je vous adresse ma candidature pour le poste de <strong>${escapeHtml(letterJob.value.trim() || 'Développeur Fullstack')}</strong>${letterCompany.value.trim() ? ' au sein de <strong>' + escapeHtml(letterCompany.value.trim()) + '</strong>' : ''}. Mon parcours m’a conduit à intervenir sur l’ensemble du cycle de vie d’un projet : de l’analyse du besoin à la mise en production, en passant par le développement, l’intégration et la coordination d’équipe.</p>

  <p>Chez <strong>${escapeHtml(latestExp.company)}</strong> (${escapeHtml(latestExp.period)}), j’ai assuré la gestion de projet et le développement d’applications web et mobiles, en mobilisant notamment ${escapeHtml(latestExp.stack)}. Cette expérience m’a permis de consolider une approche pragmatique, orientée résultats et qualité du code, tout en restant attentif à l’expérience utilisateur finale.</p>

  <p>Ma stack technique couvre en particulier : <strong>${escapeHtml(topSkills)}</strong>, ainsi que des outils de gestion de contenu (WordPress, Shopify, Joomla) et de versioning (Git / GitHub). Parmi mes réalisations récentes figurent notamment : ${escapeHtml(projectsLine)}. Je m’attache à livrer des solutions performantes, maintenables et adaptées aux contraintes réelles des utilisateurs et des métiers.</p>

  <p>Curieux, rigoureux et à l’aise en environnement collaboratif, je suis motivé à contribuer à des projets ambitieux où la technique sert clairement le produit et l’utilisateur. Je serais ravi d’échanger avec vous pour préciser comment mon profil peut répondre aux enjeux de votre structure.</p>

  <p class="formule">Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.</p>
</div>

<div class="signature">
  <div class="name">Christ Hervé Charles Joseph Junior Seri</div>
  <div style="font-size:10px;color:#666;margin-top:4px">Développeur Fullstack & Infographe</div>
</div>

<div class="footer">Lettre de motivation générée depuis le portfolio CHCJJr. SERI · by VinCi — ${today}</div>
<script>window.onload=function(){setTimeout(function(){window.print()},400)}<\/script>
</body></html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (win) { win.document.write(html); win.document.close() }
  else alert('Veuillez autoriser les pop-ups pour générer la lettre de motivation.')
  generatingLetter.value = false
}


onMounted(()=>{setTimeout(()=>loading.value=false,850); loadProjects(); window.addEventListener('scroll',onScroll,{passive:true})})
onUnmounted(()=>window.removeEventListener('scroll',onScroll))
</script>

<template>
  <div class="site" :class="themeClass">
    <Transition name="preloader">
      <div v-if="loading" class="preloader">
        <div class="brand-mark">J<span>.</span></div><div class="loader-line"><i></i></div>
        <p>CHCJJr. SERI <span>·</span> by VinCi</p>
      </div>
    </Transition>
    <header class="topbar">
      <button class="wordmark" @click="go('accueil')" aria-label="Retour à l'accueil"><span class="monogram">J.</span><span>CHCJJr. SERI<small>BY VINCI</small></span></button>
      <div class="top-actions">
        <span class="availability"><i></i> Disponible pour projets</span>
        <button class="icon-button theme-toggle" @click="dark=!dark" :aria-label="dark?'Activer le thème clair':'Activer le thème sombre'"><Sun v-if="dark" :size="18"/><Moon v-else :size="18"/></button>
        <button class="admin-trigger" @click="adminOpen=true"><LockKeyhole :size="15"/> Espace admin</button>
      </div>
    </header>

    <main>
      <section id="accueil" class="hero section-shell">
        <div class="hero-copy">
          <Motion :initial="{opacity:0,y:22}" :animate="{opacity:1,y:0}" :transition="{duration:.65,ease:'easeOut'}">
            <p class="eyebrow"><span class="eyebrow-line"></span> DÉVELOPPEUR FULLSTACK & INFOGRAPHE</p>
            <h1>Je transforme<br/>les idées en <em>expériences</em><br/>digitales.</h1>
            <p class="hero-intro">Moi, c’est Christ Hervé Charles Joseph Junior Seri. Je conçois des applications web modernes, performantes et pensées pour les personnes qui les utilisent.</p>
            <div class="hero-actions">
              <button class="button button-gold" @click="go('realisations')">Découvrir mes projets <ArrowUpRight :size="17"/></button>
              <a class="button button-ghost" href="mailto:junser700@gmail.com">Me contacter <ArrowDownRight :size="16"/></a>
            </div>
          </Motion>
          <div class="hero-footnote"><span>ABIDJAN, CÔTE D’IVOIRE</span><span>WEB · MOBILE · DESIGN</span></div>
        </div>
        <div class="hero-art" aria-label="Monogramme J doré">
          <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="art-index">PORTFOLIO<br/>2026</div>
          <div class="gold-sun"></div><div class="hero-monogram">J<span>.</span></div>
          <div class="art-caption"><span>DESIGNING<br/>WHAT'S NEXT</span><Sparkles :size="19"/></div>
          <div class="vertical-note">CHRIST JUNIOR SERI — CREATIVE DEVELOPER</div>
        </div>
        <button class="scroll-cue" @click="go('profil')"><span>FAIRE DÉFILER</span><ArrowDownRight :size="16"/></button>
      </section>

      <Motion tag="section" id="profil" class="content-section section-shell" :initial="{opacity:0,y:36}" :whileInView="{opacity:1,y:0}" :viewport="{once:true,amount:0.18}" :transition="{duration:0.7,ease:[0.22,1,0.36,1]}">
        <div class="section-label"><span>01 / PROFIL</span><span>À PROPOS DE MOI</span></div>
        <div class="profile-grid profile-grid-with-photo">
          <div class="profile-photo-wrap">
            <img src="/portrait.jpg" alt="Christ Hervé Charles Joseph Junior Seri" class="profile-photo" width="320" height="427" loading="lazy"/>
            <div class="profile-photo-caption">CHCJJr. SERI</div>
          </div>
          <div class="profile-text">
            <h2>La technique<br/>avec <em>du sens.</em></h2>
            <div class="profile-copy"><p class="lead">Développeur Fullstack passionné, spécialisé dans la création d’applications web modernes et performantes.</p><p>Fort d’une expérience en gestion de projet et curieux d’apprendre, je mets mes compétences techniques au service de solutions innovantes. J’aime donner vie aux idées, du premier croquis jusqu’à la mise en ligne.</p><div class="profile-tags"><span>Développement web</span><span>Applications mobiles</span><span>Infographie</span><span>Gestion de projet</span></div></div>
          </div>
        </div>
        <div class="stats-row"><div><strong>07<span>+</span></strong><small>ANNÉES D’EXPÉRIENCE<br/>SELON LE CV</small></div><div><strong>03</strong><small>EXPÉRIENCES<br/>PROFESSIONNELLES</small></div><div><strong>10<span>+</span></strong><small>TECHNOLOGIES<br/>MAÎTRISÉES</small></div></div>
      </Motion>

      <Motion tag="section" id="experiences" class="content-section section-shell" :initial="{opacity:0,y:36}" :whileInView="{opacity:1,y:0}" :viewport="{once:true,amount:0.15}" :transition="{duration:0.7,ease:[0.22,1,0.36,1]}">
        <div class="section-label"><span>02 / PARCOURS</span><span>EXPÉRIENCES</span></div>
        <div class="section-heading"><h2>Du concret,<br/><em>depuis 2019.</em></h2><p>Des expériences au croisement du développement, de la conception et de la gestion de projet.</p></div>
        <div class="timeline">
          <Motion v-for="(job,i) in experiences" :key="job.company" tag="article" class="timeline-item" :initial="{opacity:0,x:-18}" :whileInView="{opacity:1,x:0}" :viewport="{once:true,amount:0.3}" :transition="{duration:0.55,delay:i*0.08,ease:[0.22,1,0.36,1]}">
            <div class="timeline-period">{{job.period}}</div>
            <div class="timeline-marker">{{String(i+1).padStart(2,'0')}}</div>
            <div class="timeline-detail"><div class="timeline-title"><h3>{{job.company}}</h3><span>{{i===2?'Stage':'Expérience professionnelle'}}</span></div><p>{{job.role}}</p><small>STACK TECHNIQUE · {{job.stack}}</small></div>
          </Motion>
        </div>
      </Motion>

      <Motion tag="section" id="realisations" class="content-section section-shell projects-section" :initial="{opacity:0,y:36}" :whileInView="{opacity:1,y:0}" :viewport="{once:true,amount:0.12}" :transition="{duration:0.7,ease:[0.22,1,0.36,1]}">
        <div class="section-label"><span>03 / SÉLECTION</span><span>RÉALISATIONS</span></div>
        <div class="section-heading"><h2>Le travail parle<br/><em>de lui-même.</em></h2><p>Quelques liens pour explorer mon univers et mes projets en ligne.</p></div>
        <div class="project-grid">
          <Motion v-for="(project,i) in projects" :key="project.id ?? project.name" tag="article" class="project-card" :initial="{opacity:0,y:28,scale:0.97}" :whileInView="{opacity:1,y:0,scale:1}" :viewport="{once:true,amount:0.2}" :transition="{duration:0.55,delay:i*0.08,ease:[0.22,1,0.36,1]}" :whileHover="{y:-4,transition:{duration:0.25}}">
            <div class="project-top"><span class="project-number">0{{i+1}} / PROJET</span><span class="project-symbol">{{project.icon || 'J'}}</span></div>
            <div class="project-main"><h3>{{project.name}}</h3><p class="project-date"><CalendarDays :size="13"/> {{project.completed_at ? new Date(project.completed_at).toLocaleDateString('fr-FR',{year:'numeric',month:'long'}) : 'Date non précisée'}}</p><div class="stack-list"><span v-for="tech in project.stack" :key="tech">{{tech}}</span></div></div>
            <div class="project-bottom"><a :href="project.url" target="_blank" rel="noreferrer">Explorer le projet <ArrowUpRight :size="17"/></a><div v-if="admin" class="project-admin"><button @click="setProject(project)" aria-label="Modifier"><PencilLine :size="15"/></button><button v-if="project.id" @click="deleteProject(project.id)" aria-label="Supprimer"><X :size="15"/></button></div></div>
          </Motion>
          <Motion v-if="admin" tag="button" class="add-project-card" @click="setProject()" :initial="{opacity:0,scale:0.95}" :whileInView="{opacity:1,scale:1}" :viewport="{once:true}" :transition="{duration:0.5,delay:projects.length*0.08}" :whileHover="{scale:1.02}">
            <Plus :size="25"/><span>Ajouter une réalisation</span>
          </Motion>
        </div>
        <div class="project-note"><span class="barcode-mark">J.</span><p>Chaque projet est une nouvelle occasion<br/>d’apprendre, de construire et d’innover.</p><span class="note-index">CURIOUS BY NATURE ↗</span></div>
      </Motion>

      <Motion tag="section" id="formation" class="content-section section-shell" :initial="{opacity:0,y:36}" :whileInView="{opacity:1,y:0}" :viewport="{once:true,amount:0.15}" :transition="{duration:0.7,ease:[0.22,1,0.36,1]}">
        <div class="section-label"><span>04 / APPRENDRE</span><span>FORMATION</span></div>
        <div class="section-heading"><h2>Apprendre.<br/><em>Construire. Évoluer.</em></h2></div>
        <div class="education-list">
          <Motion v-for="(item,i) in education" :key="item.period" tag="article" class="education-item" :initial="{opacity:0,y:20}" :whileInView="{opacity:1,y:0}" :viewport="{once:true,amount:0.25}" :transition="{duration:0.55,delay:i*0.08,ease:[0.22,1,0.36,1]}">
            <span class="edu-index">0{{i+1}}</span><span class="edu-period">{{item.period}}</span><div><h3>{{item.title}}</h3><p>{{item.place}}</p></div><GraduationCap :size="20" class="edu-icon"/>
          </Motion>
        </div>
      </Motion>

      <Motion tag="section" id="competences" class="content-section section-shell" :initial="{opacity:0,y:36}" :whileInView="{opacity:1,y:0}" :viewport="{once:true,amount:0.15}" :transition="{duration:0.7,ease:[0.22,1,0.36,1]}">
        <div class="section-label"><span>05 / SAVOIR-FAIRE</span><span>COMPÉTENCES</span></div>
        <div class="section-heading"><h2>Une boîte à outils<br/><em>en mouvement.</em></h2><p>Technologies, outils et langues indiqués dans mon CV.</p></div>
        <div class="skills-grid">
          <Motion v-for="(group,i) in skillGroups" :key="group.title" tag="article" class="skill-card" :initial="{opacity:0,y:24}" :whileInView="{opacity:1,y:0}" :viewport="{once:true,amount:0.25}" :transition="{duration:0.55,delay:i*0.08,ease:[0.22,1,0.36,1]}">
            <span class="skill-index">0{{i+1}}</span><h3>{{group.title}}</h3><div class="skill-pills"><span v-for="skill in group.items" :key="skill">{{skill}}</span></div>
          </Motion>
        </div>
        <div class="interest-line"><Heart :size="17"/><span>EN DEHORS DU CODE :</span><p>Football, natation, musique, dessin, basketball et lecture.</p></div>
      </Motion>

      <Motion tag="section" id="contact" class="contact-section section-shell" :initial="{opacity:0,y:36}" :whileInView="{opacity:1,y:0}" :viewport="{once:true,amount:0.15}" :transition="{duration:0.7,ease:[0.22,1,0.36,1]}">
        <div class="section-label"><span>06 / CONTACT</span><span>ET SI ON CRÉAIT ?</span></div>
        <div class="contact-layout"><div><p class="eyebrow"><span class="eyebrow-line"></span> UNE IDÉE EN TÊTE ?</p><h2>Créons quelque<br/><em>chose de grand.</em></h2></div><div class="contact-details"><p>Ouvert aux collaborations, aux idées ambitieuses et aux défis qui font progresser.</p><a class="email-link" href="mailto:junser700@gmail.com">junser700@gmail.com <ArrowUpRight :size="19"/></a><a href="tel:+2250759128035" class="contact-line"><Phone :size="16"/> +225 07 59 12 80 35</a><a href="https://github.com/drikrianjunior" target="_blank" rel="noreferrer" class="contact-line"><Github :size="16"/> github.com/drikrianjunior <ExternalLink :size="13"/></a><p class="license"><CarFront :size="15"/> Permis toute catégorie</p></div></div>
        <footer>
          <span class="footer-logo">J.</span>
          <span>© 2026 CHCJJr. SERI · BY VINCI</span>
          <div class="footer-legal">
            <button type="button" @click="legalOpen='privacy'"><Shield :size="12"/> Confidentialité</button>
            <button type="button" @click="legalOpen='terms'"><ScrollText :size="12"/> Conditions</button>
            <button type="button" @click="go('accueil')">RETOUR EN HAUT ↑</button>
          </div>
        </footer>
      </Motion>
    </main>

    <nav class="dock" aria-label="Navigation principale">
      <button v-for="item in nav" :key="item.id" :class="{selected:activeSection===item.id}" @click="go(item.id)" :aria-label="item.label" :title="item.label"><component :is="item.icon" :size="18"/><span>{{item.label}}</span></button>
      <button v-if="admin" class="dock-admin" @click="setProject()" aria-label="Ajouter une réalisation" title="Ajouter une réalisation"><Plus :size="18"/><span>Ajouter</span></button>
      <button class="dock-legal" @click="legalOpen='privacy'" aria-label="Politique de confidentialité" title="Politique de confidentialité"><Shield :size="17"/><span>Privé</span></button>
      <button class="dock-legal" @click="legalOpen='terms'" aria-label="Conditions d'utilisation" title="Conditions d'utilisation"><ScrollText :size="17"/><span>CGU</span></button>
      <button class="dock-admin" @click="adminOpen=true" aria-label="Espace administrateur" title="Espace administrateur"><LockKeyhole :size="17"/><span>Admin</span></button>
    </nav>

    <Transition name="modal"><div v-if="adminOpen" class="modal-backdrop" @click.self="adminOpen=false"><section class="admin-modal">
      <button class="modal-close" @click="adminOpen=false" aria-label="Fermer"><X :size="20"/></button>
      <template v-if="!admin">
        <div class="modal-mark"><LockKeyhole :size="22"/></div><p class="eyebrow">ZONE SÉCURISÉE</p><h2>Accès <em>administrateur.</em></h2><p class="modal-description">Connectez-vous pour gérer les réalisations du portfolio.</p>
        <form @submit.prevent="login" class="admin-form"><label>Adresse e-mail<input v-model="email" type="email" autocomplete="username" required placeholder="admin@exemple.com"/></label><label>Mot de passe<input v-model="password" type="password" autocomplete="current-password" required placeholder="Votre mot de passe"/></label><p v-if="loginError" class="form-error">{{loginError}}</p><button class="button button-gold submit-button" type="submit">Se connecter <ArrowUpRight :size="16"/></button></form>
        <p class="modal-footnote">Le compte admin se configure côté serveur avec la commande documentée dans README.txt.</p>
      </template>
      <template v-else>
        <div class="modal-mark"><Code2 :size="22"/></div><p class="eyebrow">GESTION DU PORTFOLIO</p><h2>{{editingId?'Modifier':'Ajouter'}} <em>un projet.</em></h2>
        <form @submit.prevent="saveProject" class="admin-form project-form">
          <label>Nom de la réalisation<input v-model="projectForm.name" required placeholder="Nom du projet"/></label>
          <label>Lien de démonstration<input v-model="projectForm.url" type="url" required placeholder="https://..."/></label>
          <div class="form-two"><label>Icône / monogramme<input v-model="projectForm.icon" maxlength="8" placeholder="J"/></label><label>Date de fin<input v-model="projectForm.completed_at" type="date"/></label></div>
          <label>Stack technique <small>(séparée par des virgules)</small><input v-model="stackText" placeholder="Vue.js, Node.js, PostgreSQL"/></label>
          <p v-if="formError" class="form-error">{{formError}}</p><button class="button button-gold submit-button" type="submit" :disabled="saving"><LoaderCircle v-if="saving" class="spin" :size="16"/><Check v-else :size="16"/>{{saving?'Enregistrement…':'Enregistrer la réalisation'}}</button>
        </form>
        <div class="cv-generate-block">
          <button type="button" class="button button-ghost cv-pdf-btn" @click="generateCV" :disabled="generatingPdf || generatingLetter">
            <FileDown :size="16"/> {{ generatingPdf ? 'Génération…' : 'Générer le CV (PDF)' }}
          </button>
          <div class="letter-fields">
            <p class="letter-fields-title">Lettre de motivation</p>
            <label>Poste visé<input v-model="letterJob" type="text" placeholder="Ex. Développeur Fullstack"/></label>
            <label>Nom de l’entreprise<input v-model="letterCompany" type="text" placeholder="Ex. Orange CI"/></label>
            <label>Adresse de l’entreprise<textarea v-model="letterAddress" rows="2" placeholder="Ex. Abidjan, Plateau — ou adresse complète"></textarea></label>
            <button type="button" class="button button-ghost cv-pdf-btn" @click="generateCoverLetter" :disabled="generatingPdf || generatingLetter">
              <FileText :size="16"/> {{ generatingLetter ? 'Génération…' : 'Générer la lettre de motivation (PDF)' }}
            </button>
          </div>
          <p class="cv-hint">Renseignez le poste, l’entreprise et l’adresse, puis générez. Dans la boîte d’impression, choisissez « Enregistrer au format PDF ».</p>
        </div>
        <button class="logout-button" @click="logout">Se déconnecter</button>
      </template>
    </section></div></Transition>

    <Transition name="modal">
      <div v-if="legalOpen" class="modal-backdrop" @click.self="legalOpen=null">
        <section class="admin-modal legal-modal" role="dialog" :aria-labelledby="legalOpen==='privacy'?'legal-privacy-title':'legal-terms-title'">
          <button class="modal-close" @click="legalOpen=null" aria-label="Fermer"><X :size="20"/></button>
          <template v-if="legalOpen==='privacy'">
            <div class="modal-mark"><Shield :size="22"/></div>
            <p class="eyebrow">LÉGAL</p>
            <h2 id="legal-privacy-title">Politique de <em>confidentialité.</em></h2>
            <div class="legal-body">
              <p class="legal-updated">Dernière mise à jour : octobre 2026</p>
              <h3>1. Responsable du traitement</h3>
              <p>Le présent site portfolio est édité par Christ Hervé Charles Joseph Junior Seri (« CHCJJr. SERI »). Pour toute question relative à vos données : <a href="mailto:junser700@gmail.com">junser700@gmail.com</a>.</p>
              <h3>2. Données collectées</h3>
              <p>Ce site peut collecter les données suivantes :</p>
              <ul>
                <li><strong>Espace administrateur</strong> : adresse e-mail et mot de passe (mot de passe haché) pour la gestion des réalisations.</li>
                <li><strong>Contenu éditorial</strong> : informations de réalisations (nom, lien, stack, dates) saisies par l’administrateur.</li>
                <li><strong>Données techniques</strong> : logs éventuels liés à l’hébergement (sécurité et bon fonctionnement).</li>
              </ul>
              <p>Aucune publicité tierce ni outil de tracking marketing n’est intégré par défaut sur ce portfolio.</p>
              <h3>3. Finalités</h3>
              <p>Les données servent uniquement à présenter le portfolio, authentifier l’administrateur, stocker et afficher les réalisations, et assurer la sécurité du service.</p>
              <h3>4. Base légale &amp; conservation</h3>
              <p>Traitement fondé sur l’intérêt légitime (présentation professionnelle) et, pour l’admin, sur un accès restreint. Les données sont conservées tant que le site est en ligne ou jusqu’à suppression par l’administrateur.</p>
              <h3>5. Destinataires &amp; hébergement</h3>
              <p>Les données peuvent être traitées par les prestataires d’hébergement strictement nécessaires. Elles ne sont pas vendues à des tiers.</p>
              <h3>6. Vos droits</h3>
              <p>Vous pouvez demander l’accès, la rectification, l’effacement ou la limitation du traitement de vos données. Contact : <a href="mailto:junser700@gmail.com">junser700@gmail.com</a>.</p>
              <h3>7. Sécurité</h3>
              <p>Mesures raisonnables (HTTPS, hachage des mots de passe, accès admin restreint). Signalez tout incident suspect par e-mail.</p>
              <h3>8. Modifications</h3>
              <p>Cette politique peut être mise à jour. La version en vigueur est celle affichée sur le site.</p>
            </div>
          </template>
          <template v-else>
            <div class="modal-mark"><ScrollText :size="22"/></div>
            <p class="eyebrow">LÉGAL</p>
            <h2 id="legal-terms-title">Conditions d’<em>utilisation.</em></h2>
            <div class="legal-body">
              <p class="legal-updated">Dernière mise à jour : octobre 2026</p>
              <h3>1. Objet</h3>
              <p>Les présentes conditions régissent l’accès et l’utilisation du portfolio en ligne de Christ Hervé Charles Joseph Junior Seri (ci-après « le Site »).</p>
              <h3>2. Accès au Site</h3>
              <p>Le Site est accessible gratuitement (hors coûts de connexion). Une disponibilité continue est recherchée, sans garantie d’absence d’interruption.</p>
              <h3>3. Contenu &amp; propriété intellectuelle</h3>
              <p>Textes, visuels, code et éléments graphiques du Site sont protégés. Toute reproduction non autorisée est interdite, sauf usage privé ou citation courte avec source. Les projets tiers liés restent la propriété de leurs auteurs.</p>
              <h3>4. Utilisation autorisée</h3>
              <p>Il est interdit de perturber le Site, d’accéder à l’espace administrateur sans autorisation, d’extraire massivement les données, ou d’utiliser le Site à des fins illicites.</p>
              <h3>5. Espace administrateur</h3>
              <p>Réservé au titulaire des identifiants. Les actions effectuées avec ces identifiants sont sous sa responsabilité. Les identifiants ne doivent pas être communiqués à des tiers.</p>
              <h3>6. Liens externes</h3>
              <p>Le Site peut contenir des liens vers des sites tiers. L’éditeur n’est pas responsable de leur contenu.</p>
              <h3>7. Limitation de responsabilité</h3>
              <p>Le Site est fourni « en l’état ». L’éditeur ne saurait être tenu responsable des dommages indirects liés à son utilisation, dans les limites permises par la loi.</p>
              <h3>8. Droit applicable</h3>
              <p>Droit ivoirien. Litiges soumis aux juridictions compétentes d’Abidjan, sous réserve des règles d’ordre public.</p>
              <h3>9. Contact</h3>
              <p><a href="mailto:junser700@gmail.com">junser700@gmail.com</a></p>
            </div>
          </template>
          <button type="button" class="button button-gold submit-button" style="margin-top:18px" @click="legalOpen=null">Fermer</button>
        </section>
      </div>
    </Transition>
  </div>
</template>
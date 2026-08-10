(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();class W{constructor(e,t="/"){this.routes=e,this.defaultRoute=t,this.currentRoute=null,this._onRouteChange=null,window.addEventListener("hashchange",()=>this._handleRoute()),window.addEventListener("load",()=>this._handleRoute())}_handleRoute(){const e=window.location.hash.slice(1)||this.defaultRoute,t=this.routes.find(i=>i.path===e);t?(this.currentRoute=t,this._onRouteChange&&this._onRouteChange(t)):this.navigate(this.defaultRoute)}navigate(e){window.location.hash=e}onRouteChange(e){this._onRouteChange=e}getCurrentPath(){return window.location.hash.slice(1)||this.defaultRoute}}function G(s){return`
    <nav class="navbar${s==="/"?" navbar-on-hero":" scrolled"}" id="main-navbar">
      <div class="navbar-inner">
        <a href="#/" class="navbar-brand">
          <img src="/images/icon.png" alt="LoveAll Club" />
          <div class="navbar-brand-text">
            <span class="navbar-brand-name">LoveAll</span>
            <span class="navbar-brand-sub">Open 2026</span>
          </div>
        </a>
        <div class="navbar-links" id="navbar-links">
          ${[{path:"/",label:"Home"},{path:"/schedule",label:"Fixtures"},{path:"/admin",label:"Admin"}].map(i=>`
            <a href="#${i.path}"
               class="navbar-link ${s===i.path?"active":""}${i.path==="/admin"?" navbar-link-admin":""}"
               id="nav-${i.label.toLowerCase()}">
              ${i.label}
            </a>
          `).join("")}
        </div>
        <button class="navbar-mobile-toggle" id="navbar-toggle" aria-label="Toggle navigation">
          <i class='bx bx-menu'></i>
        </button>
      </div>
    </nav>
  `}function O(){const s=document.getElementById("navbar-toggle"),e=document.getElementById("navbar-links"),t=document.getElementById("main-navbar"),i=()=>{t&&t.classList.toggle("scrolled",window.scrollY>24)};i(),window.addEventListener("scroll",i,{passive:!0}),s&&e&&(s.addEventListener("click",()=>{e.classList.toggle("open");const n=s.querySelector("i");n&&(n.className=e.classList.contains("open")?"bx bx-x":"bx bx-menu")}),e.querySelectorAll(".navbar-link").forEach(n=>{n.addEventListener("click",()=>{e.classList.remove("open");const a=s.querySelector("i");a&&(a.className="bx bx-menu")})}))}const A="loveall_tournament_2026",z="loveall2026";function w(){return Date.now().toString(36)+Math.random().toString(36).substring(2,8)}const k={settings:{tournamentName:"LoveAll Open Badminton Tournament 2026",tournamentDate:"16th August, Sunday",tournamentTime:"9:00 AM to 1:00 PM",venue:"Toneup Badminton, opposite Tone up Gym, Muttukkaranchavadi, Thoraipakkam, Greater Chennai",venueShort:"Toneup Badminton, Thoraipakkam",mapsQuery:"Toneup Badminton Thoraipakkam Chennai",shuttles:"Yonex Mavis 350",courts:2,level:"Beginner Level"},categories:{"mens-singles":{id:"mens-singles",name:"Men's Singles",fee:500,feeLabel:"Registration Fee",type:"singles",icon:"🏸",participants:[],groups:[],knockout:{rounds:[]}},"mens-doubles":{id:"mens-doubles",name:"Men's Doubles",fee:750,feeLabel:"Per Team",type:"doubles",icon:"🏸",participants:[],groups:[],knockout:{rounds:[]}},"mixed-doubles":{id:"mixed-doubles",name:"Mixed Doubles",fee:750,feeLabel:"Per Team",type:"doubles",icon:"🏸",participants:[],groups:[],knockout:{rounds:[]}}}};class Y{constructor(){this._listeners={},this._data=null,this.load()}load(){try{const e=localStorage.getItem(A);if(e){this._data=JSON.parse(e);for(const t of Object.keys(k.categories))if(!this._data.categories[t])this._data.categories[t]=JSON.parse(JSON.stringify(k.categories[t]));else{const i=k.categories[t],n=this._data.categories[t];n.knockout||(n.knockout={rounds:[]}),n.groups||(n.groups=[]),n.participants||(n.participants=[]),n.icon||(n.icon=i.icon)}if(!this._data.settings)this._data.settings=JSON.parse(JSON.stringify(k.settings));else{const t=k.settings;for(const i of Object.keys(t))(this._data.settings[i]===void 0||this._data.settings[i]===null)&&(this._data.settings[i]=t[i])}}else this._data=JSON.parse(JSON.stringify(k))}catch(e){console.error("Failed to load store data:",e),this._data=JSON.parse(JSON.stringify(k))}}save(){try{localStorage.setItem(A,JSON.stringify(this._data))}catch(e){console.error("Failed to save store data:",e)}}reset(){this._data=JSON.parse(JSON.stringify(k)),this.save(),this.emit("change")}checkPassword(e){return e===z}getSettings(){return this._data.settings}updateSettings(e){Object.assign(this._data.settings,e),this.save(),this.emit("change")}getCategories(){return this._data.categories}getCategory(e){return this._data.categories[e]}getCategoryIds(){return Object.keys(this._data.categories)}getParticipants(e){var t;return((t=this._data.categories[e])==null?void 0:t.participants)||[]}addParticipant(e,t){const i=this._data.categories[e];if(!i)return null;const n={id:w(),...t};return i.participants.push(n),this.save(),this.emit("change"),n}removeParticipant(e,t){const i=this._data.categories[e];i&&(i.participants=i.participants.filter(n=>n.id!==t),this.save(),this.emit("change"))}getParticipantById(e,t){const i=this._data.categories[e];return i&&i.participants.find(n=>n.id===t)||null}getGroups(e){var t;return((t=this._data.categories[e])==null?void 0:t.groups)||[]}generateGroups(e,t=4){const i=this._data.categories[e];if(!i||i.participants.length<2)return;const n=[...i.participants].sort(()=>Math.random()-.5),a=Math.ceil(n.length/t),o=[];for(let r=0;r<a;r++)o.push({id:w(),name:`Group ${String.fromCharCode(65+r)}`,participantIds:[],matches:[]});n.forEach((r,c)=>{const l=c%a;o[l].participantIds.push(r.id)}),i.groups=o,this._generateRoundRobinMatches(e),this.save(),this.emit("change")}clearGroups(e){const t=this._data.categories[e];t&&(t.groups=[],t.knockout={rounds:[]},this.save(),this.emit("change"))}_generateRoundRobinMatches(e){const t=this._data.categories[e];if(t)for(const i of t.groups){const n=i.participantIds,a=[];let o=1;for(let r=0;r<n.length;r++)for(let c=r+1;c<n.length;c++)a.push({id:w(),matchNumber:o++,player1Id:n[r],player2Id:n[c],score1:null,score2:null,winner:null,status:"upcoming"});i.matches=a}}getGroupMatches(e,t){const i=this._data.categories[e];if(!i)return[];const n=i.groups.find(a=>a.id===t);return n?n.matches:[]}updateMatchScore(e,t,i,n,a){const o=this._data.categories[e];if(!o)return;const r=o.groups.find(l=>l.id===t);if(!r)return;const c=r.matches.find(l=>l.id===i);c&&(c.score1=parseInt(n),c.score2=parseInt(a),c.status="completed",c.score1>c.score2?c.winner=c.player1Id:c.score2>c.score1?c.winner=c.player2Id:c.winner=null,this.save(),this.emit("change"))}setMatchLive(e,t,i){const n=this._data.categories[e];if(!n)return;const a=n.groups.find(r=>r.id===t);if(!a)return;const o=a.matches.find(r=>r.id===i);o&&(o.status="live",this.save(),this.emit("change"))}resetMatch(e,t,i){const n=this._data.categories[e];if(!n)return;const a=n.groups.find(r=>r.id===t);if(!a)return;const o=a.matches.find(r=>r.id===i);o&&(o.score1=null,o.score2=null,o.winner=null,o.status="upcoming",this.save(),this.emit("change"))}getGroupStandings(e,t){const i=this._data.categories[e];if(!i)return[];const n=i.groups.find(o=>o.id===t);if(!n)return[];const a={};for(const o of n.participantIds)a[o]={participantId:o,played:0,won:0,lost:0,drawn:0,pointsFor:0,pointsAgainst:0,points:0};for(const o of n.matches){if(o.status!=="completed")continue;const r=a[o.player1Id],c=a[o.player2Id];!r||!c||(r.played++,c.played++,r.pointsFor+=o.score1||0,r.pointsAgainst+=o.score2||0,c.pointsFor+=o.score2||0,c.pointsAgainst+=o.score1||0,o.winner===o.player1Id?(r.won++,r.points+=2,c.lost++):o.winner===o.player2Id?(c.won++,c.points+=2,r.lost++):(r.drawn++,c.drawn++,r.points+=1,c.points+=1))}return Object.values(a).sort((o,r)=>{if(r.points!==o.points)return r.points-o.points;const c=o.pointsFor-o.pointsAgainst,l=r.pointsFor-r.pointsAgainst;return l!==c?l-c:r.pointsFor-o.pointsFor})}getKnockout(e){var t;return((t=this._data.categories[e])==null?void 0:t.knockout)||{rounds:[]}}generateKnockout(e,t=2){var u,g;const i=this._data.categories[e];if(!i||i.groups.length===0)return;const n=[];for(const p of i.groups){const L=this.getGroupStandings(e,p.id).slice(0,t);for(const B of L)n.push({participantId:B.participantId,groupName:p.name,seed:n.length+1})}if(n.length<2)return;const a=this._seedBracket(n,i.groups.length,t),o=[];let r=[];for(let p=0;p<a.length;p+=2)r.push({id:w(),matchNumber:r.length+1,player1Id:((u=a[p])==null?void 0:u.participantId)||null,player2Id:((g=a[p+1])==null?void 0:g.participantId)||null,score1:null,score2:null,winner:null,status:"upcoming"});for(const p of r)p.player1Id&&!p.player2Id?(p.winner=p.player1Id,p.status="completed",p.score1=0,p.score2=0):!p.player1Id&&p.player2Id&&(p.winner=p.player2Id,p.status="completed",p.score1=0,p.score2=0);const c=this._getRoundNames(r.length);o.push({name:c[0]||"Round 1",matches:r});let l=Math.ceil(r.length/2),m=1;for(;l>=1;){const p=[];for(let b=0;b<l;b++)p.push({id:w(),matchNumber:b+1,player1Id:null,player2Id:null,score1:null,score2:null,winner:null,status:"upcoming"});if(o.push({name:c[m]||`Round ${m+1}`,matches:p}),l=Math.ceil(l/2),m++,l<1)break}i.knockout={rounds:o},this.save(),this.emit("change")}_seedBracket(e,t,i){if(e.length<=1)return e;const n=[...e],a=Math.pow(2,Math.ceil(Math.log2(n.length)));for(;n.length<a;)n.push({participantId:null,groupName:"BYE",seed:n.length+1});return n}_getRoundNames(e){const t=Math.ceil(Math.log2(e))+1,i=[];for(let n=t;n>=1;n--)n===1?i.unshift("Final"):n===2?i.unshift("Semi Finals"):n===3?i.unshift("Quarter Finals"):i.unshift(`Round of ${Math.pow(2,n)}`);return i}updateKnockoutMatch(e,t,i,n,a){const o=this._data.categories[e];if(!o)return;const r=o.knockout.rounds[t];if(!r)return;const c=r.matches.find(l=>l.id===i);if(c){if(c.score1=parseInt(n),c.score2=parseInt(a),c.status="completed",c.score1>c.score2?c.winner=c.player1Id:c.score2>c.score1&&(c.winner=c.player2Id),c.winner&&t+1<o.knockout.rounds.length){const l=o.knockout.rounds[t+1],m=r.matches.indexOf(c),u=Math.floor(m/2),g=m%2===0;l.matches[u]&&(g?l.matches[u].player1Id=c.winner:l.matches[u].player2Id=c.winner)}this.save(),this.emit("change")}}clearKnockout(e){const t=this._data.categories[e];t&&(t.knockout={rounds:[]},this.save(),this.emit("change"))}exportData(){return JSON.stringify(this._data,null,2)}importData(e){try{const t=JSON.parse(e);return t.categories&&t.settings?(this._data=t,this.save(),this.emit("change"),!0):!1}catch(t){return console.error("Import failed:",t),!1}}on(e,t){this._listeners[e]||(this._listeners[e]=[]),this._listeners[e].push(t)}off(e,t){this._listeners[e]&&(this._listeners[e]=this._listeners[e].filter(i=>i!==t))}emit(e,t){this._listeners[e]&&this._listeners[e].forEach(i=>i(t))}}const d=new Y;function P(s=document){s.querySelectorAll("[data-stagger]").forEach(i=>{[...i.children].forEach((n,a)=>{n.style.setProperty("--stagger",`${a*70}ms`),n.hasAttribute("data-reveal")||n.setAttribute("data-reveal","")})});const e=s.querySelectorAll("[data-reveal]");if(e.length&&"IntersectionObserver"in window){const i=new IntersectionObserver(n=>{n.forEach(a=>{a.isIntersecting&&(a.target.classList.add("is-visible"),i.unobserve(a.target))})},{threshold:.12,rootMargin:"0px 0px -36px 0px"});e.forEach(n=>{const a=n.style.getPropertyValue("--stagger");a&&n.style.setProperty("--reveal-delay",a),i.observe(n)})}else e.forEach(i=>i.classList.add("is-visible"));const t=s.querySelector("[data-parallax]");if(t){const i=()=>{const n=Math.min(window.scrollY*.28,140);t.style.transform=`translate3d(0, ${n}px, 0) scale(1.06)`};i(),window.addEventListener("scroll",i,{passive:!0})}}function V(s){s&&(s.classList.remove("page-enter"),s.offsetWidth,s.classList.add("page-enter"))}function Q(s){return`https://maps.google.com/maps?q=${encodeURIComponent(s||"Toneup Badminton Thoraipakkam Chennai")}&z=15&output=embed`}function X(s){return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s||"Toneup Badminton Thoraipakkam Chennai")}`}function Z(){const s=d.getSettings(),e=d.getCategories(),t=Object.values(e),i=t.reduce((o,r)=>o+r.participants.length,0);let n=0,a=0;for(const o of t)for(const r of o.groups||[])for(const c of r.matches||[])c.status==="live"&&n++,c.status==="upcoming"&&a++;return`
    <div class="page" id="home-page">
      <section class="hero">
        <div class="hero-media" data-parallax aria-hidden="true">
          <img src="/images/poster.png" alt="" class="hero-img" />
          <div class="hero-veil"></div>
        </div>
        <div class="hero-content">
          <img src="/images/icon.png" alt="LoveAll Club" class="hero-mark" />
          <p class="hero-brand">LoveAll Club</p>
          <h1 class="hero-title">LoveAll Open</h1>
          <p class="hero-lede">Badminton tournament — ${s.tournamentDate}</p>
          <div class="hero-cta">
            <a href="#/schedule" class="btn btn-accent btn-lg">View fixtures</a>
            <button type="button" class="btn btn-ghost-light btn-lg" id="btn-scroll-venue">Find the venue</button>
          </div>
        </div>
        <div class="hero-scroll" aria-hidden="true">
          <span></span>
        </div>
      </section>

      <div class="page-content">
        <section class="section event-strip" data-reveal>
          <div class="event-strip-grid">
            <div>
              <p class="eyebrow">When</p>
              <h2 class="event-strip-value">${s.tournamentDate}</h2>
              <p class="muted">${s.tournamentTime}</p>
            </div>
            <div>
              <p class="eyebrow">Where</p>
              <h2 class="event-strip-value">${s.venueShort||"Toneup Badminton"}</h2>
              <p class="muted">${s.courts} courts · ${s.shuttles}</p>
            </div>
            <div>
              <p class="eyebrow">Level</p>
              <h2 class="event-strip-value">${s.level||"Beginner"}</h2>
              <p class="muted">${i} registered · ${a+n} fixtures</p>
            </div>
          </div>
        </section>

        <section class="section" id="details" data-reveal>
          <div class="section-intro">
            <p class="eyebrow">Event details</p>
            <h2 class="section-heading">Everything you need for match day</h2>
            <p class="section-copy">Date, timing, shuttle, and court setup — updated by the organisers.</p>
          </div>
          <div class="detail-rail" data-stagger>
            <article class="detail-block">
              <span class="detail-label">Date</span>
              <strong>${s.tournamentDate}</strong>
            </article>
            <article class="detail-block">
              <span class="detail-label">Time</span>
              <strong>${s.tournamentTime}</strong>
            </article>
            <article class="detail-block">
              <span class="detail-label">Shuttles</span>
              <strong>${s.shuttles}</strong>
            </article>
            <article class="detail-block">
              <span class="detail-label">Courts</span>
              <strong>${s.courts} courts</strong>
            </article>
          </div>
        </section>

        <section class="section venue-section" id="venue" data-reveal>
          <div class="section-intro">
            <p class="eyebrow">Venue</p>
            <h2 class="section-heading">Find us on the map</h2>
            <p class="section-copy">${s.venue}</p>
          </div>
          <div class="venue-layout">
            <div class="venue-map-wrap">
              <iframe
                class="venue-map"
                title="Venue map — ${s.venueShort||"Toneup Badminton"}"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                src="${Q(s.mapsQuery)}"
              ></iframe>
            </div>
            <div class="venue-aside">
              <h3>${s.venueShort||"Toneup Badminton"}</h3>
              <p>${s.venue}</p>
              <a class="btn btn-outline" href="${X(s.mapsQuery)}" target="_blank" rel="noopener">
                Open in Google Maps
              </a>
            </div>
          </div>
        </section>

        <section class="section" data-reveal>
          <div class="section-intro">
            <p class="eyebrow">Categories</p>
            <h2 class="section-heading">Three ways to play</h2>
            <p class="section-copy">Pick your event — fees listed below.</p>
          </div>
          <div class="category-list" data-stagger>
            ${t.map(o=>`
              <div class="category-row">
                <div>
                  <h3>${o.name}</h3>
                  <p class="muted">${o.participants.length} registered · ${o.feeLabel}</p>
                </div>
                <div class="category-fee">₹${o.fee}</div>
              </div>
            `).join("")}
          </div>
        </section>

        <section class="section fixtures-teaser" data-reveal>
          <div class="fixtures-teaser-inner">
            <div>
              <p class="eyebrow">Fixtures</p>
              <h2 class="section-heading">Match schedule goes live here</h2>
              <p class="section-copy">
                ${n>0?`${n} match${n===1?"":"es"} live right now — scores update as play happens.`:a>0?`${a} fixtures scheduled. Check the full board for groups and knockouts.`:"Once the admin publishes the draw, every group match and knockout fixture appears on the schedule."}
              </p>
            </div>
            <a href="#/schedule" class="btn btn-accent btn-lg">Open schedule</a>
          </div>
        </section>

        <section class="section" data-reveal>
          <div class="section-intro">
            <p class="eyebrow">Format</p>
            <h2 class="section-heading">Group stage, then knockout</h2>
          </div>
          <ol class="format-timeline">
            <li>
              <span class="format-num">01</span>
              <div>
                <h3>Group stage</h3>
                <p>Round-robin within each group — every player meets every other player.</p>
              </div>
            </li>
            <li>
              <span class="format-num">02</span>
              <div>
                <h3>Knockout</h3>
                <p>Top finishers advance. Win and stay in — lose and you're out.</p>
              </div>
            </li>
            <li>
              <span class="format-num">03</span>
              <div>
                <h3>Finals</h3>
                <p>Championship cups for 1st, 2nd &amp; 3rd across all categories.</p>
              </div>
            </li>
          </ol>
        </section>

        <section class="section" data-reveal>
          <div class="section-intro">
            <p class="eyebrow">Rewards</p>
            <h2 class="section-heading">Medals, certificates &amp; cups</h2>
          </div>
          <ul class="reward-list">
            <li>Participation medal for every player</li>
            <li>Certificates for all participants</li>
            <li>Championship cups — 1st, 2nd &amp; 3rd in each category</li>
            <li>Refreshments on the day</li>
          </ul>
        </section>

        <section class="section" data-reveal>
          <div class="section-intro">
            <p class="eyebrow">Contact</p>
            <h2 class="section-heading">Talk to the organisers</h2>
          </div>
          <div class="contact-list">
            <a href="https://wa.me/916380243702" target="_blank" rel="noopener" class="contact-link">
              <span class="contact-name">Priyan</span>
              <span class="contact-phone">6380243702</span>
            </a>
            <a href="https://wa.me/919962131645" target="_blank" rel="noopener" class="contact-link">
              <span class="contact-name">Hithesh</span>
              <span class="contact-phone">9962131645</span>
            </a>
          </div>
        </section>

        <footer class="footer">
          <img src="/images/icon.png" alt="LoveAll Club" class="footer-logo" />
          <p class="footer-text">Organised by <span class="footer-brand">LoveAll Club</span></p>
          <p class="footer-copyright">© ${new Date().getFullYear()} LoveAll Club</p>
        </footer>
      </div>
    </div>
  `}function ee(){var s;P(document.getElementById("home-page")||document),(s=document.getElementById("btn-scroll-venue"))==null||s.addEventListener("click",()=>{var e;(e=document.getElementById("venue"))==null||e.scrollIntoView({behavior:"smooth",block:"start"})})}function D(s,e,t=2){const i=d.getGroupStandings(s,e);return i.length===0?'<p class="text-muted" style="padding: var(--space-md);">No matches played yet</p>':`
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th class="rank-cell">#</th>
            <th>Player / Team</th>
            <th class="score-cell">P</th>
            <th class="score-cell">W</th>
            <th class="score-cell">L</th>
            <th class="score-cell">D</th>
            <th class="score-cell">PF</th>
            <th class="score-cell">PA</th>
            <th class="score-cell">PTS</th>
          </tr>
        </thead>
        <tbody>
          ${i.map((n,a)=>{const o=d.getParticipantById(s,n.participantId),r=o?o.teamName||o.name:"Unknown",c=a<t;return`
              <tr>
                <td class="rank-cell ${c?"top":""}">${a+1}</td>
                <td class="player-cell">${r}${c?' <span style="color: var(--color-accent); font-size: 0.75rem;">▲</span>':""}</td>
                <td class="score-cell">${n.played}</td>
                <td class="score-cell">${n.won}</td>
                <td class="score-cell">${n.lost}</td>
                <td class="score-cell">${n.drawn}</td>
                <td class="score-cell">${n.pointsFor}</td>
                <td class="score-cell">${n.pointsAgainst}</td>
                <td class="score-cell" style="color: var(--color-accent); font-weight: 800;">${n.points}</td>
              </tr>
            `}).join("")}
        </tbody>
      </table>
    </div>
  `}function I(s,e,t={}){const{showGroup:i=!1,groupName:n="",isAdmin:a=!1,groupId:o=""}=t,r=d.getParticipantById(s,e.player1Id),c=d.getParticipantById(s,e.player2Id),l=r?r.teamName||r.name:"TBD",m=c?c.teamName||c.name:"TBD",u={upcoming:'<span class="badge badge-upcoming">Upcoming</span>',live:'<span class="badge badge-live">● Live</span>',completed:'<span class="badge badge-completed">Completed</span>'}[e.status]||"",g=e.status==="completed",p=g&&e.winner===e.player1Id,b=g&&e.winner===e.player2Id;return`
    <div class="match-card" id="match-${e.id}">
      <div class="match-card-header">
        <span class="match-card-meta">${i&&n?n+" · ":""}Match ${e.matchNumber}</span>
        ${u}
      </div>
      <div class="match-card-players">
        <div class="match-player ${p?"winner":""}">
          <span class="match-player-name">${l}</span>
          <span class="match-player-score">${e.score1!==null?e.score1:"-"}</span>
        </div>
        <div class="match-vs">VS</div>
        <div class="match-player ${b?"winner":""}">
          <span class="match-player-name">${m}</span>
          <span class="match-player-score">${e.score2!==null?e.score2:"-"}</span>
        </div>
      </div>
      ${a&&e.player1Id&&e.player2Id?`
        <div style="margin-top: var(--space-md); display: flex; gap: var(--space-sm); justify-content: flex-end;">
          ${e.status==="upcoming"?`
            <button class="btn btn-sm btn-outline" onclick="window.setMatchLive('${s}', '${o}', '${e.id}')">Set Live</button>
          `:""}
          ${e.status!=="completed"?`
            <button class="btn btn-sm btn-primary" onclick="window.openScoreModal('${s}', '${o}', '${e.id}')">Enter Score</button>
          `:`
            <button class="btn btn-sm btn-outline" onclick="window.resetMatchScore('${s}', '${o}', '${e.id}')">Reset</button>
          `}
        </div>
      `:""}
    </div>
  `}function F(s,e=!1){const t=d.getKnockout(s);return!t.rounds||t.rounds.length===0?`
      <div class="empty-state">
        <div class="empty-state-icon"><i class='bx bx-trophy'></i></div>
        <div class="empty-state-title">No Knockout Stage Yet</div>
        <div class="empty-state-text">The knockout bracket will appear here once generated from group stage results.</div>
      </div>
    `:`
    <div class="bracket-container">
      <div class="bracket">
        ${t.rounds.map((i,n)=>`
          <div class="bracket-round">
            <div class="bracket-round-title">${i.name}</div>
            ${i.matches.map(a=>{const o=a.player1Id?d.getParticipantById(s,a.player1Id):null,r=a.player2Id?d.getParticipantById(s,a.player2Id):null,c=o?o.teamName||o.name:"TBD",l=r?r.teamName||r.name:"TBD",m=a.status==="completed"&&a.winner===a.player1Id,u=a.status==="completed"&&a.winner===a.player2Id;return`
                <div class="bracket-match" id="ko-match-${a.id}">
                  <div class="bracket-player ${m?"winner":""}">
                    <span class="bracket-player-name ${o?"":"tbd"}">${c}</span>
                    <span class="bracket-player-score">${a.score1!==null?a.score1:""}</span>
                  </div>
                  <div class="bracket-player ${u?"winner":""}">
                    <span class="bracket-player-name ${r?"":"tbd"}">${l}</span>
                    <span class="bracket-player-score">${a.score2!==null?a.score2:""}</span>
                  </div>
                  ${e&&a.player1Id&&a.player2Id&&a.status!=="completed"?`
                    <div style="padding: 6px 10px; border-top: 1px solid var(--border-subtle);">
                      <button class="btn btn-sm btn-primary w-full" 
                              onclick="window.openKnockoutScoreModal('${s}', ${n}, '${a.id}')">
                        Enter Score
                      </button>
                    </div>
                  `:""}
                  ${e&&a.status==="completed"?`
                    <div style="padding: 6px 10px; border-top: 1px solid var(--border-subtle); text-align: center;">
                      <span class="badge badge-completed">✓ Complete</span>
                    </div>
                  `:""}
                </div>
              `}).join("")}
          </div>
        `).join("")}
      </div>
    </div>
  `}let E="mens-singles";function te(){const s=d.getSettings(),e=d.getCategories();return`
    <div class="page" id="schedule-page">
      <header class="page-hero">
        <div class="page-hero-inner">
          <p class="eyebrow">Fixtures</p>
          <h1 class="page-title">Match schedule</h1>
          <p class="page-subtitle">${s.tournamentDate} · ${s.venueShort||"Toneup Badminton"}</p>
        </div>
      </header>

      <div class="page-content">
        <div class="tabs" id="schedule-tabs" role="tablist">
          ${Object.values(e).map(t=>`
            <button class="tab ${t.id===E?"active":""}"
                    data-category="${t.id}"
                    role="tab"
                    aria-selected="${t.id===E}"
                    id="schedule-tab-${t.id}">
              ${t.name}
            </button>
          `).join("")}
        </div>

        <div id="schedule-content">
          ${j(E)}
        </div>

        <footer class="footer">
          <img src="/images/icon.png" alt="LoveAll Club" class="footer-logo" />
          <p class="footer-text">Organised by <span class="footer-brand">LoveAll Club</span></p>
          <p class="footer-copyright">© ${new Date().getFullYear()} LoveAll Club</p>
        </footer>
      </div>
    </div>
  `}function j(s){const e=d.getCategory(s);if(!e)return"";const t=d.getGroups(s),i=d.getKnockout(s),n=t.length>0,a=i.rounds&&i.rounds.length>0;if(!n&&!a)return`
      <div class="empty-state" data-reveal>
        <div class="empty-state-title">Fixtures coming soon</div>
        <div class="empty-state-text">
          The ${e.name} draw hasn’t been published yet. Check back once the admin releases the schedule.
        </div>
      </div>
    `;let o="";if(n){o+=`
      <section class="section" data-reveal>
        <div class="section-intro">
          <p class="eyebrow">Standings</p>
          <h2 class="section-heading">Group stage</h2>
        </div>
        <div class="groups-grid">
          ${t.map(c=>`
            <div class="group-card">
              <div class="group-card-header">
                <span class="group-name">${c.name}</span>
                <span class="group-count">${c.participantIds.length} players</span>
              </div>
              ${D(s,c.id)}
            </div>
          `).join("")}
        </div>
      </section>
    `;const r=[];for(const c of t)for(const l of c.matches)r.push({match:l,groupName:c.name,groupId:c.id});if(r.length>0){const c=r.filter(u=>u.match.status==="live"),l=r.filter(u=>u.match.status==="upcoming"),m=r.filter(u=>u.match.status==="completed");o+=`
        <section class="section" data-reveal>
          <div class="section-intro">
            <p class="eyebrow">Fixtures</p>
            <h2 class="section-heading">Matches</h2>
          </div>
      `,c.length>0&&(o+=`
          <h3 class="match-band-title live">
            <span class="live-dot"></span> Live now
          </h3>
          <div class="match-grid match-grid-live">
            ${c.map(u=>I(s,u.match,{showGroup:!0,groupName:u.groupName})).join("")}
          </div>
        `),l.length>0&&(o+=`
          <h3 class="match-band-title">Upcoming</h3>
          <div class="match-grid">
            ${l.map(u=>I(s,u.match,{showGroup:!0,groupName:u.groupName})).join("")}
          </div>
        `),m.length>0&&(o+=`
          <h3 class="match-band-title">Completed</h3>
          <div class="match-grid">
            ${m.map(u=>I(s,u.match,{showGroup:!0,groupName:u.groupName})).join("")}
          </div>
        `),o+="</section>"}}return a&&(o+=`
      <section class="section" data-reveal>
        <div class="section-intro">
          <p class="eyebrow">Knockout</p>
          <h2 class="section-heading">Bracket</h2>
        </div>
        ${F(s,!1)}
      </section>
    `),o}function se(){const s=document.querySelectorAll("#schedule-tabs .tab");s.forEach(e=>{e.addEventListener("click",()=>{E=e.dataset.category,s.forEach(i=>{i.classList.remove("active"),i.setAttribute("aria-selected","false")}),e.classList.add("active"),e.setAttribute("aria-selected","true");const t=document.getElementById("schedule-content");t&&(t.innerHTML=j(E),P(t))})}),P(document.getElementById("schedule-page")||document)}let C=null;function _({title:s,content:e,onSubmit:t,submitLabel:i="Save",showCancel:n=!0}){f();const a=document.createElement("div");a.className="modal-overlay",a.id="active-modal-overlay",a.innerHTML=`
    <div class="modal" id="active-modal">
      <div class="modal-header">
        <h3 class="modal-title">${s}</h3>
        <button class="modal-close" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body">
        ${e}
      </div>
      <div class="modal-footer">
        ${n?'<button class="btn btn-outline" id="modal-cancel-btn">Cancel</button>':""}
        ${t?`<button class="btn btn-accent" id="modal-submit-btn">${i}</button>`:""}
      </div>
    </div>
  `,document.body.appendChild(a),C=a,a.querySelector("#modal-close-btn").addEventListener("click",f);const o=a.querySelector("#modal-cancel-btn");o&&o.addEventListener("click",f),a.addEventListener("click",c=>{c.target===a&&f()}),t&&a.querySelector("#modal-submit-btn").addEventListener("click",()=>{t()});const r=c=>{c.key==="Escape"&&(f(),document.removeEventListener("keydown",r))};document.addEventListener("keydown",r),setTimeout(()=>{const c=a.querySelector("input, select, textarea");c&&c.focus()},100)}function f(){C&&(C.remove(),C=null)}function S({title:s,message:e,onConfirm:t,confirmLabel:i="Confirm",danger:n=!1}){_({title:s,content:`<p style="color: var(--text-secondary); line-height: 1.6;">${e}</p>`,onSubmit:()=>{f(),t()},submitLabel:i}),n&&setTimeout(()=>{const a=document.getElementById("modal-submit-btn");a&&(a.className="btn btn-danger")},10)}let x=null;function v(s,e="success",t=3e3){x||(x=document.createElement("div"),x.className="toast-container",document.body.appendChild(x));const i=document.createElement("div");i.className=`toast toast-${e}`,i.textContent=s,x.appendChild(i),setTimeout(()=>{i.style.opacity="0",i.style.transform="translateX(100px)",i.style.transition="all 300ms ease",setTimeout(()=>i.remove(),300)},t)}let M=sessionStorage.getItem("loveall_admin")==="1",y="mens-singles";function K(){if(!M)return ie();const s=d.getCategories();return`
    <div class="page" id="admin-page">
      <header class="page-hero page-hero-compact">
        <div class="page-hero-inner">
          <p class="eyebrow">Admin</p>
          <h1 class="page-title">Tournament control</h1>
          <p class="page-subtitle">Edit event details, publish fixtures, and update scores</p>
        </div>
      </header>

      <div class="page-content">
        <div class="admin-toolbar">
          <div class="admin-toolbar-actions">
            <button class="btn btn-outline btn-sm" id="btn-export-data">Export</button>
            <button class="btn btn-outline btn-sm" id="btn-import-data">Import</button>
            <button class="btn btn-danger btn-sm" id="btn-reset-data">Reset all</button>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-logout">Logout</button>
        </div>

        ${ne()}

        <div class="tabs" id="admin-tabs">
          ${Object.values(s).map(e=>`
            <button class="tab ${e.id===y?"active":""}"
                    data-category="${e.id}"
                    id="admin-tab-${e.id}">
              ${e.name}
            </button>
          `).join("")}
        </div>

        <div id="admin-content">
          ${q(y)}
        </div>

        <footer class="footer">
          <img src="/images/icon.png" alt="LoveAll Club" class="footer-logo" />
          <p class="footer-text">Organised by <span class="footer-brand">LoveAll Club</span></p>
          <p class="footer-copyright">© ${new Date().getFullYear()} LoveAll Club</p>
        </footer>
      </div>
    </div>
  `}function ne(){const s=d.getSettings();return`
    <div class="admin-section" id="section-event-details">
      <div class="admin-section-header">
        <div class="admin-section-title">
          <span class="step-number">0</span>
          <span>Event details &amp; venue</span>
        </div>
        <button class="btn btn-accent btn-sm" id="btn-save-settings">Save details</button>
      </div>
      <p class="admin-hint">Only visible to the public after you save. Fixtures are managed per category below.</p>
      <div class="settings-grid">
        <div class="input-group">
          <label class="input-label" for="setting-name">Tournament name</label>
          <input type="text" class="input" id="setting-name" value="${$(s.tournamentName)}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="setting-level">Level</label>
          <input type="text" class="input" id="setting-level" value="${$(s.level||"")}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="setting-date">Date</label>
          <input type="text" class="input" id="setting-date" value="${$(s.tournamentDate)}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="setting-time">Time</label>
          <input type="text" class="input" id="setting-time" value="${$(s.tournamentTime)}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="setting-venue-short">Venue short name</label>
          <input type="text" class="input" id="setting-venue-short" value="${$(s.venueShort||"")}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="setting-shuttles">Shuttles</label>
          <input type="text" class="input" id="setting-shuttles" value="${$(s.shuttles)}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="setting-courts">Courts</label>
          <input type="number" class="input" id="setting-courts" min="1" value="${s.courts??2}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="setting-maps">Maps search query</label>
          <input type="text" class="input" id="setting-maps" value="${$(s.mapsQuery||"")}" placeholder="Toneup Badminton Thoraipakkam" />
        </div>
        <div class="input-group settings-full">
          <label class="input-label" for="setting-venue">Full venue address</label>
          <textarea class="input input-textarea" id="setting-venue" rows="2">${ae(s.venue)}</textarea>
        </div>
      </div>
    </div>
  `}function $(s){return String(s??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}function ae(s){return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function ie(){return`
    <div class="page">
      <div class="password-screen">
        <div class="password-card">
          <img src="/images/icon.png" alt="LoveAll Club" class="password-logo" />
          <h2>Admin access</h2>
          <p>Only organisers can edit event details and publish fixtures.</p>
          <div class="input-group">
            <input type="password" class="input w-full" id="admin-password-input"
                   placeholder="Password" autocomplete="current-password" />
          </div>
          <div id="password-error" class="password-error hidden"></div>
          <button class="btn btn-accent w-full mt-md" id="btn-admin-login">
            Login
          </button>
        </div>
      </div>
    </div>
  `}function q(s){const e=d.getCategory(s);if(!e)return"";let t="";return t+=oe(s,e),t+=re(s),t+=ce(s),t+=le(s),t}function oe(s,e){const t=d.getParticipants(s),i=e.type==="singles";return`
    <div class="admin-section" id="section-participants">
      <div class="admin-section-header">
        <div class="admin-section-title">
          <span class="step-number">1</span>
          <span>Manage Participants (${t.length})</span>
        </div>
        <div class="admin-actions">
          <button class="btn btn-accent btn-sm" id="btn-add-participant">
            <i class='bx bx-plus'></i> Add ${i?"Player":"Team"}
          </button>
        </div>
      </div>

      ${t.length===0?`
        <div class="empty-state" style="padding: var(--space-xl);">
          <div class="empty-state-icon"><i class='bx ${i?"bx-user":"bx-group"}'></i></div>
          <div class="empty-state-title">No ${i?"Players":"Teams"} Yet</div>
          <div class="empty-state-text">Click the button above to add ${i?"players":"teams"} to ${e.name}.</div>
        </div>
      `:`
        <div class="participant-list">
          ${t.map((n,a)=>`
            <div class="participant-item">
              <div class="participant-info">
                <span class="participant-number">${a+1}.</span>
                <div>
                  <div class="participant-name">${n.teamName||n.name}</div>
                  ${!i&&n.player1?`
                    <div class="participant-detail">${n.player1} & ${n.player2||"?"}</div>
                  `:""}
                </div>
              </div>
              <button class="btn btn-icon btn-danger" onclick="window.removeParticipant('${s}', '${n.id}')" title="Remove">
                <i class='bx bx-x'></i>
              </button>
            </div>
          `).join("")}
        </div>
      `}
    </div>
  `}function re(s,e){const t=d.getGroups(s),n=d.getParticipants(s).length>=3;return`
    <div class="admin-section" id="section-groups">
      <div class="admin-section-header">
        <div class="admin-section-title">
          <span class="step-number">2</span>
          <span>Groups (${t.length})</span>
        </div>
        <div class="admin-actions">
          ${t.length===0?`
            <div class="input-row" style="align-items: center;">
              <div class="input-group" style="min-width: 120px;">
                <label class="input-label">Group Size</label>
                <select class="select" id="group-size-select">
                  <option value="3">3 per group</option>
                  <option value="4" selected>4 per group</option>
                  <option value="5">5 per group</option>
                </select>
              </div>
              <button class="btn btn-accent btn-sm" id="btn-generate-groups" ${n?"":"disabled"}>
                <i class='bx bx-shuffle'></i> Generate Groups
              </button>
            </div>
          `:`
            <button class="btn btn-danger btn-sm" id="btn-clear-groups">
              <i class='bx bx-trash'></i> Clear Groups
            </button>
          `}
        </div>
      </div>

      ${!n&&t.length===0?`
        <p class="text-muted" style="text-align: center; padding: var(--space-md);">
          Add at least 3 participants first to generate groups.
        </p>
      `:""}

      ${t.length>0?`
        <div class="groups-grid">
          ${t.map(a=>{const o=a.participantIds.map(r=>d.getParticipantById(s,r)).filter(Boolean);return`
              <div class="group-card">
                <div class="group-card-header">
                  <span class="group-name">${a.name}</span>
                  <span class="group-count">${o.length} players</span>
                </div>
                ${D(s,a.id)}
              </div>
            `}).join("")}
        </div>
      `:""}
    </div>
  `}function ce(s,e){const t=d.getGroups(s);if(t.length===0)return`
      <div class="admin-section" id="section-matches">
        <div class="admin-section-header">
          <div class="admin-section-title">
            <span class="step-number">3</span>
            <span>Group Matches</span>
          </div>
        </div>
        <p class="text-muted" style="text-align: center; padding: var(--space-md);">
          Generate groups first to see matches.
        </p>
      </div>
    `;let i=0,n=0;for(const o of t)i+=o.matches.length,n+=o.matches.filter(r=>r.status==="completed").length;let a=`
    <div class="admin-section" id="section-matches">
      <div class="admin-section-header">
        <div class="admin-section-title">
          <span class="step-number">3</span>
          <span>Group Matches (${n}/${i} completed)</span>
        </div>
      </div>
  `;for(const o of t)a+=`
      <div style="margin-bottom: var(--space-xl);">
        <h3 style="margin-bottom: var(--space-md); color: var(--neon);">${o.name}</h3>
        <div class="match-grid">
          ${o.matches.map(r=>I(s,r,{isAdmin:!0,groupId:o.id})).join("")}
        </div>
      </div>
    `;return a+="</div>",a}function le(s,e){const t=d.getGroups(s),i=d.getKnockout(s),n=i.rounds&&i.rounds.length>0;let a=t.length>0;for(const o of t)if(o.matches.some(r=>r.status!=="completed")){a=!1;break}return`
    <div class="admin-section" id="section-knockout">
      <div class="admin-section-header">
        <div class="admin-section-title">
          <span class="step-number">4</span>
          <span>Knockout Stage</span>
        </div>
        <div class="admin-actions">
          ${!n&&t.length>0?`
            <div class="input-row" style="align-items: center;">
              <div class="input-group" style="min-width: 140px;">
                <label class="input-label">Qualifiers/Group</label>
                <select class="select" id="qualify-count-select">
                  <option value="1">Top 1</option>
                  <option value="2" selected>Top 2</option>
                  <option value="3">Top 3</option>
                </select>
              </div>
              <button class="btn btn-accent btn-sm" id="btn-generate-knockout" ${a?"":'disabled title="Complete all group matches first"'}>
                <i class='bx bx-trophy'></i> Generate Bracket
              </button>
            </div>
          `:""}
          ${n?`
            <button class="btn btn-danger btn-sm" id="btn-clear-knockout">
              <i class='bx bx-trash'></i> Clear Bracket
            </button>
          `:""}
        </div>
      </div>

      ${!a&&!n&&t.length>0?`
        <p class="text-muted" style="text-align: center; padding: var(--space-md);">
          Complete all group stage matches to generate the knockout bracket.
        </p>
      `:""}

      ${t.length===0&&!n?`
        <p class="text-muted" style="text-align: center; padding: var(--space-md);">
          Set up groups and complete group matches first.
        </p>
      `:""}

      ${n?F(s,!0):""}
    </div>
  `}function h(){const s=document.getElementById("admin-content");s&&(s.innerHTML=q(y),H())}function de(){const s=document.getElementById("btn-save-settings");s&&s.addEventListener("click",()=>{var e,t,i,n,a,o,r,c,l,m,u,g,p,b,L,B,T;d.updateSettings({tournamentName:((t=(e=document.getElementById("setting-name"))==null?void 0:e.value)==null?void 0:t.trim())||"",level:((n=(i=document.getElementById("setting-level"))==null?void 0:i.value)==null?void 0:n.trim())||"",tournamentDate:((o=(a=document.getElementById("setting-date"))==null?void 0:a.value)==null?void 0:o.trim())||"",tournamentTime:((c=(r=document.getElementById("setting-time"))==null?void 0:r.value)==null?void 0:c.trim())||"",venueShort:((m=(l=document.getElementById("setting-venue-short"))==null?void 0:l.value)==null?void 0:m.trim())||"",venue:((g=(u=document.getElementById("setting-venue"))==null?void 0:u.value)==null?void 0:g.trim())||"",shuttles:((b=(p=document.getElementById("setting-shuttles"))==null?void 0:p.value)==null?void 0:b.trim())||"",courts:parseInt(((L=document.getElementById("setting-courts"))==null?void 0:L.value)||"2",10)||2,mapsQuery:((T=(B=document.getElementById("setting-maps"))==null?void 0:B.value)==null?void 0:T.trim())||""}),v("Event details saved","success")})}function H(){const s=document.getElementById("btn-add-participant");s&&s.addEventListener("click",()=>ue(y));const e=document.getElementById("btn-generate-groups");e&&e.addEventListener("click",()=>{const a=document.getElementById("group-size-select"),o=parseInt((a==null?void 0:a.value)||"4");d.generateGroups(y,o),v("Groups generated successfully!","success"),h()});const t=document.getElementById("btn-clear-groups");t&&t.addEventListener("click",()=>{S({title:"Clear Groups",message:"This will delete all groups, matches, scores, and the knockout bracket for this category. Are you sure?",onConfirm:()=>{d.clearGroups(y),v("Groups cleared","info"),h()},danger:!0,confirmLabel:"Clear All"})});const i=document.getElementById("btn-generate-knockout");i&&i.addEventListener("click",()=>{const a=document.getElementById("qualify-count-select"),o=parseInt((a==null?void 0:a.value)||"2");d.generateKnockout(y,o),v("Knockout bracket generated!","success"),h()});const n=document.getElementById("btn-clear-knockout");n&&n.addEventListener("click",()=>{S({title:"Clear Knockout",message:"This will remove the entire knockout bracket. Are you sure?",onConfirm:()=>{d.clearKnockout(y),v("Knockout bracket cleared","info"),h()},danger:!0,confirmLabel:"Clear Bracket"})})}function ue(s){const e=d.getCategory(s),t=e.type==="singles";let i;t?i=`
      <div class="input-group">
        <label class="input-label">Player Name</label>
        <input type="text" class="input" id="input-player-name" placeholder="Enter player name" />
      </div>
    `:i=`
      <div class="input-group">
        <label class="input-label">Team Name</label>
        <input type="text" class="input" id="input-team-name" placeholder="Enter team name" />
      </div>
      <div class="input-group">
        <label class="input-label">Player 1</label>
        <input type="text" class="input" id="input-player1" placeholder="Enter player 1 name" />
      </div>
      <div class="input-group">
        <label class="input-label">Player 2</label>
        <input type="text" class="input" id="input-player2" placeholder="Enter player 2 name" />
      </div>
    `,_({title:`Add ${t?"Player":"Team"} — ${e.name}`,content:i,submitLabel:`Add ${t?"Player":"Team"}`,onSubmit:()=>{var n,a,o,r,c,l,m,u;if(t){const g=(a=(n=document.getElementById("input-player-name"))==null?void 0:n.value)==null?void 0:a.trim();if(!g){v("Please enter a player name","error");return}d.addParticipant(s,{name:g}),v(`${g} added!`,"success")}else{const g=(r=(o=document.getElementById("input-team-name"))==null?void 0:o.value)==null?void 0:r.trim(),p=(l=(c=document.getElementById("input-player1"))==null?void 0:c.value)==null?void 0:l.trim(),b=(u=(m=document.getElementById("input-player2"))==null?void 0:m.value)==null?void 0:u.trim();if(!g){v("Please enter a team name","error");return}d.addParticipant(s,{teamName:g,player1:p,player2:b}),v(`${g} added!`,"success")}f(),h()}})}window.removeParticipant=function(s,e){const t=d.getParticipantById(s,e),i=t?t.teamName||t.name:"this participant";S({title:"Remove Participant",message:`Are you sure you want to remove <strong>${i}</strong>?`,onConfirm:()=>{d.removeParticipant(s,e),v(`${i} removed`,"info"),h()},danger:!0,confirmLabel:"Remove"})};window.setMatchLive=function(s,e,t){d.setMatchLive(s,e,t),v("Match set to live!","success"),h()};window.openScoreModal=function(s,e,t){const i=d.getGroups(s).find(l=>l.id===e),n=i==null?void 0:i.matches.find(l=>l.id===t);if(!n)return;const a=d.getParticipantById(s,n.player1Id),o=d.getParticipantById(s,n.player2Id),r=a?a.teamName||a.name:"Player 1",c=o?o.teamName||o.name:"Player 2";_({title:"Enter Score",content:`
      <div class="score-input-group" style="justify-content: center; padding: var(--space-md) 0;">
        <div style="text-align: center;">
          <div style="font-weight: 600; margin-bottom: var(--space-sm); font-size: 0.9rem;">${r}</div>
          <input type="number" class="score-input" id="score-input-1" min="0" max="99" value="${n.score1!==null?n.score1:""}" />
        </div>
        <span class="score-vs">VS</span>
        <div style="text-align: center;">
          <div style="font-weight: 600; margin-bottom: var(--space-sm); font-size: 0.9rem;">${c}</div>
          <input type="number" class="score-input" id="score-input-2" min="0" max="99" value="${n.score2!==null?n.score2:""}" />
        </div>
      </div>
    `,submitLabel:"Save Score",onSubmit:()=>{var u,g;const l=(u=document.getElementById("score-input-1"))==null?void 0:u.value,m=(g=document.getElementById("score-input-2"))==null?void 0:g.value;if(l===""||m===""){v("Please enter both scores","error");return}d.updateMatchScore(s,e,t,l,m),f(),v("Score saved!","success"),h()}})};window.resetMatchScore=function(s,e,t){S({title:"Reset Match",message:"Reset this match score and status?",onConfirm:()=>{d.resetMatch(s,e,t),v("Match reset","info"),h()},confirmLabel:"Reset"})};window.openKnockoutScoreModal=function(s,e,t){const n=d.getKnockout(s).rounds[e],a=n==null?void 0:n.matches.find(m=>m.id===t);if(!a)return;const o=d.getParticipantById(s,a.player1Id),r=d.getParticipantById(s,a.player2Id),c=o?o.teamName||o.name:"Player 1",l=r?r.teamName||r.name:"Player 2";_({title:`${n.name} — Enter Score`,content:`
      <div class="score-input-group" style="justify-content: center; padding: var(--space-md) 0;">
        <div style="text-align: center;">
          <div style="font-weight: 600; margin-bottom: var(--space-sm); font-size: 0.9rem;">${c}</div>
          <input type="number" class="score-input" id="ko-score-1" min="0" max="99" value="" />
        </div>
        <span class="score-vs">VS</span>
        <div style="text-align: center;">
          <div style="font-weight: 600; margin-bottom: var(--space-sm); font-size: 0.9rem;">${l}</div>
          <input type="number" class="score-input" id="ko-score-2" min="0" max="99" value="" />
        </div>
      </div>
      <p class="text-muted" style="text-align: center; font-size: 0.8rem;">Scores cannot be tied in knockout. Winner advances.</p>
    `,submitLabel:"Save Score",onSubmit:()=>{var g,p;const m=(g=document.getElementById("ko-score-1"))==null?void 0:g.value,u=(p=document.getElementById("ko-score-2"))==null?void 0:p.value;if(m===""||u===""){v("Please enter both scores","error");return}if(m===u){v("Knockout matches cannot be a draw!","error");return}d.updateKnockoutMatch(s,e,t,m,u),f(),v("Score saved! Winner advances.","success"),h()}})};function J(){if(!M){const a=document.getElementById("btn-admin-login"),o=document.getElementById("admin-password-input"),r=document.getElementById("password-error"),c=()=>{const l=(o==null?void 0:o.value)||"";if(d.checkPassword(l)){M=!0,sessionStorage.setItem("loveall_admin","1");const m=document.getElementById("app");if(m){const{renderNavbar:u,initNavbar:g}=pe();m.innerHTML=u("/admin")+K(),g(),J()}}else r&&(r.textContent="Incorrect password. Try again.",r.classList.remove("hidden")),o==null||o.classList.add("shake"),setTimeout(()=>o==null?void 0:o.classList.remove("shake"),500)};a&&a.addEventListener("click",c),o&&o.addEventListener("keydown",l=>{l.key==="Enter"&&c()});return}const s=document.querySelectorAll("#admin-tabs .tab");s.forEach(a=>{a.addEventListener("click",()=>{y=a.dataset.category,s.forEach(o=>o.classList.remove("active")),a.classList.add("active"),h()})});const e=document.getElementById("btn-export-data");e&&e.addEventListener("click",()=>{const a=d.exportData(),o=new Blob([a],{type:"application/json"}),r=URL.createObjectURL(o),c=document.createElement("a");c.href=r,c.download=`loveall_tournament_${Date.now()}.json`,c.click(),URL.revokeObjectURL(r),v("Data exported!","success")});const t=document.getElementById("btn-import-data");t&&t.addEventListener("click",()=>{const a=document.createElement("input");a.type="file",a.accept=".json",a.onchange=o=>{const r=o.target.files[0];if(!r)return;const c=new FileReader;c.onload=l=>{d.importData(l.target.result)?(v("Data imported successfully!","success"),h()):v("Invalid data file","error")},c.readAsText(r)},a.click()});const i=document.getElementById("btn-reset-data");i&&i.addEventListener("click",()=>{S({title:"Reset All Data",message:"This will permanently delete ALL tournament data including participants, groups, matches, and scores. This cannot be undone!",onConfirm:()=>{d.reset(),v("All data has been reset","info"),h()},danger:!0,confirmLabel:"Reset Everything"})});const n=document.getElementById("btn-logout");n&&n.addEventListener("click",()=>{M=!1,sessionStorage.removeItem("loveall_admin"),window.dispatchEvent(new HashChangeEvent("hashchange"))}),de(),H()}function pe(){return{renderNavbar:s=>{const{renderNavbar:e}=window.__navbarModule||{};return e?e(s):""},initNavbar:()=>{const{initNavbar:s}=window.__navbarModule||{};s&&s()}}}window.__navbarModule={renderNavbar:G,initNavbar:O};const R=document.getElementById("app"),N=[{path:"/",name:"home",render:Z,init:ee},{path:"/schedule",name:"schedule",render:te,init:se},{path:"/admin",name:"admin",render:K,init:J}],me=new W(N,"/");function U(s){if(!s)return;const e=G(s.path),t=s.render();R.innerHTML=e+t,O(),s.init&&s.init();const i=R.querySelector(".page");V(i),window.scrollTo(0,0)}me.onRouteChange(s=>{U(s)});const ge=window.location.hash.slice(1)||"/",ve=N.find(s=>s.path===ge)||N[0];U(ve);

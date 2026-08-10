(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(s){if(s.ep)return;s.ep=!0;const n=t(s);fetch(s.href,n)}})();class K{constructor(e,t="/"){this.routes=e,this.defaultRoute=t,this.currentRoute=null,this._onRouteChange=null,window.addEventListener("hashchange",()=>this._handleRoute()),window.addEventListener("load",()=>this._handleRoute())}_handleRoute(){const e=window.location.hash.slice(1)||this.defaultRoute,t=this.routes.find(o=>o.path===e);t?(this.currentRoute=t,this._onRouteChange&&this._onRouteChange(t)):this.navigate(this.defaultRoute)}navigate(e){window.location.hash=e}onRouteChange(e){this._onRouteChange=e}getCurrentPath(){return window.location.hash.slice(1)||this.defaultRoute}}function _(i){return`
    <nav class="navbar" id="main-navbar">
      <div class="navbar-inner">
        <a href="#/" class="navbar-brand">
          <img src="/images/icon.png" alt="LoveAll Club" />
          <div class="navbar-brand-text">
            <span class="navbar-brand-name">LoveAll Open</span>
            <span class="navbar-brand-sub">Tournament 2026</span>
          </div>
        </a>
        <div class="navbar-links" id="navbar-links">
          ${[{path:"/",label:"Home",icon:"bx-home-alt"},{path:"/schedule",label:"Schedule",icon:"bx-list-ul"},{path:"/admin",label:"Admin",icon:"bx-cog"}].map(t=>`
            <a href="#${t.path}" 
               class="navbar-link ${i===t.path?"active":""}"
               id="nav-${t.label.toLowerCase()}">
              <i class='bx ${t.icon}'></i>
              <span>${t.label}</span>
            </a>
          `).join("")}
        </div>
        <button class="navbar-mobile-toggle" id="navbar-toggle" aria-label="Toggle navigation">
          <i class='bx bx-menu'></i>
        </button>
      </div>
    </nav>
  `}function B(){const i=document.getElementById("navbar-toggle"),e=document.getElementById("navbar-links");i&&e&&(i.addEventListener("click",()=>{e.classList.toggle("open");const t=i.querySelector("i");t&&(t.className=e.classList.contains("open")?"bx bx-x":"bx bx-menu")}),e.querySelectorAll(".navbar-link").forEach(t=>{t.addEventListener("click",()=>{e.classList.remove("open");const o=i.querySelector("i");o&&(o.className="bx bx-menu")})}))}const I="loveall_tournament_2026",H="loveall2026";function k(){return Date.now().toString(36)+Math.random().toString(36).substring(2,8)}const x={settings:{tournamentName:"LoveAll Open Badminton Tournament 2026",tournamentDate:"16th August, Sunday",tournamentTime:"9:00 AM to 1:00 PM",venue:"Toneup Badminton, opposite Tone up Gym, Muttukkaranchavadi, Thoraipakkam, Greater Chennai",shuttles:"Yonex Mavis 350",courts:2},categories:{"mens-singles":{id:"mens-singles",name:"Men's Singles",fee:500,feeLabel:"Registration Fee",type:"singles",icon:"🏸",participants:[],groups:[],knockout:{rounds:[]}},"mens-doubles":{id:"mens-doubles",name:"Men's Doubles",fee:750,feeLabel:"Per Team",type:"doubles",icon:"🏸",participants:[],groups:[],knockout:{rounds:[]}},"mixed-doubles":{id:"mixed-doubles",name:"Mixed Doubles",fee:750,feeLabel:"Per Team",type:"doubles",icon:"🏸",participants:[],groups:[],knockout:{rounds:[]}}}};class J{constructor(){this._listeners={},this._data=null,this.load()}load(){try{const e=localStorage.getItem(I);if(e){this._data=JSON.parse(e);for(const t of Object.keys(x.categories))if(!this._data.categories[t])this._data.categories[t]=JSON.parse(JSON.stringify(x.categories[t]));else{const o=x.categories[t],s=this._data.categories[t];s.knockout||(s.knockout={rounds:[]}),s.groups||(s.groups=[]),s.participants||(s.participants=[]),s.icon||(s.icon=o.icon)}this._data.settings||(this._data.settings=JSON.parse(JSON.stringify(x.settings)))}else this._data=JSON.parse(JSON.stringify(x))}catch(e){console.error("Failed to load store data:",e),this._data=JSON.parse(JSON.stringify(x))}}save(){try{localStorage.setItem(I,JSON.stringify(this._data))}catch(e){console.error("Failed to save store data:",e)}}reset(){this._data=JSON.parse(JSON.stringify(x)),this.save(),this.emit("change")}checkPassword(e){return e===H}getSettings(){return this._data.settings}updateSettings(e){Object.assign(this._data.settings,e),this.save(),this.emit("change")}getCategories(){return this._data.categories}getCategory(e){return this._data.categories[e]}getCategoryIds(){return Object.keys(this._data.categories)}getParticipants(e){var t;return((t=this._data.categories[e])==null?void 0:t.participants)||[]}addParticipant(e,t){const o=this._data.categories[e];if(!o)return null;const s={id:k(),...t};return o.participants.push(s),this.save(),this.emit("change"),s}removeParticipant(e,t){const o=this._data.categories[e];o&&(o.participants=o.participants.filter(s=>s.id!==t),this.save(),this.emit("change"))}getParticipantById(e,t){const o=this._data.categories[e];return o&&o.participants.find(s=>s.id===t)||null}getGroups(e){var t;return((t=this._data.categories[e])==null?void 0:t.groups)||[]}generateGroups(e,t=4){const o=this._data.categories[e];if(!o||o.participants.length<2)return;const s=[...o.participants].sort(()=>Math.random()-.5),n=Math.ceil(s.length/t),a=[];for(let r=0;r<n;r++)a.push({id:k(),name:`Group ${String.fromCharCode(65+r)}`,participantIds:[],matches:[]});s.forEach((r,c)=>{const l=c%n;a[l].participantIds.push(r.id)}),o.groups=a,this._generateRoundRobinMatches(e),this.save(),this.emit("change")}clearGroups(e){const t=this._data.categories[e];t&&(t.groups=[],t.knockout={rounds:[]},this.save(),this.emit("change"))}_generateRoundRobinMatches(e){const t=this._data.categories[e];if(t)for(const o of t.groups){const s=o.participantIds,n=[];let a=1;for(let r=0;r<s.length;r++)for(let c=r+1;c<s.length;c++)n.push({id:k(),matchNumber:a++,player1Id:s[r],player2Id:s[c],score1:null,score2:null,winner:null,status:"upcoming"});o.matches=n}}getGroupMatches(e,t){const o=this._data.categories[e];if(!o)return[];const s=o.groups.find(n=>n.id===t);return s?s.matches:[]}updateMatchScore(e,t,o,s,n){const a=this._data.categories[e];if(!a)return;const r=a.groups.find(l=>l.id===t);if(!r)return;const c=r.matches.find(l=>l.id===o);c&&(c.score1=parseInt(s),c.score2=parseInt(n),c.status="completed",c.score1>c.score2?c.winner=c.player1Id:c.score2>c.score1?c.winner=c.player2Id:c.winner=null,this.save(),this.emit("change"))}setMatchLive(e,t,o){const s=this._data.categories[e];if(!s)return;const n=s.groups.find(r=>r.id===t);if(!n)return;const a=n.matches.find(r=>r.id===o);a&&(a.status="live",this.save(),this.emit("change"))}resetMatch(e,t,o){const s=this._data.categories[e];if(!s)return;const n=s.groups.find(r=>r.id===t);if(!n)return;const a=n.matches.find(r=>r.id===o);a&&(a.score1=null,a.score2=null,a.winner=null,a.status="upcoming",this.save(),this.emit("change"))}getGroupStandings(e,t){const o=this._data.categories[e];if(!o)return[];const s=o.groups.find(a=>a.id===t);if(!s)return[];const n={};for(const a of s.participantIds)n[a]={participantId:a,played:0,won:0,lost:0,drawn:0,pointsFor:0,pointsAgainst:0,points:0};for(const a of s.matches){if(a.status!=="completed")continue;const r=n[a.player1Id],c=n[a.player2Id];!r||!c||(r.played++,c.played++,r.pointsFor+=a.score1||0,r.pointsAgainst+=a.score2||0,c.pointsFor+=a.score2||0,c.pointsAgainst+=a.score1||0,a.winner===a.player1Id?(r.won++,r.points+=2,c.lost++):a.winner===a.player2Id?(c.won++,c.points+=2,r.lost++):(r.drawn++,c.drawn++,r.points+=1,c.points+=1))}return Object.values(n).sort((a,r)=>{if(r.points!==a.points)return r.points-a.points;const c=a.pointsFor-a.pointsAgainst,l=r.pointsFor-r.pointsAgainst;return l!==c?l-c:r.pointsFor-a.pointsFor})}getKnockout(e){var t;return((t=this._data.categories[e])==null?void 0:t.knockout)||{rounds:[]}}generateKnockout(e,t=2){var p,v;const o=this._data.categories[e];if(!o||o.groups.length===0)return;const s=[];for(const u of o.groups){const F=this.getGroupStandings(e,u.id).slice(0,t);for(const j of F)s.push({participantId:j.participantId,groupName:u.name,seed:s.length+1})}if(s.length<2)return;const n=this._seedBracket(s,o.groups.length,t),a=[];let r=[];for(let u=0;u<n.length;u+=2)r.push({id:k(),matchNumber:r.length+1,player1Id:((p=n[u])==null?void 0:p.participantId)||null,player2Id:((v=n[u+1])==null?void 0:v.participantId)||null,score1:null,score2:null,winner:null,status:"upcoming"});for(const u of r)u.player1Id&&!u.player2Id?(u.winner=u.player1Id,u.status="completed",u.score1=0,u.score2=0):!u.player1Id&&u.player2Id&&(u.winner=u.player2Id,u.status="completed",u.score1=0,u.score2=0);const c=this._getRoundNames(r.length);a.push({name:c[0]||"Round 1",matches:r});let l=Math.ceil(r.length/2),m=1;for(;l>=1;){const u=[];for(let y=0;y<l;y++)u.push({id:k(),matchNumber:y+1,player1Id:null,player2Id:null,score1:null,score2:null,winner:null,status:"upcoming"});if(a.push({name:c[m]||`Round ${m+1}`,matches:u}),l=Math.ceil(l/2),m++,l<1)break}o.knockout={rounds:a},this.save(),this.emit("change")}_seedBracket(e,t,o){if(e.length<=1)return e;const s=[...e],n=Math.pow(2,Math.ceil(Math.log2(s.length)));for(;s.length<n;)s.push({participantId:null,groupName:"BYE",seed:s.length+1});return s}_getRoundNames(e){const t=Math.ceil(Math.log2(e))+1,o=[];for(let s=t;s>=1;s--)s===1?o.unshift("Final"):s===2?o.unshift("Semi Finals"):s===3?o.unshift("Quarter Finals"):o.unshift(`Round of ${Math.pow(2,s)}`);return o}updateKnockoutMatch(e,t,o,s,n){const a=this._data.categories[e];if(!a)return;const r=a.knockout.rounds[t];if(!r)return;const c=r.matches.find(l=>l.id===o);if(c){if(c.score1=parseInt(s),c.score2=parseInt(n),c.status="completed",c.score1>c.score2?c.winner=c.player1Id:c.score2>c.score1&&(c.winner=c.player2Id),c.winner&&t+1<a.knockout.rounds.length){const l=a.knockout.rounds[t+1],m=r.matches.indexOf(c),p=Math.floor(m/2),v=m%2===0;l.matches[p]&&(v?l.matches[p].player1Id=c.winner:l.matches[p].player2Id=c.winner)}this.save(),this.emit("change")}}clearKnockout(e){const t=this._data.categories[e];t&&(t.knockout={rounds:[]},this.save(),this.emit("change"))}exportData(){return JSON.stringify(this._data,null,2)}importData(e){try{const t=JSON.parse(e);return t.categories&&t.settings?(this._data=t,this.save(),this.emit("change"),!0):!1}catch(t){return console.error("Import failed:",t),!1}}on(e,t){this._listeners[e]||(this._listeners[e]=[]),this._listeners[e].push(t)}off(e,t){this._listeners[e]&&(this._listeners[e]=this._listeners[e].filter(o=>o!==t))}emit(e,t){this._listeners[e]&&this._listeners[e].forEach(o=>o(t))}}const d=new J;function q(){const i=d.getSettings(),e=d.getCategories();return`
    <div class="page" id="home-page">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <div class="hero-badge">
            <i class='bx bx-star neon-icon'></i>
            Beginner Level Tournament
          </div>
          <img src="/images/icon.png" alt="LoveAll Club" class="hero-logo" />
          <h1 class="hero-title">LoveAll Open</h1>
          <p class="hero-subtitle">Badminton Tournament 2026</p>
          <div class="hero-date">
            <span class="hero-date-item">
              <i class='bx bx-calendar'></i> ${i.tournamentDate}
            </span>
            <span class="hero-date-item">
              <i class='bx bx-time-five'></i> ${i.tournamentTime}
            </span>
          </div>
          <div class="hero-cta">
            <a href="#/schedule" class="btn btn-accent btn-lg">
              <i class='bx bx-list-ul'></i> View Schedule
            </a>
            <a href="#/schedule" class="btn btn-outline btn-lg" style="border-color: var(--border-neon); color: var(--neon);">
              <i class='bx bx-trophy'></i> View Fixtures
            </a>
          </div>
        </div>
      </section>

      <div class="page-content">
        <!-- Tournament Info -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title"><i class='bx bx-info-circle'></i> Event Details</h2>
            <div class="section-line"></div>
          </div>
          <div class="info-bar">
            <div class="info-item">
              <div class="neon-icon-box">
                <i class='bx bx-calendar'></i>
              </div>
              <div class="info-item-content">
                <span class="info-item-label">Date</span>
                <span class="info-item-value">${i.tournamentDate}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="neon-icon-box">
                <i class='bx bx-time-five'></i>
              </div>
              <div class="info-item-content">
                <span class="info-item-label">Time</span>
                <span class="info-item-value">${i.tournamentTime}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="neon-icon-box">
                <i class='bx bx-map'></i>
              </div>
              <div class="info-item-content">
                <span class="info-item-label">Venue</span>
                <span class="info-item-value">${i.venue}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="neon-icon-box">
                <i class='bx bx-target-lock'></i>
              </div>
              <div class="info-item-content">
                <span class="info-item-label">Shuttles</span>
                <span class="info-item-value">${i.shuttles}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Categories -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title"><i class='bx bx-category'></i> Three Categories</h2>
            <div class="section-line"></div>
          </div>
          <div class="category-grid">
            ${Object.values(e).map(t=>`
              <div class="category-card">
                <div class="category-icon">
                  <i class='bx ${t.type==="singles"?"bx-user":(t.id==="mixed-doubles","bx-group")}'></i>
                </div>
                <h3 class="category-name">${t.name}</h3>
                <div class="category-fee">₹${t.fee}</div>
                <div class="category-fee-label">${t.feeLabel}</div>
                <div style="margin-top: var(--space-md);">
                  <span class="badge badge-neon">
                    ${t.participants.length} Registered
                  </span>
                </div>
              </div>
            `).join("")}
          </div>
        </section>

        <!-- League Tournament Format -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title"><i class='bx bx-git-branch'></i> League Tournament Format</h2>
            <div class="section-line"></div>
          </div>
          <div class="card neon-border" style="max-width: 720px;">
            <div class="format-steps">
              <div class="format-step">
                <div class="format-step-icon">
                  <i class='bx bx-grid-alt'></i>
                </div>
                <div class="format-step-content">
                  <h4>Group Stage</h4>
                  <p>Players are divided into groups. Everyone in a group plays against each other in a round-robin format.</p>
                </div>
              </div>
              <div class="format-step">
                <div class="format-step-icon">
                  <i class='bx bx-trending-up'></i>
                </div>
                <div class="format-step-content">
                  <h4>Knockout Stage</h4>
                  <p>Top players from each group advance to the knockout bracket. Win or go home!</p>
                </div>
              </div>
              <div class="format-step">
                <div class="format-step-icon">
                  <i class='bx bx-trophy'></i>
                </div>
                <div class="format-step-content">
                  <h4>Finals</h4>
                  <p>The best players compete head-to-head for the championship cups!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Prizes -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title"><i class='bx bx-trophy'></i> Prizes & Rewards</h2>
            <div class="section-line"></div>
          </div>
          <div class="prizes-grid">
            <div class="prize-card">
              <div class="prize-icon-box">
                <i class='bx bx-medal'></i>
              </div>
              <div class="prize-text">
                <span class="prize-title">Participation Medal</span>
                <span class="prize-desc">For every participant</span>
              </div>
            </div>
            <div class="prize-card">
              <div class="prize-icon-box">
                <i class='bx bx-certification'></i>
              </div>
              <div class="prize-text">
                <span class="prize-title">Certificates</span>
                <span class="prize-desc">For every participant</span>
              </div>
            </div>
            <div class="prize-card">
              <div class="prize-icon-box">
                <i class='bx bx-trophy'></i>
              </div>
              <div class="prize-text">
                <span class="prize-title">Championship Cups</span>
                <span class="prize-desc">1st, 2nd & 3rd in all categories</span>
              </div>
            </div>
            <div class="prize-card">
              <div class="prize-icon-box">
                <i class='bx bx-drink'></i>
              </div>
              <div class="prize-text">
                <span class="prize-title">Refreshments</span>
                <span class="prize-desc">Will be provided!</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Contact -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title"><i class='bx bx-phone'></i> Contact</h2>
            <div class="section-line"></div>
          </div>
          <div class="contact-grid">
            <a href="https://wa.me/916380243702" target="_blank" class="contact-card" style="text-decoration: none;">
              <div class="contact-icon-box">
                <i class='bx bxl-whatsapp'></i>
              </div>
              <div>
                <div class="contact-name">Priyan</div>
                <div class="contact-phone">6380243702</div>
              </div>
            </a>
            <a href="https://wa.me/919962131645" target="_blank" class="contact-card" style="text-decoration: none;">
              <div class="contact-icon-box">
                <i class='bx bxl-whatsapp'></i>
              </div>
              <div>
                <div class="contact-name">Hithesh</div>
                <div class="contact-phone">9962131645</div>
              </div>
            </a>
          </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
          <img src="/images/icon.png" alt="LoveAll Club" class="footer-logo" />
          <p class="footer-text">
            Organized with <span style="color: var(--color-error);">♥</span> by <span class="footer-brand">LoveAll Club</span>
          </p>
          <p class="footer-copyright">
            © ${new Date().getFullYear()} LoveAll Club. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  `}function W(){}function N(i,e,t=2){const o=d.getGroupStandings(i,e);return o.length===0?'<p class="text-muted" style="padding: var(--space-md);">No matches played yet</p>':`
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
          ${o.map((s,n)=>{const a=d.getParticipantById(i,s.participantId),r=a?a.teamName||a.name:"Unknown",c=n<t;return`
              <tr>
                <td class="rank-cell ${c?"top":""}">${n+1}</td>
                <td class="player-cell">${r}${c?' <span style="color: var(--color-accent); font-size: 0.75rem;">▲</span>':""}</td>
                <td class="score-cell">${s.played}</td>
                <td class="score-cell">${s.won}</td>
                <td class="score-cell">${s.lost}</td>
                <td class="score-cell">${s.drawn}</td>
                <td class="score-cell">${s.pointsFor}</td>
                <td class="score-cell">${s.pointsAgainst}</td>
                <td class="score-cell" style="color: var(--color-accent); font-weight: 800;">${s.points}</td>
              </tr>
            `}).join("")}
        </tbody>
      </table>
    </div>
  `}function L(i,e,t={}){const{showGroup:o=!1,groupName:s="",isAdmin:n=!1,groupId:a=""}=t,r=d.getParticipantById(i,e.player1Id),c=d.getParticipantById(i,e.player2Id),l=r?r.teamName||r.name:"TBD",m=c?c.teamName||c.name:"TBD",p={upcoming:'<span class="badge badge-upcoming">Upcoming</span>',live:'<span class="badge badge-live">● Live</span>',completed:'<span class="badge badge-completed">Completed</span>'}[e.status]||"",v=e.status==="completed",u=v&&e.winner===e.player1Id,y=v&&e.winner===e.player2Id;return`
    <div class="match-card" id="match-${e.id}">
      <div class="match-card-header">
        <span class="match-card-meta">${o&&s?s+" · ":""}Match ${e.matchNumber}</span>
        ${p}
      </div>
      <div class="match-card-players">
        <div class="match-player ${u?"winner":""}">
          <span class="match-player-name">${l}</span>
          <span class="match-player-score">${e.score1!==null?e.score1:"-"}</span>
        </div>
        <div class="match-vs">VS</div>
        <div class="match-player ${y?"winner":""}">
          <span class="match-player-name">${m}</span>
          <span class="match-player-score">${e.score2!==null?e.score2:"-"}</span>
        </div>
      </div>
      ${n&&e.player1Id&&e.player2Id?`
        <div style="margin-top: var(--space-md); display: flex; gap: var(--space-sm); justify-content: flex-end;">
          ${e.status==="upcoming"?`
            <button class="btn btn-sm btn-outline" onclick="window.setMatchLive('${i}', '${a}', '${e.id}')">Set Live</button>
          `:""}
          ${e.status!=="completed"?`
            <button class="btn btn-sm btn-primary" onclick="window.openScoreModal('${i}', '${a}', '${e.id}')">Enter Score</button>
          `:`
            <button class="btn btn-sm btn-outline" onclick="window.resetMatchScore('${i}', '${a}', '${e.id}')">Reset</button>
          `}
        </div>
      `:""}
    </div>
  `}function A(i,e=!1){const t=d.getKnockout(i);return!t.rounds||t.rounds.length===0?`
      <div class="empty-state">
        <div class="empty-state-icon"><i class='bx bx-trophy'></i></div>
        <div class="empty-state-title">No Knockout Stage Yet</div>
        <div class="empty-state-text">The knockout bracket will appear here once generated from group stage results.</div>
      </div>
    `:`
    <div class="bracket-container">
      <div class="bracket">
        ${t.rounds.map((o,s)=>`
          <div class="bracket-round">
            <div class="bracket-round-title">${o.name}</div>
            ${o.matches.map(n=>{const a=n.player1Id?d.getParticipantById(i,n.player1Id):null,r=n.player2Id?d.getParticipantById(i,n.player2Id):null,c=a?a.teamName||a.name:"TBD",l=r?r.teamName||r.name:"TBD",m=n.status==="completed"&&n.winner===n.player1Id,p=n.status==="completed"&&n.winner===n.player2Id;return`
                <div class="bracket-match" id="ko-match-${n.id}">
                  <div class="bracket-player ${m?"winner":""}">
                    <span class="bracket-player-name ${a?"":"tbd"}">${c}</span>
                    <span class="bracket-player-score">${n.score1!==null?n.score1:""}</span>
                  </div>
                  <div class="bracket-player ${p?"winner":""}">
                    <span class="bracket-player-name ${r?"":"tbd"}">${l}</span>
                    <span class="bracket-player-score">${n.score2!==null?n.score2:""}</span>
                  </div>
                  ${e&&n.player1Id&&n.player2Id&&n.status!=="completed"?`
                    <div style="padding: 6px 10px; border-top: 1px solid var(--border-subtle);">
                      <button class="btn btn-sm btn-primary w-full" 
                              onclick="window.openKnockoutScoreModal('${i}', ${s}, '${n.id}')">
                        Enter Score
                      </button>
                    </div>
                  `:""}
                  ${e&&n.status==="completed"?`
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
  `}let C="mens-singles";function U(){const i=d.getCategories();return`
    <div class="page" id="schedule-page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title"><i class='bx bx-list-ul'></i> Fixtures & Schedule</h1>
          <p class="page-subtitle">View all match fixtures, group standings, and knockout brackets</p>
        </div>

        <!-- Category Tabs -->
        <div class="tabs" id="schedule-tabs">
          ${Object.values(i).map(e=>`
            <button class="tab ${e.id===C?"active":""}" 
                    data-category="${e.id}"
                    id="schedule-tab-${e.id}">
              ${e.name}
            </button>
          `).join("")}
        </div>

        <!-- Content -->
        <div id="schedule-content">
          ${T(C)}
        </div>

        <!-- Footer -->
        <footer class="footer">
          <img src="/images/icon.png" alt="LoveAll Club" class="footer-logo" />
          <p class="footer-text">
            Organized with <span style="color: var(--color-error);">♥</span> by <span class="footer-brand">LoveAll Club</span>
          </p>
          <p class="footer-copyright">
            © ${new Date().getFullYear()} LoveAll Club. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  `}function T(i){const e=d.getCategory(i);if(!e)return"";const t=d.getGroups(i),o=d.getKnockout(i),s=t.length>0,n=o.rounds&&o.rounds.length>0;if(!s&&!n)return`
      <div class="empty-state">
        <div class="empty-state-icon"><i class='bx bx-calendar-event'></i></div>
        <div class="empty-state-title">Fixtures Coming Soon</div>
        <div class="empty-state-text">The schedule for ${e.name} will be published here once it's ready. Stay tuned!</div>
      </div>
    `;let a="";if(s){a+=`
      <section class="section">
        <div class="section-header">
          <h2 class="section-title"><i class='bx bx-grid-alt'></i> Group Stage</h2>
          <div class="section-line"></div>
        </div>
        <div class="groups-grid">
          ${t.map(c=>`
            <div class="group-card">
              <div class="group-card-header">
                <span class="group-name">${c.name}</span>
                <span class="group-count">${c.participantIds.length} players</span>
              </div>
              ${N(i,c.id)}
            </div>
          `).join("")}
        </div>
      </section>
    `;const r=[];for(const c of t)for(const l of c.matches)r.push({match:l,groupName:c.name,groupId:c.id});if(r.length>0){const c=r.filter(p=>p.match.status==="live"),l=r.filter(p=>p.match.status==="upcoming"),m=r.filter(p=>p.match.status==="completed");a+='<section class="section">',a+=`<div class="section-header"><h2 class="section-title"><i class='bx bx-play-circle'></i> Matches</h2><div class="section-line"></div></div>`,c.length>0&&(a+=`<h3 style="color: var(--color-live); margin-bottom: var(--space-md); display: flex; align-items: center; gap: var(--space-sm);"><i class='bx bx-broadcast' style="filter: drop-shadow(0 0 6px rgba(255,64,129,0.5));"></i> Live Now</h3>`,a+='<div class="match-grid" style="margin-bottom: var(--space-xl);">',a+=c.map(p=>L(i,p.match,{showGroup:!0,groupName:p.groupName})).join(""),a+="</div>"),l.length>0&&(a+=`<h3 style="color: var(--text-secondary); margin-bottom: var(--space-md); display: flex; align-items: center; gap: var(--space-sm);"><i class='bx bx-time-five'></i> Upcoming</h3>`,a+='<div class="match-grid" style="margin-bottom: var(--space-xl);">',a+=l.map(p=>L(i,p.match,{showGroup:!0,groupName:p.groupName})).join(""),a+="</div>"),m.length>0&&(a+=`<h3 style="color: var(--color-success); margin-bottom: var(--space-md); display: flex; align-items: center; gap: var(--space-sm);"><i class='bx bx-check-circle'></i> Completed</h3>`,a+='<div class="match-grid">',a+=m.map(p=>L(i,p.match,{showGroup:!0,groupName:p.groupName})).join(""),a+="</div>"),a+="</section>"}}return n&&(a+=`
      <section class="section">
        <div class="section-header">
          <h2 class="section-title"><i class='bx bx-trophy'></i> Knockout Stage</h2>
          <div class="section-line"></div>
        </div>
        ${A(i,!1)}
      </section>
    `),a}function Y(){const i=document.querySelectorAll("#schedule-tabs .tab");i.forEach(e=>{e.addEventListener("click",()=>{C=e.dataset.category,i.forEach(o=>o.classList.remove("active")),e.classList.add("active");const t=document.getElementById("schedule-content");t&&(t.innerHTML=T(C))})})}let S=null;function P({title:i,content:e,onSubmit:t,submitLabel:o="Save",showCancel:s=!0}){f();const n=document.createElement("div");n.className="modal-overlay",n.id="active-modal-overlay",n.innerHTML=`
    <div class="modal" id="active-modal">
      <div class="modal-header">
        <h3 class="modal-title">${i}</h3>
        <button class="modal-close" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body">
        ${e}
      </div>
      <div class="modal-footer">
        ${s?'<button class="btn btn-outline" id="modal-cancel-btn">Cancel</button>':""}
        ${t?`<button class="btn btn-accent" id="modal-submit-btn">${o}</button>`:""}
      </div>
    </div>
  `,document.body.appendChild(n),S=n,n.querySelector("#modal-close-btn").addEventListener("click",f);const a=n.querySelector("#modal-cancel-btn");a&&a.addEventListener("click",f),n.addEventListener("click",c=>{c.target===n&&f()}),t&&n.querySelector("#modal-submit-btn").addEventListener("click",()=>{t()});const r=c=>{c.key==="Escape"&&(f(),document.removeEventListener("keydown",r))};document.addEventListener("keydown",r),setTimeout(()=>{const c=n.querySelector("input, select, textarea");c&&c.focus()},100)}function f(){S&&(S.remove(),S=null)}function w({title:i,message:e,onConfirm:t,confirmLabel:o="Confirm",danger:s=!1}){P({title:i,content:`<p style="color: var(--text-secondary); line-height: 1.6;">${e}</p>`,onSubmit:()=>{f(),t()},submitLabel:o}),s&&setTimeout(()=>{const n=document.getElementById("modal-submit-btn");n&&(n.className="btn btn-danger")},10)}let $=null;function g(i,e="success",t=3e3){$||($=document.createElement("div"),$.className="toast-container",document.body.appendChild($));const o=document.createElement("div");o.className=`toast toast-${e}`,o.textContent=i,$.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transform="translateX(100px)",o.style.transition="all 300ms ease",setTimeout(()=>o.remove(),300)},t)}let E=!1,b="mens-singles";function R(){if(!E)return V();const i=d.getCategories();return i[b],`
    <div class="page" id="admin-page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title"><i class='bx bx-cog'></i> Admin Dashboard</h1>
          <p class="page-subtitle">Manage participants, fixtures, and scores</p>
        </div>

        <!-- Toolbar -->
        <div class="admin-toolbar">
          <div class="admin-toolbar-actions">
            <button class="btn btn-outline btn-sm" id="btn-export-data"><i class='bx bx-export'></i> Export Data</button>
            <button class="btn btn-outline btn-sm" id="btn-import-data"><i class='bx bx-import'></i> Import Data</button>
            <button class="btn btn-danger btn-sm" id="btn-reset-data"><i class='bx bx-trash'></i> Reset All</button>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-logout"><i class='bx bx-log-out'></i> Logout</button>
        </div>

        <!-- Category Tabs -->
        <div class="tabs" id="admin-tabs">
          ${Object.values(i).map(e=>`
            <button class="tab ${e.id===b?"active":""}" 
                    data-category="${e.id}"
                    id="admin-tab-${e.id}">
              ${e.name}
            </button>
          `).join("")}
        </div>

        <!-- Admin Content -->
        <div id="admin-content">
          ${G(b)}
        </div>

        <!-- Footer -->
        <footer class="footer">
          <img src="/images/icon.png" alt="LoveAll Club" class="footer-logo" />
          <p class="footer-text">
            Organized with <span style="color: var(--color-error);">♥</span> by <span class="footer-brand">LoveAll Club</span>
          </p>
          <p class="footer-copyright">
            © ${new Date().getFullYear()} LoveAll Club. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  `}function V(){return`
    <div class="page">
      <div class="password-screen">
        <div class="password-card">
          <img src="/images/icon.png" alt="LoveAll Club" class="hero-logo" />
          <h2>Admin Access</h2>
          <p>Enter the admin password to manage the tournament</p>
          <div class="input-group">
            <input type="password" class="input w-full" id="admin-password-input" 
                   placeholder="Enter password" autocomplete="off" />
          </div>
          <div id="password-error" class="password-error hidden"></div>
          <button class="btn btn-accent w-full mt-lg" id="btn-admin-login" style="margin-top: var(--space-md);">
            <i class='bx bx-lock-open-alt'></i> Login
          </button>
        </div>
      </div>
    </div>
  `}function G(i){const e=d.getCategory(i);if(!e)return"";let t="";return t+=Q(i,e),t+=X(i),t+=Z(i),t+=ee(i),t}function Q(i,e){const t=d.getParticipants(i),o=e.type==="singles";return`
    <div class="admin-section" id="section-participants">
      <div class="admin-section-header">
        <div class="admin-section-title">
          <span class="step-number">1</span>
          <span>Manage Participants (${t.length})</span>
        </div>
        <div class="admin-actions">
          <button class="btn btn-accent btn-sm" id="btn-add-participant">
            <i class='bx bx-plus'></i> Add ${o?"Player":"Team"}
          </button>
        </div>
      </div>

      ${t.length===0?`
        <div class="empty-state" style="padding: var(--space-xl);">
          <div class="empty-state-icon"><i class='bx ${o?"bx-user":"bx-group"}'></i></div>
          <div class="empty-state-title">No ${o?"Players":"Teams"} Yet</div>
          <div class="empty-state-text">Click the button above to add ${o?"players":"teams"} to ${e.name}.</div>
        </div>
      `:`
        <div class="participant-list">
          ${t.map((s,n)=>`
            <div class="participant-item">
              <div class="participant-info">
                <span class="participant-number">${n+1}.</span>
                <div>
                  <div class="participant-name">${s.teamName||s.name}</div>
                  ${!o&&s.player1?`
                    <div class="participant-detail">${s.player1} & ${s.player2||"?"}</div>
                  `:""}
                </div>
              </div>
              <button class="btn btn-icon btn-danger" onclick="window.removeParticipant('${i}', '${s.id}')" title="Remove">
                <i class='bx bx-x'></i>
              </button>
            </div>
          `).join("")}
        </div>
      `}
    </div>
  `}function X(i,e){const t=d.getGroups(i),s=d.getParticipants(i).length>=3;return`
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
              <button class="btn btn-accent btn-sm" id="btn-generate-groups" ${s?"":"disabled"}>
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

      ${!s&&t.length===0?`
        <p class="text-muted" style="text-align: center; padding: var(--space-md);">
          Add at least 3 participants first to generate groups.
        </p>
      `:""}

      ${t.length>0?`
        <div class="groups-grid">
          ${t.map(n=>{const a=n.participantIds.map(r=>d.getParticipantById(i,r)).filter(Boolean);return`
              <div class="group-card">
                <div class="group-card-header">
                  <span class="group-name">${n.name}</span>
                  <span class="group-count">${a.length} players</span>
                </div>
                ${N(i,n.id)}
              </div>
            `}).join("")}
        </div>
      `:""}
    </div>
  `}function Z(i,e){const t=d.getGroups(i);if(t.length===0)return`
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
    `;let o=0,s=0;for(const a of t)o+=a.matches.length,s+=a.matches.filter(r=>r.status==="completed").length;let n=`
    <div class="admin-section" id="section-matches">
      <div class="admin-section-header">
        <div class="admin-section-title">
          <span class="step-number">3</span>
          <span>Group Matches (${s}/${o} completed)</span>
        </div>
      </div>
  `;for(const a of t)n+=`
      <div style="margin-bottom: var(--space-xl);">
        <h3 style="margin-bottom: var(--space-md); color: var(--neon);">${a.name}</h3>
        <div class="match-grid">
          ${a.matches.map(r=>L(i,r,{isAdmin:!0,groupId:a.id})).join("")}
        </div>
      </div>
    `;return n+="</div>",n}function ee(i,e){const t=d.getGroups(i),o=d.getKnockout(i),s=o.rounds&&o.rounds.length>0;let n=t.length>0;for(const a of t)if(a.matches.some(r=>r.status!=="completed")){n=!1;break}return`
    <div class="admin-section" id="section-knockout">
      <div class="admin-section-header">
        <div class="admin-section-title">
          <span class="step-number">4</span>
          <span>Knockout Stage</span>
        </div>
        <div class="admin-actions">
          ${!s&&t.length>0?`
            <div class="input-row" style="align-items: center;">
              <div class="input-group" style="min-width: 140px;">
                <label class="input-label">Qualifiers/Group</label>
                <select class="select" id="qualify-count-select">
                  <option value="1">Top 1</option>
                  <option value="2" selected>Top 2</option>
                  <option value="3">Top 3</option>
                </select>
              </div>
              <button class="btn btn-accent btn-sm" id="btn-generate-knockout" ${n?"":'disabled title="Complete all group matches first"'}>
                <i class='bx bx-trophy'></i> Generate Bracket
              </button>
            </div>
          `:""}
          ${s?`
            <button class="btn btn-danger btn-sm" id="btn-clear-knockout">
              <i class='bx bx-trash'></i> Clear Bracket
            </button>
          `:""}
        </div>
      </div>

      ${!n&&!s&&t.length>0?`
        <p class="text-muted" style="text-align: center; padding: var(--space-md);">
          Complete all group stage matches to generate the knockout bracket.
        </p>
      `:""}

      ${t.length===0&&!s?`
        <p class="text-muted" style="text-align: center; padding: var(--space-md);">
          Set up groups and complete group matches first.
        </p>
      `:""}

      ${s?A(i,!0):""}
    </div>
  `}function h(){const i=document.getElementById("admin-content");i&&(i.innerHTML=G(b),O())}function O(){const i=document.getElementById("btn-add-participant");i&&i.addEventListener("click",()=>te(b));const e=document.getElementById("btn-generate-groups");e&&e.addEventListener("click",()=>{const n=document.getElementById("group-size-select"),a=parseInt((n==null?void 0:n.value)||"4");d.generateGroups(b,a),g("Groups generated successfully!","success"),h()});const t=document.getElementById("btn-clear-groups");t&&t.addEventListener("click",()=>{w({title:"Clear Groups",message:"This will delete all groups, matches, scores, and the knockout bracket for this category. Are you sure?",onConfirm:()=>{d.clearGroups(b),g("Groups cleared","info"),h()},danger:!0,confirmLabel:"Clear All"})});const o=document.getElementById("btn-generate-knockout");o&&o.addEventListener("click",()=>{const n=document.getElementById("qualify-count-select"),a=parseInt((n==null?void 0:n.value)||"2");d.generateKnockout(b,a),g("Knockout bracket generated!","success"),h()});const s=document.getElementById("btn-clear-knockout");s&&s.addEventListener("click",()=>{w({title:"Clear Knockout",message:"This will remove the entire knockout bracket. Are you sure?",onConfirm:()=>{d.clearKnockout(b),g("Knockout bracket cleared","info"),h()},danger:!0,confirmLabel:"Clear Bracket"})})}function te(i){const e=d.getCategory(i),t=e.type==="singles";let o;t?o=`
      <div class="input-group">
        <label class="input-label">Player Name</label>
        <input type="text" class="input" id="input-player-name" placeholder="Enter player name" />
      </div>
    `:o=`
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
    `,P({title:`Add ${t?"Player":"Team"} — ${e.name}`,content:o,submitLabel:`Add ${t?"Player":"Team"}`,onSubmit:()=>{var s,n,a,r,c,l,m,p;if(t){const v=(n=(s=document.getElementById("input-player-name"))==null?void 0:s.value)==null?void 0:n.trim();if(!v){g("Please enter a player name","error");return}d.addParticipant(i,{name:v}),g(`${v} added!`,"success")}else{const v=(r=(a=document.getElementById("input-team-name"))==null?void 0:a.value)==null?void 0:r.trim(),u=(l=(c=document.getElementById("input-player1"))==null?void 0:c.value)==null?void 0:l.trim(),y=(p=(m=document.getElementById("input-player2"))==null?void 0:m.value)==null?void 0:p.trim();if(!v){g("Please enter a team name","error");return}d.addParticipant(i,{teamName:v,player1:u,player2:y}),g(`${v} added!`,"success")}f(),h()}})}window.removeParticipant=function(i,e){const t=d.getParticipantById(i,e),o=t?t.teamName||t.name:"this participant";w({title:"Remove Participant",message:`Are you sure you want to remove <strong>${o}</strong>?`,onConfirm:()=>{d.removeParticipant(i,e),g(`${o} removed`,"info"),h()},danger:!0,confirmLabel:"Remove"})};window.setMatchLive=function(i,e,t){d.setMatchLive(i,e,t),g("Match set to live!","success"),h()};window.openScoreModal=function(i,e,t){const o=d.getGroups(i).find(l=>l.id===e),s=o==null?void 0:o.matches.find(l=>l.id===t);if(!s)return;const n=d.getParticipantById(i,s.player1Id),a=d.getParticipantById(i,s.player2Id),r=n?n.teamName||n.name:"Player 1",c=a?a.teamName||a.name:"Player 2";P({title:"Enter Score",content:`
      <div class="score-input-group" style="justify-content: center; padding: var(--space-md) 0;">
        <div style="text-align: center;">
          <div style="font-weight: 600; margin-bottom: var(--space-sm); font-size: 0.9rem;">${r}</div>
          <input type="number" class="score-input" id="score-input-1" min="0" max="99" value="${s.score1!==null?s.score1:""}" />
        </div>
        <span class="score-vs">VS</span>
        <div style="text-align: center;">
          <div style="font-weight: 600; margin-bottom: var(--space-sm); font-size: 0.9rem;">${c}</div>
          <input type="number" class="score-input" id="score-input-2" min="0" max="99" value="${s.score2!==null?s.score2:""}" />
        </div>
      </div>
    `,submitLabel:"Save Score",onSubmit:()=>{var p,v;const l=(p=document.getElementById("score-input-1"))==null?void 0:p.value,m=(v=document.getElementById("score-input-2"))==null?void 0:v.value;if(l===""||m===""){g("Please enter both scores","error");return}d.updateMatchScore(i,e,t,l,m),f(),g("Score saved!","success"),h()}})};window.resetMatchScore=function(i,e,t){w({title:"Reset Match",message:"Reset this match score and status?",onConfirm:()=>{d.resetMatch(i,e,t),g("Match reset","info"),h()},confirmLabel:"Reset"})};window.openKnockoutScoreModal=function(i,e,t){const s=d.getKnockout(i).rounds[e],n=s==null?void 0:s.matches.find(m=>m.id===t);if(!n)return;const a=d.getParticipantById(i,n.player1Id),r=d.getParticipantById(i,n.player2Id),c=a?a.teamName||a.name:"Player 1",l=r?r.teamName||r.name:"Player 2";P({title:`${s.name} — Enter Score`,content:`
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
    `,submitLabel:"Save Score",onSubmit:()=>{var v,u;const m=(v=document.getElementById("ko-score-1"))==null?void 0:v.value,p=(u=document.getElementById("ko-score-2"))==null?void 0:u.value;if(m===""||p===""){g("Please enter both scores","error");return}if(m===p){g("Knockout matches cannot be a draw!","error");return}d.updateKnockoutMatch(i,e,t,m,p),f(),g("Score saved! Winner advances.","success"),h()}})};function z(){if(!E){const n=document.getElementById("btn-admin-login"),a=document.getElementById("admin-password-input"),r=document.getElementById("password-error"),c=()=>{const l=(a==null?void 0:a.value)||"";if(d.checkPassword(l)){E=!0;const m=document.getElementById("app");if(m){const{renderNavbar:p,initNavbar:v}=se();m.innerHTML=p("/admin")+R(),v(),z()}}else r&&(r.textContent="Incorrect password. Try again.",r.classList.remove("hidden")),a==null||a.classList.add("shake"),setTimeout(()=>a==null?void 0:a.classList.remove("shake"),500)};n&&n.addEventListener("click",c),a&&a.addEventListener("keydown",l=>{l.key==="Enter"&&c()});return}const i=document.querySelectorAll("#admin-tabs .tab");i.forEach(n=>{n.addEventListener("click",()=>{b=n.dataset.category,i.forEach(a=>a.classList.remove("active")),n.classList.add("active"),h()})});const e=document.getElementById("btn-export-data");e&&e.addEventListener("click",()=>{const n=d.exportData(),a=new Blob([n],{type:"application/json"}),r=URL.createObjectURL(a),c=document.createElement("a");c.href=r,c.download=`loveall_tournament_${Date.now()}.json`,c.click(),URL.revokeObjectURL(r),g("Data exported!","success")});const t=document.getElementById("btn-import-data");t&&t.addEventListener("click",()=>{const n=document.createElement("input");n.type="file",n.accept=".json",n.onchange=a=>{const r=a.target.files[0];if(!r)return;const c=new FileReader;c.onload=l=>{d.importData(l.target.result)?(g("Data imported successfully!","success"),h()):g("Invalid data file","error")},c.readAsText(r)},n.click()});const o=document.getElementById("btn-reset-data");o&&o.addEventListener("click",()=>{w({title:"Reset All Data",message:"This will permanently delete ALL tournament data including participants, groups, matches, and scores. This cannot be undone!",onConfirm:()=>{d.reset(),g("All data has been reset","info"),h()},danger:!0,confirmLabel:"Reset Everything"})});const s=document.getElementById("btn-logout");s&&s.addEventListener("click",()=>{E=!1,window.dispatchEvent(new HashChangeEvent("hashchange"))}),O()}function se(){return{renderNavbar:i=>{const{renderNavbar:e}=window.__navbarModule||{};return e?e(i):""},initNavbar:()=>{const{initNavbar:i}=window.__navbarModule||{};i&&i()}}}window.__navbarModule={renderNavbar:_,initNavbar:B};const ae=document.getElementById("app"),M=[{path:"/",name:"home",render:q,init:W},{path:"/schedule",name:"schedule",render:U,init:Y},{path:"/admin",name:"admin",render:R,init:z}],ne=new K(M,"/");function D(i){if(!i)return;const e=_(i.path),t=i.render();ae.innerHTML=e+t,B(),i.init&&i.init(),window.scrollTo(0,0)}ne.onRouteChange(i=>{D(i)});const ie=window.location.hash.slice(1)||"/",oe=M.find(i=>i.path===ie)||M[0];D(oe);

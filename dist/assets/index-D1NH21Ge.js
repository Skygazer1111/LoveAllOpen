(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const n of a.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&o(n)}).observe(document,{childList:!0,subtree:!0});function t(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(s){if(s.ep)return;s.ep=!0;const a=t(s);fetch(s.href,a)}})();class F{constructor(e,t="/"){this.routes=e,this.defaultRoute=t,this.currentRoute=null,this._onRouteChange=null,window.addEventListener("hashchange",()=>this._handleRoute()),window.addEventListener("load",()=>this._handleRoute())}_handleRoute(){const e=window.location.hash.slice(1)||this.defaultRoute,t=this.routes.find(o=>o.path===e);t?(this.currentRoute=t,this._onRouteChange&&this._onRouteChange(t)):this.navigate(this.defaultRoute)}navigate(e){window.location.hash=e}onRouteChange(e){this._onRouteChange=e}getCurrentPath(){return window.location.hash.slice(1)||this.defaultRoute}}function B(i){return`
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
          ${[{path:"/",label:"Home",icon:"🏠"},{path:"/schedule",label:"Schedule",icon:"📋"},{path:"/admin",label:"Admin",icon:"⚙️"}].map(t=>`
            <a href="#${t.path}" 
               class="navbar-link ${i===t.path?"active":""}"
               id="nav-${t.label.toLowerCase()}">
              <span>${t.icon}</span>
              <span>${t.label}</span>
            </a>
          `).join("")}
        </div>
        <button class="navbar-mobile-toggle" id="navbar-toggle" aria-label="Toggle navigation">
          ☰
        </button>
      </div>
    </nav>
  `}function _(){const i=document.getElementById("navbar-toggle"),e=document.getElementById("navbar-links");i&&e&&(i.addEventListener("click",()=>{e.classList.toggle("open"),i.textContent=e.classList.contains("open")?"✕":"☰"}),e.querySelectorAll(".navbar-link").forEach(t=>{t.addEventListener("click",()=>{e.classList.remove("open"),i.textContent="☰"})}))}const I="loveall_tournament_2026",H="loveall2026";function $(){return Date.now().toString(36)+Math.random().toString(36).substring(2,8)}const k={settings:{tournamentName:"LoveAll Open Badminton Tournament 2026",tournamentDate:"16th August, Sunday",tournamentTime:"9:00 AM to 1:00 PM",venue:"Toneup Badminton, opposite Tone up Gym, Muttukkaranchavadi, Thoraipakkam, Greater Chennai",shuttles:"Yonex Mavis 350",courts:2},categories:{"mens-singles":{id:"mens-singles",name:"Men's Singles",fee:500,feeLabel:"Registration Fee",type:"singles",icon:"🏸",participants:[],groups:[],knockout:{rounds:[]}},"mens-doubles":{id:"mens-doubles",name:"Men's Doubles",fee:750,feeLabel:"Per Team",type:"doubles",icon:"🏸",participants:[],groups:[],knockout:{rounds:[]}},"mixed-doubles":{id:"mixed-doubles",name:"Mixed Doubles",fee:750,feeLabel:"Per Team",type:"doubles",icon:"🏸",participants:[],groups:[],knockout:{rounds:[]}}}};class J{constructor(){this._listeners={},this._data=null,this.load()}load(){try{const e=localStorage.getItem(I);if(e){this._data=JSON.parse(e);for(const t of Object.keys(k.categories))if(!this._data.categories[t])this._data.categories[t]=JSON.parse(JSON.stringify(k.categories[t]));else{const o=k.categories[t],s=this._data.categories[t];s.knockout||(s.knockout={rounds:[]}),s.groups||(s.groups=[]),s.participants||(s.participants=[]),s.icon||(s.icon=o.icon)}this._data.settings||(this._data.settings=JSON.parse(JSON.stringify(k.settings)))}else this._data=JSON.parse(JSON.stringify(k))}catch(e){console.error("Failed to load store data:",e),this._data=JSON.parse(JSON.stringify(k))}}save(){try{localStorage.setItem(I,JSON.stringify(this._data))}catch(e){console.error("Failed to save store data:",e)}}reset(){this._data=JSON.parse(JSON.stringify(k)),this.save(),this.emit("change")}checkPassword(e){return e===H}getSettings(){return this._data.settings}updateSettings(e){Object.assign(this._data.settings,e),this.save(),this.emit("change")}getCategories(){return this._data.categories}getCategory(e){return this._data.categories[e]}getCategoryIds(){return Object.keys(this._data.categories)}getParticipants(e){var t;return((t=this._data.categories[e])==null?void 0:t.participants)||[]}addParticipant(e,t){const o=this._data.categories[e];if(!o)return null;const s={id:$(),...t};return o.participants.push(s),this.save(),this.emit("change"),s}removeParticipant(e,t){const o=this._data.categories[e];o&&(o.participants=o.participants.filter(s=>s.id!==t),this.save(),this.emit("change"))}getParticipantById(e,t){const o=this._data.categories[e];return o&&o.participants.find(s=>s.id===t)||null}getGroups(e){var t;return((t=this._data.categories[e])==null?void 0:t.groups)||[]}generateGroups(e,t=4){const o=this._data.categories[e];if(!o||o.participants.length<2)return;const s=[...o.participants].sort(()=>Math.random()-.5),a=Math.ceil(s.length/t),n=[];for(let r=0;r<a;r++)n.push({id:$(),name:`Group ${String.fromCharCode(65+r)}`,participantIds:[],matches:[]});s.forEach((r,c)=>{const l=c%a;n[l].participantIds.push(r.id)}),o.groups=n,this._generateRoundRobinMatches(e),this.save(),this.emit("change")}clearGroups(e){const t=this._data.categories[e];t&&(t.groups=[],t.knockout={rounds:[]},this.save(),this.emit("change"))}_generateRoundRobinMatches(e){const t=this._data.categories[e];if(t)for(const o of t.groups){const s=o.participantIds,a=[];let n=1;for(let r=0;r<s.length;r++)for(let c=r+1;c<s.length;c++)a.push({id:$(),matchNumber:n++,player1Id:s[r],player2Id:s[c],score1:null,score2:null,winner:null,status:"upcoming"});o.matches=a}}getGroupMatches(e,t){const o=this._data.categories[e];if(!o)return[];const s=o.groups.find(a=>a.id===t);return s?s.matches:[]}updateMatchScore(e,t,o,s,a){const n=this._data.categories[e];if(!n)return;const r=n.groups.find(l=>l.id===t);if(!r)return;const c=r.matches.find(l=>l.id===o);c&&(c.score1=parseInt(s),c.score2=parseInt(a),c.status="completed",c.score1>c.score2?c.winner=c.player1Id:c.score2>c.score1?c.winner=c.player2Id:c.winner=null,this.save(),this.emit("change"))}setMatchLive(e,t,o){const s=this._data.categories[e];if(!s)return;const a=s.groups.find(r=>r.id===t);if(!a)return;const n=a.matches.find(r=>r.id===o);n&&(n.status="live",this.save(),this.emit("change"))}resetMatch(e,t,o){const s=this._data.categories[e];if(!s)return;const a=s.groups.find(r=>r.id===t);if(!a)return;const n=a.matches.find(r=>r.id===o);n&&(n.score1=null,n.score2=null,n.winner=null,n.status="upcoming",this.save(),this.emit("change"))}getGroupStandings(e,t){const o=this._data.categories[e];if(!o)return[];const s=o.groups.find(n=>n.id===t);if(!s)return[];const a={};for(const n of s.participantIds)a[n]={participantId:n,played:0,won:0,lost:0,drawn:0,pointsFor:0,pointsAgainst:0,points:0};for(const n of s.matches){if(n.status!=="completed")continue;const r=a[n.player1Id],c=a[n.player2Id];!r||!c||(r.played++,c.played++,r.pointsFor+=n.score1||0,r.pointsAgainst+=n.score2||0,c.pointsFor+=n.score2||0,c.pointsAgainst+=n.score1||0,n.winner===n.player1Id?(r.won++,r.points+=2,c.lost++):n.winner===n.player2Id?(c.won++,c.points+=2,r.lost++):(r.drawn++,c.drawn++,r.points+=1,c.points+=1))}return Object.values(a).sort((n,r)=>{if(r.points!==n.points)return r.points-n.points;const c=n.pointsFor-n.pointsAgainst,l=r.pointsFor-r.pointsAgainst;return l!==c?l-c:r.pointsFor-n.pointsFor})}getKnockout(e){var t;return((t=this._data.categories[e])==null?void 0:t.knockout)||{rounds:[]}}generateKnockout(e,t=2){var p,v;const o=this._data.categories[e];if(!o||o.groups.length===0)return;const s=[];for(const u of o.groups){const j=this.getGroupStandings(e,u.id).slice(0,t);for(const K of j)s.push({participantId:K.participantId,groupName:u.name,seed:s.length+1})}if(s.length<2)return;const a=this._seedBracket(s,o.groups.length,t),n=[];let r=[];for(let u=0;u<a.length;u+=2)r.push({id:$(),matchNumber:r.length+1,player1Id:((p=a[u])==null?void 0:p.participantId)||null,player2Id:((v=a[u+1])==null?void 0:v.participantId)||null,score1:null,score2:null,winner:null,status:"upcoming"});for(const u of r)u.player1Id&&!u.player2Id?(u.winner=u.player1Id,u.status="completed",u.score1=0,u.score2=0):!u.player1Id&&u.player2Id&&(u.winner=u.player2Id,u.status="completed",u.score1=0,u.score2=0);const c=this._getRoundNames(r.length);n.push({name:c[0]||"Round 1",matches:r});let l=Math.ceil(r.length/2),m=1;for(;l>=1;){const u=[];for(let y=0;y<l;y++)u.push({id:$(),matchNumber:y+1,player1Id:null,player2Id:null,score1:null,score2:null,winner:null,status:"upcoming"});if(n.push({name:c[m]||`Round ${m+1}`,matches:u}),l=Math.ceil(l/2),m++,l<1)break}o.knockout={rounds:n},this.save(),this.emit("change")}_seedBracket(e,t,o){if(e.length<=1)return e;const s=[...e],a=Math.pow(2,Math.ceil(Math.log2(s.length)));for(;s.length<a;)s.push({participantId:null,groupName:"BYE",seed:s.length+1});return s}_getRoundNames(e){const t=Math.ceil(Math.log2(e))+1,o=[];for(let s=t;s>=1;s--)s===1?o.unshift("Final"):s===2?o.unshift("Semi Finals"):s===3?o.unshift("Quarter Finals"):o.unshift(`Round of ${Math.pow(2,s)}`);return o}updateKnockoutMatch(e,t,o,s,a){const n=this._data.categories[e];if(!n)return;const r=n.knockout.rounds[t];if(!r)return;const c=r.matches.find(l=>l.id===o);if(c){if(c.score1=parseInt(s),c.score2=parseInt(a),c.status="completed",c.score1>c.score2?c.winner=c.player1Id:c.score2>c.score1&&(c.winner=c.player2Id),c.winner&&t+1<n.knockout.rounds.length){const l=n.knockout.rounds[t+1],m=r.matches.indexOf(c),p=Math.floor(m/2),v=m%2===0;l.matches[p]&&(v?l.matches[p].player1Id=c.winner:l.matches[p].player2Id=c.winner)}this.save(),this.emit("change")}}clearKnockout(e){const t=this._data.categories[e];t&&(t.knockout={rounds:[]},this.save(),this.emit("change"))}exportData(){return JSON.stringify(this._data,null,2)}importData(e){try{const t=JSON.parse(e);return t.categories&&t.settings?(this._data=t,this.save(),this.emit("change"),!0):!1}catch(t){return console.error("Import failed:",t),!1}}on(e,t){this._listeners[e]||(this._listeners[e]=[]),this._listeners[e].push(t)}off(e,t){this._listeners[e]&&(this._listeners[e]=this._listeners[e].filter(o=>o!==t))}emit(e,t){this._listeners[e]&&this._listeners[e].forEach(o=>o(t))}}const d=new J;function q(){const i=d.getSettings(),e=d.getCategories();return`
    <div class="page" id="home-page">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <div class="hero-badge">🏸 Beginner Level Tournament</div>
          <img src="/images/icon.png" alt="LoveAll Club" class="hero-logo" />
          <h1 class="hero-title">LoveAll Open</h1>
          <p class="hero-subtitle">Badminton Tournament 2026</p>
          <div class="hero-date">
            <span style="margin-right: var(--space-md);">📅 ${i.tournamentDate}</span>
            <span>⏰ ${i.tournamentTime}</span>
          </div>
          <div style="margin-top: var(--space-xl); display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap;">
            <a href="#/schedule" class="btn btn-accent btn-lg">📋 View Schedule</a>
            <a href="#/schedule" class="btn btn-outline btn-lg">🏆 View Fixtures</a>
          </div>
        </div>
      </section>

      <div class="page-content">
        <!-- Tournament Info -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">📌 Event Details</h2>
            <div class="section-line"></div>
          </div>
          <div class="info-bar">
            <div class="info-item">
              <div class="info-item-icon">📅</div>
              <div class="info-item-content">
                <span class="info-item-label">Date</span>
                <span class="info-item-value">${i.tournamentDate}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-item-icon">⏰</div>
              <div class="info-item-content">
                <span class="info-item-label">Time</span>
                <span class="info-item-value">${i.tournamentTime}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-item-icon">📍</div>
              <div class="info-item-content">
                <span class="info-item-label">Venue</span>
                <span class="info-item-value">${i.venue}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-item-icon">🏸</div>
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
            <h2 class="section-title">🏸 Three Categories</h2>
            <div class="section-line"></div>
          </div>
          <div class="category-grid">
            ${Object.values(e).map(t=>`
              <div class="category-card card-glow">
                <div class="category-icon">${t.type==="singles"?"🧑":t.id==="mixed-doubles"?"👫":"👬"}</div>
                <h3 class="category-name">${t.name}</h3>
                <div class="category-fee">₹${t.fee}</div>
                <div class="category-fee-label">${t.feeLabel}</div>
                <div style="margin-top: var(--space-md);">
                  <span class="badge badge-upcoming" style="font-size: 0.8rem; padding: 5px 12px;">
                    ${t.participants.length} Registered
                  </span>
                </div>
              </div>
            `).join("")}
          </div>
        </section>

        <!-- League Tournament -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">🎯 League Tournament Format</h2>
            <div class="section-line"></div>
          </div>
          <div class="card" style="max-width: 700px;">
            <div style="display: flex; flex-direction: column; gap: var(--space-md);">
              <div style="display: flex; align-items: flex-start; gap: var(--space-md);">
                <span style="font-size: 1.5rem;">1️⃣</span>
                <div>
                  <h4 style="margin-bottom: 4px;">Group Stage</h4>
                  <p class="text-secondary" style="font-size: 0.9rem;">Players are divided into groups. Everyone in a group plays against each other (round-robin).</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: var(--space-md);">
                <span style="font-size: 1.5rem;">2️⃣</span>
                <div>
                  <h4 style="margin-bottom: 4px;">Knockout Stage</h4>
                  <p class="text-secondary" style="font-size: 0.9rem;">Top players from each group advance to the knockout bracket. Win or go home!</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: var(--space-md);">
                <span style="font-size: 1.5rem;">🏆</span>
                <div>
                  <h4 style="margin-bottom: 4px;">Finals</h4>
                  <p class="text-secondary" style="font-size: 0.9rem;">The best players compete for the championship cups!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Prizes -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">🏆 Prizes & Rewards</h2>
            <div class="section-line"></div>
          </div>
          <div class="prizes-grid">
            <div class="prize-card card-glow">
              <div class="prize-icon">🏅</div>
              <div class="prize-text">
                <span class="prize-title">Participation Medal</span>
                <span class="prize-desc">For every participant</span>
              </div>
            </div>
            <div class="prize-card card-glow">
              <div class="prize-icon">📜</div>
              <div class="prize-text">
                <span class="prize-title">Certificates</span>
                <span class="prize-desc">For every participant</span>
              </div>
            </div>
            <div class="prize-card card-glow">
              <div class="prize-icon">🏆</div>
              <div class="prize-text">
                <span class="prize-title">Championship Cups</span>
                <span class="prize-desc">1st, 2nd & 3rd in all categories</span>
              </div>
            </div>
            <div class="prize-card card-glow">
              <div class="prize-icon">🧃</div>
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
            <h2 class="section-title">📞 Contact</h2>
            <div class="section-line"></div>
          </div>
          <div class="contact-grid">
            <div class="contact-card">
              <div class="contact-icon">📱</div>
              <div>
                <div class="contact-name">Priyan</div>
                <div class="contact-phone">6380243702</div>
              </div>
            </div>
            <div class="contact-card">
              <div class="contact-icon">📱</div>
              <div>
                <div class="contact-name">Hithesh</div>
                <div class="contact-phone">9962131645</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
          <p class="footer-text">
            Organized by <span class="footer-brand">LoveAll Club</span> · 
            Badminton Tournament 2026 · 
            All rights reserved
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
          ${o.map((s,a)=>{const n=d.getParticipantById(i,s.participantId),r=n?n.teamName||n.name:"Unknown",c=a<t;return`
              <tr>
                <td class="rank-cell ${c?"top":""}">${a+1}</td>
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
  `}function E(i,e,t={}){const{showGroup:o=!1,groupName:s="",isAdmin:a=!1,groupId:n=""}=t,r=d.getParticipantById(i,e.player1Id),c=d.getParticipantById(i,e.player2Id),l=r?r.teamName||r.name:"TBD",m=c?c.teamName||c.name:"TBD",p={upcoming:'<span class="badge badge-upcoming">Upcoming</span>',live:'<span class="badge badge-live">● Live</span>',completed:'<span class="badge badge-completed">Completed</span>'}[e.status]||"",v=e.status==="completed",u=v&&e.winner===e.player1Id,y=v&&e.winner===e.player2Id;return`
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
      ${a&&e.player1Id&&e.player2Id?`
        <div style="margin-top: var(--space-md); display: flex; gap: var(--space-sm); justify-content: flex-end;">
          ${e.status==="upcoming"?`
            <button class="btn btn-sm btn-outline" onclick="window.setMatchLive('${i}', '${n}', '${e.id}')">Set Live</button>
          `:""}
          ${e.status!=="completed"?`
            <button class="btn btn-sm btn-primary" onclick="window.openScoreModal('${i}', '${n}', '${e.id}')">Enter Score</button>
          `:`
            <button class="btn btn-sm btn-outline" onclick="window.resetMatchScore('${i}', '${n}', '${e.id}')">Reset</button>
          `}
        </div>
      `:""}
    </div>
  `}function T(i,e=!1){const t=d.getKnockout(i);return!t.rounds||t.rounds.length===0?`
      <div class="empty-state">
        <div class="empty-state-icon">🏆</div>
        <div class="empty-state-title">No Knockout Stage Yet</div>
        <div class="empty-state-text">The knockout bracket will appear here once generated from group stage results.</div>
      </div>
    `:`
    <div class="bracket-container">
      <div class="bracket">
        ${t.rounds.map((o,s)=>`
          <div class="bracket-round">
            <div class="bracket-round-title">${o.name}</div>
            ${o.matches.map(a=>{const n=a.player1Id?d.getParticipantById(i,a.player1Id):null,r=a.player2Id?d.getParticipantById(i,a.player2Id):null,c=n?n.teamName||n.name:"TBD",l=r?r.teamName||r.name:"TBD",m=a.status==="completed"&&a.winner===a.player1Id,p=a.status==="completed"&&a.winner===a.player2Id;return`
                <div class="bracket-match" id="ko-match-${a.id}">
                  <div class="bracket-player ${m?"winner":""}">
                    <span class="bracket-player-name ${n?"":"tbd"}">${c}</span>
                    <span class="bracket-player-score">${a.score1!==null?a.score1:""}</span>
                  </div>
                  <div class="bracket-player ${p?"winner":""}">
                    <span class="bracket-player-name ${r?"":"tbd"}">${l}</span>
                    <span class="bracket-player-score">${a.score2!==null?a.score2:""}</span>
                  </div>
                  ${e&&a.player1Id&&a.player2Id&&a.status!=="completed"?`
                    <div style="padding: 6px 10px; border-top: 1px solid var(--border-subtle);">
                      <button class="btn btn-sm btn-primary w-full" 
                              onclick="window.openKnockoutScoreModal('${i}', ${s}, '${a.id}')">
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
  `}let x="mens-singles";function U(){const i=d.getCategories();return i[x],`
    <div class="page" id="schedule-page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">📋 Fixtures & Schedule</h1>
          <p class="page-subtitle">View all match fixtures, group standings, and knockout brackets</p>
        </div>

        <!-- Category Tabs -->
        <div class="tabs" id="schedule-tabs">
          ${Object.values(i).map(e=>`
            <button class="tab ${e.id===x?"active":""}" 
                    data-category="${e.id}"
                    id="schedule-tab-${e.id}">
              ${e.name}
            </button>
          `).join("")}
        </div>

        <!-- Content -->
        <div id="schedule-content">
          ${A(x)}
        </div>
      </div>
    </div>
  `}function A(i){const e=d.getCategory(i);if(!e)return"";const t=d.getGroups(i),o=d.getKnockout(i),s=t.length>0,a=o.rounds&&o.rounds.length>0;if(!s&&!a)return`
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-title">Fixtures Coming Soon</div>
        <div class="empty-state-text">The schedule for ${e.name} will be published here once it's ready. Stay tuned!</div>
      </div>
    `;let n="";if(s){n+=`
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">📊 Group Stage</h2>
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
    `;const r=[];for(const c of t)for(const l of c.matches)r.push({match:l,groupName:c.name,groupId:c.id});if(r.length>0){const c=r.filter(p=>p.match.status==="live"),l=r.filter(p=>p.match.status==="upcoming"),m=r.filter(p=>p.match.status==="completed");n+='<section class="section">',n+='<div class="section-header"><h2 class="section-title">🏸 Matches</h2><div class="section-line"></div></div>',c.length>0&&(n+='<h3 style="color: var(--color-live); margin-bottom: var(--space-md);">● Live Now</h3>',n+='<div class="match-grid" style="margin-bottom: var(--space-xl);">',n+=c.map(p=>E(i,p.match,{showGroup:!0,groupName:p.groupName})).join(""),n+="</div>"),l.length>0&&(n+='<h3 style="color: var(--text-secondary); margin-bottom: var(--space-md);">Upcoming</h3>',n+='<div class="match-grid" style="margin-bottom: var(--space-xl);">',n+=l.map(p=>E(i,p.match,{showGroup:!0,groupName:p.groupName})).join(""),n+="</div>"),m.length>0&&(n+='<h3 style="color: var(--color-success); margin-bottom: var(--space-md);">✓ Completed</h3>',n+='<div class="match-grid">',n+=m.map(p=>E(i,p.match,{showGroup:!0,groupName:p.groupName})).join(""),n+="</div>"),n+="</section>"}}return a&&(n+=`
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">🏆 Knockout Stage</h2>
          <div class="section-line"></div>
        </div>
        ${T(i,!1)}
      </section>
    `),n}function V(){const i=document.querySelectorAll("#schedule-tabs .tab");i.forEach(e=>{e.addEventListener("click",()=>{x=e.dataset.category,i.forEach(o=>o.classList.remove("active")),e.classList.add("active");const t=document.getElementById("schedule-content");t&&(t.innerHTML=A(x))})})}let L=null;function C({title:i,content:e,onSubmit:t,submitLabel:o="Save",showCancel:s=!0}){b();const a=document.createElement("div");a.className="modal-overlay",a.id="active-modal-overlay",a.innerHTML=`
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
  `,document.body.appendChild(a),L=a,a.querySelector("#modal-close-btn").addEventListener("click",b);const n=a.querySelector("#modal-cancel-btn");n&&n.addEventListener("click",b),a.addEventListener("click",c=>{c.target===a&&b()}),t&&a.querySelector("#modal-submit-btn").addEventListener("click",()=>{t()});const r=c=>{c.key==="Escape"&&(b(),document.removeEventListener("keydown",r))};document.addEventListener("keydown",r),setTimeout(()=>{const c=a.querySelector("input, select, textarea");c&&c.focus()},100)}function b(){L&&(L.remove(),L=null)}function S({title:i,message:e,onConfirm:t,confirmLabel:o="Confirm",danger:s=!1}){C({title:i,content:`<p style="color: var(--text-secondary); line-height: 1.6;">${e}</p>`,onSubmit:()=>{b(),t()},submitLabel:o}),s&&setTimeout(()=>{const a=document.getElementById("modal-submit-btn");a&&(a.className="btn btn-danger")},10)}let w=null;function g(i,e="success",t=3e3){w||(w=document.createElement("div"),w.className="toast-container",document.body.appendChild(w));const o=document.createElement("div");o.className=`toast toast-${e}`,o.textContent=i,w.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transform="translateX(100px)",o.style.transition="all 300ms ease",setTimeout(()=>o.remove(),300)},t)}let P=!1,f="mens-singles";function R(){if(!P)return Y();const i=d.getCategories();return i[f],`
    <div class="page" id="admin-page">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">⚙️ Admin Dashboard</h1>
          <p class="page-subtitle">Manage participants, fixtures, and scores</p>
        </div>

        <!-- Toolbar -->
        <div class="admin-toolbar">
          <div class="admin-toolbar-actions">
            <button class="btn btn-outline btn-sm" id="btn-export-data">📥 Export Data</button>
            <button class="btn btn-outline btn-sm" id="btn-import-data">📤 Import Data</button>
            <button class="btn btn-danger btn-sm" id="btn-reset-data">🗑️ Reset All</button>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-logout">🚪 Logout</button>
        </div>

        <!-- Category Tabs -->
        <div class="tabs" id="admin-tabs">
          ${Object.values(i).map(e=>`
            <button class="tab ${e.id===f?"active":""}" 
                    data-category="${e.id}"
                    id="admin-tab-${e.id}">
              ${e.name}
            </button>
          `).join("")}
        </div>

        <!-- Admin Content -->
        <div id="admin-content">
          ${G(f)}
        </div>
      </div>
    </div>
  `}function Y(){return`
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
            🔓 Login
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
            + Add ${o?"Player":"Team"}
          </button>
        </div>
      </div>

      ${t.length===0?`
        <div class="empty-state" style="padding: var(--space-xl);">
          <div class="empty-state-icon">${o?"🧑":"👥"}</div>
          <div class="empty-state-title">No ${o?"Players":"Teams"} Yet</div>
          <div class="empty-state-text">Click the button above to add ${o?"players":"teams"} to ${e.name}.</div>
        </div>
      `:`
        <div class="participant-list">
          ${t.map((s,a)=>`
            <div class="participant-item">
              <div class="participant-info">
                <span class="participant-number">${a+1}.</span>
                <div>
                  <div class="participant-name">${s.teamName||s.name}</div>
                  ${!o&&s.player1?`
                    <div class="participant-detail">${s.player1} & ${s.player2||"?"}</div>
                  `:""}
                </div>
              </div>
              <button class="btn btn-icon btn-danger" onclick="window.removeParticipant('${i}', '${s.id}')" title="Remove">
                ✕
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
                ✨ Generate Groups
              </button>
            </div>
          `:`
            <button class="btn btn-danger btn-sm" id="btn-clear-groups">
              🗑️ Clear Groups
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
          ${t.map(a=>{const n=a.participantIds.map(r=>d.getParticipantById(i,r)).filter(Boolean);return`
              <div class="group-card">
                <div class="group-card-header">
                  <span class="group-name">${a.name}</span>
                  <span class="group-count">${n.length} players</span>
                </div>
                ${N(i,a.id)}
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
    `;let o=0,s=0;for(const n of t)o+=n.matches.length,s+=n.matches.filter(r=>r.status==="completed").length;let a=`
    <div class="admin-section" id="section-matches">
      <div class="admin-section-header">
        <div class="admin-section-title">
          <span class="step-number">3</span>
          <span>Group Matches (${s}/${o} completed)</span>
        </div>
      </div>
  `;for(const n of t)a+=`
      <div style="margin-bottom: var(--space-xl);">
        <h3 style="margin-bottom: var(--space-md); color: var(--color-accent);">${n.name}</h3>
        <div class="match-grid">
          ${n.matches.map(r=>E(i,r,{isAdmin:!0,groupId:n.id})).join("")}
        </div>
      </div>
    `;return a+="</div>",a}function ee(i,e){const t=d.getGroups(i),o=d.getKnockout(i),s=o.rounds&&o.rounds.length>0;let a=t.length>0;for(const n of t)if(n.matches.some(r=>r.status!=="completed")){a=!1;break}return`
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
              <button class="btn btn-accent btn-sm" id="btn-generate-knockout" ${a?"":'disabled title="Complete all group matches first"'}>
                🏆 Generate Bracket
              </button>
            </div>
          `:""}
          ${s?`
            <button class="btn btn-danger btn-sm" id="btn-clear-knockout">
              🗑️ Clear Bracket
            </button>
          `:""}
        </div>
      </div>

      ${!a&&!s&&t.length>0?`
        <p class="text-muted" style="text-align: center; padding: var(--space-md);">
          Complete all group stage matches to generate the knockout bracket.
        </p>
      `:""}

      ${t.length===0&&!s?`
        <p class="text-muted" style="text-align: center; padding: var(--space-md);">
          Set up groups and complete group matches first.
        </p>
      `:""}

      ${s?T(i,!0):""}
    </div>
  `}function h(){const i=document.getElementById("admin-content");i&&(i.innerHTML=G(f),z())}function z(){const i=document.getElementById("btn-add-participant");i&&i.addEventListener("click",()=>te(f));const e=document.getElementById("btn-generate-groups");e&&e.addEventListener("click",()=>{const a=document.getElementById("group-size-select"),n=parseInt((a==null?void 0:a.value)||"4");d.generateGroups(f,n),g("Groups generated successfully!","success"),h()});const t=document.getElementById("btn-clear-groups");t&&t.addEventListener("click",()=>{S({title:"Clear Groups",message:"This will delete all groups, matches, scores, and the knockout bracket for this category. Are you sure?",onConfirm:()=>{d.clearGroups(f),g("Groups cleared","info"),h()},danger:!0,confirmLabel:"Clear All"})});const o=document.getElementById("btn-generate-knockout");o&&o.addEventListener("click",()=>{const a=document.getElementById("qualify-count-select"),n=parseInt((a==null?void 0:a.value)||"2");d.generateKnockout(f,n),g("Knockout bracket generated!","success"),h()});const s=document.getElementById("btn-clear-knockout");s&&s.addEventListener("click",()=>{S({title:"Clear Knockout",message:"This will remove the entire knockout bracket. Are you sure?",onConfirm:()=>{d.clearKnockout(f),g("Knockout bracket cleared","info"),h()},danger:!0,confirmLabel:"Clear Bracket"})})}function te(i){const e=d.getCategory(i),t=e.type==="singles";let o;t?o=`
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
    `,C({title:`Add ${t?"Player":"Team"} — ${e.name}`,content:o,submitLabel:`Add ${t?"Player":"Team"}`,onSubmit:()=>{var s,a,n,r,c,l,m,p;if(t){const v=(a=(s=document.getElementById("input-player-name"))==null?void 0:s.value)==null?void 0:a.trim();if(!v){g("Please enter a player name","error");return}d.addParticipant(i,{name:v}),g(`${v} added!`,"success")}else{const v=(r=(n=document.getElementById("input-team-name"))==null?void 0:n.value)==null?void 0:r.trim(),u=(l=(c=document.getElementById("input-player1"))==null?void 0:c.value)==null?void 0:l.trim(),y=(p=(m=document.getElementById("input-player2"))==null?void 0:m.value)==null?void 0:p.trim();if(!v){g("Please enter a team name","error");return}d.addParticipant(i,{teamName:v,player1:u,player2:y}),g(`${v} added!`,"success")}b(),h()}})}window.removeParticipant=function(i,e){const t=d.getParticipantById(i,e),o=t?t.teamName||t.name:"this participant";S({title:"Remove Participant",message:`Are you sure you want to remove <strong>${o}</strong>?`,onConfirm:()=>{d.removeParticipant(i,e),g(`${o} removed`,"info"),h()},danger:!0,confirmLabel:"Remove"})};window.setMatchLive=function(i,e,t){d.setMatchLive(i,e,t),g("Match set to live!","success"),h()};window.openScoreModal=function(i,e,t){const o=d.getGroups(i).find(l=>l.id===e),s=o==null?void 0:o.matches.find(l=>l.id===t);if(!s)return;const a=d.getParticipantById(i,s.player1Id),n=d.getParticipantById(i,s.player2Id),r=a?a.teamName||a.name:"Player 1",c=n?n.teamName||n.name:"Player 2";C({title:"Enter Score",content:`
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
    `,submitLabel:"Save Score",onSubmit:()=>{var p,v;const l=(p=document.getElementById("score-input-1"))==null?void 0:p.value,m=(v=document.getElementById("score-input-2"))==null?void 0:v.value;if(l===""||m===""){g("Please enter both scores","error");return}d.updateMatchScore(i,e,t,l,m),b(),g("Score saved!","success"),h()}})};window.resetMatchScore=function(i,e,t){S({title:"Reset Match",message:"Reset this match score and status?",onConfirm:()=>{d.resetMatch(i,e,t),g("Match reset","info"),h()},confirmLabel:"Reset"})};window.openKnockoutScoreModal=function(i,e,t){const s=d.getKnockout(i).rounds[e],a=s==null?void 0:s.matches.find(m=>m.id===t);if(!a)return;const n=d.getParticipantById(i,a.player1Id),r=d.getParticipantById(i,a.player2Id),c=n?n.teamName||n.name:"Player 1",l=r?r.teamName||r.name:"Player 2";C({title:`${s.name} — Enter Score`,content:`
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
    `,submitLabel:"Save Score",onSubmit:()=>{var v,u;const m=(v=document.getElementById("ko-score-1"))==null?void 0:v.value,p=(u=document.getElementById("ko-score-2"))==null?void 0:u.value;if(m===""||p===""){g("Please enter both scores","error");return}if(m===p){g("Knockout matches cannot be a draw!","error");return}d.updateKnockoutMatch(i,e,t,m,p),b(),g("Score saved! Winner advances.","success"),h()}})};function O(){if(!P){const a=document.getElementById("btn-admin-login"),n=document.getElementById("admin-password-input"),r=document.getElementById("password-error"),c=()=>{const l=(n==null?void 0:n.value)||"";if(d.checkPassword(l)){P=!0;const m=document.getElementById("app");if(m){const{renderNavbar:p,initNavbar:v}=se();m.innerHTML=p("/admin")+R(),v(),O()}}else r&&(r.textContent="Incorrect password. Try again.",r.classList.remove("hidden")),n==null||n.classList.add("shake"),setTimeout(()=>n==null?void 0:n.classList.remove("shake"),500)};a&&a.addEventListener("click",c),n&&n.addEventListener("keydown",l=>{l.key==="Enter"&&c()});return}const i=document.querySelectorAll("#admin-tabs .tab");i.forEach(a=>{a.addEventListener("click",()=>{f=a.dataset.category,i.forEach(n=>n.classList.remove("active")),a.classList.add("active"),h()})});const e=document.getElementById("btn-export-data");e&&e.addEventListener("click",()=>{const a=d.exportData(),n=new Blob([a],{type:"application/json"}),r=URL.createObjectURL(n),c=document.createElement("a");c.href=r,c.download=`loveall_tournament_${Date.now()}.json`,c.click(),URL.revokeObjectURL(r),g("Data exported!","success")});const t=document.getElementById("btn-import-data");t&&t.addEventListener("click",()=>{const a=document.createElement("input");a.type="file",a.accept=".json",a.onchange=n=>{const r=n.target.files[0];if(!r)return;const c=new FileReader;c.onload=l=>{d.importData(l.target.result)?(g("Data imported successfully!","success"),h()):g("Invalid data file","error")},c.readAsText(r)},a.click()});const o=document.getElementById("btn-reset-data");o&&o.addEventListener("click",()=>{S({title:"Reset All Data",message:"This will permanently delete ALL tournament data including participants, groups, matches, and scores. This cannot be undone!",onConfirm:()=>{d.reset(),g("All data has been reset","info"),h()},danger:!0,confirmLabel:"Reset Everything"})});const s=document.getElementById("btn-logout");s&&s.addEventListener("click",()=>{P=!1,window.dispatchEvent(new HashChangeEvent("hashchange"))}),z()}function se(){return{renderNavbar:i=>{const{renderNavbar:e}=window.__navbarModule||{};return e?e(i):""},initNavbar:()=>{const{initNavbar:i}=window.__navbarModule||{};i&&i()}}}window.__navbarModule={renderNavbar:B,initNavbar:_};const ne=document.getElementById("app"),M=[{path:"/",name:"home",render:q,init:W},{path:"/schedule",name:"schedule",render:U,init:V},{path:"/admin",name:"admin",render:R,init:O}],ae=new F(M,"/");function D(i){if(!i)return;const e=B(i.path),t=i.render();ne.innerHTML=e+t,_(),i.init&&i.init(),window.scrollTo(0,0)}ae.onRouteChange(i=>{D(i)});const ie=window.location.hash.slice(1)||"/",oe=M.find(i=>i.path===ie)||M[0];D(oe);

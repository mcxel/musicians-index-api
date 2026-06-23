(()=>{var e={};e.id=46392,e.ids=[46392],e.modules={647849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},572934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},155403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},554580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},794749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},345869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},220399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},333685:(e,r,t)=>{"use strict";t.r(r),t.d(r,{GlobalError:()=>a.ZP,__next_app__:()=>p,originalPathname:()=>d,pages:()=>c,routeModule:()=>m,tree:()=>l}),t(815369),t(140226),t(864543),t(858383),t(424921),t(230051),t(254534),t(931306),t(958909);var o=t(193282),n=t(905736),a=t(661249),s=t(436880),i={};for(let e in s)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(i[e]=()=>s[e]);t.d(r,i);let l=["",{children:["venues",{children:["[slug]",{children:["tickets",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(t.bind(t,815369)),"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\venues\\[slug]\\tickets\\page.tsx"]}]},{}]},{error:[()=>Promise.resolve().then(t.bind(t,140226)),"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\venues\\[slug]\\error.tsx"],loading:[()=>Promise.resolve().then(t.bind(t,864543)),"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\venues\\[slug]\\loading.tsx"]}]},{layout:[()=>Promise.resolve().then(t.bind(t,858383)),"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\venues\\layout.tsx"],error:[()=>Promise.resolve().then(t.bind(t,424921)),"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\venues\\error.tsx"],loading:[()=>Promise.resolve().then(t.bind(t,230051)),"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\venues\\loading.tsx"],metadata:{icon:[],apple:[],openGraph:[],twitter:[],manifest:"/manifest.webmanifest"}}]},{layout:[()=>Promise.resolve().then(t.bind(t,254534)),"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\layout.tsx"],error:[()=>Promise.resolve().then(t.bind(t,931306)),"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\error.tsx"],loading:[()=>Promise.resolve().then(t.bind(t,638048)),"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\loading.tsx"],"not-found":[()=>Promise.resolve().then(t.bind(t,958909)),"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\not-found.tsx"],metadata:{icon:[],apple:[],openGraph:[],twitter:[],manifest:"/manifest.webmanifest"}}],c=["C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\venues\\[slug]\\tickets\\page.tsx"],d="/venues/[slug]/tickets/page",p={require:t,loadChunk:()=>Promise.resolve()},m=new o.AppPageRouteModule({definition:{kind:n.x.APP_PAGE,page:"/venues/[slug]/tickets/page",pathname:"/venues/[slug]/tickets",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:l}})},31278:(e,r,t)=>{Promise.resolve().then(t.bind(t,385054)),Promise.resolve().then(t.bind(t,209912))},385054:(e,r,t)=>{"use strict";t.d(r,{default:()=>l});var o=t(473227),n=t(323677);let a=new Map,s=new Map;Object.values({"neon-palace":{venueId:"neon-palace",venueName:"Neon Palace",primaryColor:"#FF2DAA",secondaryColor:"#00FFFF",accentColor:"#FFD700",theme:"neon",fontFamily:"'Arial Black', sans-serif",ticketStyle:"card"},"beat-lab":{venueId:"beat-lab",venueName:"Beat Lab",primaryColor:"#AA2DFF",secondaryColor:"#00FF88",accentColor:"#FF8C00",theme:"modern",fontFamily:"'Helvetica Neue', sans-serif",ticketStyle:"strip"},"cypher-stage":{venueId:"cypher-stage",venueName:"Cypher Stage",primaryColor:"#00FFFF",secondaryColor:"#FF2DAA",accentColor:"#FFD700",theme:"minimal",fontFamily:"'Courier New', monospace",ticketStyle:"certificate"}}).forEach(e=>{a.set(e.venueId,e)});class i{static async getBranding(e){return a.get(e)||{venueId:e,venueName:`Venue ${e}`,primaryColor:"#050510",secondaryColor:"#FFFFFF",accentColor:"#00FFFF",theme:"modern",fontFamily:"Arial, sans-serif",ticketStyle:"card"}}static async updateBranding(e,r){let t=a.get(e);return t||(t={venueId:e,venueName:r.venueName||`Venue ${e}`,primaryColor:"#050510",secondaryColor:"#FFFFFF",accentColor:"#00FFFF",theme:"modern",fontFamily:"Arial, sans-serif",ticketStyle:"card"},a.set(e,t)),r.primaryColor&&(t.primaryColor=r.primaryColor),r.secondaryColor&&(t.secondaryColor=r.secondaryColor),r.accentColor&&(t.accentColor=r.accentColor),r.logo&&(t.logo=r.logo),r.backgroundPattern&&(t.backgroundPattern=r.backgroundPattern),r.theme&&(t.theme=r.theme),r.fontFamily&&(t.fontFamily=r.fontFamily),r.ticketStyle&&(t.ticketStyle=r.ticketStyle),r.customCSS&&(t.customCSS=r.customCSS),t}static async applyBrandingToTicket(e,r,t){let o=await this.getBranding(t),n=this.generateBrandingCSS(o),a={ticketId:e,venueId:t,brandingApplied:!0,htmlWithBranding:this.injectBrandingCSS(r,n,o),cssOverrides:n,appliedAt:new Date().toISOString()};return s.set(e,a),a}static generateBrandingCSS(e){let r=`
      :root {
        --primary-color: ${e.primaryColor};
        --secondary-color: ${e.secondaryColor};
        --accent-color: ${e.accentColor};
      }

      body {
        font-family: ${e.fontFamily};
      }

      .ticket {
        background: linear-gradient(135deg, ${e.primaryColor}15 0%, ${e.secondaryColor}10 100%);
        border-color: ${e.primaryColor};
        color: ${e.secondaryColor};
      }

      .header {
        color: ${e.primaryColor};
        font-size: 28px;
        text-shadow: 0 0 10px ${e.accentColor}55;
      }

      .venue {
        color: ${e.secondaryColor};
        border-left: 4px solid ${e.accentColor};
        padding-left: 12px;
      }

      .details {
        color: ${e.secondaryColor};
        background: ${e.primaryColor}20;
        border-radius: 8px;
        padding: 10px;
      }

      .owner {
        color: ${e.accentColor};
        background: ${e.primaryColor}30;
        padding: 8px;
        border-radius: 4px;
      }

      .barcode {
        color: ${e.primaryColor};
        border: 2px solid ${e.accentColor};
        padding: 8px;
        background: ${e.secondaryColor}20;
      }
    `;return"neon"===e.theme&&(r+=`
        .ticket {
          box-shadow: 0 0 20px ${e.primaryColor}88, inset 0 0 20px ${e.primaryColor}22;
        }
        .header {
          text-shadow: 0 0 10px ${e.primaryColor}, 0 0 20px ${e.accentColor};
        }
      `),"minimal"===e.theme&&(r+=`
        .ticket {
          background: #fff;
          border: 1px solid #ddd;
        }
      `),e.customCSS&&(r+=e.customCSS),r}static injectBrandingCSS(e,r,t){let o=`
      <style>
        ${r}
      </style>
    `,n=e.indexOf("</head>");return -1!==n?e.substring(0,n)+o+e.substring(n):o+e}static async getPreview(e){return s.get(e)||null}static async applyTheme(e,r){let t={modern:{primaryColor:"#0066CC",secondaryColor:"#FFFFFF",accentColor:"#FF9900",fontFamily:"'Segoe UI', sans-serif"},classic:{primaryColor:"#333333",secondaryColor:"#EEEEEE",accentColor:"#D4AF37",fontFamily:"'Georgia', serif"},neon:{primaryColor:"#FF00FF",secondaryColor:"#00FFFF",accentColor:"#FFFF00",fontFamily:"'Arial Black', sans-serif"},minimal:{primaryColor:"#000000",secondaryColor:"#FFFFFF",accentColor:"#888888",fontFamily:"'Helvetica', sans-serif"}},o=t[r]||t.modern;return this.updateBranding(e,{theme:r,...o})}static async getAllBrandings(){return Array.from(a.values())}static async revertToDefault(e){a.delete(e)}}function l({venueId:e}){let[r,t]=(0,n.useState)("neon"),[a,s]=(0,n.useState)("");async function l(){await i.applyTheme(e,r),s(`Theme applied: ${r}`)}return(0,o.jsxs)("div",{style:{border:"1px solid rgba(255,45,170,0.3)",borderRadius:10,padding:12},children:[o.jsx("div",{style:{fontSize:10,color:"#FF2DAA",marginBottom:6,fontWeight:700},children:"VENUE BRANDING"}),(0,o.jsxs)("select",{value:r,onChange:e=>t(e.target.value),style:{width:"100%",marginBottom:8,padding:"8px 10px",borderRadius:8,border:"1px solid rgba(255,45,170,0.3)",background:"#0a0f1a",color:"#fff"},children:[o.jsx("option",{value:"modern",children:"modern"}),o.jsx("option",{value:"classic",children:"classic"}),o.jsx("option",{value:"neon",children:"neon"}),o.jsx("option",{value:"minimal",children:"minimal"})]}),o.jsx("button",{onClick:l,style:{padding:"6px 12px",borderRadius:8,border:"1px solid rgba(255,45,170,0.6)",background:"rgba(255,45,170,0.16)",color:"#fff",cursor:"pointer"},children:"Apply Branding"}),a&&o.jsx("div",{style:{marginTop:8,fontSize:11,color:"rgba(255,255,255,0.72)"},children:a})]})}},815369:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>p});var o=t(199013),n=t(128803);function a(e){return(0,o.jsxs)("section",{"aria-label":"Ticket Wallet Panel",children:[o.jsx("h2",{children:"Ticket Wallet"}),o.jsx("ul",{style:{listStyle:"none",padding:0,margin:0},children:e.tickets.map(r=>(0,o.jsxs)("li",{style:{border:"1px solid #333",padding:12,marginBottom:10,borderRadius:8},children:[o.jsx("div",{children:o.jsx("strong",{children:r.eventName})}),(0,o.jsxs)("div",{children:["Venue: ",r.venueName]}),(0,o.jsxs)("div",{children:["Status: ",r.status]}),(0,o.jsxs)("div",{children:["QR Preview: ",r.qrValue.slice(0,16),"..."]}),(0,o.jsxs)("div",{style:{marginTop:8,display:"flex",gap:8},children:[o.jsx("button",{onClick:()=>e.onTransfer(r.ticketId),children:"Transfer"}),o.jsx("button",{onClick:()=>e.onRefund(r.ticketId),children:"Refund"})]})]},r.ticketId))})]})}t(976321);var s=t(353189);let i=(0,s.createProxy)(String.raw`C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\components\tickets\VenueTicketBrandingPanel.tsx`),{__esModule:l,$$typeof:c}=i;i.default;let d=(0,s.createProxy)(String.raw`C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\components\tickets\VenueTicketBrandingPanel.tsx#default`);function p({params:e}){return o.jsx("main",{style:{minHeight:"100vh",background:"#050510",color:"#fff",padding:20},children:(0,o.jsxs)("div",{style:{maxWidth:1100,margin:"0 auto",display:"grid",gap:12},children:[o.jsx(n.ZP,{slug:e.slug,focus:"tickets"}),(0,o.jsxs)("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:10},children:[o.jsx(a,{tickets:[],onTransfer:()=>{},onRefund:()=>{}}),o.jsx(d,{venueId:e.slug})]})]})})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[44522,72295,30104,98143,16321,87257,84140],()=>t(333685));module.exports=o})();
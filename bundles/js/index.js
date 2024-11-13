import{matter as e,visit as t,h as n,unified as o,remarkParse as r,remarkGfm as i,remarkSub as s,remarkSuper as a,remarkDirective as l,remarkRehype as c,rehypeSlug as d,rehypeHighlight as h,rehypeHighlightLines as m,rehypeRaw as u,rehypeSanitize as p,defaultSchema as g,rehypeToc as w,toHtml as b,rehypeRewrite as f,rehypeStringify as v,remarkFrontmatter as y}from"unified-externals";class k extends HTMLElement{connectedCallback(){this.innerHTML="\n          <article></article>\n        "}update(e,t){const n=this.querySelector("article");n&&(null==t?null!=e&&(n.innerHTML=e):n.innerHTML=t)}}function M(){return function(t,n){e(n)}}const C={selector:"pre,li,a",rewrite:(e,t,n)=>{"element"===e.type&&("pre"===e.tagName?function(e,t,n){if("element"!==e.type)return;const o=e.children[0];let r="";if("element"===o.type&&"code"===o.tagName){const t=o.properties.className||[];for(let n=0;n<t.length;n++){const o=t[n].match(/language-(.*)$/);if(o){r=o[1],e.properties["data-lang"]=o[1];break}}}const i={type:"element",tagName:"div",properties:{className:["code-block"]},children:[{type:"element",tagName:"div",properties:{className:["code-block-actions"]},children:[{type:"element",tagName:"span",properties:{className:["code-block-actions--copy"]},children:[{type:"text",value:"copy"}]},{type:"element",tagName:"span",properties:{className:["code-block-actions--lang"]},children:[{type:"text",value:r}]}]},e]};n.children.splice(t,1,i)}(e,t,n):"li"!==e.tagName&&"a"!==e.tagName||function(e){if("element"!==e.type)return;e.properties.id&&e.properties.id.startsWith("user-content-user-content-")&&(e.properties.id=e.properties.id.replace("user-content-user-content-","user-content-"))}(e))}};const L="note-",x=["warning","important","tip","caution","info"],S=[new RegExp(`^${L}`)],H=[new RegExp(`^${L}`)];function T(){const e=x.reduce(((e,t)=>(e[L+t]=!0,e)),{}),o=L+"info";return r=>{t(r,(t=>{if("containerDirective"===t.type&&"note"===t.name){const r=t.data||(t.data={}),i="div";r.hName="div",r.hProperties=n(i,t.attributes||{}).properties;let s="";if(r.hProperties.className){const t=[];for(let n=r.hProperties.className.length-1;n>=0;n--){const o=r.hProperties.className[n],i=r.hProperties.className[n].startsWith(L)?o:L+o;e[i]?s||(t.unshift(i),s=o):t.unshift(o)}r.hProperties.className=t}else s="info",r.hProperties.className=[o];if(t.children.length>0){const e=t.children[0];if(e.data&&!0===e.data.directiveLabel){e.attributes={...e.attributes,class:L+"title"},e.data.hName="p",e.data.hProperties=n(e.data.hName,e.attributes).properties;const t={type:"html",value:`<w-svg-icon href="${s||"info"}"></w-svg-icon>`};e.children.unshift(t)}}}}))}}function E(e){return(e=>{let t="";const n=o().use(r,{fragment:!0}).use(i).use(s).use(a).use(l).use(T).use(c,{allowDangerousHtml:!0}).use(d).use(h,{detect:!1,prefix:"hljs-"}).use(m,{showLineNumbers:!0,lineContainerTagName:"div"}).use(u).use(p,{attributes:{...g.attributes,code:[["className",/(hljs|language-)/],...g.attributes.code||[]],span:[...g.attributes.span||[],["className",/^hljs-?/,/(code-line|numbered-code-line)/]],div:[...g.attributes.div||[],["className",/^hljs-?/,/(code-line|numbered-code-line)/,...S],"dataLineNumber"],h2:["id",...g.attributes.h2||[]],p:[["className",...H]],"w-svg-icon":["href","width","height"],"w-code-loadview":["src","caption","lang"]},tagNames:[...g.tagNames,"w-svg-icon","w-code-loadview"]}).use(w,{headings:["h1","h2","h3","h4"],nav:!0,customizeTOC:e=>(t=b(e),!1)}).use(f,C).use(v).use(y,["yaml"]).use(M).processSync(e);return{html:String(n),frontmatter:n.data&&n.data.matter||{},tocHTML:t}})(e)}function j(e,t){return Object.prototype.toString.call(e)==="[object "+t+"]"}function N(e){if("string"==typeof e)try{let t=e.trim();return-1===t.indexOf(" ")&&-1===t.indexOf("T")&&(t+="T12:00:00.000Z"),new Date(t)}catch{return null}return e instanceof Date?e:null}function A(e){return j(e,"String")?e.split(",").map((e=>j(e,"String")?e.trim():"")).filter(Boolean):j(e,"Array")?e:[]}class B extends HTMLElement{#e;#t;#n;#o;#r;connectedCallback(){this.load()}attributeChangedCallback(e,t,n){"src"===e&&n!==t&&this.load()}load(){const e=this.formatSrc(this.getAttribute("src"));e&&e!==this.#r&&(this.#r=e,this.classList.add("loading"),fetch(e).then((e=>e.text())).then((e=>{const t=E(e);var n,o;this.#e=t.html,this.#t=t.tocHTML,this.#n={title:j((n=t.frontmatter).title,"String")?n.title:"Untitled",author:j(n.author,"String")?n.author:"wiskewu",categories:A(n.category),tags:A(n.tags),created:N(n.created),updated:N(n.updated),top:(o=n.top,null!=o&&!1!==o&&0!==o&&""!==o&&!Number.isNaN(o)),summary:j(n.summary,"String")?n.summary:""},this.#o=null})).catch((e=>this.#o=e.message)).finally((()=>{this.notify(),this.classList.remove("loading")})))}formatSrc(e){if(!e)return;return e.split("/").pop().endsWith(".md")||(e+=".md"),e}notify(){this.dispatchEvent(new CustomEvent("w-event:md-loaded",{detail:{html:this.#e,tocHtml:this.#t,matter:this.#n,error:this.#o}}))}getDetail(){return{html:this.#e,tocHtml:this.#t,matter:this.#n,error:this.#o}}static get observedAttributes(){return["src"]}}const q=document.createDocumentFragment();q.innerHTML='\n<w-blog-layout>\n    <w-md-loader></w-md-loader>\n    <div id="page-header">\n      <w-blog-header></w-blog-header>\n    </div>\n    <div id="page-content">\n      <div class="post-page__title">\n          <h1></h1>\n          <hr/>\n      </div>\n      <w-md-viewer></w-md-viewer>\n      <w-md-toc></w-md-toc>\n      <w-blog-eof></w-blog-eof>\n    </div>\n    <div id="page-footer">\n      <w-blog-footer></w-blog-footer>\n    </div>\n</w-blog-layout>\n';class $ extends HTMLElement{constructor(){super(),this.update=this.update.bind(this)}connectedCallback(){if(this.querySelector("w-blog-layout"))return;this.innerHTML=q.innerHTML;const e=this.querySelector("w-md-loader");e&&(e.setAttribute("src",this.getAttribute("src")),e.addEventListener("w-event:md-loaded",(e=>{this.update(e.detail)})))}update(e){const{html:t,tocHtml:n,error:o,matter:r}=e,i=this.querySelector("w-md-viewer"),s=this.querySelector("w-blog-eof"),a=this.querySelector("w-md-toc");i&&i.update(t,o),a&&a.update(n,o),s&&s.update(r,o),this.updateTitle(r?r.title:"")}updateTitle(e){let t="Untitled";const n=this.querySelector(".post-page__title > h1");n&&(e&&"string"==typeof e&&(t=e),n.textContent=t)}}class z extends HTMLElement{constructor(){super(),this.update=this.update.bind(this)}connectedCallback(){document.querySelector('[data-name="toc"]')||(this.innerHTML='\n      <section data-name="toc">\n        <div></div>\n      </section>\n    ')}update(e,t){const n=this.querySelector('[data-name="toc"]');n&&n.firstElementChild&&(n.firstElementChild.innerHTML=t?"":e)}}class _ extends HTMLElement{connectedCallback(){if(document.querySelector("#header"))return;const e=window.env&&window.env.root||"/";this.innerHTML=`\n      <header>\n        <a href="${e}blog/index.html" title="Adiós·Vanilla Blog">\n          <div class="logo-container">\n            <div class="logo-container__logo"></div>\n            <span class="logo-container__title">&nbsp;Adiós·VBlog</span>\n          </div>\n        </a>\n        <div class="navbar">\n          <a href="${e}blog/pages/links/index.html">Link</a>\n          <a href="${e}blog/pages/about/index.html">About</a>\n        </div>\n        <div class="settings">\n          <w-theme-toggle></w-theme-toggle>\n        </div>\n      </header>\n    `}}class D extends HTMLElement{connectedCallback(){if(this.querySelector("button"))return;this.innerHTML='\n      <button type="button" class="toggle" aria-label="Theme Toggle Button">\n        <w-svg-icon class="theme-icon-light" href="sun"></w-svg-icon>\n        <w-svg-icon class="theme-icon-dark" href="moon"></w-svg-icon>\n      </button>\n    ';this.querySelector("button").addEventListener("click",(()=>{const e="light"===(document.documentElement.getAttribute("data-theme")||"light")?"dark":"light";document.documentElement.setAttribute("data-theme",e),localStorage.setItem("theme",e)}))}}class V extends HTMLElement{constructor(){super(),this.update=this.update.bind(this)}connectedCallback(){document.querySelector('[data-name="matter"]')||(this.innerHTML='\n      <div data-name="matter">\n        <h1></h1>\n        <p class="matter-author"></p>\n        <p class="matter-category"></p>\n        <p class="matter-tags"></p>\n        <p class="matter-timeline__created"></p>\n        <p class="matter-timeline__updated"></p>\n        <hr/>\n      </div>\n    ')}update(e,t){if(t)return;const n=this.querySelector("h1"),o=this.querySelector(".matter-author"),r=this.querySelector(".matter-category"),i=this.querySelector(".matter-tags"),s=this.querySelector(".matter-timeline__created"),a=this.querySelector(".matter-timeline__updated");if(n&&(n.textContent=j(e.title,"String")?e.title:"Untitled"),o&&(o.textContent=j(e.author,"String")?"author: "+e.author:"author: wiskewu"),r){const t=this.toStrArray(e.category);t.length&&(r.innerHTML="categories:&nbsp;"+t.map((e=>`<a href="#">${e}</a>`)).join("&nbsp;"))}if(i){const t=this.toStrArray(e.tags);t.length&&(i.innerHTML="tags:&nbsp;"+t.map((e=>`<a href="#">${e}</a>`)).join("&nbsp;"))}if(s){const t=N(e.created);if(t){const e=t.toISOString();s.innerHTML=`<span>published:&nbsp;</span><time title=${e} datetime=${e}>${t.toLocaleDateString()}</time>`}else s.innerHTML=""}if(a){const t=N(e.updated);if(t){const e=t.toISOString();a.innerHTML=`<span>lastModified:&nbsp;</span><time title=${e} datetime=${e}>${t.toLocaleDateString()}</time>`}else a.innerHTML=""}}toStrArray(e){return j(e,"String")?e.split(",").map((e=>j(e,"String")?e.trim():"")).filter(Boolean):j(e,"Array")?e:[]}}class I extends HTMLElement{constructor(){super(),this.update=this.update.bind(this)}connectedCallback(){document.querySelector('[data-name="eof"]')||(this.innerHTML='\n      <div data-name="eof">\n        <p class="eof-line"><span>--<attr title="END OF LINE">EOF</attr></span>--</p>\n        <p class="eof-author"></p>\n        <p class="eof-category"></p>\n        <p class="eof-tags"></p>\n        <p class="eof-timeline__created"></p>\n        <p class="eof-timeline__updated"></p>\n      </div>\n    ')}update(e,t){if(t)return;const n=this.querySelector(".eof-author"),o=this.querySelector(".eof-category"),r=this.querySelector(".eof-tags"),i=this.querySelector(".eof-timeline__created"),s=this.querySelector(".eof-timeline__updated");if(n){const t=j(e.author,"String")?e.author:"wiskewu";n.innerHTML=`<span title="author"><w-svg-icon href="user-circle"></w-svg-icon></span>&nbsp;<span>${t}</span>`}if(o){const t=this.toStrArray(e.category);t.length&&(o.innerHTML='<span title="categories"><w-svg-icon href="puzzle-piece"></w-svg-icon></span>&nbsp;'+t.map((e=>`<a href="#">${e}</a>`)).join("&nbsp;"))}if(r){const t=this.toStrArray(e.tags);t.length&&(r.innerHTML='<span title="tags"><w-svg-icon href="paper-clip"></w-svg-icon></span>&nbsp;'+t.map((e=>`<a href="#">${e}</a>`)).join("&nbsp;"))}const a=N(e.created);if(i)if(a){const e=a.toISOString();i.innerHTML=`<span title="published"><w-svg-icon href="calendar"></w-svg-icon></span>&nbsp;<time title=${e} datetime=${e}>${a.toLocaleDateString()}</time>`}else i.innerHTML="";if(s){const t=N(e.updated);if(!t||a&&t.getTime()===a.getTime())s.innerHTML="";else{const e=t.toISOString();s.innerHTML=`<span title="lastModified"><w-svg-icon href="calendar"></w-svg-icon></span>&nbsp;<time title=${e} datetime=${e}>${t.toLocaleDateString()}</time>`}}}toStrArray(e){return j(e,"String")?e.split(",").map((e=>j(e,"String")?e.trim():"")).filter(Boolean):j(e,"Array")?e:[]}}class O extends HTMLElement{connectedCallback(){if(this.querySelector("ul"))return;if(this.getElementsByTagName("ul")[0])return;const e=this.getAttribute("title");this.innerHTML=`\n        <h2>${e}</h2>\n        <ul></ul>\n      `,this.load()}attributeChangedCallback(e,t,n){"src"===e&&n!==t&&this.load()}load(){const e=this.formatSrc(this.getAttribute("src")),t=this.getElementsByTagName("ul")[0];e&&t&&(this.classList.add("loading"),this.setMessage("Loading..."),fetch(e).then((e=>e.json())).then((e=>{Array.isArray(e)?this.setData(e):this.setMessage("Data formatted incorrectly")})).catch((e=>this.setMessage(e.message))).finally((()=>{this.classList.remove("loading")})))}formatSrc(e){if(!e)return;return e.split("/").pop().endsWith(".json")||(e+=".json"),e}setData(e){let t=+this.getAttribute("data-limit");const n=this.getAttribute("data-dk")||"created",o="true"===this.getAttribute("data-top"),r=this.sort(e,n,o);t=Number.isNaN(t)||!t?r.length:t,t<0&&(t=r.length);const i=r.slice(0,t),s=this.getElementsByTagName("ul")[0];if(s)if(i.length){const e=document.createDocumentFragment();i.slice(0,t).forEach((t=>{const r=document.createElement("li"),i=document.createElement("a"),s=document.createElement("h3");i.href=t.slug,s.textContent=t.title;if(N(t[n])){const e=document.createElement("span");e.innerHTML=N(t[n]).toLocaleDateString(),s.appendChild(e)}if(o&&t.top){const e=document.createElement("span");e.className="top",e.innerHTML='<w-svg-icon href="flag" width=".75rem" height=".75rem"></w-svg-icon>',s.appendChild(e)}if(i.appendChild(s),t.summary){const e=document.createElement("p");e.className="summary",e.textContent=t.summary,i.appendChild(e)}r.appendChild(i),e.appendChild(r)})),s.innerHTML="",s.appendChild(e)}else s.innerHTML="<li><i>No data</i></li>"}setMessage(e){const t=this.getElementsByTagName("ul")[0];t&&(t.innerHTML=`<li><i>${e}</i></li>`)}sort(e,t,n){const o=(e,n)=>e[t]&&n[t]?N(n[t]).getTime()-N(e[t]).getTime():0;if(n){const t=e.filter((e=>e.top)),n=e.filter((e=>!e.top));return t.sort(((e,t)=>e.top&&t.top?0:t.top?1:-1)),n.sort(o),[...t,...n]}return[...e].sort(o)}static get observedAttributes(){return["src"]}}document.createElement("template").innerHTML='\n  <slot name="header"><w-blog-header></w-blog-header></slot>\n  <slot name="content"></slot>\n  <slot name="footer"><w-blog-footer></w-blog-footer></slot>';class Z extends HTMLElement{constructor(){super(),this.initTheme(),this.enableCodeCopy()}connectedCallback(){if(this.querySelector("#root"))return;const e=document.createElement("div");e.id="root",e.append(...this.childNodes),this.append(e)}initTheme(){let e;try{e=localStorage.getItem("theme")}catch(e){}null==e&&(e="light"),document.documentElement.setAttribute("data-theme",e)}enableCodeCopy(){document.addEventListener("click",(e=>{if(e.target&&e.target.tagName&&e.target.classList&&Array.from(e.target.classList).includes("code-block-actions--copy")){let t=e.target;for(;t&&(!t.classList||!Array.from(t.classList).includes("code-block"));)t=t.parentNode;if(!t)return;const n=t.querySelector("code");if(n){const t=n.textContent,o=document.createElement("textarea");o.style.opacity="0",o.style.height="0px",o.value=t,document.body.appendChild(o),o.select(),document.execCommand("copy"),document.body.removeChild(o);const r=e.target.textContent;e.target.textContent="Copied!",setTimeout((()=>{e.target.textContent=r}),1e3)}}}))}}class P extends HTMLElement{constructor(){super(),this.update=this.update.bind(this)}connectedCallback(){if(this.querySelector("w-md-loader"))return;this.innerHTML='\n      <div data-role="viewer" style="margin: 0 var(--content-margin)">\n        <w-md-loader></w-md-loader>\n        <w-md-viewer></w-md-viewer>\n      </div>\n    ';const e=this.querySelector("w-md-loader");e&&(e.setAttribute("src",this.getAttribute("src")),e.addEventListener("w-event:md-loaded",(e=>{this.update(e.detail)})))}update(e){const{html:t,error:n}=e,o=this.querySelector("w-md-viewer");o&&o.update(t,n)}}class W extends HTMLElement{connectedCallback(){const e=(new Date).getFullYear();this.innerHTML=`\n        <style>\n          .copyright {\n            text-align: center;\n            color: var(--primary-text-color);\n            padding-bottom: 1rem;\n            font-size: .75rem;\n          }\n        </style>\n        <div class="copyright">\n          <hr />\n          <i>\n            © 2022 - ${e} wiskeWu.\n            <a title="Creative Commons Attribution 4.0 International License" target="_blank" rel="noopener noreferrer" href="http://creativecommons.org/licenses/by/4.0/deed.zh">\n              <abbr class="share-license" title="This site and all its content are licensed under a Creative Commons Attribution-NonCommercial 4.0 International License.">CC BY-NC 4.0</abbr>\n            </a>\n          </i>\n        </div>\n      `,requestIdleCallback((()=>{this.load()}))}load(){const e=window.env.root||"/";fetch(e+"blog/data/info.json").then((e=>e.json())).then((e=>{const t=this.querySelector(".copyright");e&&e.buildTime&&(t.innerHTML+=`<br />Build at ${new Date(e.buildTime).toLocaleString()}`)}))}}class F extends HTMLElement{connectedCallback(){if(this.querySelector("svg"))return;const{width:e,height:t,style:n}=this.getStyle(),o=this.getHref();this.innerHTML=`\n      <svg aria-hidden="true" class="icon" width="${e}" height="${t}" style="${n}">\n        <use xlink:href="${o}" x="0" y="0" width="${e}" height="${t}"></use>\n      </svg>\n    `}getStyle(){const e=this.getAttribute("width"),t=this.getAttribute("height"),n=this.getAttribute("color");let o="vertical-align: middle;";return n&&(o+=`color: ${n};`),{width:e||18,height:t||18,style:o}}getHref(){const e=this.getAttribute("href");return e?e.startsWith("#")?e:`#${e}`:""}}class U extends HTMLElement{#i="";#s="";connectedCallback(){this.querySelector(".code-viewer")||(this.innerHTML='\n            <div class="code-viewer">\n                <label></label>\n            </div>\n        ',this.formatInfo(),requestIdleCallback((()=>this.load())))}load(){const e=this.getAttribute("src");e?(this.classList.add("loading"),fetch(e).then((e=>e.text())).then((e=>{this.update(e)})).catch((e=>this.showError(e.message))).finally((()=>this.classList.remove("loading")))):this.showError("No src attribute provided")}formatInfo(){const e=this.getAttribute("src")||"",t=this.getAttribute("lang")||"",n=this.getAttribute("caption")||"",o=e.split(".").pop(),r=e.split("/").pop();this.#s=n||r,this.#i=t||o}update(e){const t=this.querySelector(".code-viewer"),n=t.querySelector("label");if(t&&n)if(n.textContent=this.#s,e.trim()){const n=E("```"+this.#i+"\n"+e+"\n```");n.html&&(t.innerHTML+=n.html)}else this.showError("Empty file")}showError(e){const t=this.querySelector(".code-viewer"),n=t.querySelector("label");if(t&&n){t.innerHTML="",t.appendChild(n);const o=`<pre><code>${e}</code></pre>`;t.innerHTML+=o}}}document.addEventListener("DOMContentLoaded",(async()=>{var e,t,n;customElements.define("w-md-loader",B),customElements.define("w-md-viewer",k),customElements.define("w-md-toc",z),customElements.define("w-theme-toggle",D),customElements.define("w-blog-header",_),customElements.define("w-md-matter",V),customElements.define("w-blog-eof",I),customElements.define("w-blog-list",O),customElements.define("w-blog-post-page",$),customElements.define("w-blog-layout",Z),customElements.define("w-md-loadview",P),customElements.define("w-blog-footer",W),customElements.define("w-svg-icon",F),customElements.define("w-code-loadview",U),e={tag:'<symbol id="tag" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></symbol>',home:'<symbol id="home" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></symbol>',folder:'<symbol id="folder" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></symbol>',"chevron-up":'<symbol id="chevron-up" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></symbol>',"arrow-left":'<symbol id="arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></symbol>',"arrow-right":'<symbol id="arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></symbol>',"arrow-up":'<symbol id="arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></symbol>',"arrow-down":'<symbol id="arrow-down" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></symbol>',sun:'<symbol id="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></symbol>',moon:'<symbol id="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></symbol>',archive:'<symbol id="archive" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></symbol>',"at-symbol":'<symbol id="at-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></symbol>',calendar:'<symbol id="calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></symbol>',code:'<symbol id="code" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></symbol>',"dots-horizontal":'<symbol id="dots-horizontal" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></symbol>',"dots-vertical":'<symbol id="dots-vertical" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></symbol>',"pencil-alt":'<symbol id="pencil-alt" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></symbol>',rss:'<symbol id="rss" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"></path></symbol>',user:'<symbol id="user" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></symbol>',users:'<symbol id="users" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></symbol>',"user-circle":'<symbol id="user-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></symbol>',"user-group":'<symbol id="user-group" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></symbol>',cog:'<symbol id="cog" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></symbol>',flag:'<symbol id="flag" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></symbol>',map:'<symbol id="map" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></symbol>',"paper-clip":'<symbol id="paper-clip" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"></path></symbol>',"puzzle-piece":'<symbol id="puzzle-piece" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z"></path></symbol>',clock:'<symbol id="clock" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></symbol>',"arrow-turn-left":'<symbol id="arrow-turn-left" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"></path></symbol>',info:'<symbol id="info" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"></path></symbol>',tip:'<symbol id="tip" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"></path></symbol>',warning:'<symbol id="warning" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"></path></symbol>',caution:'<symbol id="caution" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"></path></symbol>',important:'<symbol id="important" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"></path></symbol>'},t=Object.values(e).join(""),(n=document.createElement("div")).innerHTML=`<svg aria-hidden="true" style="position: absolute; width: 0px; height: 0px; overflow: hidden;">${t}</svg>`,document.head.appendChild(n.firstChild),n.remove(),n=null}));

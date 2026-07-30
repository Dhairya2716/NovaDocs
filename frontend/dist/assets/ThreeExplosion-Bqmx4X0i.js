import{r as S,j}from"./motion-wG387-V0.js";import{W as B,S as H,P as _,C as p,B as k,a as C,b as L,A as N,c as G,d as I}from"./three-oHCDOM6C.js";function D({className:T=""}){const x=S.useRef(null);return S.useEffect(()=>{const i=x.current;if(!i)return;const r=new B({antialias:!0,alpha:!0});r.setPixelRatio(Math.min(window.devicePixelRatio,2)),r.setSize(i.clientWidth,i.clientHeight),r.setClearColor(0,0),i.appendChild(r.domElement);const b=new H,c=new _(60,i.clientWidth/i.clientHeight,.1,1e3);c.position.z=5;const s=3200,g=new Float32Array(s*3),a=new Float32Array(s*3),u=new Float32Array(s*3),A=new Float32Array(s*3),y=new Float32Array(s),P=[new p(15247416),new p(15777376),new p(5822916),new p(8317398),new p(16503948),new p(15247416),new p(15247416)];for(let d=0;d<s;d++){const t=d*3;g[t]=0,g[t+1]=0,g[t+2]=0;const m=Math.random()*Math.PI*2,n=Math.acos(2*Math.random()-1),e=.02+Math.random()*.06;a[t]=Math.sin(n)*Math.cos(m)*e,a[t+1]=Math.sin(n)*Math.sin(m)*e,a[t+2]=Math.cos(n)*e*.4;const o=3.5+Math.random()*3;u[t]=Math.sin(n)*Math.cos(m)*o,u[t+1]=Math.sin(n)*Math.sin(m)*o,u[t+2]=Math.cos(n)*o*.3;const l=P[Math.floor(Math.random()*P.length)];A[t]=l.r,A[t+1]=l.g,A[t+2]=l.b,y[d]=1.5+Math.random()*3.5}const h=new k;h.setAttribute("position",new C(g,3)),h.setAttribute("color",new C(A,3)),h.setAttribute("size",new C(y,1));const f=new L({vertexShader:`
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float dist = length(position);
          vAlpha = clamp(dist * 0.3 + 0.1, 0.05, 0.9);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,fragmentShader:`
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = vAlpha * (1.0 - smoothstep(0.3, 0.5, d));
          gl_FragColor = vec4(vColor, alpha);
        }
      `,uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:N,vertexColors:!0}),R=new G(h,f);b.add(R);let v=0,z;const W=new I,E=()=>{z=requestAnimationFrame(E);const d=W.getDelta();v+=d,f.uniforms.uTime.value+=d;const t=h.attributes.position.array;if(v<1.8)for(let n=0;n<s;n++){const e=n*3;t[e]+=a[e],t[e+1]+=a[e+1],t[e+2]+=a[e+2],a[e]*=.97,a[e+1]*=.97,a[e+2]*=.97}else if(v<6){const n=f.uniforms.uTime.value;for(let e=0;e<s;e++){const o=e*3,l=u[o],M=u[o+1],w=u[o+2];t[o]+=(l*.6+Math.sin(n*.4+e)*.01-t[o])*.005,t[o+1]+=(M*.6+Math.cos(n*.3+e)*.01-t[o+1])*.005,t[o+2]+=(w*.6-t[o+2])*.005}}else{let n=!0;for(let e=0;e<s;e++){const o=e*3;t[o]*=.94,t[o+1]*=.94,t[o+2]*=.94,Math.abs(t[o])>.05&&(n=!1)}if(n||v>9){v=0;for(let e=0;e<s;e++){const o=e*3;t[o]=0,t[o+1]=0,t[o+2]=0;const l=Math.random()*Math.PI*2,M=Math.acos(2*Math.random()-1),w=.02+Math.random()*.06;a[o]=Math.sin(M)*Math.cos(l)*w,a[o+1]=Math.sin(M)*Math.sin(l)*w,a[o+2]=Math.cos(M)*w*.4}}}h.attributes.position.needsUpdate=!0;const m=f.uniforms.uTime.value;c.position.x=Math.sin(m*.08)*.5,c.position.y=Math.cos(m*.06)*.3,c.lookAt(0,0,0),r.render(b,c)};E();const F=()=>{i&&(c.aspect=i.clientWidth/i.clientHeight,c.updateProjectionMatrix(),r.setSize(i.clientWidth,i.clientHeight))};return window.addEventListener("resize",F),()=>{cancelAnimationFrame(z),window.removeEventListener("resize",F),r.dispose(),h.dispose(),f.dispose(),i.contains(r.domElement)&&i.removeChild(r.domElement)}},[]),j.jsx("div",{ref:x,className:`absolute inset-0 pointer-events-none ${T}`})}export{D as default};

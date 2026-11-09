(() => {
  'use strict';
  const hero = document.querySelector('#main-intro');
  const title = document.querySelector('#main-intro-title');
  if (!hero || !title || location.protocol === 'file:') return;
  let started = false;
  async function start() {
    if (started || !window.ForestTHREE) return;
    started = true;
    const T = window.ForestTHREE;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const layer = document.createElement('div');
    layer.className = 'butterfly-scene';
    layer.setAttribute('aria-hidden', 'true');
    hero.append(layer);
    let renderer;
    try {
      renderer = new T.WebGLRenderer({alpha:true, antialias:false, powerPreference:'low-power'});
    } catch { layer.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.setClearColor(0, 0);
    layer.append(renderer.domElement);
    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(0, 1, 1, 0, .1, 2000);
    camera.position.z = 1000;
    scene.add(new T.HemisphereLight('#e5f2ff', '#384557', 2.2));
    const light = new T.DirectionalLight('#fff2d6', 2.5);
    light.position.set(-100, 500, 600); scene.add(light);
    // A single inexpensive radial sprite provides the reference's blue aura without a bloom pass.
    const auraCanvas=document.createElement('canvas');auraCanvas.width=auraCanvas.height=128;
    const ac=auraCanvas.getContext('2d'),ag=ac.createRadialGradient(64,64,0,64,64,64);
    ag.addColorStop(0,'rgba(255,255,255,.92)');ag.addColorStop(.25,'rgba(255,255,255,.65)');ag.addColorStop(.6,'rgba(255,255,255,.18)');ag.addColorStop(1,'rgba(255,255,255,0)');ac.fillStyle=ag;ac.fillRect(0,0,128,128);
    const auraTexture=new T.CanvasTexture(auraCanvas);
    const aura=new T.Sprite(new T.SpriteMaterial({map:auraTexture,color:'#0088ff',transparent:true,opacity:0,depthTest:false,depthWrite:false,blending:T.AdditiveBlending}));aura.renderOrder=-2;scene.add(aura);

    const clamp = x => Math.max(0, Math.min(1, x));
    const smooth = x => {x=clamp(x); return x*x*(3-2*x);};
    let width=1, height=1, landing=new T.Vector3(), butterfly;
    let flightStart=0, lastFrame=0, lastEmit=0, wasHidden=false;
    const particles=64, positions=new Float32Array(particles*3), alphas=new Float32Array(particles);
    const sizes=new Float32Array(particles), life=new Float32Array(particles), age=new Float32Array(particles);
    const velocity=new Float32Array(particles*2);
    const trailGeometry=new T.BufferGeometry();
    trailGeometry.setAttribute('position', new T.BufferAttribute(positions,3));
    trailGeometry.setAttribute('alpha', new T.BufferAttribute(alphas,1));
    trailGeometry.setAttribute('size', new T.BufferAttribute(sizes,1));
    const trailMaterial=new T.ShaderMaterial({
      transparent:true, depthTest:false, depthWrite:false, blending:T.AdditiveBlending,
      vertexShader:`attribute float alpha,size;varying float a;void main(){a=alpha;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=size;}`,
      fragmentShader:`varying float a;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);float core=1.-smoothstep(.04,.45,d);float rays=pow(max(0.,1.-min(abs(p.x),abs(p.y))*12.),5.)*(1.-smoothstep(.05,.5,d));gl_FragColor=vec4(vec3(.18,.7,1.),a*(core*.7+rays*.3));}`
    });
    const trail=new T.Points(trailGeometry,trailMaterial);trail.frustumCulled=false;scene.add(trail);
    let cursor=0;
    function resize() {
      width=hero.clientWidth; height=hero.clientHeight;
      renderer.setSize(Math.ceil(width*.8),Math.ceil(height*.8),false);
      camera.left=0; camera.right=width; camera.top=height; camera.bottom=0; camera.updateProjectionMatrix();
      const a=hero.getBoundingClientRect(),b=title.getBoundingClientRect();
      // Anchor to the actual L character rather than a percentage of the heading box.
      const walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT);let textNode,perchNode=null,perchIndex=-1;
      while((textNode=walker.nextNode())){const i=textNode.textContent.lastIndexOf('L');if(i>=0){perchNode=textNode;perchIndex=i;}}
      let anchor=b,x=b.left+b.width*.8;
      if(perchNode){const range=document.createRange();range.setStart(perchNode,perchIndex);range.setEnd(perchNode,perchIndex+1);anchor=range.getBoundingClientRect();x=anchor.left+anchor.width*.35;}
      const inkInset=parseFloat(getComputedStyle(title).fontSize)*.18;
      landing.set(x-a.left,height-(anchor.top-a.top+inkInset),0);hero.dataset.butterflyPerch='L';
    }
    const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(hero);sizeObserver.observe(title);
    document.fonts.ready.then(resize);
    function reset() { flightStart=performance.now(); lastEmit=0; age.fill(9); alphas.fill(0); }
    function emit(x,y) {
      const i=cursor++%particles;
      positions[i*3]=x+(Math.random()-.5)*10;positions[i*3+1]=y-6;positions[i*3+2]=-10;
      velocity[i*2]=(Math.random()-.5)*13;velocity[i*2+1]=-7-Math.random()*9;
      life[i]=.7+Math.random()*.9;age[i]=0;sizes[i]=3+Math.random()*4.5;
    }
    try {
      const response=await fetch(new URL('forest-entry/models/butterfly-minimal.glb',document.baseURI));
      if(!response.ok)throw Error('Butterfly HTTP '+response.status);
      const bytes=await response.arrayBuffer(),dv=new DataView(bytes);let j,bin;
      for(let o=12;o<bytes.byteLength;){const n=dv.getUint32(o,true),type=dv.getUint32(o+4,true);if(type===0x4e4f534a)j=JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,o+8,n)).trim());if(type===0x004e4942)bin=o+8;o+=8+n;}
      function attribute(index) {
        const a=j.accessors[index],v=j.bufferViews[a.bufferView];
        const C={5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5126:Float32Array}[a.componentType];
        const dim={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type];
        return new T.BufferAttribute(new C(bytes,bin+(v.byteOffset||0)+(a.byteOffset||0),a.count*dim),dim,!!a.normalized);
      }
      const images=await Promise.all(j.images.map(async image=>{
        const v=j.bufferViews[image.bufferView],url=URL.createObjectURL(new Blob([new Uint8Array(bytes,bin+v.byteOffset,v.byteLength)],{type:image.mimeType}));
        try {const texture=await new T.TextureLoader().loadAsync(url);texture.flipY=false;return texture;} finally {URL.revokeObjectURL(url);}
      }));
      images[0].colorSpace=T.SRGBColorSpace;
      const geometry=new T.BufferGeometry();
      geometry.setAttribute('position',attribute(0));geometry.setAttribute('normal',attribute(1));geometry.setAttribute('uv',attribute(2));
      geometry.setIndex(attribute(3));geometry.setAttribute('skinIndex',attribute(4));geometry.setAttribute('skinWeight',attribute(5));
      const material=new T.MeshStandardMaterial({map:images[0],roughnessMap:images[1],metalnessMap:images[1],normalMap:images[2],normalScale:new T.Vector2(.35,.35),roughness:.65,metalness:.08,emissiveMap:images[0],emissive:new T.Color('#168fff'),emissiveIntensity:.1,side:T.DoubleSide});
      const mesh=new T.SkinnedMesh(geometry,material);mesh.frustumCulled=false;
      const body=new T.Bone(),left=new T.Bone(),right=new T.Bone();body.name='Body';left.name='WingLeft';right.name='WingRight';
      left.position.x=-.018;right.position.x=.018;body.add(left,right);
      const inverse=attribute(6).array;
      const skeleton=new T.Skeleton([body,left,right],[0,1,2].map(i=>new T.Matrix4().fromArray(inverse,i*16)));
      butterfly=new T.Group();butterfly.add(body,mesh);butterfly.updateMatrixWorld(true);mesh.bind(skeleton,new T.Matrix4());scene.add(butterfly);
      hero.dataset.butterflyBones='3';hero.dataset.butterflyReady='true';
      resize();reset();
      new MutationObserver(()=>{if(!hero.hasAttribute('inert'))reset();}).observe(hero,{attributes:true,attributeFilter:['inert']});
      const at=new T.Vector3();
      // Photo silhouette: horizontal body, both folded wings rising above it.
      // Compose world roll AFTER yaw; XYZ Euler order reverses these and turns the body toward the lens.
      const zAxis=new T.Vector3(0,0,1),yAxis=new T.Vector3(0,1,0);
      const sideYaw=new T.Quaternion().setFromAxisAngle(yAxis,-Math.PI/2+.08);
      const flightPose=new T.Quaternion(),perchPose=new T.Quaternion().setFromEuler(new T.Euler(-.12,.08,-.22));
      function draw(now) {
        requestAnimationFrame(draw);
        if(document.hidden||now-lastFrame<(reduced.matches?180:40))return;
        const dt=Math.min(.08,(now-lastFrame)/1000||.04);lastFrame=now;
        const progress=Number(hero.dataset.progress||0),fade=smooth(progress/.115);
        if(hero.hasAttribute('inert')||fade>=1){if(!wasHidden){layer.style.opacity='0';wasHidden=true;}return;}
        wasHidden=false;layer.style.opacity=String(1-fade);layer.style.filter=`blur(${fade*28}px) brightness(${1-fade*.75}) drop-shadow(0 10px 12px #0009)`;
        const seconds=(now-flightStart)/1000,travel=reduced.matches?1:clamp((seconds-.5)/4.6),u=smooth(travel),v=1-u;
        const startX=-width*.08,startY=height*.38,c1x=width*.16,c1y=height*.66,c2x=landing.x-width*.24,c2y=landing.y+height*.1;
        at.set(v*v*v*startX+3*v*v*u*c1x+3*v*u*u*c2x+u*u*u*landing.x,v*v*v*startY+3*v*v*u*c1y+3*v*u*u*c2y+u*u*u*landing.y,0);
        const settle=smooth((travel-.72)/.28),t=seconds;
        const beat=t*3.4+.07*Math.sin(t*1.3),cycle=beat-Math.floor(beat);
        const stroke=cycle<.36?smooth(cycle/.36):1-smooth((cycle-.36)/.64);
        const flightFlap=.62+stroke*(.79+.045*Math.sin(t*1.7)),restFlap=.58+Math.sin(t*2.8)*.19;
        const angle=reduced.matches?.43:T.MathUtils.lerp(flightFlap,restFlap,settle);
        left.rotation.y=angle;right.rotation.y=-angle+(1-settle)*.07;
        butterfly.position.copy(at);
        // Side-on flight with the body leaning into its path, then a smooth turn onto the type.
        flightPose.setFromAxisAngle(zAxis,-1.32+Math.sin(travel*Math.PI*2.3)*.065+Math.sin(beat*Math.PI*2-.5)*.018).multiply(sideYaw);
        butterfly.quaternion.copy(flightPose).slerp(perchPose,settle);
        const envelope=(1-settle)*Math.sin(travel*Math.PI),flightBob=envelope*(height*(Math.sin(travel*Math.PI*5.5)*.075+Math.sin(travel*Math.PI*9.2+.3)*.009)+Math.sin(beat*Math.PI*2-.55)*2.2);butterfly.position.y+=flightBob;hero.dataset.butterflyVerticalOffset=flightBob.toFixed(1);
        const scale=(innerWidth<700?58:82)*T.MathUtils.lerp(1.08,1,settle);butterfly.scale.setScalar(scale);
        // Feet meet the type's upper edge while the wings stay above it.
        butterfly.position.y+=scale*.16;
        aura.position.set(butterfly.position.x,butterfly.position.y+scale*.02,-20);aura.scale.set(scale*T.MathUtils.lerp(2.9,1.5,settle),scale*T.MathUtils.lerp(2.9,1.5,settle),1);
        aura.material.opacity=T.MathUtils.lerp(.62,.09,settle)*(travel>0||reduced.matches?1:0);
        material.emissiveIntensity=T.MathUtils.lerp(.28,.1,settle);
        if(!reduced.matches&&travel>0&&seconds<7.5&&now-lastEmit>(travel<1?34:170)){emit(butterfly.position.x,butterfly.position.y-scale*.04);lastEmit=now;}
        for(let i=0;i<particles;i++){age[i]+=dt;const a=clamp(1-age[i]/(life[i]||1));alphas[i]=a*a*.7;positions[i*3]+=velocity[i*2]*dt;positions[i*3+1]+=velocity[i*2+1]*dt;}
        trailGeometry.attributes.position.needsUpdate=true;trailGeometry.attributes.alpha.needsUpdate=true;trailGeometry.attributes.size.needsUpdate=true;
        hero.dataset.butterflyState=travel<1?'arriving':'perched';hero.dataset.butterflyFlight=travel.toFixed(2);hero.dataset.butterflyParticles=String(alphas.reduce((n,a)=>n+(a>0?1:0),0));hero.dataset.butterflyFade=fade.toFixed(3);
        renderer.render(scene,camera);
      }
      requestAnimationFrame(draw);
    } catch(error) {hero.dataset.butterflyReady='error';console.warn('Butterfly unavailable',error);renderer.dispose();layer.remove();}
  }
  if(window.ForestTHREE)start();
  else {const script=Array.from(document.scripts).find(s=>s.src.includes('forest-three.js'));script?.addEventListener('load',start,{once:true});window.addEventListener('temple-assets-ready',start,{once:true});}
})();










import * as THREE from '../book-library/vendor/three.module.js';

// A small, local WebGL scene. The existing DOM cube remains the fallback.
export async function createStoryCube(viewport, data, openFace, reduced) {
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 renderer.setClearColor(0,0);
 const canvas=renderer.domElement;canvas.className='story-cube-webgl';canvas.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,60);
 const group=new THREE.Group();scene.add(group);
 scene.add(new THREE.HemisphereLight('#e5edff','#1e1420',2));
 const key=new THREE.DirectionalLight('#f3f6ff',4);key.position.set(-3,5,6);scene.add(key);
 const rim=new THREE.DirectionalLight('#a4ccff',3);rim.position.set(4,2,-3);scene.add(rim);
 const softLight=new THREE.PointLight('#dce8ff',3,14);softLight.position.set(-3,-1,4);scene.add(softLight);
 const studio=new THREE.Scene();studio.background=new THREE.Color('#161c27');
 for(const [position,scale,power] of [ [[-3,3,2],[1,6,3],6],[[3,1,0],[1,5,5],4],[[0,5,-2],[6,1,3],5] ]){
  const panel=new THREE.Mesh(new THREE.BoxGeometry(...scale),new THREE.MeshBasicMaterial({color:new THREE.Color('#f1f5ff').multiplyScalar(power)}));panel.position.set(...position);studio.add(panel);
 }
 const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(studio,.04);scene.environment=environment.texture;pmrem.dispose();
 studio.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});
 const glassEdges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.1,2.1,2.1)),new THREE.LineBasicMaterial({color:'#d8e4f3',transparent:true,opacity:.24}));group.add(glassEdges);
 const glass=new THREE.Mesh(new THREE.BoxGeometry(2.1,2.1,2.1),new THREE.MeshPhysicalMaterial({color:'#edf3ff',metalness:.08,roughness:.08,transparent:true,opacity:.13,transmission:.15,thickness:.12,ior:1.45,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.5,depthWrite:false}));glass.renderOrder=3;group.add(glass);
 const image=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});
 let pictures;
 try{pictures=await Promise.all(data.map(async row=>Promise.all([image('images/interactive/'+row[2]),image('images/interactive/'+row[3]+'-actor.webp')])));}catch(error){scene.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});environment.dispose();renderer.dispose();throw error;}
 const panels=[];
 const rotations=[[0,0],[0,Math.PI/2],[0,Math.PI],[0,-Math.PI/2],[-Math.PI/2,0],[Math.PI/2,0]];
 pictures.forEach(([background,actor],i)=>{
  const surface=document.createElement('canvas');surface.width=surface.height=768;const ctx=surface.getContext('2d');
  const cover=Math.max(768/background.width,768/background.height);ctx.drawImage(background,(768-background.width*cover)/2,(768-background.height*cover)/2,background.width*cover,background.height*cover);
  ctx.fillStyle='#07101b33';ctx.fillRect(0,0,768,768);
  const fit=Math.min(750/actor.width,730/actor.height);ctx.drawImage(actor,(768-actor.width*fit)/2,768-actor.height*fit-12,actor.width*fit,actor.height*fit);
  const texture=new THREE.CanvasTexture(surface);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const material=new THREE.MeshPhysicalMaterial({map:texture,roughness:.5,metalness:.04,clearcoat:.8,clearcoatRoughness:.15,transparent:true,opacity:.79,depthWrite:false,envMapIntensity:.7});
  const face=new THREE.Mesh(new THREE.PlaneGeometry(2.035,2.035),material);
  const slot=new THREE.Group();slot.rotation.set(...rotations[i],0);face.position.z=1.015;face.userData.face=i;slot.add(face);group.add(slot);panels.push(face);
 });
 viewport.append(canvas);
 let width=1,height=1,angleX=-12,angleY=-22,active=true,inView=false,lastDraw=0,frame=0,held=false,disposed=false,depth=.5,flashIndex=-1,flashAt=0;
 function resize(){const edge=viewport.querySelector('.story-cube').offsetWidth;const rect={width:viewport.clientWidth,height:viewport.clientHeight};width=rect.width;height=rect.height;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=height/(Math.max(160,edge)*Math.tan(THREE.MathUtils.degToRad(17.5)))+1.1;camera.updateProjectionMatrix();paint(performance.now());}
 function paint(now){
 if(flashIndex>=0){const elapsed=(now-flashAt)/480,amount=Math.max(0,Math.sin(Math.min(1,elapsed)*Math.PI));const material=panels[flashIndex].material;material.emissive.set('#e5edff');material.emissiveIntensity=amount*.48;material.opacity=.79+amount*.15;if(elapsed>=1)flashIndex=-1;}
 group.scale.setScalar(.96+depth*.08);group.rotation.set(-angleX*Math.PI/180,angleY*Math.PI/180,0,'XYZ');group.position.y=reduced.matches||held?0:Math.sin(now*.00085)*.035;group.rotation.z=reduced.matches?0:Math.sin(now*.00065)*.008;renderer.render(scene,camera);}
 function loop(now){frame=0;if(!active||!inView||document.hidden)return;if(now-lastDraw>1000/(held?45:30)){lastDraw=now;paint(now);}frame=requestAnimationFrame(loop);}
 function resume(){if(!frame&&inView&&!document.hidden&&active)frame=requestAnimationFrame(loop);}
 const observer=new ResizeObserver(resize);observer.observe(viewport);
 const intersection=new IntersectionObserver(entries=>{inView=entries.some(entry=>entry.isIntersecting);if(inView)resume();else{cancelAnimationFrame(frame);frame=0;}},{threshold:.01});intersection.observe(viewport);
 const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resume();};document.addEventListener('visibilitychange',visibility);
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
 canvas.addEventListener('click',event=>{const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(panels)[0];if(hit)openFace(hit.object.userData.face);});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();dispose();viewport.closest('.cube-story').classList.remove('cube-webgl-ready');});
 function dispose(){if(disposed)return;disposed=true;active=false;cancelAnimationFrame(frame);observer?.disconnect();intersection?.disconnect();document.removeEventListener('visibilitychange',visibility);const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)materials.add(object.material);});materials.forEach(material=>{if(material.map)textures.add(material.map);material.dispose();});geometries.forEach(geometry=>geometry.dispose());textures.forEach(texture=>texture.dispose());environment.dispose();renderer.dispose();canvas.remove();}
 resize();renderer.compile(scene,camera);paint(performance.now());resume();
 return {
 flashFace(index){if(reduced.matches)return;if(flashIndex>=0){panels[flashIndex].material.emissiveIntensity=0;panels[flashIndex].material.opacity=.79;}flashIndex=index;flashAt=performance.now();resume();},
 getFaceBounds(index){
  group.updateMatrixWorld(true);camera.updateMatrixWorld(true);const rect=canvas.getBoundingClientRect();
  const points=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>new THREE.Vector3(x,y,0).applyMatrix4(panels[index].matrixWorld).project(camera));
  const xs=points.map(point=>rect.left+(point.x+1)*rect.width/2),ys=points.map(point=>rect.top+(1-point.y)*rect.height/2);
  return {x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
 },
 setDepth(value){depth=value;if(reduced.matches)paint(performance.now());},setRotation(x,y,isHeld){angleX=x;angleY=y;held=isHeld;if(held||reduced.matches)paint(performance.now());else resume();},dispose};
}

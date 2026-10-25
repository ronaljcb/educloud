import {store,save,reply,payload,mutate} from './core';
const seed=[['React desde cero','Desarrollo Web','Aprende a crear interfaces con componentes y buenas prácticas.','Ana Torres',79],['Diseño de interfaces con Figma','Diseño','De la idea al prototipo: diseña experiencias accesibles.','Diego Flores',69],['Python para análisis de datos','Programación','Explora datos y resuelve problemas con Python.','María Silva',89],['Arquitectura en la nube','Tecnología','Comprende microservicios, redes y despliegues modernos.','Luis Rojas',99],['Bases de datos con SQL','Programación','Modela información y escribe tus primeras consultas.','Ana Torres',59],['Estrategia de producto digital','Negocios','Convierte necesidades de usuarios en productos útiles.','Diego Flores',79]].map((c,i)=>({curso_id:String(i+1),tenant_id:'UTEC',curso_datos:{nombre:c[0],categoria:c[1],descripcion:c[2],instructor:c[3],precio:c[4],estado:'activo',nivel:'Principiante',duracion_horas:12+i*2,etiquetas:[c[1]],publicado:true}}));
export const DEMO=import.meta.env.VITE_DEMO_MODE!=='false';
export async function demoFetch(input:string,init:RequestInit={}):Promise<Response>{
 if(!DEMO)return fetch(input,init);
 const u=new URL(input,window.location.origin),p=u.pathname,method=(init.method||'GET').toUpperCase(),b=await payload(init.body);
 if(p.includes('/usuario/')||p.includes('/api/auth/')) {
  if(p.endsWith('/login')&&((b.username||b.email)!=='demo'||b.password!=='Demo123!'))return reply({message:'Usa demo y Demo123! para explorar.'},401);
  return reply({token:'demo-local-session',mensaje:'Acceso de demostración',user:{id:'demo',name:'Estudiante Demo',email:'demo@educloud.local',tenantId:'UTEC'}});
 }
 const courses=store('educloud:v1:courses',seed);
 if(p.includes('/compras/')) {
  const key='educloud:v1:purchases',rows=store(key,[]);
  if(p.endsWith('/listar'))return reply({compras:rows});
  const course=courses.find(c=>c.curso_id===b.curso_id);const purchase={...b,compra_id:String(Date.now()),nombre_curso:b.nombre_curso||course?.curso_datos.nombre,curso_detalle:course?.curso_datos,fecha_compra:new Date().toISOString()};
  rows.push(purchase);save(key,rows);return reply(purchase,201);
 }
 if(p.includes('/cursos')) {
  const id=p.split('/').slice(-1)[0];
  if(p.includes('buscar-avanzado')||p.includes('/search/')) { const q=(u.searchParams.get('q')||'').toLowerCase(); const found=courses.filter(c=>JSON.stringify(c.curso_datos).toLowerCase().includes(q));return reply({total:found.length,cursos:found.map(c=>({...c,...c.curso_datos,score:1})),tipo_busqueda:'demo',tiempo_respuesta:0,es_autocompletado:true}); }
  if(method==='GET') {if(p.includes('/buscar/')){const course=courses.find(c=>String(c.curso_id)===id);return reply(course||{},course?200:404);}return reply({cursos:courses,lastEvaluatedKey:null});}
  if(method==='DELETE')return mutate('educloud:v1:courses',courses,method,id,b,'curso_id');
  if(method==='PUT'){const idx=courses.findIndex(c=>String(c.curso_id)===id);if(idx<0)return reply({},404);courses[idx]={...courses[idx],...b,curso_datos:{...courses[idx].curso_datos,...b.curso_datos}};save('educloud:v1:courses',courses);return reply(courses[idx]);}
  const course={...b,curso_id:String(Date.now()),tenant_id:b.tenant_id||'UTEC'};courses.push(course);save('educloud:v1:courses',courses);return reply(course,201);
 }
 if(p.includes('/search/'))return reply({suggestions:[]});
 return reply({message:'Ruta de demo no disponible'},404);
}

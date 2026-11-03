export const slugify=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const publicUrl=(slug:string)=>`${(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000').replace(/\/$/,'')}/invite/${slug}`;
export const defaultEvents=['Roka Ceremony','Engagement','Ganesh Puja','Haldi Ceremony','Mehndi Ceremony','Sangeet Night','Baraat','Wedding Ceremony','Pheras','Vidaai','Reception'];

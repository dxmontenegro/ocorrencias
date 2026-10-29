const SUPABASE_URL = 'https://mspucfzsdpejwnhmwwmk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E6S5Xx028e1ue_4EQsj6qA_tBilAr8R';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyMlYTKrLtiiZ5BI7IK7BBby8vW86dEq9WPptSyjacowDDBma1Wim2uSNsanKVuC_Dv/exec';
let professorLogado = '';
let dadosAtuaisConsulta = [];
let gravidadeSelecionada = 'Leve';
const STORAGE_EVIDENCIAS = 'ocorrencias-evidencias';
let fotosSelecionadas = []; // File objects, kept only until the current registration is saved
const ADMIN = 'eem.dragao.mar@gmail.com';

function page(){return document.body.dataset.page||''}
async function sessionAtual(){const {data:{session}}=await _supabase.auth.getSession();return session}
async function protegerPagina(){const session=await sessionAtual();if(!session){location.href='index.html';return null}professorLogado=session.user.email;document.querySelectorAll('[data-user-email]').forEach(e=>e.textContent=professorLogado);return session}
function irMenu(){location.href='menu.html'}
async function acaoSair(){await _supabase.auth.signOut();location.href='index.html'}
function preencherTurmas(id='turma',todos=false){const s=document.getElementById(id);if(!s)return;s.innerHTML=todos?'<option value="">Todas as turmas...</option>':'<option value="">Selecione...</option>';const turmas=[...Object.keys(dadosEscola.integral),...Object.keys(dadosEscola.noturno)];[...new Set(turmas)].forEach(t=>s.innerHTML+=`<option value="${t}">${t}</option>`)}
function atualizarTurmas(){const m=document.getElementById('modalidade')?.value,s=document.getElementById('turma');if(!s)return;s.innerHTML='<option value="">Selecione...</option>';if(m)Object.keys(dadosEscola[m]).forEach(t=>s.innerHTML+=`<option value="${t}">${t}</option>`)}
function atualizarAlunos(){const m=document.getElementById('modalidade')?.value,t=document.getElementById('turma')?.value,s=document.getElementById('aluno');if(!s)return;s.innerHTML='<option value="">Selecione...</option>';if(m&&t)[...dadosEscola[m][t]].sort((a,b)=>a.localeCompare(b,'pt-BR')).forEach(a=>s.innerHTML+=`<option value="${a}">${a}</option>`)}
function selecionarGravidade(nivel,id){gravidadeSelecionada=nivel;document.querySelectorAll('.flag-option').forEach(e=>e.classList.remove('selected'));document.getElementById(id)?.classList.add('selected')}
function mostrarAlerta(msg){const p=document.getElementById('mensagem-alerta');if(p)p.innerText=msg;document.getElementById('meu-alerta')?.classList.remove('hidden')}
function fecharAlerta(){document.getElementById('meu-alerta')?.classList.add('hidden')}

async function acaoLogin(){const e=document.getElementById('login-email').value.trim(),s=document.getElementById('login-senha').value,btn=document.getElementById('btn-entrar-login');btn.innerText='AUTENTICANDO...';btn.disabled=true;const {data,error}=await _supabase.auth.signInWithPassword({email:e,password:s});if(error){alert('Erro de login!');btn.innerText='➡️ENTRAR';btn.disabled=false}else{professorLogado=data.user.email;location.href='menu.html'}}
async function acaoCadastro(){const e=document.getElementById('cad-email').value.trim(),s=document.getElementById('cad-senha').value;const {error}=await _supabase.auth.signUp({email:e,password:s});if(error)alert(error.message);else{alert('Cadastrado! Verifique e-mail.');location.href='index.html'}}
async function solicitarReset(){const e=prompt('E-mail para reset:');if(e){const {error}=await _supabase.auth.resetPasswordForEmail(e,{redirectTo:location.origin+'/index.html'});alert(error?'Erro ao solicitar redefinição.':'Confira seu e-mail para redefinir a senha.')}}

async function initPage(){const p=page();if(p==='login'){const s=await sessionAtual();if(s)location.href='menu.html';return}const s=await protegerPagina();if(!s)return;if(p==='menu'){return}if(p==='individual')initIndividual();if(p==='dia')initDia();if(p==='registro')initRegistro();if(p==='estatisticas')carregarDashboard();if(p==='historico')initHistorico()}

async function buscarIndividual(){const aluno=document.getElementById('aluno').value;if(!aluno)return alert('Selecione o aluno.');const {data,error}=await _supabase.from('ocorrencias').select('*').eq('aluno',aluno).order('id',{ascending:false});if(error)return alert('Erro ao consultar.');dadosAtuaisConsulta=data||[];exibirResultados(dadosAtuaisConsulta,`Histórico: ${aluno}`)}
function initIndividual(){atualizarTurmas();document.getElementById('modalidade')?.addEventListener('change',atualizarTurmas);document.getElementById('turma')?.addEventListener('change',atualizarAlunos);document.getElementById('btn-buscar')?.addEventListener('click',buscarIndividual)}

async function buscarDia(){const dataFiltro=document.getElementById('filtro-data').value;if(!dataFiltro)return alert('Selecione a data.');const df=dataFiltro.split('-').reverse().join('/');const {data,error}=await _supabase.from('ocorrencias').select('*').like('data_hora',`%${df}%`).order('id',{ascending:false});if(error)return alert('Erro ao consultar.');dadosAtuaisConsulta=data||[];exibirResultados(dadosAtuaisConsulta,`Data: ${df}`)}
function initDia(){document.getElementById('btn-buscar')?.addEventListener('click',buscarDia)}

function initRegistro(){
 if(professorLogado!==ADMIN){document.getElementById('acesso-negado')?.classList.remove('hidden');document.getElementById('form-registro')?.classList.add('hidden');return}
 atualizarTurmas();document.getElementById('modalidade')?.addEventListener('change',atualizarTurmas);document.getElementById('turma')?.addEventListener('change',atualizarAlunos);
 document.getElementById('btn-avancar')?.addEventListener('click',()=>{const aluno=document.getElementById('aluno').value;if(!aluno)return alert('Selecione o aluno.');document.getElementById('nome-aluno-confirmado').innerText=aluno;document.getElementById('selecao-registro').classList.add('hidden');document.getElementById('form-registro').classList.remove('hidden')});
 document.getElementById('btn-cancelar')?.addEventListener('click',()=>location.reload());document.getElementById('btn-finalizar')?.addEventListener('click',gerarEEnviar);
 document.getElementById('foto-camera')?.addEventListener('change',e=>adicionarFotos(e.target.files,e.target));
 document.getElementById('foto-galeria')?.addEventListener('change',e=>adicionarFotos(e.target.files,e.target));
 document.getElementById('limpar-fotos')?.addEventListener('click',()=>{fotosSelecionadas=[];renderizarPreviaFotos()});
}
const LIMITE_FOTOS=5, LIMITE_FOTO_MB=12;
async function adicionarFotos(files,input){
 for(const file of [...(files||[])]){
  if(!file.type.startsWith('image/')){alert('Selecione apenas arquivos de imagem.');continue;}
  if(file.size>LIMITE_FOTO_MB*1024*1024){alert(`${file.name}: arquivo acima de ${LIMITE_FOTO_MB} MB.`);continue;}
  if(fotosSelecionadas.length>=LIMITE_FOTOS){alert(`Limite de ${LIMITE_FOTOS} fotos por ocorrência.`);break;}
  fotosSelecionadas.push(file);
 }
 if(input)input.value='';
 renderizarPreviaFotos();
}
function renderizarPreviaFotos(){
 const area=document.getElementById('previa-fotos');if(!area)return;
 area.innerHTML='';
 fotosSelecionadas.forEach((file,index)=>{
  const item=document.createElement('div');item.className='foto-preview-item';
  const img=document.createElement('img');img.alt=`Evidência ${index+1}`;img.src=URL.createObjectURL(file);
  img.onload=()=>URL.revokeObjectURL(img.src);
  const legenda=document.createElement('span');legenda.textContent=`Foto ${index+1}`;
  const remover=document.createElement('button');remover.type='button';remover.className='btn-remover-foto';remover.textContent='Remover';remover.onclick=()=>{fotosSelecionadas.splice(index,1);renderizarPreviaFotos()};
  item.append(img,legenda,remover);area.appendChild(item);
 });
 const contador=document.getElementById('contador-fotos');if(contador)contador.textContent=`${fotosSelecionadas.length}/${LIMITE_FOTOS} foto(s)`;
 const limpar=document.getElementById('limpar-fotos');if(limpar)limpar.classList.toggle('hidden',!fotosSelecionadas.length);
}
function novaOcorrencia(){location.href='registro.html'}

function exibirResultados(dados,titulo){document.getElementById('form-selecao')?.classList.add('hidden');document.getElementById('resultados-consulta')?.classList.remove('hidden');document.getElementById('filtro-meses-area')?.classList.toggle('hidden',page()!=='individual');renderizarCards(dados,titulo)}
function renderizarCards(dados,tituloOpcional){
 const podeExcluir=professorLogado===ADMIN,lista=document.getElementById('lista-ocorrencias'),titulo=tituloOpcional||'Resultados';let htmlResumo='';
 if(page()==='individual'){
  const contagemMeses={},nomesMeses=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  dadosAtuaisConsulta.forEach(oc=>{const mi=parseInt((oc.data_hora||'').split('/')[1])-1;if(mi>=0)contagemMeses[nomesMeses[mi]]=(contagemMeses[nomesMeses[mi]]||0)+1});
  htmlResumo='<div class="resumo-mensal"><b>📊 RESUMO ANUAL:</b><br>';nomesMeses.forEach(m=>{if(contagemMeses[m])htmlResumo+=`<span class="mes-item"><b>${m}:</b> ${contagemMeses[m]}</span>`});htmlResumo+='</div>';
 }
 lista.innerHTML=`<h3>${titulo}</h3>`+htmlResumo;
 if(!dados.length){lista.innerHTML+='<p>Nenhum registro encontrado.</p>';return}
 dados.forEach((oc,idx)=>{
  let cls='',emoji='🟢';if(oc.gravidade==='Grave'){cls='card-grave';emoji='🔴'}else if(oc.gravidade==='Média'){cls='card-media';emoji='🟠'}
  const evidencias=Array.isArray(oc.fotos)?oc.fotos:[];
  const evidenceBox=evidencias.length?`<div class="ocorrencia-evidencias" id="evidencias-oc-${idx}"><b>📷 Evidências (${evidencias.length})</b><div class="evidencias-historico-grid"><span class="muted">Carregando imagens protegidas…</span></div></div>`:'';
  lista.insertAdjacentHTML('beforeend',`<div class="card-ocorrencia ${cls}"><span class="badge-gravidade">${emoji}</span><b>🎓 Aluno:</b> ${escapeHTML(oc.aluno||'')} | <b>Turma:</b> ${escapeHTML(oc.turma||'')}<br><b>📅 Data:</b> ${escapeHTML(oc.data_hora||'')}<br><b>⚠️ Ocorrência:</b> ${escapeHTML((oc.tipos_selecionados||'').replace(/ \| /g,', '))}<br><b>⚖️ Medida Adotada:</b> ${escapeHTML(oc.penalidades||'Não registrada')}${evidenceBox}<hr><a href="${oc.url_pdf||'#'}" target="_blank" rel="noopener" class="btn-pdf-link">📄 VER PDF</a>${podeExcluir?`<button class="btn-excluir" onclick="excluirOcorrencia(${Number(oc.id)})">🗑️ EXCLUIR</button>`:''}</div>`);
  if(evidencias.length)mostrarEvidenciasHistorico(`evidencias-oc-${idx}`,evidencias);
 });
}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function mostrarEvidenciasHistorico(elementId,fotos){
 const holder=document.getElementById(elementId)?.querySelector('.evidencias-historico-grid');if(!holder)return;holder.innerHTML='';
 for(let i=0;i<fotos.length;i++){
  try{const item=fotos[i],path=typeof item==='string'?item:item.path;const {data,error}=await _supabase.storage.from(STORAGE_EVIDENCIAS).createSignedUrl(path,180);if(error)throw error;
   const a=document.createElement('a');a.href=data.signedUrl;a.target='_blank';a.rel='noopener';a.title=`Abrir evidência ${i+1}`;
   const img=document.createElement('img');img.src=data.signedUrl;img.alt=`Evidência fotográfica ${i+1}`;a.appendChild(img);holder.appendChild(a);
  }catch(e){const span=document.createElement('span');span.className='muted';span.textContent='Uma evidência não pôde ser carregada.';holder.appendChild(span)}
 }
}
function executarFiltroMes(){const mesNum=document.getElementById('select-filtro-mes').value;const filtrados=mesNum==='Tudo'?dadosAtuaisConsulta:dadosAtuaisConsulta.filter(oc=>parseInt(oc.data_hora.split('/')[1])===parseInt(mesNum));renderizarCards(filtrados)}
function limparConsulta(){location.reload()}

async function carregarDashboard(){const lista=document.getElementById('lista-ocorrencias');lista.innerHTML='<h4>Carregando estatísticas...</h4>';const {data,error}=await _supabase.from('ocorrencias').select('turma, tipos_selecionados');if(error){lista.innerHTML='<p>Erro ao carregar estatísticas.</p>';return}const ctTurmas={},ctTipos={};(data||[]).forEach(oc=>{ctTurmas[oc.turma]=(ctTurmas[oc.turma]||0)+1;if(oc.tipos_selecionados)oc.tipos_selecionados.split(' | ').forEach(t=>{if(t)ctTipos[t]=(ctTipos[t]||0)+1})});const topTurmas=Object.entries(ctTurmas).sort((a,b)=>b[1]-a[1]).slice(0,3),topTipos=Object.entries(ctTipos).sort((a,b)=>b[1]-a[1]).slice(0,5);let htmlTipos='<ul class="dash-list">';topTipos.forEach(t=>htmlTipos+=`<li><b>${t[1]}x</b> ${t[0]}</li>`);htmlTipos+='</ul>';let htmlTurmas='<ul class="dash-list">';topTurmas.forEach(t=>htmlTurmas+=`<li><b>${t[0]}:</b> ${t[1]} ocorrências</li>`);htmlTurmas+='</ul>';lista.innerHTML=`<h3>📊 Estatísticas Gerais</h3><div class="dash-container"><div class="dash-card"><span class="dash-title">Total Geral</span><span class="dash-value">${data.length}</span></div><div class="dash-card"><span class="dash-title">🏆 Top 3 Turmas Críticas</span>${htmlTurmas}</div><div class="dash-card"><span class="dash-title">⚠️ Ocorrências mais Frequentes</span>${htmlTipos}</div></div>`}

async function excluirOcorrencia(id){if(professorLogado!==ADMIN)return alert('Sem permissão!');if(!confirm('Deseja excluir esta ocorrência?'))return;const {error}=await _supabase.from('ocorrencias').delete().eq('id',id);if(error)return alert('Erro ao excluir!');dadosAtuaisConsulta=dadosAtuaisConsulta.filter(oc=>oc.id!==id);renderizarCards(dadosAtuaisConsulta);alert('Excluído com sucesso!')}

function carregarImagem(src) { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; }); }
async function imagemParaDataURL(file){
 const bitmap=await createImageBitmap(file);
 const max=1800,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
 const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
 return canvas.toDataURL('image/jpeg',0.82);
}
async function baixarFotoStorage(path){
 const {data,error}=await _supabase.storage.from(STORAGE_EVIDENCIAS).createSignedUrl(path,180);
 if(error||!data?.signedUrl)throw error||new Error('Não foi possível obter acesso temporário à evidência.');
 const resp=await fetch(data.signedUrl);if(!resp.ok)throw new Error('Falha ao baixar evidência armazenada.');
 return await imagemParaDataURL(await resp.blob());
}
async function gerarPDFBlobOcorrencia(oc, fotosData=[]){
 const {jsPDF}=window.jspdf;const doc=new jsPDF();
 const gravidade=oc.gravidade||'Leve';const corPDF=gravidade==='Grave'?[192,57,43]:gravidade==='Média'?[243,156,18]:[26,73,144];
 const aluno=oc.aluno||'Aluno não informado',turma=oc.turma||'Não informada',dataHora=oc.data_hora||'Não informada',professor=oc.professor||'Não informado';
 const selecionados=(oc.tipos_selecionados||'Sem ocorrência especificada').split(' | ').filter(Boolean),obs=oc.observacoes||'Sem observações adicionais.',pen=oc.penalidades||'A informar';
 doc.setFillColor(...corPDF);doc.rect(0,0,210,45,'F');
 try{const logo=await carregarImagem('imagem1.png');doc.addImage(logo,'PNG',15,5,30,30)}catch(e){}
 doc.setTextColor(255);doc.setFontSize(18);doc.text('EEMTI DRAGÃO DO MAR',50,20);doc.setFontSize(12);doc.text('SISTEMA DE REGISTRO DE OCORRÊNCIAS',50,30);
 doc.autoTable({startY:55,head:[['DADOS DA OCORRÊNCIA','']],body:[['ESTUDANTE:',aluno],['SÉRIE/TURMA:',turma],['DATA/HORA:',dataHora],['CLASSIFICAÇÃO:',gravidade.toUpperCase()],['PROFESSOR:',professor]],headStyles:{fillColor:corPDF}});
 let y=doc.lastAutoTable.finalY+10;doc.setTextColor(...corPDF);doc.setFontSize(11);doc.text('OCORRÊNCIA(S):',15,y);y+=7;doc.setTextColor(0);doc.setFontSize(10);
 for(const item of selecionados){const ls=doc.splitTextToSize(`- ${item}`,170);if(y+ls.length*5>278){doc.addPage();y=20}doc.text(ls,20,y);y+=Math.max(6,ls.length*5)}
 y+=5;if(y>270){doc.addPage();y=20}doc.setTextColor(...corPDF);doc.text('RELATO DOS FATOS:',15,y);y+=7;doc.setTextColor(0);
 const relato=doc.splitTextToSize(obs,180);if(y+relato.length*5>278){doc.addPage();y=20}doc.text(relato,15,y);y+=relato.length*5+10;
 if(y>270){doc.addPage();y=20}doc.setTextColor(...corPDF);doc.text('MEDIDA ADOTADA:',15,y);doc.setTextColor(0);const pLines=doc.splitTextToSize(pen,125);doc.text(pLines,60,y);y+=Math.max(8,pLines.length*5)+8;
 if(fotosData.length){
  if(y>250){doc.addPage();y=20}doc.setTextColor(...corPDF);doc.setFontSize(12);doc.text('EVIDÊNCIAS FOTOGRÁFICAS',15,y);y+=8;
  for(let i=0;i<fotosData.length;i++){
   const photo=fotosData[i];
   if(y+82>280){doc.addPage();y=20}
   doc.setFontSize(9);doc.setTextColor(0);doc.text(`Evidência ${i+1}`,15,y);y+=3;
   try{const dims=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve({w:im.width,h:im.height});im.onerror=reject;im.src=photo});
    const maxW=175,maxH=76,ratio=Math.min(maxW/dims.w,maxH/dims.h);const w=dims.w*ratio,h=dims.h*ratio;
    doc.addImage(photo,'JPEG',15,y,w,h,undefined,'FAST');y+=h+8;
   }catch(e){doc.setFontSize(9);doc.text('(Imagem não pôde ser inserida no documento.)',15,y);y+=8}
  }
 }
 return doc.output('blob');
}
async function enviarFotosStorage(fotos,registroKey){
 const out=[];const uid=(await sessionAtual())?.user?.id;if(!uid)throw new Error('Sessão expirada. Entre novamente.');
 for(let i=0;i<fotos.length;i++){
  const compressed=await (async()=>{const data=await imagemParaDataURL(fotos[i]);const res=await fetch(data);return res.blob()})();
  const path=`${uid}/${registroKey}/${String(i+1).padStart(2,'0')}.jpg`;
  const {error}=await _supabase.storage.from(STORAGE_EVIDENCIAS).upload(path,compressed,{contentType:'image/jpeg',upsert:false});
  if(error){for(const saved of out)await _supabase.storage.from(STORAGE_EVIDENCIAS).remove([saved.path]);throw error}
  out.push({path,legenda:`Evidência ${i+1}`});
 }
 return out;
}
async function gerarEEnviar(){
 // Reserve a janela do WhatsApp durante o clique do usuário.
 // Isso evita que o navegador bloqueie a abertura após os processos assíncronos.
 const janelaWhatsApp = window.open('about:blank', '_blank');

 const aluno=document.getElementById('nome-aluno-confirmado').innerText,
       turma=document.getElementById('turma').value,
       fone=document.getElementById('whatsapp-fone').value.trim();
 const obs=document.getElementById('descricao').value,
       agr=document.getElementById('houve-agressao').value,
       pen=document.getElementById('penalidades').value,
       gravidade=gravidadeSelecionada;
 const emojiG=gravidade==='Grave'?'\u{1F534} GRAVE':gravidade==='Média'?'\u{1F7E0} MÉDIA':'\u{1F7E2} LEVE';
 if(!fone){if(janelaWhatsApp)janelaWhatsApp.close();return alert('WhatsApp obrigatório.');}
 if(!aluno||!turma){if(janelaWhatsApp)janelaWhatsApp.close();return alert('Confira aluno e turma.');}

 // Aceita telefone brasileiro com ou sem +55, espaços, parênteses e traços.
 let numero=fone.replace(/\D/g,'');
 if(numero.startsWith('55')) numero=numero.slice(2);
 if(numero.length!==10 && numero.length!==11){
   if(janelaWhatsApp)janelaWhatsApp.close();
   return alert('Confira o WhatsApp: informe DDD + número (10 ou 11 dígitos).');
 }

 const btn=document.getElementById('btn-finalizar');
 btn.innerText='PREPARANDO EVIDÊNCIAS...';btn.disabled=true;
 const agora=new Date(),dataF=agora.toLocaleDateString('pt-BR'),horaF=agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
 const selecionados=[...document.querySelectorAll('#tipos-ocorrencia input:checked')].map(c=>c.getAttribute('data-label')),
       textoParaBanco=selecionados.join(' | ');
 let fotosSalvas=[];
 try{
  const registroKey=`${Date.now()}-${crypto.randomUUID()}`;
  if(fotosSelecionadas.length)fotosSalvas=await enviarFotosStorage(fotosSelecionadas,registroKey);
  const fotosParaPDF=await Promise.all(fotosSelecionadas.map(imagemParaDataURL));
  const dadosPDF={aluno,turma,tipos_selecionados:textoParaBanco,observacoes:obs,penalidades:pen,professor:professorLogado,data_hora:`${dataF} às ${horaF}`,gravidade};
  btn.innerText='GERANDO PDF...';
  const pdfBlob=await gerarPDFBlobOcorrencia(dadosPDF,fotosParaPDF);
  const pdfBase64=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=reject;r.readAsDataURL(pdfBlob)});
  btn.innerText='ARQUIVANDO REGISTRO...';
  const resp=await fetch(GOOGLE_SCRIPT_URL,{method:'POST',body:JSON.stringify({base64:pdfBase64,nomeArquivo:`Ocorrencia_${nomeArquivoSeguro(aluno)}_${registroKey}.pdf`})});
  if(!resp.ok)throw new Error('Não foi possível arquivar o PDF no Drive.');
  const resJ=await resp.json();const linkDrive=resJ.url||'';
  const registro={aluno,turma,tipos_selecionados:textoParaBanco,observacoes:obs,agressao:agr,penalidades:pen,professor:professorLogado,data_hora:`${dataF} às ${horaF}`,url_pdf:linkDrive,gravidade,fotos:fotosSalvas};
  const {error:insertError}=await _supabase.from('ocorrencias').insert([registro]);
  if(insertError)throw insertError;

  // Mensagem WhatsApp
  const saudacao=`*📎EEMTI DRAGÃO DO MAR - NOTIFICAÇÃO DISCIPLINAR*%0A%0A📌 Olá, informamos um registro de indisciplina para o aluno(a) *${aluno}*.%0A%0A`;
  const corpoMsg=`*🔎 DETALHES:*%0A*🎓 Aluno:* ${aluno}%0A*⚖️ Classificação:* ${emojiG}%0A*📆 Data:* ${dataF} às ${horaF}%0A*⚠️ Itens:* ${selecionados.join(', ')}%0A%0A*📝 RELATO:* ${obs||'Não detalhado'}%0A%0A*⚖️ MEDIDA:* ${pen}%0A%0A_Documento original arquivado na nuvem._`;
  const linkTexto=linkDrive?`%0A%0A*📄 ACESSE O PDF COMPLETO AQUI:*%0A${linkDrive}`:'';
  const urlWhatsApp=`https://api.whatsapp.com/send?phone=55${numero}&text=${saudacao}${corpoMsg}${linkTexto}`;
  
  if(janelaWhatsApp && !janelaWhatsApp.closed){ 
    janelaWhatsApp.location.href=urlWhatsApp; 
  } else { 
    window.open(urlWhatsApp,'_blank'); 
  }

  // Aciona o download local do PDF
  const pdfURL=URL.createObjectURL(pdfBlob),a=document.createElement('a');
  a.href=pdfURL;a.download=`Ocorrencia_${nomeArquivoSeguro(aluno)}.pdf`;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(pdfURL),3000);
  fotosSelecionadas=[];alert('Ocorrência salva com sucesso, com as evidências anexadas.');novaOcorrencia();
 }catch(e){
  console.error(e);
  if(janelaWhatsApp && !janelaWhatsApp.closed)janelaWhatsApp.close();
  alert(`Não foi possível concluir o registro. ${e?.message||'Verifique sua conexão e as permissões do Supabase.'}\n\nSe as fotos chegaram a ser enviadas, confira o Storage antes de repetir.`);
 }finally{btn.innerText='💾 SALVAR E ✅ NOTIFICAR';btn.disabled=false}
}
function parseDataHora(v){
    if(!v)return null;
    const m=v.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if(!m)return null;
    return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]));
}
function initHistorico(){
    preencherTurmas('turma-historico',true);
    document.getElementById('btn-baixar-zip')?.addEventListener('click',baixarHistoricoZip);
}
function nomeArquivoSeguro(s){
    return (s||'arquivo').replace(/[\\/:*?"<>|]+/g,'_').replace(/\s+/g,' ').trim().slice(0,90);
}
async function baixarHistoricoZip(){
    const turma=document.getElementById('turma-historico').value;
    const mes=document.getElementById('mes-historico').value;
    if(!turma)return alert('Selecione a turma.');

    const btn=document.getElementById('btn-baixar-zip');
    btn.disabled=true;
    btn.innerText='PREPARANDO PASTAS...';

    try{
        const {data,error}=await _supabase
            .from('ocorrencias')
            .select('*')
            .eq('turma',turma)
            .order('id',{ascending:true});

        if(error)throw error;

        const registros=(data||[]).filter(oc=>{
            if(mes==='Tudo')return true;
            const d=parseDataHora(oc.data_hora);
            return d&&String(d.getMonth()+1)===mes;
        });

        if(!registros.length){
            alert('Nenhuma ocorrência encontrada para os filtros selecionados.');
            return;
        }

        const zip=new JSZip();
        const periodoNome=mes==='Tudo'
            ? 'Todo o período'
            : document.getElementById('mes-historico').selectedOptions[0].text;

        // Pasta principal do ZIP
        const pastaTurma=zip.folder(`Turma ${turma}`);

        // CSV geral na raiz da turma
        let csv='ID,Aluno,Turma,Data/Hora,Gravidade,Ocorrências,Medida,Professor,PDF\n';
        registros.forEach(oc=>{
            csv+=`"${oc.id}","${(oc.aluno||'').replace(/"/g,'""')}","${oc.turma||''}","${oc.data_hora||''}","${oc.gravidade||''}","${(oc.tipos_selecionados||'').replace(/"/g,'""')}","${(oc.penalidades||'').replace(/"/g,'""')}","${oc.professor||''}","${oc.url_pdf||''}"\n`;
        });
        pastaTurma.file('historico.csv',csv);

        const pastaDocumentacao=pastaTurma.folder('DOCUMENTAÇÃO');
        pastaDocumentacao.file('LEIA-ME.txt',
`EEMTI DRAGÃO DO MAR - HISTÓRICO DE OCORRÊNCIAS\n\n`+
`Turma: ${turma}\n`+
`Período: ${periodoNome}\n`+
`Total de registros: ${registros.length}\n\n`+
`ESTRUTURA DO ARQUIVO:\n`+
`• Cada aluno possui sua própria pasta.\n`+
`• Os PDFs das ocorrências ficam dentro da pasta do respectivo aluno.\n`+
`• historico.csv contém todos os registros selecionados.\n`+
`• Os PDFs são reconstruídos localmente a partir dos dados da ocorrência, evitando bloqueios de CORS do Google Drive.\n`
        );

        let ok=0;
        let links=0;

        for(let i=0;i<registros.length;i++){
            const oc=registros[i];
            const aluno=nomeArquivoSeguro(oc.aluno||'Aluno sem nome');
            const pastaAluno=pastaTurma.folder(aluno);

            if(!oc.url_pdf){
                pastaAluno.file(`${String(i+1).padStart(3,'0')}_SEM_PDF.txt`,
                    `Registro ${oc.id} não possui PDF associado no banco de dados.`);
                continue;
            }

            btn.innerText=`BAIXANDO PDF ${i+1}/${registros.length}...`;

            try{
                // O PDF é reconstruído localmente a partir dos dados salvos no Supabase.
                // Isso evita o bloqueio CORS do Google Drive e coloca o PDF real dentro do ZIP.
                const fotosPDF=await Promise.all((Array.isArray(oc.fotos)?oc.fotos:[]).map(f=>baixarFotoStorage(typeof f==='string'?f:f.path).catch(err=>{console.warn('Foto indisponível no PDF histórico',err);return null})).then(xs=>xs.filter(Boolean)));
                const blob=await gerarPDFBlobOcorrencia(oc,fotosPDF);
                pastaAluno.file(
                    `${String(i+1).padStart(3,'0')}_Ocorrencia_${oc.id}.pdf`,
                    blob
                );
                ok++;
            }catch(e){
                console.error('Falha ao gerar PDF da ocorrência',oc.id,e);
                // Só usa o link como último recurso se os dados não permitirem reconstruir o PDF.
                if(oc.url_pdf){
                    pastaAluno.file(
                        `${String(i+1).padStart(3,'0')}_Ocorrencia_${oc.id}.url.txt`,
                        oc.url_pdf
                    );
                    links++;
                }
            }
        }

        // Resumo técnico na raiz.
        pastaTurma.file('RESUMO.txt',
`EEMTI DRAGÃO DO MAR\n`+
`HISTÓRICO DE OCORRÊNCIAS\n\n`+
`Turma: ${turma}\n`+
`Período: ${periodoNome}\n`+
`Registros: ${registros.length}\n`+
`PDFs baixados: ${ok}\n`+
`Links preservados: ${links}\n\n`+
`Os documentos estão organizados em pastas individuais por aluno.`
        );

        const arquivo=await zip.generateAsync({
            type:'blob',
            compression:'DEFLATE',
            compressionOptions:{level:6}
        });

        const url=URL.createObjectURL(arquivo);
        const a=document.createElement('a');
        a.href=url;
        a.download=`Historico_${nomeArquivoSeguro(turma)}_${mes==='Tudo'?'TodoPeriodo':mes}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(()=>URL.revokeObjectURL(url),5000);

        alert(`ZIP gerado!\n\n📁 Turma: ${turma}\n📅 Período: ${periodoNome}\n📄 Registros: ${registros.length}\n✅ PDFs baixados: ${ok}\n🔗 Links preservados: ${links}`);
    }catch(e){
        console.error(e);
        alert('Erro ao gerar o histórico em ZIP.');
    }finally{
        btn.disabled=false;
        btn.innerText='📦 BAIXAR HISTÓRICO EM ZIP';
    }
}

document.addEventListener('DOMContentLoaded',initPage);

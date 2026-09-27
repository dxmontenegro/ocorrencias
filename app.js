const SUPABASE_URL = 'https://mspucfzsdpejwnhmwwmk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E6S5Xx028e1ue_4EQsj6qA_tBilAr8R';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyMlYTKrLtiiZ5BI7IK7BBby8vW86dEq9WPptSyjacowDDBma1Wim2uSNsanKVuC_Dv/exec';
let professorLogado = '';
let dadosAtuaisConsulta = [];
let gravidadeSelecionada = 'Leve';
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

function initRegistro(){if(professorLogado!==ADMIN){document.getElementById('acesso-negado')?.classList.remove('hidden');document.getElementById('form-registro')?.classList.add('hidden');return}atualizarTurmas();document.getElementById('modalidade')?.addEventListener('change',atualizarTurmas);document.getElementById('turma')?.addEventListener('change',atualizarAlunos);document.getElementById('btn-avancar')?.addEventListener('click',()=>{const aluno=document.getElementById('aluno').value;if(!aluno)return alert('Selecione o aluno.');document.getElementById('nome-aluno-confirmado').innerText=aluno;document.getElementById('selecao-registro').classList.add('hidden');document.getElementById('form-registro').classList.remove('hidden')});document.getElementById('btn-cancelar')?.addEventListener('click',()=>location.reload());document.getElementById('btn-finalizar')?.addEventListener('click',gerarEEnviar)}
function novaOcorrencia(){location.href='registro.html'}

function exibirResultados(dados,titulo){document.getElementById('form-selecao')?.classList.add('hidden');document.getElementById('resultados-consulta')?.classList.remove('hidden');document.getElementById('filtro-meses-area')?.classList.toggle('hidden',page()!=='individual');renderizarCards(dados,titulo)}
function renderizarCards(dados,tituloOpcional){const podeExcluir=professorLogado===ADMIN;const lista=document.getElementById('lista-ocorrencias');const titulo=tituloOpcional||'Resultados';let htmlResumo='';if(page()==='individual'){const contagemMeses={},nomesMeses=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];dadosAtuaisConsulta.forEach(oc=>{const mesIndice=parseInt(oc.data_hora.split('/')[1])-1;if(mesIndice>=0)contagemMeses[nomesMeses[mesIndice]]=(contagemMeses[nomesMeses[mesIndice]]||0)+1});htmlResumo='<div class="resumo-mensal"><b>📊 RESUMO ANUAL:</b><br>';nomesMeses.forEach(m=>{if(contagemMeses[m])htmlResumo+=`<span class="mes-item"><b>${m}:</b> ${contagemMeses[m]}</span>`});htmlResumo+='</div>'}lista.innerHTML=`<h3>${titulo}</h3>`+htmlResumo;if(!dados.length){lista.innerHTML+='<p>Nenhum registro encontrado.</p>';return}dados.forEach(oc=>{let classeG='',emojiG='';if(oc.gravidade==='Grave'){classeG='card-grave';emojiG='🔴'}else if(oc.gravidade==='Média'){classeG='card-media';emojiG='🟠'}else{classeG='card-leve';emojiG='🟢'}lista.innerHTML+=`<div class="card-ocorrencia ${classeG}"><span class="badge-gravidade">${emojiG}</span><b>🎓 Aluno:</b> ${oc.aluno} | <b>Turma:</b> ${oc.turma}<br><b>📅 Data:</b> ${oc.data_hora}<br><b>⚠️ Ocorrência:</b> ${(oc.tipos_selecionados||'').replace(/ \| /g,', ')}<br><b>⚖️ Medida Adotada:</b> ${oc.penalidades||'Não registrada'}<hr><a href="${oc.url_pdf||'#'}" target="_blank" class="btn-pdf-link">📄 VER PDF</a>${podeExcluir?`<button class="btn-excluir" onclick="excluirOcorrencia(${oc.id})">🗑️ EXCLUIR</button>`:''}</div>`})}
function executarFiltroMes(){const mesNum=document.getElementById('select-filtro-mes').value;const filtrados=mesNum==='Tudo'?dadosAtuaisConsulta:dadosAtuaisConsulta.filter(oc=>parseInt(oc.data_hora.split('/')[1])===parseInt(mesNum));renderizarCards(filtrados)}
function limparConsulta(){location.reload()}

async function carregarDashboard(){const lista=document.getElementById('lista-ocorrencias');lista.innerHTML='<h4>Carregando estatísticas...</h4>';const {data,error}=await _supabase.from('ocorrencias').select('turma, tipos_selecionados');if(error){lista.innerHTML='<p>Erro ao carregar estatísticas.</p>';return}const ctTurmas={},ctTipos={};(data||[]).forEach(oc=>{ctTurmas[oc.turma]=(ctTurmas[oc.turma]||0)+1;if(oc.tipos_selecionados)oc.tipos_selecionados.split(' | ').forEach(t=>{if(t)ctTipos[t]=(ctTipos[t]||0)+1})});const topTurmas=Object.entries(ctTurmas).sort((a,b)=>b[1]-a[1]).slice(0,3),topTipos=Object.entries(ctTipos).sort((a,b)=>b[1]-a[1]).slice(0,5);let htmlTipos='<ul class="dash-list">';topTipos.forEach(t=>htmlTipos+=`<li><b>${t[1]}x</b> ${t[0]}</li>`);htmlTipos+='</ul>';let htmlTurmas='<ul class="dash-list">';topTurmas.forEach(t=>htmlTurmas+=`<li><b>${t[0]}:</b> ${t[1]} ocorrências</li>`);htmlTurmas+='</ul>';lista.innerHTML=`<h3>📊 Estatísticas Gerais</h3><div class="dash-container"><div class="dash-card"><span class="dash-title">Total Geral</span><span class="dash-value">${data.length}</span></div><div class="dash-card"><span class="dash-title">🏆 Top 3 Turmas Críticas</span>${htmlTurmas}</div><div class="dash-card"><span class="dash-title">⚠️ Ocorrências mais Frequentes</span>${htmlTipos}</div></div>`}

async function excluirOcorrencia(id){if(professorLogado!==ADMIN)return alert('Sem permissão!');if(!confirm('Deseja excluir esta ocorrência?'))return;const {error}=await _supabase.from('ocorrencias').delete().eq('id',id);if(error)return alert('Erro ao excluir!');dadosAtuaisConsulta=dadosAtuaisConsulta.filter(oc=>oc.id!==id);renderizarCards(dadosAtuaisConsulta);alert('Excluído com sucesso!')}

function carregarImagem(src) { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; }); }
async function gerarPDFBlobOcorrencia(oc){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const gravidade = oc.gravidade || 'Leve';
    const corPDF = gravidade === 'Grave' ? [192,57,43] : gravidade === 'Média' ? [243,156,18] : [26,73,144];
    const aluno = oc.aluno || 'Aluno não informado';
    const turma = oc.turma || 'Não informada';
    const dataHora = oc.data_hora || 'Não informada';
    const professor = oc.professor || 'Não informado';
    const selecionados = (oc.tipos_selecionados || 'Sem ocorrência especificada').split(' | ').filter(Boolean);
    const obs = oc.observacoes || 'Sem observações adicionais.';
    const pen = oc.penalidades || 'A informar';

    doc.setFillColor(...corPDF); doc.rect(0,0,210,45,'F');
    try { const logo=await carregarImagem('imagem1.png'); doc.addImage(logo,'PNG',15,5,30,30); } catch(e){}
    doc.setTextColor(255); doc.setFontSize(18); doc.text('EEMTI DRAGÃO DO MAR',50,20);
    doc.setFontSize(12); doc.text('SISTEMA DE REGISTRO DE INDISCIPLINA',50,30);
    doc.autoTable({
        startY:55,
        head:[['DADOS DA OCORRÊNCIA','']],
        body:[
            ['ESTUDANTE:',aluno],
            ['SÉRIE/TURMA:',turma],
            ['DATA/HORA:',dataHora],
            ['CLASSIFICAÇÃO:',gravidade.toUpperCase()],
            ['PROFESSOR:',professor]
        ],
        headStyles:{fillColor:corPDF}
    });
    let finalY=doc.lastAutoTable.finalY+10;
    doc.setTextColor(...corPDF); doc.setFontSize(11); doc.text('INDISCIPLINA(S):',15,finalY);
    finalY+=7; doc.setTextColor(0); doc.setFontSize(10);
    selecionados.forEach(item=>{ if(finalY>275){doc.addPage();finalY=20;} const lines=doc.splitTextToSize(`- ${item}`,170); doc.text(lines,20,finalY); finalY+=Math.max(6,lines.length*5); });
    finalY+=5;
    if(finalY>270){doc.addPage();finalY=20;}
    doc.setTextColor(...corPDF); doc.text('RELATO DOS FATOS:',15,finalY);
    finalY+=7; doc.setTextColor(0);
    const lines=doc.splitTextToSize(obs,180); doc.text(lines,15,finalY);
    finalY+=(lines.length*5)+10;
    if(finalY>275){doc.addPage();finalY=20;}
    doc.setTextColor(...corPDF); doc.text('MEDIDA ADOTADA:',15,finalY);
    doc.setTextColor(0); doc.text(doc.splitTextToSize(pen,125),60,finalY);
    return doc.output('blob');
}

async function gerarEEnviar() {
    const aluno=document.getElementById('nome-aluno-confirmado').innerText;
    const turma=document.getElementById('turma').value;
    const fone=document.getElementById('whatsapp-fone').value;
    const obs=document.getElementById('descricao').value;
    const agr=document.getElementById('houve-agressao').value;
    const pen=document.getElementById('penalidades').value;
    const gravidade=gravidadeSelecionada;
    const emojiG=gravidade==='Grave'?'🔴 GRAVE':gravidade==='Média'?'🟠 MÉDIA':'🟢 LEVE';
    if(!fone)return alert('WhatsApp obrigatório.');
    const btn=document.getElementById('btn-finalizar'); btn.innerText='PROCESSANDO...'; btn.disabled=true;
    const agora=new Date(); const dataF=agora.toLocaleDateString('pt-BR'); const horaF=agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    const selecionados=[...document.querySelectorAll('#tipos-ocorrencia input:checked')].map(c=>c.getAttribute('data-label'));
    const textoParaBanco=selecionados.join(' | ');
    try{
        const {jsPDF}=window.jspdf;
        const dadosPDF={aluno,turma,tipos_selecionados:textoParaBanco,observacoes:obs,penalidades:pen,professor:professorLogado,data_hora:`${dataF} às ${horaF}`,gravidade};
        const pdfBlob=await gerarPDFBlobOcorrencia(dadosPDF);
        const pdfBase64=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=reject;r.readAsDataURL(pdfBlob)});
        const resp=await fetch(GOOGLE_SCRIPT_URL,{method:'POST',body:JSON.stringify({base64:pdfBase64,nomeArquivo:`Ocorrencia_${aluno}.pdf`})});
        const resJ=await resp.json(); const linkDrive=resJ.url||'';
        await _supabase.from('ocorrencias').insert([{aluno,turma,tipos_selecionados:textoParaBanco,observacoes:obs,agressao:agr,penalidades:pen,professor:professorLogado,data_hora:`${dataF} às ${horaF}`,url_pdf:linkDrive,gravidade}]);
        const saudacao=`*📎EEMTI DRAGÃO DO MAR - NOTIFICAÇÃO DISCIPLINAR*%0A%0A📌 Olá, informamos um registro de indisciplina para o aluno(a) *${aluno}*.%0A%0A`;
        const corpoMsg=`*🔎 DETALHES:*%0A*🎓 Aluno:* ${aluno}%0A*⚖️ Classificação:* ${emojiG}%0A*📆 Data:* ${dataF} às ${horaF}%0A*⚠️ Itens:* ${selecionados.join(', ')}%0A%0A*📝 RELATO:* ${obs||'Não detalhado'}%0A%0A*⚖️ MEDIDA:* ${pen}%0A%0A_Documento original arquivado na nuvem._`;
        const linkTexto=linkDrive?`%0A%0A*📄 ACESSE O PDF COMPLETO AQUI:*%0A${linkDrive}`:'';
        window.open(`https://api.whatsapp.com/send?phone=55${fone}&text=${saudacao}${corpoMsg}${linkTexto}`,'_blank');
        const url=URL.createObjectURL(pdfBlob); const a=document.createElement('a'); a.href=url; a.download=`Ocorrencia_${nomeArquivoSeguro(aluno)}.pdf`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),3000);
        alert('Salvo com sucesso!'); novaOcorrencia();
    }catch(e){console.error(e);alert('Erro ao salvar.');}finally{btn.innerText='💾SALVAR E ✅NOTIFICAR';btn.disabled=false;}
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
                const blob=await gerarPDFBlobOcorrencia(oc);
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

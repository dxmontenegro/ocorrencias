SISTEMA DE OCORRÊNCIAS - EEMTI DRAGÃO DO MAR

Estrutura:
- index.html: login
- cadastro.html: cadastro
- reset.html: redefinição de senha
- menu.html: menu principal
- individual.html: histórico individual
- dia.html: ocorrências do dia
- registro.html: novo registro
- estatisticas.html: estatísticas
- historico.html: download por turma/período em ZIP
- app.js: lógica compartilhada
- dados.js: alunos/turmas
- styles.css: estilo compartilhado

IMPORTANTE:
Mantenha imagem1.png na mesma pasta dos arquivos HTML.
O módulo ZIP depende do JSZip via CDN.
Os PDFs são buscados pelos links armazenados em url_pdf. Quando o servidor bloquear o download via navegador (CORS), o ZIP inclui um arquivo .url.txt com o link original.

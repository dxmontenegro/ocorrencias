import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    // 🔥 SÓ TROQUE AQUI PELO NOME DA SUA TABELA
    const { error } = await supabase
      .from('ocorrencias') // 👈 coloque sua tabela aqui
      .select('*')
      .limit(1);

    if (error) throw error;

    res.status(200).json({ status: "ok", supabase: "ativo" });

  } catch (e) {
    res.status(500).json({ status: "erro", detalhe: e.message });
  }
}

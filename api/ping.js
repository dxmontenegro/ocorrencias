export default async function handler(req, res) {

  try {

    const resposta = await fetch(
      "https://mspucfzsdpejwnhmwwmk.supabase.co/rest/v1/ocorrencia?select=*&limit=1",
      {
        headers: {
          apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcHVjZnpzZHBlanduaG13d21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjE5NTMsImV4cCI6MjA4NjI5Nzk1M30.2fz71fsG-eAJeKXNYRyUTWHSzwx9OLAVtrVj0Ynxk3s"
        }
      }
    );

    if (!resposta.ok) throw new Error("erro");

    res.status(200).json({ status: "ok" });

  } catch (e) {
    res.status(500).json({ status: "erro" });
  }
}

import { createClient } from "@/lib/supabase/server";
import { AcceptInviteForm } from "./AcceptInviteForm";

export default async function ConvitePage({ params }: { params: { token: string } }) {
  const supabase = createClient();

  // Busca o convite
  const { data: invite } = await supabase
    .from("couple_invites")
    .select("id, couple_id, used")
    .eq("token", params.token)
    .single();

  if (!invite || invite.used) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">💔</p>
          <h1 className="font-display text-3xl text-noir mb-2">Link inválido</h1>
          <p className="font-body text-smoke text-sm">
            Este link de convite já foi usado ou não existe. Peça um novo link para a noiva.
          </p>
        </div>
      </div>
    );
  }

  // Busca dados do casal
  const { data: couple } = await supabase
    .from("couples")
    .select("partner1_name, partner2_name, wedding_date")
    .eq("id", invite.couple_id)
    .single();

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="font-display text-gold text-lg tracking-wide mb-1">Você foi convidado</p>
          {couple && (
            <h1 className="font-display text-4xl text-noir">
              {couple.partner1_name} & {couple.partner2_name}
            </h1>
          )}
          {couple?.wedding_date && (
            <p className="font-body text-smoke text-sm mt-2">
              {new Date(couple.wedding_date + "T00:00:00").toLocaleDateString("pt-BR", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          )}
          <div className="w-12 h-px bg-gold mx-auto mt-4" />
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
          <p className="font-display text-xl text-noir mb-1 text-center">Criar seu acesso</p>
          <p className="font-body text-smoke text-sm text-center mb-6">
            Você terá acesso completo ao painel do casamento.
          </p>
          <AcceptInviteForm token={params.token} coupleId={invite.couple_id} />
        </div>
      </div>
    </div>
  );
}

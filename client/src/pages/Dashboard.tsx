import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Plus, Copy, CheckCircle2, Clock, AlertCircle, Mail, MessageCircle, Link } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [sendLinkDialogOpen, setSendLinkDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    notes: "",
  });

  const patientsQuery = trpc.patients.list.useQuery();
  const createPatientMutation = trpc.patients.create.useMutation();
  const generateLinkMutation = trpc.assessments.generateLink.useMutation();

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPatientMutation.mutateAsync({
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        notes: formData.notes || undefined,
      });
      
      setFormData({ name: "", age: "", email: "", phone: "", notes: "" });
      setIsAddingPatient(false);
      patientsQuery.refetch();
      toast.success("Paciente adicionado com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar paciente: " + (error as any).message);
    }
  };

  const openSendLinkDialog = (patient: any) => {
    setSelectedPatient(patient);
    setSendLinkDialogOpen(true);
  };

  const handleGenerateAndCopyLink = async (patientId: number) => {
    try {
      const result = await generateLinkMutation.mutateAsync({ patientId, sendEmail: false });
      const baseUrl = window.location.origin;
      const assessmentUrl = `${baseUrl}/assessment/${result.token}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(assessmentUrl);
      toast.success("Link copiado para a área de transferência!");
      setSendLinkDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao gerar link: " + (error as any).message);
    }
  };

  const handleSendEmail = async (patientId: number) => {
    try {
      const result = await generateLinkMutation.mutateAsync({ 
        patientId, 
        sendEmail: true 
      });
      
      if (result.emailSent) {
        toast.success("Link enviado por email com sucesso!");
      } else {
        toast.warning("Link gerado, mas o email não pôde ser enviado. Copie o link manualmente.");
        const baseUrl = window.location.origin;
        const assessmentUrl = `${baseUrl}/assessment/${result.token}`;
        await navigator.clipboard.writeText(assessmentUrl);
      }
      setSendLinkDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao enviar email: " + (error as any).message);
    }
  };

  const handleSendWhatsApp = async (patientId: number, phone: string) => {
    try {
      const result = await generateLinkMutation.mutateAsync({ patientId, sendEmail: false });
      const baseUrl = window.location.origin;
      const assessmentUrl = `${baseUrl}/assessment/${result.token}`;
      
      // Format WhatsApp message
      const message = `Olá! 👋\n\nVocê foi convidado(a) a responder um questionário de avaliação psicológica.\n\n🔗 Acesse aqui:\n${assessmentUrl}\n\n📋 Informações:\n• 68 questões\n• Tempo: 15-20 minutos\n• Válido por 30 dias\n\nQualquer dúvida, estou à disposição! 😊`;
      
      // Clean phone number (remove non-numeric characters)
      const cleanPhone = phone.replace(/\D/g, '');
      
      // Handle country code - if phone already starts with country code, don't add it
      // Otherwise, default to Brazil (55)
      const phoneWithCountry = cleanPhone.startsWith('55') || cleanPhone.length > 11
        ? cleanPhone
        : `55${cleanPhone}`;
      
      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      toast.success("Link gerado! Abrindo WhatsApp...");
      setSendLinkDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao gerar link: " + (error as any).message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Avaliação Psicológica</h1>
            <p className="text-gray-600 mt-1">Gerencie pacientes e questionários de avaliação</p>
          </div>
          
          <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Paciente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Paciente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPatient} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Nome completo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="Ex: 25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas adicionais sobre o paciente"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createPatientMutation.isPending}>
                  {createPatientMutation.isPending ? "Adicionando..." : "Adicionar Paciente"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Patients Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientsQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Carregando pacientes...
                    </TableCell>
                  </TableRow>
                ) : patientsQuery.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhum paciente cadastrado. Clique em "Novo Paciente" para começar.
                    </TableCell>
                  </TableRow>
                ) : (
                  patientsQuery.data?.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.age || "-"}</TableCell>
                      <TableCell>{patient.email || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-amber-600">Aguardando resposta</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openSendLinkDialog(patient)}
                          disabled={generateLinkMutation.isPending}
                        >
                          <Link className="w-4 h-4 mr-2" />
                          Enviar Link
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex gap-4">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Como usar:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Adicione um novo paciente usando o botão "Novo Paciente"</li>
                <li>Clique em "Enviar Link" para criar e enviar o link de avaliação</li>
                <li>Escolha enviar por Email, WhatsApp ou apenas copiar o link</li>
                <li>O paciente responde o questionário através do link</li>
                <li>As respostas são automaticamente armazenadas e analisadas</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>

      {/* Send Link Dialog */}
      <Dialog open={sendLinkDialogOpen} onOpenChange={setSendLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Link de Avaliação</DialogTitle>
            <DialogDescription>
              Escolha como deseja enviar o link para {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Email Option */}
            <Button
              className="w-full justify-start gap-3 h-auto py-4"
              variant="outline"
              onClick={() => handleSendEmail(selectedPatient?.id)}
              disabled={!selectedPatient?.email || generateLinkMutation.isPending}
            >
              <Mail className="w-5 h-5 text-blue-600" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Enviar por Email</div>
                <div className="text-xs text-gray-500">
                  {selectedPatient?.email || "Email não cadastrado"}
                </div>
              </div>
            </Button>

            {/* WhatsApp Option */}
            <Button
              className="w-full justify-start gap-3 h-auto py-4"
              variant="outline"
              onClick={() => handleSendWhatsApp(selectedPatient?.id, selectedPatient?.phone)}
              disabled={!selectedPatient?.phone || generateLinkMutation.isPending}
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Enviar por WhatsApp</div>
                <div className="text-xs text-gray-500">
                  {selectedPatient?.phone || "Telefone não cadastrado"}
                </div>
              </div>
            </Button>

            {/* Copy Link Option */}
            <Button
              className="w-full justify-start gap-3 h-auto py-4"
              variant="outline"
              onClick={() => handleGenerateAndCopyLink(selectedPatient?.id)}
              disabled={generateLinkMutation.isPending}
            >
              <Copy className="w-5 h-5 text-gray-600" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Copiar Link</div>
                <div className="text-xs text-gray-500">
                  Gerar e copiar para área de transferência
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

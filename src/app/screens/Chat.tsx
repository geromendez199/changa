import { MessageCircle } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { Badge } from "../components/Badge";

const conversations = [
  {
    id: "1",
    name: "Mariana G.",
    lastMessage: "Perfecto, nos vemos mañana a las 10",
    time: "Hace 5 min",
    unread: 2,
    avatar: "M",
    job: "Reparación de puerta",
    online: true,
  },
  {
    id: "2",
    name: "Carlos R.",
    lastMessage: "¿El precio incluye materiales?",
    time: "Hace 1 hora",
    unread: 0,
    avatar: "C",
    job: "Pintura de habitación",
    online: false,
  },
  {
    id: "3",
    name: "Laura P.",
    lastMessage: "Muchas gracias por el excelente trabajo!",
    time: "Ayer",
    unread: 0,
    avatar: "L",
    job: "Limpieza profunda",
    online: false,
  },
  {
    id: "4",
    name: "Diego M.",
    lastMessage: "¿Podés venir el viernes por la tarde?",
    time: "2 días",
    unread: 0,
    avatar: "D",
    job: "Instalación eléctrica",
    online: true,
  },
];

export function Chat() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 max-w-md mx-auto font-['Inter']">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-[#111827]">Mensajes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {conversations.filter(c => c.unread > 0).length} conversaciones nuevas
          </p>
        </div>
      </div>

      {/* Conversations List */}
      <div className="px-6 py-4 space-y-2">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`bg-white rounded-3xl p-4 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 border ${
              conv.unread > 0 ? "border-[#10B981]/20" : "border-gray-100"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {conv.avatar}
                </div>
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#10B981] rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="font-bold text-[#111827] text-base">
                      {conv.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{conv.job}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {conv.time}
                    </span>
                    {conv.unread > 0 && (
                      <div className="bg-[#10B981] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {conv.unread}
                      </div>
                    )}
                  </div>
                </div>
                <p
                  className={`text-sm line-clamp-1 ${
                    conv.unread > 0
                      ? "text-[#111827] font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-24 h-24 bg-[#F8FAFC] rounded-3xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-200">
            <MessageCircle size={40} className="text-gray-400" />
          </div>
          <h3 className="font-bold text-[#111827] text-lg mb-2">
            No tenés mensajes
          </h3>
          <p className="text-gray-600 text-center text-sm max-w-xs">
            Cuando te contacten por un trabajo, las conversaciones aparecerán acá
          </p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

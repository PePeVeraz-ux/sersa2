'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Phone, Paperclip, Send, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { apiFetch } from '@/lib/api';

export default function NurseMessages() {
  const { token, user } = useAuth();
  const { socket, connected } = useSocket();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messagesByRequest, setMessagesByRequest] = useState<Record<string, any[]>>({});
  const [convToReq, setConvToReq] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch mis citas asignadas para armar la lista de contactos (pacientes)
  useEffect(() => {
    if (!token) return;
    apiFetch<any[]>('/requests/nurse/requests', { token })
      .then(data => {
        const uniquePatients: Record<string, any> = {};
        
        // Sort requests by created_at desc so latest is first
        const sortedData = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        sortedData.forEach((req: any) => {
          const patientId = req.patient.id;
          if (!uniquePatients[patientId]) {
            uniquePatients[patientId] = {
              patientId,
              name: `${req.patient.patient_profile?.first_name || 'Paciente'} ${req.patient.patient_profile?.last_name || ''}`,
              role: 'Paciente',
              online: false,
              requests: []
            };
          }
          uniquePatients[patientId].requests.push(req);
        });

        const contactsList = Object.values(uniquePatients);
        setContacts(contactsList);
        if (contactsList.length > 0) {
          setSelectedContact(contactsList[0]);
        }
      })
      .catch(console.error);
  }, [token]);

  // Manejar Sockets
  useEffect(() => {
    if (!socket || !selectedContact) return;

    // Join room for each request
    selectedContact.requests.forEach((req: any) => {
      socket.emit('joinConversation', { serviceRequestId: req.id });
    });

    const handleHistory = (data: any) => {
      setConvToReq(prev => ({ ...prev, [data.conversationId]: data.serviceRequestId }));
      setMessagesByRequest(prev => ({ ...prev, [data.serviceRequestId]: data.messages }));
    };

    const handleNewMessage = (msg: any) => {
      setConvToReq(prev => {
        const reqId = prev[msg.conversation_id];
        if (reqId) {
          setMessagesByRequest(prevMsgs => {
            const msgs = prevMsgs[reqId] || [];
            // Prevent duplicates
            if (msgs.some(m => m.id === msg.id)) return prevMsgs;
            return { ...prevMsgs, [reqId]: [...msgs, msg] };
          });
        }
        return prev;
      });
    };

    socket.on('conversationHistory', handleHistory);
    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('conversationHistory', handleHistory);
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, selectedContact]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesByRequest]);

  const handleSend = () => {
    if (!message.trim() || !selectedContact || !socket) return;
    
    // We send to the most recent request (index 0 because we sorted desc)
    const activeRequest = selectedContact.requests[0];
    const targetConversationId = Object.keys(convToReq).find(key => convToReq[key] === activeRequest.id);
    
    if (!targetConversationId) return;

    socket.emit('sendMessage', { conversationId: targetConversationId, text: message });
    setMessage('');
  };

  const renderRequests = useMemo(() => {
    if (!selectedContact) return [];
    // Sort chronological for display (oldest first, newest at bottom)
    return [...selectedContact.requests].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [selectedContact]);

  const totalMessagesCount = useMemo(() => {
    return Object.values(messagesByRequest).reduce((acc, curr) => acc + curr.length, 0);
  }, [messagesByRequest]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-8rem)] flex gap-6 max-w-7xl mx-auto"
    >
      
      {/* Left Sidebar: Contacts */}
      <Card className="w-80 shadow-sm flex flex-col border-slate-200 shrink-0 hidden md:flex">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#4DB4D7]" />
            Mis Pacientes
            <div className={cn("w-2 h-2 rounded-full ml-auto", connected ? "bg-emerald-500" : "bg-rose-500")} />
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar paciente..." 
              className="pl-10 h-10 border-slate-200 bg-slate-50 rounded-xl"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No tienes pacientes asignados actualmente.
            </div>
          ) : contacts.map((contact) => (
            <div 
              key={contact.patientId} 
              onClick={() => setSelectedContact(contact)}
              className={cn(
                "flex items-center gap-3 p-4 cursor-pointer transition-all border-b last:border-0",
                selectedContact?.patientId === contact.patientId 
                  ? "bg-sky-50/50 border-l-4 border-l-[#4DB4D7]" 
                  : "hover:bg-slate-50 border-l-4 border-l-transparent"
              )}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center overflow-hidden shrink-0 text-sky-700 font-bold text-sm">
                  {contact.name.substring(0, 2).toUpperCase()}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-semibold text-slate-800 text-sm truncate">{contact.name}</h3>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500 truncate">{contact.requests.length} Cita{contact.requests.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Right Area: Chat Window */}
      {selectedContact ? (
        <Card className="flex-1 shadow-sm flex flex-col border-slate-200 overflow-hidden">
          
          {/* Chat Header */}
          <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center text-sky-700 font-bold text-sm">
                {selectedContact.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{selectedContact.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  Paciente ({selectedContact.requests.length} citas)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button className="hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-50"><Phone className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
            {totalMessagesCount === 0 && (
              <div className="text-center text-slate-400 text-sm my-8">
                Envía un mensaje para comenzar la conversación.
              </div>
            )}
            
            {renderRequests.map((req: any) => {
              const reqMessages = messagesByRequest[req.id] || [];
              const serviceName = req.items?.[0]?.service?.name || 'Servicio';
              
              return (
                <div key={req.id} className="space-y-4">
                  {/* Divider for the appointment */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="h-px bg-slate-200 flex-1" />
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-500 shadow-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      Cita: {serviceName} • {new Date(req.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  {reqMessages.map((msg: any) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <motion.div 
                        key={msg.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
                      >
                        <div 
                          className={cn(
                            "max-w-[70%] rounded-2xl px-5 py-3 shadow-sm",
                            isMe 
                              ? "bg-[#4DB4D7] text-white rounded-tr-sm" 
                              : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm"
                          )}
                        >
                          <p className="text-sm leading-relaxed">{msg.body}</p>
                        </div>
                        <span className="text-xs text-slate-400 mt-1 px-1">
                          {new Date(msg.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-50">
                <Paperclip className="w-5 h-5" />
              </button>
              <Input 
                placeholder="Escribe un mensaje para la cita más reciente..." 
                className="flex-1 h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-1"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                className="w-11 h-11 rounded-full bg-[#4DB4D7] text-white flex items-center justify-center hover:bg-[#3ba0c2] transition-all shrink-0 shadow-sm active:scale-95 disabled:opacity-50"
                onClick={handleSend}
                disabled={!message.trim()}
              >
                <Send className="w-5 h-5 -ml-0.5" />
              </button>
            </div>
          </div>

        </Card>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <MessageSquare className="w-12 h-12 mb-4 text-slate-300" />
          <p>Selecciona una conversación</p>
        </div>
      )}

    </motion.div>
  );
}

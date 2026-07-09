'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Loader2, Upload, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

export default function DocumentsSettings() {
  const { token } = useAuth();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCredentials = () => {
    if (!token) return;
    apiFetch<any[]>('/profiles/credentials', { token })
      .then(data => {
        setCredentials(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) fetchCredentials();
  }, [token]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'professional_license');

    try {
      await apiFetch('/profiles/credentials/upload', {
        method: 'POST',
        token,
        body: formData,
      });
      fetchCredentials();
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#4DB4D7]" />
      </div>
    );
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-slate-800">Documentos Profesionales</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {credentials.length === 0 ? (
          <div className="p-8 text-center border rounded-xl border-dashed border-slate-300 bg-slate-50 text-slate-500">
            No tienes documentos subidos. Sube tu cédula profesional.
          </div>
        ) : (
          credentials.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-[#4DB4D7] rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-medium text-slate-700 block">{doc.document_type === 'professional_license' ? 'Cédula Profesional' : 'Título'}</span>
                  <span className="text-xs text-slate-400">Enviado: {new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <span className={cn(
                "text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-full",
                doc.review_status === 'pending' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {doc.review_status === 'pending' ? 'En Revisión' : <><CheckCircle className="w-4 h-4"/> Aprobado</>}
              </span>
            </div>
          ))
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />

        <Button 
          variant="outline" 
          className="w-full h-14 border-dashed border-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          onClick={handleUploadClick}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Upload className="w-5 h-5 mr-2" />
          )}
          {uploading ? 'Subiendo...' : 'Subir Nuevo Documento'}
        </Button>
      </CardContent>
    </Card>
  );
}

import React, { useState, useRef } from 'react';
import { FileText, Upload, Download, Trash2, Share2, PenTool, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import SignatureCanvas from 'react-signature-canvas';
import toast from 'react-hot-toast';

interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  sizeBytes: number;
  lastModified: string;
  shared: boolean;
  status: 'draft' | 'review' | 'signed';
  signedBy?: string;
  signedDate?: string;
  fileData?: string; // For storing uploaded file as data URL
}

const getStatusBadge = (status: string) => {
  switch(status) {
    case 'draft':
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">📝 Draft</Badge>;
    case 'review':
      return <Badge variant="primary" className="bg-yellow-100 text-yellow-700">🔄 In Review</Badge>;
    case 'signed':
      return <Badge variant="success" className="bg-green-100 text-green-700">✅ Signed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      name: 'Pitch Deck 2024.pdf',
      type: 'PDF',
      size: '2.4 MB',
      sizeBytes: 2400000,
      lastModified: '2024-02-15',
      shared: true,
      status: 'draft'
    },
    {
      id: 2,
      name: 'Financial Projections.xlsx',
      type: 'Spreadsheet',
      size: '1.8 MB',
      sizeBytes: 1800000,
      lastModified: '2024-02-10',
      shared: false,
      status: 'draft'
    },
    {
      id: 3,
      name: 'Business Plan.docx',
      type: 'Document',
      size: '3.2 MB',
      sizeBytes: 3200000,
      lastModified: '2024-02-05',
      shared: true,
      status: 'review'
    }
  ]);

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateDocumentStatus = (docId: number, newStatus: 'draft' | 'review' | 'signed') => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, status: newStatus } : doc
    ));
    toast.success(`Document status updated to ${newStatus}`);
  };

  const handleSignDocument = () => {
    if (signatureRef.current && selectedDocument) {
      signatureRef.current.toDataURL();
      setDocuments(prev => prev.map(doc =>
        doc.id === selectedDocument.id ? {
          ...doc,
          status: 'signed',
          signedBy: 'Current User',
          signedDate: new Date().toISOString().split('T')[0]
        } : doc
      ));
      setShowSignatureModal(false);
      setSelectedDocument(null);
      toast.success('Document signed successfully!');
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = e.target?.result as string;
      
      const newDocument: Document = {
        id: Date.now(),
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'File',
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        sizeBytes: file.size,
        lastModified: new Date().toISOString().split('T')[0],
        shared: false,
        status: 'draft',
        fileData: fileData
      };
      
      setDocuments(prev => [newDocument, ...prev]);
      toast.success(`${file.name} uploaded successfully!`);
      setShowUploadModal(false);
      setUploading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.onerror = () => {
      toast.error('Failed to read file');
      setUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const deleteDocument = (docId: number) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast.success('Document deleted');
  };

  const downloadDocument = (doc: Document) => {
    if (doc.fileData) {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.name;
      link.click();
      toast.success(`Downloading ${doc.name}`);
    } else {
      // For mock documents, simulate download
      toast.success(`Downloading ${doc.name} (demo)`);
    }
  };

  // Calculate total storage used
  const totalStorageUsed = documents.reduce((total, doc) => total + (doc.sizeBytes || 0), 0);
  const totalStorageMB = (totalStorageUsed / (1024 * 1024)).toFixed(1);
  const storagePercentage = Math.min((totalStorageUsed / (20 * 1024 * 1024)) * 100, 100); // 20MB max

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">Manage, sign, and track your important documents</p>
        </div>

        <Button 
          leftIcon={<Upload size={18} />}
          onClick={() => setShowUploadModal(true)}
        >
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Status sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Document Status</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm">Draft</span>
                </div>
                <Badge variant="secondary">{documents.filter(d => d.status === 'draft').length}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-yellow-500" />
                  <span className="text-sm">In Review</span>
                </div>
                <Badge variant="primary">{documents.filter(d => d.status === 'review').length}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm">Signed</span>
                </div>
                <Badge variant="success">{documents.filter(d => d.status === 'signed').length}</Badge>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Storage</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Used</span>
                  <span className="font-medium text-gray-900">{totalStorageMB} MB</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-primary-600 rounded-full" style={{ width: `${storagePercentage}%` }}></div>
                </div>
                <p className="text-xs text-gray-500">Max 20 MB</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Access</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Recent Files
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Shared with Me
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Starred
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Document list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Sort by
                </Button>
                <Button variant="outline" size="sm">
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No documents yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowUploadModal(true)}
                  >
                    Upload your first document
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex-wrap gap-4"
                    >
                      <div className="p-2 bg-primary-50 rounded-lg">
                        <FileText size={24} className="text-primary-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {doc.name}
                          </h3>
                          {doc.shared && <Badge variant="secondary" size="sm">Shared</Badge>}
                          {getStatusBadge(doc.status)}
                          {doc.signedBy && (
                            <span className="text-xs text-gray-500">Signed by {doc.signedBy} on {doc.signedDate}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                          <span>{doc.type}</span>
                          <span>{doc.size}</span>
                          <span>Modified {doc.lastModified}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          onClick={() => downloadDocument(doc)}
                        >
                          <Download size={18} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                        >
                          <Share2 size={18} />
                        </Button>

                        {doc.status !== 'signed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-green-600"
                            onClick={() => {
                              setSelectedDocument(doc);
                              setShowSignatureModal(true);
                            }}
                          >
                            <PenTool size={18} />
                          </Button>
                        )}

                        <select
                          value={doc.status}
                          onChange={(e) => updateDocumentStatus(doc.id, e.target.value as any)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="draft">Draft</option>
                          <option value="review">In Review</option>
                          <option value="signed">Signed</option>
                        </select>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-red-600 hover:text-red-700"
                          onClick={() => deleteDocument(doc.id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Upload Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload size={40} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Click or drag to upload</p>
              <p className="text-xs text-gray-500 mb-4">PDF, DOC, XLSX, PPT (Max 10MB)</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 cursor-pointer"
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Sign Document</h3>
              <button onClick={() => setShowSignatureModal(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Signing: <strong>{selectedDocument.name}</strong>
            </p>

            <div className="border-2 border-gray-300 rounded-lg mb-4">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: 'w-full h-40 rounded-lg',
                  style: { width: '100%', height: '160px', background: '#f9fafb' }
                }}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={clearSignature} className="flex-1">
                Clear
              </Button>
              <Button onClick={handleSignDocument} className="flex-1">
                Sign Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
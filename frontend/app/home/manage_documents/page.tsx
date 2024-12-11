"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Upload, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Document {
  name: string
  uploadDate: string
}

export default function ManageDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/embeddings`)
      const data = await response.json()
      const documents: Document[] = data.documents.map(doc => ({
        name: doc[0],
        uploadDate: doc[1]
      }));
      setDocuments(documents)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    
    // Check for duplicates
    const existingDocs = documents.map(x => x.name)
    const duplicates = Array.from(files).filter(file => existingDocs.includes(file.name))
    
    if (duplicates.length > 0) {
      toast({
        title: "Error",
        description: `Duplicate documents already exist: ${duplicates.map(f => f.name).join(', ')}`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    
    // Append all files to formData
    Array.from(files).forEach(file => {
      formData.append("files", file)
    })

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/embed`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${files.length} document${files.length > 1 ? 's' : ''} uploaded successfully`,
          variant: "success",
        })
        fetchDocuments()
      } else {
        console.log(await response.json())
        toast({
          title: "Error",
          description: "Failed to upload documents",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the file input
      event.target.value = ''
    }
  }

  const handleDelete = async (documentName: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/remove/${documentName}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.name !== documentName))
        toast({
          title: "Success",
          description: "Document deleted successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Documents</h1>
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
              multiple
              disabled={isUploading}
            />
            <label htmlFor="file-upload">
              <Button disabled={isUploading} asChild>
                <span className="flex items-center gap-2">
                  <Upload size={16} />
                  {isUploading ? "Uploading..." : "Upload Documents"}
                </span>
              </Button>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {documents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No documents uploaded yet
            </div>
          ) : (
            <div className="divide-y">
              {documents.map((doc) => (
                <motion.div
                  key={doc.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <p className="text-sm text-gray-500">
                      Uploaded on {doc.uploadDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(doc.name)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
} 
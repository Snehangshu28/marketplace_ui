import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Smile, Lock, MessageSquare, Check, CheckCheck, Image as ImageIcon, FileText, Download, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import ChatProfileModal from '../components/ChatProfileModal';
import { User } from 'lucide-react';
import { apiUrl } from '@/lib/api';

export default function ChatPage() {
  const { currentUser, userData } = useAuth();
  const { sendMessage, onMessage, onNewMessage, markDelivered, markSeen, onMessageStatusUpdate } = useSocket();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [attachment, setAttachment] = useState<{file: File, type: 'image' | 'video' | 'file', previewUrl: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch real conversations
  useEffect(() => {
    const fetchChatPartners = async () => {
      if (!currentUser) return;
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch(apiUrl('/chat'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          const partners = data.data.map((conv: any) => ({
            id: conv._id,
            partnerId: conv.partnerId,
            name: conv.partnerName,
            lastMessage: conv.lastMessage || 'Start chatting...',
            time: new Date(conv.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date(conv.time).getTime(),
            avatar: conv.partnerImage,
            online: true,
          }));
          // sort initially, though backend sorted it
          setConversations(partners.sort((a: any, b: any) => b.timestamp - a.timestamp));
          if (partners.length > 0) setSelectedConversation(partners[0]);
        }
      } catch (error) {
        console.error('Error fetching chat partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatPartners();
  }, [currentUser]);

  // Fetch real chat history when conversation selected
  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser || !selectedConversation) return;
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch(apiUrl(`/chat/${selectedConversation.id}/messages`), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setChatMessages(data.data);
          setTimeout(scrollToBottom, 100);
          
          // If we opened the chat, we have "seen" the other user's messages
          if (currentUser) {
            markSeen(selectedConversation.partnerId);
          }
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };
    fetchHistory();
  }, [currentUser, selectedConversation]);

  // Handle incoming sockets
  useEffect(() => {
    const cleanup = onMessage((msg: any) => {
      // Receiver logic
      if (selectedConversation && (msg.senderId === selectedConversation.partnerId || msg.senderId === currentUser?.uid)) {
        
        // If it's a message from the partner while we have the chat actively opened, mark as seen immediately!
        // Otherwise, mark as delivered if we just received it.
        const isFromPartner = msg.senderId !== currentUser?.uid;
        const newStatus = isFromPartner ? 'seen' : 'sent';
        
        if (isFromPartner && currentUser) {
          markSeen(selectedConversation.partnerId);
        }

        const displayFileUrl = msg.fileId ? apiUrl(`/file/${msg.fileId}`) : (msg.fileUrl || '');

        setChatMessages((prev) => [...prev, {
          id: Date.now(),
          sender: isFromPartner ? 'them' : 'me',
          content: msg.content,
          type: msg.type || 'text',
          fileUrl: displayFileUrl,
          fileName: msg.fileName || '',
          status: newStatus,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setTimeout(scrollToBottom, 50);
      } else if (msg.senderId !== currentUser?.uid) {
        // We received it but chat isn't open -> mark as delivered
        markDelivered(msg._id, msg.senderId);
      }
    });
    return cleanup;
  }, [selectedConversation, currentUser, onMessage, markSeen, markDelivered]);

  // Listen to status updates
  useEffect(() => {
    const cleanup = onMessageStatusUpdate((data: any) => {
      if (data.messageId) {
        // Individual message update (delivered)
        setChatMessages((prev) => prev.map((msg) => msg.id === data.messageId ? { ...msg, status: data.status } : msg));
      } else if (data.receiverId) {
        // Bulk messages seen update
        setChatMessages((prev) => prev.map((msg) => msg.sender === 'me' ? { ...msg, status: 'seen' } : msg));
      }
    });
    return cleanup;
  }, [onMessageStatusUpdate]);

  // Listen to new_message to update conversations list
  useEffect(() => {
    const cleanup = onNewMessage((msg: any) => {
      setConversations((prev) => {
        const updated = prev.map(conv => {
          if (conv.partnerId === msg.senderId || conv.partnerId === msg.receiverId) {
            let textPreview = msg.content;
            if (msg.type === 'image') textPreview = '📷 Image';
            else if (msg.type === 'video') textPreview = '🎥 Video';
            else if (msg.type === 'file') textPreview = `📄 ${msg.fileName || 'File'}`;

            return {
              ...conv,
              lastMessage: textPreview,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: new Date().getTime()
            };
          }
          return conv;
        });
        
        return updated.sort((a, b) => b.timestamp - a.timestamp);
      });
    });
    return cleanup;
  }, [onNewMessage]);

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    let type: 'image' | 'video' | 'file' = 'file';
    
    if (fileType.startsWith('image/')) type = 'image';
    else if (fileType.startsWith('video/')) type = 'video';

    const previewUrl = type !== 'file' ? URL.createObjectURL(file) : '';
    setAttachment({ file, type, previewUrl });
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset
  };

  const removeAttachment = () => {
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment(null);
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !attachment) || !selectedConversation || !currentUser) return;
    
    setIsUploading(true);
    let finalType = attachment ? attachment.type : 'text';
    let fileUrl = '';
    let fileId = '';
    let fileName = '';
    const tempId = Date.now() + Math.random();

    try {
      if (attachment) {
        fileName = attachment.file.name;
        
        // Upload to MongoDB GridFS via API
        const token = await currentUser.getIdToken();
        const formData = new FormData();
        formData.append('file', attachment.file);

        const uploadRes = await fetch(apiUrl('/upload'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.data?.fileId) {
           fileId = uploadData.data.fileId;
           fileUrl = apiUrl(`/file/${fileId}`);
        }
      }

      // Send real-time socket
      sendMessage(selectedConversation.partnerId, messageInput, finalType, fileUrl, fileId, fileName);
      
      // Persist to DB
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(apiUrl(`/chat/${selectedConversation.id}/messages`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: messageInput, type: finalType, fileUrl, fileId, fileName })
        });
        const savedMsg = await res.json();
        if (savedMsg.success) {
           setChatMessages(prev => {
             const newArr = prev.map(msg => 
               msg.id === tempId ? { ...msg, id: savedMsg.data._id, status: 'sent' } : msg
             );
             return newArr;
           });
        }
      } catch (error) {
        console.error('Failed to persist message', error);
      }

      // Optimistically add to UI before server responds
      setChatMessages((prev) => [...prev, {
        id: tempId,
        sender: 'me',
        content: messageInput,
        type: finalType,
        fileUrl,
        fileName,
        status: 'sending',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setTimeout(scrollToBottom, 50);
      
      setMessageInput('');
      removeAttachment();
      setShowEmojiPicker(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="dashboard" />

      <div className="h-[calc(100vh-4rem)] flex">
        {/* Conversations List */}
        <aside className="w-80 bg-background border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-bold mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
              <Input
                type="text"
                placeholder="Search conversations..."
                className="pl-9 h-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-center text-foreground">Loading...</p>
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    setChatMessages([]); // Clear for new partner in this simplified demo
                  }}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-background transition-colors border-b border-border ${
                    selectedConversation?.partnerId === conversation.partnerId ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={conversation.avatar}
                      alt={conversation.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-background rounded-full border-2 border-border"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm truncate">
                        {conversation.name}
                      </span>
                      <span className="text-xs text-foreground whitespace-nowrap ml-2">{conversation.time}</span>
                    </div>
                    <p className="text-sm text-foreground truncate break-all">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <Lock className="w-12 h-12 text-foreground mx-auto mb-2" />
                <p className="text-foreground text-sm">No accepted invites found. You can only chat after an invite is accepted.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Chat Window */}
        <main className="flex-1 flex flex-col bg-background">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-6 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedConversation.avatar}
                      alt={selectedConversation.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {selectedConversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-background rounded-full border-2 border-border"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{selectedConversation.name}</div>
                    <div className="text-xs text-foreground">
                      {selectedConversation.online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="w-5 h-5" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)} className="gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        <span>View Profile</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.length > 0 ? chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl ${
                        message.sender === 'me'
                          ? 'bg-primary text-[#2b2635] text-foreground rounded-br-sm'
                          : 'bg-background text-foreground rounded-bl-sm'
                      }`}
                    >
                      {message.type === 'image' && message.fileUrl && (
                        <div className="mb-2">
                          <img src={message.fileUrl} alt="attachment" className="max-w-[240px] max-h-[240px] rounded object-cover cursor-pointer hover:opacity-90" onClick={() => window.open(message.fileUrl, '_blank')} />
                        </div>
                      )}
                      {message.type === 'video' && message.fileUrl && (
                        <div className="mb-2">
                          <video src={message.fileUrl} controls className="max-w-[240px] max-h-[240px] rounded" />
                        </div>
                      )}
                      {message.type === 'file' && message.fileUrl && (
                        <div className="mb-2 flex items-center gap-3 p-3 bg-background rounded-lg cursor-pointer hover:bg-background transition-colors" onClick={() => window.open(message.fileUrl, '_blank')}>
                          <div className="bg-background p-2 rounded">
                            <FileText className="w-5 h-5 text-current" />
                          </div>
                          <span className="text-sm font-medium truncate max-w-[150px]">{message.fileName || 'Document'}</span>
                          <Download className="w-4 h-4 ml-auto opacity-70" />
                        </div>
                      )}
                      {message.content && <p className="text-sm break-words">{message.content}</p>}
                      <div
                        className={`mt-1 flex items-center gap-1 text-xs ${
                          message.sender === 'me' ? 'text-primary/70 justify-end' : 'text-foreground'
                        }`}
                      >
                        <span>{message.time}</span>
                        {message.sender === 'me' && (
                          <div className="flex items-center">
                            {message.status === 'sent' && <Check className="w-3 h-3 opacity-80" />}
                            {message.status === 'delivered' && <CheckCheck className="w-3 h-3 opacity-80" />}
                            {message.status === 'seen' && <CheckCheck className="w-3 h-3 text-primary/70 transition-colors duration-300" />}
                            {message.status === 'sending' && <span className="opacity-70 text-[10px] animate-pulse">...</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-foreground mt-10">No messages yet. Say hi!</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                {/* Preview Section */}
                {attachment && (
                  <div className="mb-3 p-3 bg-background border border-border rounded-xl relative flex items-center gap-4">
                    <button onClick={removeAttachment} className="absolute -top-2 -right-2 bg-background hover:bg-background rounded-full p-1 shadow-sm">
                      <X className="w-4 h-4" />
                    </button>
                    {attachment.type === 'image' && (
                      <img src={attachment.previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-border" />
                    )}
                    {attachment.type === 'video' && (
                      <video src={attachment.previewUrl} className="w-16 h-16 object-cover rounded-lg border border-border" />
                    )}
                    {attachment.type === 'file' && (
                      <div className="w-16 h-16 bg-background border border-border rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 truncate">
                      <p className="text-sm font-medium truncate">{attachment.file.name}</p>
                      <p className="text-xs text-foreground">{(attachment.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-end gap-2">
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleAttachmentSelect} accept="*/*" />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="flex-shrink-0 relative overflow-hidden" disabled={isUploading}>
                        <Paperclip className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={10} className="w-48 bg-background border border-border shadow-xl rounded-xl">
                      <DropdownMenuItem onClick={() => { if(fileInputRef.current) { fileInputRef.current.accept = 'image/*'; fileInputRef.current.click(); }}} className="gap-3 py-3 cursor-pointer hover:bg-primary/10 focus:bg-primary/10">
                        <div className="bg-primary/20 p-2 rounded-full text-primary"><ImageIcon className="w-4 h-4" /></div>
                        <span className="font-medium">Image</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { if(fileInputRef.current) { fileInputRef.current.accept = 'video/*'; fileInputRef.current.click(); }}} className="gap-3 py-3 cursor-pointer hover:bg-background focus:bg-background">
                        <div className="bg-background p-2 rounded-full text-foreground"><Video className="w-4 h-4" /></div>
                        <span className="font-medium">Video</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { if(fileInputRef.current) { fileInputRef.current.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx'; fileInputRef.current.click(); }}} className="gap-3 py-3 cursor-pointer hover:bg-background focus:bg-background">
                        <div className="bg-background p-2 rounded-full text-foreground"><FileText className="w-4 h-4" /></div>
                        <span className="font-medium">Document</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder={isUploading ? "Uploading..." : attachment ? "Add a caption..." : "Type a message..."}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isUploading && handleSendMessage()}
                      className="pr-10 h-11"
                      disabled={isUploading}
                    />
                    {showEmojiPicker && (
                      <div className="absolute bottom-14 right-0 z-50 shadow-xl rounded-lg">
                        <EmojiPicker 
                          onEmojiClick={(emojiData) => setMessageInput(prev => prev + emojiData.emoji)}
                          width={300}
                          height={400}
                        />
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isUploading}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-foreground hover:text-foreground"
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={isUploading || (!messageInput.trim() && !attachment)}
                    className="bg-primary text-[#2b2635] hover:bg-primary text-[#2b2635] flex-shrink-0 relative overflow-hidden"
                    size="icon"
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-border border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Select a conversation</h3>
              <p className="text-foreground max-w-xs">
                You can only chat with users who have accepted your invite or whose invite you have accepted.
              </p>
            </div>
          )}
        </main>
      </div>
      
      {selectedConversation && (
        <ChatProfileModal 
          userId={selectedConversation.partnerId}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
}

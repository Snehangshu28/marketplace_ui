import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Check, X, MessageSquare } from 'lucide-react';
import { Link } from 'react-router';
import { apiUrl, fetchWithIdToken } from '@/lib/api';

export default function InvitesList() {
  const { currentUser, userData, loading: authLoading } = useAuth();
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    if (authLoading || !currentUser) return;
    try {
      const response = await fetchWithIdToken('/invites', currentUser);
      const data = await response.json();
      if (data.success) {
        setInvites(data.data);
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [currentUser, authLoading]);

  const handleUpdateStatus = async (inviteId: string, status: 'accepted' | 'rejected') => {
    if (!currentUser) return;
    try {
      const response = await fetchWithIdToken(`/invites/${inviteId}`, currentUser, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Invite ${status}`);
        fetchInvites(); // Refresh list
      } else {
        toast.error(data.message || 'Failed to update invite');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  if (loading) return <p className="text-[#9d97a8] text-sm">Loading invites...</p>;

  const incomingInvites = invites.filter(inv => inv.receiverId === currentUser?.uid && inv.status === 'pending');

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base md:text-lg text-[#e8e6ed] mb-4">
        {userData?.role === 'talent' ? 'Incoming Invites' : 'Sent Invites'}
      </h3>
      
      {userData?.role === 'talent' ? (
        incomingInvites.length > 0 ? (
          <div className="grid gap-4">
            {incomingInvites.map((invite) => (
              <Card key={invite._id} className="p-3 md:p-4 bg-[#3d3549]/30 border-0 rounded-[14px] flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-[#e8e6ed]">New Invite from Brand</p>
                  <p className="text-xs text-[#9d97a8]">{new Date(invite.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-[rgba(192,255,0,0.15)] text-[#9d97a8] hover:bg-[#342e40] rounded-xl text-xs"
                    onClick={() => handleUpdateStatus(invite._id, 'rejected')}
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] rounded-xl text-xs"
                    onClick={() => handleUpdateStatus(invite._id, 'accepted')}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Accept
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-[#9d97a8] text-sm italic">No pending invites.</p>
        )
      ) : (
        <div className="grid gap-4">
          {invites.filter(inv => inv.senderId === currentUser?.uid).map((invite) => (
            <Card key={invite._id} className="p-3 md:p-4 bg-[#3d3549]/30 border-0 rounded-[14px] flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-[#e8e6ed]">Invite to Talent</p>
                <p className="text-xs text-[#9d97a8]">{new Date(invite.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={invite.status === 'accepted' ? 'success' : invite.status === 'pending' ? 'secondary' : 'destructive'} className="text-[10px] rounded-full">
                  {invite.status}
                </Badge>
                {invite.status === 'accepted' && (
                  <Link to="/chat">
                    <Button size="sm" variant="ghost" className="text-[#c0ff00] hover:bg-[#c0ff00]/10 rounded-xl">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
          {invites.filter(inv => inv.senderId === currentUser?.uid).length === 0 && (
             <p className="text-[#9d97a8] text-sm italic">You haven't sent any invites yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

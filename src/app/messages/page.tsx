import { ChatLayout } from '@/components/messages/ChatLayout';
import { conversations, users } from '@/lib/mock-data';

export default function MessagesPage() {
    const currentUser = users[0];
    return <ChatLayout conversations={conversations} currentUser={currentUser} />;
}

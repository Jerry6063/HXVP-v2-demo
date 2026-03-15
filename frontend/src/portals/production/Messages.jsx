import { useState } from 'react';
import { useMessages, useMessage, useReplyMessage } from '../../api/hooks';
import { useAuth } from '../../contexts/AuthContext';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

export default function ProductionMessages() {
  const { data: messagesData, isLoading } = useMessages();
  const [selectedId, setSelectedId] = useState(null);

  const messages = messagesData?.results || messagesData || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Client Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread list */}
        <div className="lg:col-span-1 space-y-2">
          {isLoading ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No messages from clients</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelectedId(msg.id)}
                className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-sm ${
                  selectedId === msg.id
                    ? 'border-indigo-400 ring-1 ring-indigo-200'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {msg.subject}
                  </p>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  From: {msg.sender_name}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{msg.body}</p>
                {msg.reply_count > 0 && (
                  <p className="text-xs text-indigo-600 mt-1">
                    {msg.reply_count} {msg.reply_count === 1 ? 'reply' : 'replies'}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Thread detail */}
        <div className="lg:col-span-2">
          {selectedId ? (
            <ThreadView messageId={selectedId} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                Select a message thread to view and reply
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThreadView({ messageId }) {
  const { data: thread, isLoading } = useMessage(messageId);
  const replyMessage = useReplyMessage();
  const { user } = useAuth();
  const [replyBody, setReplyBody] = useState('');

  if (isLoading || !thread) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  const replies = thread.replies || [];

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    replyMessage.mutate(
      { id: messageId, body: replyBody },
      { onSuccess: () => setReplyBody('') }
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{thread.subject}</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          From: {thread.sender_name} &middot;{' '}
          {new Date(thread.created_at).toLocaleString()}
        </p>
      </div>

      <div className="divide-y divide-gray-50 max-h-[32rem] overflow-y-auto">
        <MessageBubble
          sender={thread.sender_name}
          role={thread.sender_role}
          body={thread.body}
          date={thread.created_at}
          isOwn={thread.sender === user?.id}
        />
        {replies.map((r) => (
          <MessageBubble
            key={r.id}
            sender={r.sender_name}
            role={r.sender_role}
            body={r.body}
            date={r.created_at}
            isOwn={r.sender === user?.id}
          />
        ))}
      </div>

      <form onSubmit={handleReply} className="px-5 py-4 border-t border-gray-100">
        <div className="flex gap-3">
          <input
            type="text"
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={!replyBody.trim() || replyMessage.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ sender, role, body, date, isOwn }) {
  return (
    <div className={`px-5 py-4 ${isOwn ? 'bg-indigo-50/40' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-gray-900">{sender || 'Unknown'}</span>
        <span className="text-xs text-gray-400 capitalize">
          {role === 'production_admin' ? 'Studio' : role === 'client' ? 'Client' : role}
        </span>
        <span className="text-xs text-gray-300 ml-auto">
          {new Date(date).toLocaleString()}
        </span>
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{body}</p>
    </div>
  );
}
